"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FiClock, 
  FiMapPin, 
  FiArrowLeft,
  FiEdit2,
  FiUserCheck,
  FiCalendar,
  FiCompass,
  FiInfo,
  FiCheckCircle
} from "react-icons/fi";
import { IoCalendar } from "react-icons/io5";
import Topbar from "@/app/components/Topbar";
import { createClient } from "@/lib/supabase";

export default function LihatItineraryContent({ id }) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState(null);

  useEffect(() => {
    fetchDetailData();
  }, [id]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);

      if (!id) {
        // Ambil itinerary terbaru jika tidak ada ID
        const { data: latestItin } = await supabase
          .from("itineraries")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestItin?.id) {
          router.replace(`/itinerary/lihat/${latestItin.id}`);
          return;
        }
      }

      // 1. Coba ambil dari tabel itineraries dengan relasi nested
      const { data: itinData, error: itinError } = await supabase
        .from("itineraries")
        .select(`
          *,
          itinerary_days (
            id,
            day_number,
            activity_date,
            title,
            itinerary_activities (
              id,
              activity_time,
              title,
              description,
              location,
              sort_order
            )
          ),
          itinerary_recipient_rules (
            id,
            recipient_role,
            recipient_mode,
            itinerary_recipient_users (
              id,
              profile_id,
              profiles (
                id,
                username,
                role
              )
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (itinData) {
        const sortedDays = (itinData.itinerary_days || []).sort(
          (a, b) => (a.day_number || 0) - (b.day_number || 0)
        );
        sortedDays.forEach((day) => {
          if (day.itinerary_activities) {
            day.itinerary_activities.sort(
              (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
            );
          }
        });

        setItinerary({
          ...itinData,
          itinerary_days: sortedDays,
        });
        return;
      }

      // 2. Fallback query terpisah jika relasi gagal/tidak terdefinisi di Supabase
      const { data: directItin } = await supabase
        .from("itineraries")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (directItin) {
        const { data: days } = await supabase
          .from("itinerary_days")
          .select("*")
          .eq("itinerary_id", id)
          .order("day_number", { ascending: true });

        const dayIds = (days || []).map((d) => d.id);
        let activities = [];

        if (dayIds.length > 0) {
          const { data: acts } = await supabase
            .from("itinerary_activities")
            .select("*")
            .in("itinerary_day_id", dayIds)
            .order("sort_order", { ascending: true });
          activities = acts || [];
        }

        const combinedDays = (days || []).map((d) => ({
          ...d,
          itinerary_activities: activities.filter(
            (a) => a.itinerary_day_id === d.id
          ),
        }));

        const { data: rules } = await supabase
          .from("itinerary_recipient_rules")
          .select("*, itinerary_recipient_users(*, profiles(*))")
          .eq("itinerary_id", id);

        setItinerary({
          ...directItin,
          itinerary_days: combinedDays,
          itinerary_recipient_rules: rules || [],
        });
        return;
      }

      // 3. Fallback jika id yang dikirim kebetulan adalah id dari itinerary_activities
      const { data: actData } = await supabase
        .from("itinerary_activities")
        .select(`
          *,
          itinerary_days (
            id,
            day_number,
            activity_date,
            itineraries (
              id,
              title,
              status
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (actData?.itinerary_days?.itineraries?.id) {
        router.replace(`/itinerary/lihat/${actData.itinerary_days.itineraries.id}`);
        return;
      }

      setItinerary(null);
    } catch (err) {
      console.error("Gagal mengambil detail itinerary:", err);
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const itineraryTitle = itinerary?.title || "Detail Itinerary";
  const statusLabel =
    itinerary?.status === "published" || itinerary?.status === "Terkirim"
      ? "Terkirim"
      : itinerary?.status || "Draft";

  const dateRange =
    itinerary?.start_date && itinerary?.end_date && itinerary.start_date !== itinerary.end_date
      ? `${formatDate(itinerary.start_date)} - ${formatDate(itinerary.end_date)}`
      : formatDate(itinerary?.start_date || itinerary?.created_at);

  const totalDays = itinerary?.itinerary_days?.length || 1;
  const totalActivities = (itinerary?.itinerary_days || []).reduce(
    (acc, day) => acc + (day.itinerary_activities?.length || 0),
    0
  );

  const getRecipientNames = (role) => {
    if (!itinerary?.itinerary_recipient_rules) return [];
    const rule = itinerary.itinerary_recipient_rules.find(
      (r) => r.recipient_role === role
    );
    if (!rule) return [];
    if (rule.recipient_mode === "all") {
      return [role === "tour_leader" ? "Semua Tour Leader" : "Semua Muthawif"];
    }
    const names = (rule.itinerary_recipient_users || [])
      .map((u) => u.profiles?.username || u.profiles?.email)
      .filter(Boolean);
    return names.length > 0
      ? names
      : [role === "tour_leader" ? "Tour Leader Tertentu" : "Muthawif Tertentu"];
  };

  const tlRecipients = getRecipientNames("tour_leader");
  const muthRecipients = getRecipientNames("muthawif");

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
      <Topbar 
        title="Detail Itinerary" 
        breadcrumbs={["Dashboard", "Itinerary", itineraryTitle]} 
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full max-w-7xl mx-auto space-y-6 no-scrollbar">
        {loading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-[#263754] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-semibold text-slate-500">Memuat detail itinerary...</p>
          </div>
        ) : !itinerary ? (
          <div className="w-full py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-4">
            <FiInfo className="w-14 h-14 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Itinerary Tidak Ditemukan</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Data paket itinerary yang Anda cari tidak tersedia atau mungkin telah dihapus.
            </p>
            <button
              onClick={() => router.push("/itinerary")}
              className="mt-6 px-5 py-2.5 bg-[#263754] hover:bg-[#1e293b] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" /> Kembali ke Daftar Itinerary
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* HERO BANNER CARD */}
            <div className="bg-gradient-to-br from-[#121c38] via-[#1b2a4a] to-[#0f172a] text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden border border-slate-800/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {statusLabel}
                  </span>

                  <span className="bg-white/10 text-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/5">
                    <IoCalendar className="text-indigo-300" />
                    {dateRange}
                  </span>

                  <span className="bg-white/10 text-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/5">
                    📦 Total {totalDays} Hari
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => router.push(`/itinerary/edit/${itinerary.id}`)}
                    className="bg-[#263754] hover:bg-[#1e293b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border border-white/10"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" /> Edit Itinerary
                  </button>
                  <button 
                    onClick={() => router.push("/itinerary")}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" /> Kembali
                  </button>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                {itineraryTitle}
              </h1>

              {/* Penerima Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-3 border-t border-white/10">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <FiUserCheck className="w-3.5 h-3.5 text-indigo-400" /> Penerima & Pendamping:
                </span>
                {tlRecipients.map((name, i) => (
                  <span key={i} className="bg-[#3730a3]/60 border border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-medium">
                    {name} <span className="opacity-70">(Tour Leader)</span>
                  </span>
                ))}
                {muthRecipients.map((name, i) => (
                  <span key={i} className="bg-[#047857]/50 border border-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-xs font-medium">
                    {name} <span className="opacity-70">(Muthawif)</span>
                  </span>
                ))}
                {tlRecipients.length === 0 && muthRecipients.length === 0 && (
                  <span className="text-slate-400 italic">Semua Petugas</span>
                )}
              </div>
            </div>

            {/* DETAIL RUNDOWN DAY LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* KOLOM KIRI (2 COLUMNS): DAFTAR HARI & KEGIATAN */}
              <div className="lg:col-span-2 space-y-6">
                {(!itinerary.itinerary_days || itinerary.itinerary_days.length === 0) ? (
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-slate-400 text-sm">
                    Belum ada hari atau kegiatan yang ditambahkan ke itinerary ini.
                  </div>
                ) : (
                  itinerary.itinerary_days.map((day) => (
                    <div 
                      key={day.id || day.day_number}
                      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6"
                    >
                      {/* Day Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-[#1b3167]"></span>
                          <h3 className="font-extrabold text-slate-900 text-base">
                            Hari {day.day_number}
                          </h3>
                          <span className="text-slate-400 text-xs font-medium">
                            {formatDate(day.activity_date)}
                          </span>
                          {day.title && (
                            <span className="bg-[#f3e8ff] text-[#6b21a8] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-purple-200">
                              <FiMapPin className="w-3.5 h-3.5" /> 
                              {day.title}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {day.itinerary_activities?.length || 0} agenda kegiatan
                        </span>
                      </div>

                      {/* Activity Timeline List */}
                      {(!day.itinerary_activities || day.itinerary_activities.length === 0) ? (
                        <p className="text-xs text-slate-400 italic py-2">
                          Belum ada agenda kegiatan untuk hari ini.
                        </p>
                      ) : (
                        <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100">
                          {day.itinerary_activities.map((act, index) => (
                            <div 
                              key={act.id || index}
                              className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-5 shadow-xs relative transition-all"
                            >
                              <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 bg-[#1b3167] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
                                  <FiClock className="w-3.5 h-3.5" />
                                  <span>{act.activity_time || "08:00"}</span>
                                </div>
                                <h4 className="font-extrabold text-slate-900 text-base">
                                  {act.title}
                                </h4>
                                {act.description && (
                                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                    {act.description}
                                  </p>
                                )}
                                {act.location && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                                    <FiCompass className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Lokasi: {act.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* KOLOM KANAN (1 COLUMN): SIDEBAR RINGKASAN */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4 sticky top-6">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Ringkasan Informasi Paket
                  </h4>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Nama Paket Itinerary</span>
                      <span className="font-bold text-slate-800 text-sm">{itineraryTitle}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Periode Perjalanan</span>
                      <span className="font-semibold text-slate-700">{dateRange}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Total Durasi</span>
                      <span className="font-semibold text-slate-700">{totalDays} Hari</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Total Agenda Kegiatan</span>
                      <span className="font-semibold text-slate-700">{totalActivities} Kegiatan Terjadwal</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Status Publikasi</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {statusLabel}
                      </span>
                    </div>

                    {itinerary?.created_at && (
                      <div>
                        <span className="text-slate-400 block font-medium mb-1">Dibuat Pada</span>
                        <span className="font-medium text-slate-500">
                          {formatDate(itinerary.created_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => router.push(`/itinerary/edit/${itinerary.id}`)}
                      className="w-full py-3 bg-[#263754] hover:bg-[#1e293b] text-white font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit Paket Itinerary Ini
                    </button>
                    <button
                      onClick={() => router.push("/itinerary")}
                      className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-gray-200/80"
                    >
                      <FiArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
