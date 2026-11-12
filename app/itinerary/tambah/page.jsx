"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  FiMapPin, 
  FiPackage, 
  FiArrowLeft,
  FiSave,
  FiSend,
  FiCalendar,
  FiUsers,
  FiPlus,
  FiTrash2,
  FiClock
} from "react-icons/fi";
import Topbar from "@/app/components/Topbar";
import { createClient } from "@/lib/supabase";
import { createItineraryPackageAction } from "@/app/actions/itinerary";

export default function TambahItineraryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Penerima list dari profiles
  const [tourleaders, setTourleaders] = useState([]);
  const [muthawifs, setMuthawifs] = useState([]);

  // Form Paket
  const [packageName, setPackageName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [recipientType, setRecipientType] = useState("all"); // 'all', 'tour_leader_only', 'selected'
  const [selectedTLs, setSelectedTLs] = useState([]);
  const [selectedMuthawifs, setSelectedMuthawifs] = useState([]);

  // Days & Activities
  const [days, setDays] = useState([
    {
      day_number: 1,
      title: "Makkah",
      date: "",
      activities: [
        { time: "08:00", title: "Keberangkatan / Tiba", location: "Bandara / Hotel", description: "" }
      ]
    }
  ]);

  const fetchPetugas = useCallback(async () => {
    try {
      const { data: tls } = await supabase
        .from("profiles")
        .select("id, username, role")
        .eq("role", "tour_leader");

      if (tls) setTourleaders(tls);

      const { data: muths } = await supabase
        .from("profiles")
        .select("id, username, role")
        .eq("role", "muthawif");

      if (muths) setMuthawifs(muths);
    } catch (e) {
      console.warn("Gagal fetch petugas:", e.message);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPetugas();
  }, [fetchPetugas]);

  const handleAddDay = () => {
    const nextNum = days.length + 1;
    setDays(prev => [
      ...prev,
      {
        day_number: nextNum,
        title: "Makkah",
        date: "",
        activities: []
      }
    ]);
  };

  const handleRemoveDay = (dayIndex) => {
    if (days.length <= 1) return;
    setDays(prev => prev.filter((_, idx) => idx !== dayIndex).map((d, i) => ({ ...d, day_number: i + 1 })));
  };

  const handleAddActivity = (dayIndex) => {
    setDays(prev => prev.map((d, idx) => {
      if (idx === dayIndex) {
        return {
          ...d,
          activities: [
            ...d.activities,
            { time: "10:00", title: "", location: d.title, description: "" }
          ]
        };
      }
      return d;
    }));
  };

  const handleRemoveActivity = (dayIndex, actIndex) => {
    setDays(prev => prev.map((d, idx) => {
      if (idx === dayIndex) {
        return {
          ...d,
          activities: d.activities.filter((_, aIdx) => aIdx !== actIndex)
        };
      }
      return d;
    }));
  };

  const handleSave = async (isPublished = false) => {
    if (!packageName.trim()) {
      alert("Nama paket itinerary wajib diisi!");
      return;
    }
    if (!startDate || !endDate) {
      alert("Periode tanggal mulai dan selesai wajib diisi!");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: packageName,
        start_date: startDate,
        end_date: endDate,
        status: isPublished ? "published" : "draft",
        recipient_type: recipientType,
        selected_tl_ids: selectedTLs,
        selected_muthawif_ids: selectedMuthawifs,
        days: days.map(d => ({
          day_number: d.day_number,
          title: d.title,
          date: d.date || startDate,
          activities: d.activities.filter(a => a.title.trim().length > 0)
        }))
      };

      const res = await createItineraryPackageAction(payload);
      if (!res.success) {
        throw new Error(res.error);
      }

      alert(isPublished ? "Paket itinerary berhasil dipublikasikan!" : "Paket itinerary berhasil disimpan sebagai draft!");
      router.push("/itinerary");
    } catch (error) {
      console.error("Gagal menyimpan itinerary:", error.message);
      alert("Terjadi kesalahan saat menyimpan data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
      <Topbar 
        title="Buat Itinerary" 
        breadcrumbs={["Dashboard", "Itinerary", "Buat Itinerary"]} 
      />
      
      <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-10 transition-all space-y-8">
          {/* Header Card */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Buat Paket Itinerary Baru
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Atur judul paket, periode tanggal, penerima tugas, dan jadwal kegiatan harian.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/itinerary")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200/80 transition-all shadow-sm cursor-pointer"
            >
              <FiArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>

          {/* Form Fields Utama */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nama Paket Itinerary <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FiPackage className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Contoh: Umrah Plus Eropa / Umrah Ultimo Minimalis"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b3167]/20 focus:border-[#1b3167] transition-all"
                />
              </div>
            </div>

            {/* Periode Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Mulai <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <FiCalendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b3167]/20 focus:border-[#1b3167] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Selesai <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <FiCalendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b3167]/20 focus:border-[#1b3167] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Penerima Tugas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Penerima Itinerary <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setRecipientType("all")}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    recipientType === "all"
                      ? "border-[#1b3167] bg-[#1b3167]/10 text-[#1b3167] ring-2 ring-[#1b3167]/10"
                      : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-extrabold text-sm mb-0.5">Semua Petugas</div>
                  <div className="font-normal text-[11px] opacity-80">Semua Tour Leader & Muthawif</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType("tour_leader_only")}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    recipientType === "tour_leader_only"
                      ? "border-[#1b3167] bg-[#1b3167]/10 text-[#1b3167] ring-2 ring-[#1b3167]/10"
                      : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-extrabold text-sm mb-0.5">Semua Tourleader</div>
                  <div className="font-normal text-[11px] opacity-80">Hanya seluruh Tour Leader</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType("selected")}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    recipientType === "selected"
                      ? "border-[#1b3167] bg-[#1b3167]/10 text-[#1b3167] ring-2 ring-[#1b3167]/10"
                      : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-extrabold text-sm mb-0.5">Pengguna Tertentu</div>
                  <div className="font-normal text-[11px] opacity-80">Pilih spesifik TL & Muthawif</div>
                </button>
              </div>

              {/* Pemilihan Spesifik jika 'selected' */}
              {recipientType === "selected" && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">Pilih Tour Leader:</span>
                    <div className="flex flex-wrap gap-2">
                      {tourleaders.map(tl => {
                        const isChecked = selectedTLs.includes(tl.id);
                        return (
                          <button
                            key={tl.id}
                            type="button"
                            onClick={() => {
                              setSelectedTLs(prev => isChecked ? prev.filter(x => x !== tl.id) : [...prev, tl.id]);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isChecked ? "bg-[#1b3167] text-white border-[#1b3167]" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {tl.username || "TL"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">Pilih Muthawif:</span>
                    <div className="flex flex-wrap gap-2">
                      {muthawifs.map(muth => {
                        const isChecked = selectedMuthawifs.includes(muth.id);
                        return (
                          <button
                            key={muth.id}
                            type="button"
                            onClick={() => {
                              setSelectedMuthawifs(prev => isChecked ? prev.filter(x => x !== muth.id) : [...prev, muth.id]);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isChecked ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {muth.username || "Muthawif"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rincian Hari & Kegiatan */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Rundown & Jadwal Harian</h3>
                  <p className="text-xs text-slate-400">Susun agenda perjalanan untuk setiap hari</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b3167]/10 hover:bg-[#1b3167]/20 text-[#1b3167] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Tambah Hari
                </button>
              </div>

              <div className="space-y-4">
                {days.map((day, dIdx) => (
                  <div key={dIdx} className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#1b3167] text-white text-xs font-bold flex items-center justify-center">
                          {day.day_number}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">Hari ke-{day.day_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDays(prev => prev.map((d, i) => i === dIdx ? { ...d, title: val } : d));
                          }}
                          placeholder="Kota / Wilayah (e.g. Makkah)"
                          className="px-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold w-40"
                        />
                        {days.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(dIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Hari"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Kegiatan List */}
                    <div className="space-y-2.5">
                      {day.activities.map((act, aIdx) => (
                        <div key={aIdx} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <input
                            type="time"
                            value={act.time}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDays(prev => prev.map((d, i) => i === dIdx ? {
                                ...d,
                                activities: d.activities.map((a, j) => j === aIdx ? { ...a, time: val } : a)
                              } : d));
                            }}
                            className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-700 w-full sm:w-28"
                          />
                          <input
                            type="text"
                            value={act.title}
                            placeholder="Judul agenda (e.g. Tawaf Wada)"
                            onChange={(e) => {
                              const val = e.target.value;
                              setDays(prev => prev.map((d, i) => i === dIdx ? {
                                ...d,
                                activities: d.activities.map((a, j) => j === aIdx ? { ...a, title: val } : a)
                              } : d));
                            }}
                            className="px-3 py-1 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 flex-1 w-full"
                          />
                          <input
                            type="text"
                            value={act.location}
                            placeholder="Lokasi"
                            onChange={(e) => {
                              const val = e.target.value;
                              setDays(prev => prev.map((d, i) => i === dIdx ? {
                                ...d,
                                activities: d.activities.map((a, j) => j === aIdx ? { ...a, location: val } : a)
                              } : d));
                            }}
                            className="px-3 py-1 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-600 w-full sm:w-44"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(dIdx, aIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddActivity(dIdx)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#1b3167] hover:text-[#1a2538] font-bold py-1 px-2 rounded-lg hover:bg-[#1b3167]/10 transition-colors cursor-pointer"
                      >
                        <FiPlus className="w-3.5 h-3.5" /> Tambah Kegiatan di Hari {day.day_number}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/itinerary")}
              className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Batal
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-all cursor-pointer"
              >
                <FiSave className="w-4 h-4" />
                {loading ? "Menyimpan..." : "Simpan Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-xs text-white bg-[#1b3167] hover:bg-[#1a2538] active:scale-[0.98] disabled:opacity-50 transition-all shadow-md shadow-[#1b3167]/20 cursor-pointer"
              >
                <FiSend className="w-4 h-4" />
                {loading ? "Memproses..." : "Publikasikan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
