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
  FiInfo
} from "react-icons/fi";
import { IoCalendar } from "react-icons/io5";
import Topbar from "@/app/components/Topbar";
import { createClient } from "@/lib/supabase";

export default function LihatItineraryContent({ id }) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [dayActivities, setDayActivities] = useState([]);

  useEffect(() => {
    fetchDetailData();
  }, [id]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);

      let query = supabase
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
        `);

      if (id) {
        query = query.eq("id", id);
      } else {
        query = query.order("created_at", { ascending: false }).limit(1);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("Fetch detail error:", error.message);
        // Fallback simple query
        const { data: simpleData } = await supabase
          .from("itinerary_activities")
          .select("*")
          .limit(1);
        if (simpleData && simpleData.length > 0) {
          setActivity(simpleData[0]);
        }
      } else if (data && data.length > 0) {
        const currentItem = data[0];
        setActivity(currentItem);

        // Ambil semua aktivitas di hari yang sama jika ada itinerary_day_id
        if (currentItem.itinerary_day_id) {
          const { data: relatedActs } = await supabase
            .from("itinerary_activities")
            .select("*")
            .eq("itinerary_day_id", currentItem.itinerary_day_id)
            .order("sort_order", { ascending: true });

          if (relatedActs && relatedActs.length > 0) {
            setDayActivities(relatedActs);
          } else {
            setDayActivities([currentItem]);
          }
        } else {
          setDayActivities([currentItem]);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil detail:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const itineraryTitle = 
    activity?.itinerary_days?.itineraries?.title || 
    activity?.title || 
    "Umrah Plus Eropa";

  const dayNumber = activity?.itinerary_days?.day_number || 1;
  const activityDate = activity?.itinerary_days?.activity_date
    ? new Date(activity.itinerary_days.activity_date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "10 Agu 2026";

  const statusLabel = activity?.itinerary_days?.itineraries?.status || "Terkirim";

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
      <Topbar 
        title="Detail Itinerary" 
        breadcrumbs={["Dashboard", "Itinerary", "Detail Itinerary"]} 
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold text-slate-500">Memuat detail itinerary...</p>
          </div>
        ) : !activity ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-4">
            <FiInfo className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Itinerary Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Data aktivitas itinerary yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <button
              onClick={() => router.push("/itinerary")}
              className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              Kembali ke Daftar Itinerary
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* HERO BANNER CARD */}
            <div className="bg-gradient-to-br from-[#121c38] to-[#1e293b] text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden border border-slate-800/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {statusLabel}
                  </span>

                  <span className="bg-white/10 text-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/5">
                    <IoCalendar className="text-indigo-300" />
                    {activityDate}
                  </span>

                  <span className="bg-white/10 text-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/5">
                    📦 Hari ke-{dayNumber}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => router.push(activity?.id ? `/itinerary/edit/${activity.id}` : "/itinerary/edit")}
                    className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <FiUserCheck className="w-3.5 h-3.5 text-indigo-400" /> Penerima & Pendamping:
                </span>
                <span className="bg-[#3730a3]/60 border border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-medium">
                  Muhammad Fio Ramadhan <span className="opacity-70">(Tour Leader)</span>
                </span>
                <span className="bg-[#047857]/50 border border-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-xs font-medium">
                  Ustadz Hasan <span className="opacity-70">(Muthawif)</span>
                </span>
              </div>
            </div>

            {/* DETAIL RUNDOWN DAY LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Hari {dayNumber}
                      </h3>
                      <span className="text-slate-400 text-xs font-medium">
                        {activityDate}
                      </span>
                      <span className="bg-[#f3e8ff] text-[#6b21a8] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-purple-200">
                        <FiMapPin className="w-3.5 h-3.5" /> 
                        {activity?.location || "Jakarta - Mumbai - Jeddah"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {dayActivities.length} agenda kegiatan
                    </span>
                  </div>

                  {/* Activity Timeline List */}
                  <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100">
                    {dayActivities.map((act, index) => (
                      <div 
                        key={act.id || index}
                        className={`bg-white border rounded-2xl p-5 shadow-xs relative transition-all ${
                          act.id === activity.id 
                            ? "border-indigo-300 ring-2 ring-indigo-500/10 bg-indigo-50/20" 
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 bg-[#4338ca] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
                              <FiClock className="w-3.5 h-3.5" />
                              <span>{act.activity_time || "08:00 - 10:00"}</span>
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-base">
                              {act.title || act.location || "Agenda Umrah"}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                              {act.description || "Petunjuk teknis dan rincian aktivitas bagi seluruh jamaah."}
                            </p>
                            {act.location && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                                <FiCompass className="w-3.5 h-3.5 text-slate-400" />
                                <span>Lokasi: {act.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIDEBAR METADATA INFORMASI */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Ringkasan Informasi
                  </h4>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Paket Perjalanan</span>
                      <span className="font-bold text-slate-800 text-sm">{itineraryTitle}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Hari & Tanggal</span>
                      <span className="font-semibold text-slate-700">Hari ke-{dayNumber} ({activityDate})</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Waktu Pelaksanaan</span>
                      <span className="font-semibold text-slate-700">{activity?.activity_time || "08:00"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Lokasi Utama</span>
                      <span className="font-semibold text-slate-700">{activity?.location || "-"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">Status Publikasi</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {statusLabel}
                      </span>
                    </div>

                    {activity?.created_at && (
                      <div>
                        <span className="text-slate-400 block font-medium mb-1">Dibuat Pada</span>
                        <span className="font-medium text-slate-500">
                          {new Date(activity.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => router.push(activity?.id ? `/itinerary/edit/${activity.id}` : "/itinerary/edit")}
                      className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit Data Kegiatan Ini
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
