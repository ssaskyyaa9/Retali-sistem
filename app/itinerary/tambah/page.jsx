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
  FiClock,
  FiUpload,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiDatabase,
  FiEdit3,
  FiX
} from "react-icons/fi";
import Topbar from "@/app/components/Topbar";
import { createClient } from "@/lib/supabase";
import { createItineraryPackageAction } from "@/app/actions/itinerary";
import { parseItineraryFile } from "@/lib/itineraryParser";

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

  // Toast Notifikasi
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // State Modal Preview Import CSV / Excel
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [directSaving, setDirectSaving] = useState(false);

  // Cek apakah ada data itinerary import dari halaman /itinerary via sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("imported_itinerary_data");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          sessionStorage.removeItem("imported_itinerary_data");
          if (parsed.packageName) setPackageName(parsed.packageName);
          if (parsed.startDate) setStartDate(parsed.startDate);
          if (parsed.endDate) setEndDate(parsed.endDate);
          if (parsed.days && parsed.days.length > 0) setDays(parsed.days);
          showToast(
            `Data itinerary dari file berhasil dimuat (${parsed.days?.length || 0} hari & ${parsed.totalActivities || 0} kegiatan). Silakan periksa formulir dan simpan.`,
            "success"
          );
        } catch (err) {
          console.error("Gagal membaca imported_itinerary_data:", err);
        }
      }
    }
  }, []);

  // Handle Import CSV / XLSX menggunakan itineraryParser
  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await parseItineraryFile(file);
      if (!res.success) {
        showToast(res.error || "Gagal membaca file CSV/Excel.", "error");
        return;
      }

      setImportPreviewData({
        packageName: res.packageName || packageName || "Paket Itinerary Umrah",
        startDate: res.startDate || startDate,
        endDate: res.endDate || endDate,
        days: res.days,
        totalActivities: res.totalActivities,
      });
      setImportModalOpen(true);
    } catch (err) {
      console.error("Gagal membaca file CSV/Excel:", err);
      showToast("Gagal membaca file: " + err.message, "error");
    } finally {
      e.target.value = "";
    }
  };

  // Opsi 1: Tinjau di Formulir (masukkan data ke form tanpa langsung simpan)
  const handleApplyToForm = () => {
    if (!importPreviewData) return;
    setPackageName(importPreviewData.packageName);
    setStartDate(importPreviewData.startDate);
    setEndDate(importPreviewData.endDate);
    setDays(importPreviewData.days);
    setImportModalOpen(false);
    showToast(
      `Data file dimasukkan ke formulir (${importPreviewData.days.length} hari & ${importPreviewData.totalActivities} kegiatan). Data belum disimpan ke Supabase — silakan periksa dan klik tombol Simpan jika sudah sesuai.`,
      "success"
    );
  };

  // Opsi 2: Langsung Simpan ke Supabase
  const handleSaveDirectToSupabase = async (isPublished = true) => {
    if (!importPreviewData) return;
    try {
      setDirectSaving(true);
      const payload = {
        title: importPreviewData.packageName,
        start_date: importPreviewData.startDate,
        end_date: importPreviewData.endDate,
        status: isPublished ? "published" : "draft",
        recipient_type: recipientType,
        selected_tl_ids: selectedTLs,
        selected_muthawif_ids: selectedMuthawifs,
        days: importPreviewData.days.map((d) => ({
          day_number: d.day_number,
          title: d.title,
          date: d.date || importPreviewData.startDate,
          activities: d.activities.filter((a) => a.title.trim().length > 0),
        })),
      };

      const res = await createItineraryPackageAction(payload);
      if (!res.success) {
        throw new Error(res.error);
      }

      setImportModalOpen(false);
      sessionStorage.setItem(
        "flash_toast",
        JSON.stringify({
          message: "Paket itinerary dari file berhasil disimpan langsung ke database Supabase!",
          type: "success",
        })
      );
      router.push("/itinerary");
    } catch (err) {
      console.error("Gagal simpan langsung ke Supabase:", err);
      showToast("Gagal menyimpan ke Supabase: " + err.message, "error");
    } finally {
      setDirectSaving(false);
    }
  };

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
      showToast("Nama paket itinerary wajib diisi!", "error");
      return;
    }
    if (!startDate || !endDate) {
      showToast("Periode tanggal mulai dan selesai wajib diisi!", "error");
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

      sessionStorage.setItem(
        "flash_toast",
        JSON.stringify({
          message: isPublished
            ? "Paket itinerary berhasil dipublikasikan!"
            : "Paket itinerary berhasil disimpan sebagai draft!",
          type: "success",
        })
      );
      router.push("/itinerary");
    } catch (error) {
      console.error("Gagal menyimpan itinerary:", error.message);
      showToast("Terjadi kesalahan saat menyimpan data: " + error.message, "error");
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
        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-6 right-6 z-50 animate-bounce">
            <div
              className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-bold ${
                toast.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              {toast.type === "error" ? (
                <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-10 transition-all space-y-8">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Buat Paket Itinerary Baru
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Atur judul paket, periode tanggal, penerima tugas, dan jadwal kegiatan harian.
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="/dummy_itinerary_template.xlsx"
                download="dummy_itinerary_template.xlsx"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200/80 transition-all shadow-xs cursor-pointer"
                title="Download contoh template format Excel (.xlsx)"
              >
                <FiDownload className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Format Excel</span>
              </a>

              {/* <a
                href="/dummy_itinerary_template.csv"
                download="dummy_itinerary_template.csv"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200/80 transition-all shadow-xs cursor-pointer"
                title="Download contoh template format CSV"
              >
                <FiDownload className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Format CSV</span>
              </a> */}

              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b3167] hover:bg-[#121c2d] active:scale-[0.98] px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer">
                <FiUpload className="w-4 h-4" />
                <span>Import File</span>
                <input
                  type="file"
                  accept=".csv, .txt, .xlsx, .xls"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => router.push("/itinerary")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200/80 transition-all shadow-xs cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4" /> Kembali
              </button>
            </div>
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
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Rundown & Jadwal Harian</h3>
                  <p className="text-xs text-slate-400">Susun agenda perjalanan untuk setiap hari atau impor langsung dari file CSV</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer">
                    <FiUpload className="w-3.5 h-3.5" />
                    <span>Import CSV</span>
                    <input
                      type="file"
                      accept=".csv, .txt, .xlsx, .xls"
                      onChange={handleImportCSV}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b3167]/10 hover:bg-[#1b3167]/20 text-[#1b3167] text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Tambah Hari
                  </button>
                </div>
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

      {/* Modal Preview & Konfirmasi Import CSV */}
      {importModalOpen && importPreviewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 border border-slate-100 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1b3167]/10 text-[#1b3167] flex items-center justify-center font-bold">
                  <FiFileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    Pratinjau Hasil Impor File (Excel / CSV)
                  </h3>
                  <p className="text-xs text-slate-400">
                    File berhasil dibaca. Tinjau ringkasan dan tentukan cara penyimpanan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Ringkasan Metadata */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Paket Itinerary
                </label>
                <input
                  type="text"
                  value={importPreviewData.packageName}
                  onChange={(e) =>
                    setImportPreviewData((prev) => ({ ...prev, packageName: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3167]/20 focus:border-[#1b3167]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={importPreviewData.startDate}
                    onChange={(e) =>
                      setImportPreviewData((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={importPreviewData.endDate}
                    onChange={(e) =>
                      setImportPreviewData((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-slate-600 font-semibold">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">
                  {importPreviewData.days.length} Hari Perjalanan
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold">
                  {importPreviewData.totalActivities} Agenda Kegiatan
                </span>
              </div>
            </div>

            {/* List Pratinjau Jadwal Harian */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Daftar Hari & Contoh Kegiatan:
              </span>
              <div className="max-h-40 overflow-y-auto no-scrollbar space-y-2 border border-slate-200/80 rounded-2xl p-3 bg-slate-50/40">
                {importPreviewData.days.map((d, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 text-xs shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                      <span className="text-[#1b3167]">Hari {d.day_number} — {d.title}</span>
                      <span className="text-slate-400 font-medium">{d.date || "-"}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      {d.activities.length} Kegiatan:{" "}
                      <span className="text-slate-700 font-medium">
                        {d.activities.slice(0, 2).map((a) => a.title).join(", ")}
                        {d.activities.length > 2 && "..."}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Opsi Penyimpanan */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleApplyToForm}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  title="Masukkan data ke formulir untuk dicek & diedit manual"
                >
                  <FiEdit3 className="w-4 h-4 text-slate-600" />
                  <span>Tinjau di Formulir</span>
                </button>

                <button
                  type="button"
                  disabled={directSaving}
                  onClick={() => handleSaveDirectToSupabase(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1b3167] hover:bg-[#121c2d] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  title="Langsung simpan & terbitkan ke Supabase"
                >
                  <FiDatabase className="w-4 h-4" />
                  <span>{directSaving ? "Menyimpan..." : "Langsung Simpan ke Supabase"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
