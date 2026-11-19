"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { PlusIcon } from "@/app/components/CustomIcons";
import { createClient } from "@/lib/supabase";
import { deleteItineraryAction } from "@/app/actions/itinerary";
import { 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiX, 
  FiMapPin,
  FiUpload,
  FiDownload,
  FiFileText,
  FiAlertCircle,
  FiDatabase,
  FiEdit3,
  FiCheckCircle
} from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import { BsBuildings } from "react-icons/bs";
import { parseItineraryFile } from "@/lib/itineraryParser";
import { createItineraryPackageAction } from "@/app/actions/itinerary";

export default function ItineraryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [itinerariesList, setItinerariesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCityModal, setShowCityModal] = useState(false);

  // State Modal Konfirmasi Hapus & Toast Notifikasi
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // State Import File
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [directSaving, setDirectSaving] = useState(false);
  const [importingFile, setImportingFile] = useState(false);

  // Flash Toast dari halaman Tambah / Edit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const flash = sessionStorage.getItem("flash_toast");
      if (flash) {
        try {
          const parsed = JSON.parse(flash);
          showToast(parsed.message, parsed.type || "success");
        } catch {
          showToast(flash, "success");
        }
        sessionStorage.removeItem("flash_toast");
      }
    }
  }, []);

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportingFile(true);
      const res = await parseItineraryFile(file);
      if (!res.success) {
        showToast(res.error || "Gagal membaca file CSV/Excel.", "error");
        return;
      }

      setImportPreviewData({
        packageName: res.packageName || "Paket Itinerary Umrah",
        startDate: res.startDate,
        endDate: res.endDate,
        days: res.days,
        totalActivities: res.totalActivities,
      });
      setImportModalOpen(true);
    } catch (err) {
      console.error("Gagal membaca file itinerary:", err);
      showToast("Gagal membaca file: " + err.message, "error");
    } finally {
      setImportingFile(false);
      e.target.value = "";
    }
  };

  const handleOpenInForm = () => {
    if (!importPreviewData) return;
    try {
      sessionStorage.setItem("imported_itinerary_data", JSON.stringify(importPreviewData));
      router.push("/itinerary/tambah");
    } catch (e) {
      console.error("Gagal simpan ke sessionStorage:", e);
      router.push("/itinerary/tambah");
    }
  };

  const handleDirectSave = async () => {
    if (!importPreviewData) return;
    try {
      setDirectSaving(true);
      const payload = {
        title: importPreviewData.packageName,
        start_date: importPreviewData.startDate,
        end_date: importPreviewData.endDate,
        status: "published",
        recipient_type: "all",
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
      showToast("Paket itinerary dari file berhasil disimpan langsung ke database Supabase!", "success");
      fetchItinerariesData();
    } catch (err) {
      console.error("Gagal simpan langsung ke Supabase:", err);
      showToast("Gagal menyimpan ke Supabase: " + err.message, "error");
    } finally {
      setDirectSaving(false);
    }
  };

  const fetchItinerariesData = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("itineraries")
        .select(`
          *,
          itinerary_days (
            id,
            day_number,
            activity_date,
            title
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
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Relational fetch notice:", error.message);
        // Fallback simple query
        const { data: simpleData, error: simpleErr } = await supabase
          .from("itineraries")
          .select("*")
          .order("created_at", { ascending: false });

        if (simpleErr) throw simpleErr;
        setItinerariesList(simpleData || []);
      } else {
        setItinerariesList(data || []);
      }
    } catch (error) {
      console.error("Gagal memuat daftar paket itinerary:", error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItinerariesData(true);
  }, [fetchItinerariesData]);

  const confirmDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const executeDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteItineraryAction(itemToDelete.id);
      if (!res.success) {
        // Fallback client delete
        const { error } = await supabase.from("itineraries").delete().eq("id", itemToDelete.id);
        if (error) throw error;
      }
      setItinerariesList((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      showToast("Paket itinerary berhasil dihapus.", "success");
    } catch (error) {
      console.error("Gagal menghapus itinerary:", error.message);
      showToast("Gagal menghapus data: " + error.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format Tanggal: "10 Aug 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Hitung durasi hari
  const getDayCount = (item) => {
    if (item.itinerary_days && item.itinerary_days.length > 0) {
      return item.itinerary_days.length;
    }
    if (!item.start_date || !item.end_date) return 1;
    const start = new Date(item.start_date);
    const end = new Date(item.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  // Helper untuk membaca Penerima
  const formatPenerima = (item) => {
    const rules = item.itinerary_recipient_rules || [];
    if (rules.length === 0) {
      return {
        type: "Pengguna Tertentu",
        detail: "(0 TL, 0 Muthawif)"
      };
    }

    const tlRule = rules.find((r) => r.recipient_role === "tour_leader");
    const muthawifRule = rules.find((r) => r.recipient_role === "muthawif");

    if (tlRule?.recipient_mode === "all" && muthawifRule?.recipient_mode === "all") {
      return {
        type: "Semua Petugas",
        detail: null
      };
    }

    if (tlRule?.recipient_mode === "all" && (!muthawifRule || muthawifRule?.recipient_mode !== "selected")) {
      return {
        type: "Semua Tourleader",
        detail: null
      };
    }

    if (muthawifRule?.recipient_mode === "all" && (!tlRule || tlRule?.recipient_mode !== "selected")) {
      return {
        type: "Semua Muthawif",
        detail: null
      };
    }

    let tlCount = 0;
    let muthawifCount = 0;

    rules.forEach((rule) => {
      (rule.itinerary_recipient_users || []).forEach((u) => {
        const role = u.profiles?.role || rule.recipient_role;
        if (role === "tour_leader") tlCount++;
        else if (role === "muthawif") muthawifCount++;
      });
    });

    return {
      type: "Pengguna Tertentu",
      detail: `(${tlCount} TL, ${muthawifCount} Muthawif)`
    };
  };

  // Filter list hanya berdasarkan pencarian (dropdown status sudah dihilangkan)
  const filteredList = itinerariesList.filter((item) => {
    const titleMatch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const penerima = formatPenerima(item);
    const penerimaMatch = (penerima.type + " " + (penerima.detail || "")).toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || penerimaMatch;
  });

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
      <Topbar title="Itinerary" breadcrumbs={["Dashboard", "Itinerary"]} />

      <main className="p-8 w-full max-w-7xl mx-auto flex-1 no-scrollbar overflow-y-auto space-y-6">
        {/* HEADER SECTION MENGGUNAKAN PageHeader COMPONENT */}
        <PageHeader
          title="Manajemen Itinerary"
          description="Kelola semua itinerary perjalanan umroh & haji, jadwal aktivitas harian, dan pembagian tugas petugas."
          icon={<FaCalendarAlt className="w-[26px] h-[26px] text-[#eab308]" />}
          buttonText="Buat Itinerary"
          buttonIcon={<PlusIcon className="w-4 h-4" />}
          buttonOnClick={() => router.push("/itinerary/tambah")}
          buttonBgColor="bg-[#1b3167] hover:bg-[#1a2538]"
        />

        {/* SEARCH BAR CONTAINER DENGAN TOMBOL DAFTAR LIST KOTA DI SISI KANAN */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Sisi Kiri: Search Input */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari judul paket atau penerima..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 placeholder:text-gray-400 text-gray-700 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538]"
            />
          </div>

          {/* Sisi Kanan: Action Buttons (Template, Import File, Daftar Kota) */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <a
              href="/dummy_itinerary_template.xlsx"
              download="dummy_itinerary_template.xlsx"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-lg border border-emerald-200/80 transition-all shadow-2xs cursor-pointer"
              title="Download contoh template format Excel (.xlsx)"
            >
              <FiDownload className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Template Excel</span>
            </a>

            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b3167] hover:bg-[#121c2d] active:scale-[0.98] px-3.5 py-2 rounded-lg transition-all shadow-xs cursor-pointer">
              <FiUpload className="w-4 h-4" />
              <span>{importingFile ? "Membaca..." : "Import File"}</span>
              <input
                type="file"
                accept=".csv, .txt, .xlsx, .xls"
                onChange={handleImportFile}
                className="hidden"
                disabled={importingFile}
              />
            </label>

            <button
              onClick={() => setShowCityModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#1b3167] border border-gray-200 hover:border-gray-300 px-3.5 py-2 rounded-lg font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <BsBuildings className="w-4 h-4 text-[#1b3167]" />
              <span>Daftar Kota</span>
            </button>
          </div>
        </div>

        {/* TABEL DATA ITINERARY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-white text-gray-400 font-bold text-[11px] border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6">JUDUL</th>
                  <th className="py-4 px-6">PERIODE</th>
                  <th className="py-4 px-6 text-center">HARI</th>
                  <th className="py-4 px-6">PENERIMA</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6">DIBUAT</th>
                  <th className="py-4 px-6 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-gray-400 text-center text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#1b3167] border-t-transparent rounded-full animate-spin"></div>
                        <span>Memuat data paket itinerary...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-gray-500 text-center text-sm">
                      {itinerariesList.length === 0 
                        ? "Belum ada paket itinerary. Klik tombol 'Buat Itinerary' di atas untuk membuat paket baru."
                        : "Tidak ada paket itinerary yang sesuai dengan pencarian."}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    const daysCount = getDayCount(item);
                    const penerima = formatPenerima(item);
                    const isPublished = item.status === "published" || item.status === "Terkirim" || item.status === "terkirim";

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* 1. JUDUL */}
                        <td className="py-5 px-6 font-bold text-gray-900 text-sm max-w-xs">
                          {item.title || "Tanpa Judul"}
                        </td>

                        {/* 2. PERIODE */}
                        <td className="py-5 px-6 text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                          {formatDate(item.start_date)} —{"\n"}
                          {formatDate(item.end_date)}
                        </td>

                        {/* 3. HARI */}
                        <td className="py-5 px-6 text-center">
                          <div className="inline-flex flex-col items-center justify-center bg-[#1b3167]/10 text-[#1b3167] px-3.5 py-1.5 rounded-xl min-w-[50px] shadow-xs border border-[#1b3167]/15">
                            <span className="text-sm font-extrabold leading-none text-[#1b3167]">
                              {daysCount}
                            </span>
                            <span className="text-[10px] font-semibold text-[#1b3167]/80 lowercase leading-tight mt-0.5">
                              hari
                            </span>
                          </div>
                        </td>

                        {/* 4. PENERIMA */}
                        <td className="py-5 px-6 text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                          <div>{penerima.type}</div>
                          {penerima.detail && (
                            <div className="text-gray-400 font-normal mt-0.5">
                              {penerima.detail}
                            </div>
                          )}
                        </td>

                        {/* 5. STATUS */}
                        <td className="py-5 px-6">
                          {isPublished ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#15803d]">
                              Terkirim
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#b45309]">
                              Draft
                            </span>
                          )}
                        </td>

                        {/* 6. DIBUAT */}
                        <td className="py-5 px-6 text-xs text-gray-500 font-medium whitespace-nowrap">
                          {formatDate(item.created_at)}
                        </td>

                        {/* 7. AKSI */}
                        <td className="py-5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Tombol Lihat */}
                            <button
                              onClick={() => router.push(`/itinerary/lihat/${item.id}`)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#1b3167] hover:bg-blue-50/50 text-gray-500 hover:text-[#1b3167] transition-all cursor-pointer shadow-xs"
                              title="Lihat Detail Itinerary"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Edit */}
                            <button
                              onClick={() => router.push(`/itinerary/edit/${item.id}`)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 text-amber-500 hover:text-amber-600 transition-all cursor-pointer shadow-xs"
                              title="Edit Itinerary"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => confirmDeleteItem(item)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-rose-400 hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-all cursor-pointer shadow-xs"
                              title="Hapus Itinerary"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL LIAT DAFTAR KOTA */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1b3167]/10 text-[#1b3167] rounded-xl">
                  <BsBuildings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Daftar Kota Tujuan</h3>
                  <p className="text-xs text-gray-400">Destinasi utama perjalanan ibadah umroh & haji</p>
                </div>
              </div>
              <button
                onClick={() => setShowCityModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {[
                { name: "Makkah Al-Mukarramah", role: "Kota Suci", desc: "Masjidil Haram, Ka'bah, Mina, Arafah, Muzdalifah" },
                { name: "Madinah Al-Munawwarah", role: "Kota Suci", desc: "Masjid Nabawi, Raudhah, Makam Rasulullah SAW, Quba" },
                { name: "Jeddah", role: "Gerbang Masuk", desc: "Bandara King Abdulaziz, Corniche, Masjid Terapung" },
                { name: "Taif", role: "Miqat & Ziarah", desc: "Miqat Qarnul Manazil, Kebun Mawar, Masjid Abdullah bin Abbas" },
                { name: "Riyadh", role: "Ibukota", desc: "Pusat pemerintahan & Bandara Internasional King Khalid" },
                { name: "Istanbul / Dubai / Amman", role: "Transit Plus", desc: "Kota persinggahan untuk program Umrah Plus Wisata" },
              ].map((city, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
                  <FiMapPin className="w-4 h-4 text-[#1b3167] mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-800 text-sm">{city.name}</h4>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1b3167]/10 text-[#1b3167]">
                        {city.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{city.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowCityModal(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL PRATINJAU & KONFIRMASI IMPORT FILE */}
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
                  onClick={handleOpenInForm}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  title="Masukkan data ke formulir untuk dicek & diedit manual"
                >
                  <FiEdit3 className="w-4 h-4 text-slate-600" />
                  <span>Tinjau di Formulir</span>
                </button>

                <button
                  type="button"
                  disabled={directSaving}
                  onClick={handleDirectSave}
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

      {/* Modal Konfirmasi Hapus Itinerary */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Hapus Paket Itinerary</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus <span className="font-bold text-gray-800">"{itemToDelete?.title || "Paket Itinerary"}"</span> secara permanen?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDeleteItem}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
