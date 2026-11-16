"use client";

import React, { useState, useEffect, useMemo } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  HelpCircle,
  Tag,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "retali_faqs_data";

const DEFAULT_FAQS = [
  {
    id: "faq-1",
    category: "Tour Leader",
    question: "Bagaimana cara mencatat absensi jamaah saat kegiatan berlangsung?",
    answer:
      "Tour Leader dapat membuka menu 'Tugas Ceklis' atau 'Riwayat Absensi' di sidebar, lalu pilih sesi kegiatan yang aktif (misal: Ziarah Makkah/Madinah atau Keberangkatan). Klik 'Catat Absensi' atau gunakan fitur 'Riwayat Scan' untuk memindai barcode paspor/koper jamaah secara cepat.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-2",
    category: "Tour Leader",
    question: "Apa yang harus dilakukan jika ada jamaah yang terpisah dari rombongan?",
    answer:
      "1. Tetap tenang dan koordinasikan dengan Muthawif serta Tour Leader pendamping.\n2. Buka menu 'Kloter' atau 'Petugas' untuk melihat kontak darurat dan hotel jamaah.\n3. Hubungi nomor kontak jamaah atau periksa titik kumpul (meeting point) yang telah disepakati.\n4. Laporkan segera ke tim operasional pusat melalui grup koordinasi.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-3",
    category: "Muthawif",
    question: "Bagaimana panduan Muthawif dalam memberikan bimbingan ibadah saat tawaf & sai?",
    answer:
      "Muthawif bertugas memimpin doa dan memastikan seluruh jamaah kloter tetap berada dalam barisan dan tidak terpisah. Sebelum memulai, pastikan semua jamaah dalam keadaan suci (berwudhu), kenakan tanda pengenal/syal kloter, dan jelaskan rute serta putaran tawaf maupun sai secara jelas.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-4",
    category: "Jamaah & Kloter",
    question: "Bagaimana cara menambahkan atau mengedit data Kloter baru?",
    answer:
      "Admin dapat masuk ke menu 'Kloter' di sidebar, lalu klik tombol '+ Tambah Kloter' di pojok kanan atas. Isi nama kloter, tanggal mulai, dan tanggal berakhir, lalu klik 'Simpan'. Untuk mengedit, klik ikon pensil pada baris kloter yang ingin diubah.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-5",
    category: "Teknis",
    question: "Bagaimana cara memindai (scan) koper dan paspor jamaah?",
    answer:
      "Gunakan menu 'Riwayat Scan' pada sidebar. Arahkan kamera perangkat ke barcode koper atau barcode paspor jamaah. Sistem akan otomatis memvalidasi data jamaah dan kloter terkait serta mencatat riwayat pemindaian ke dalam database.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-6",
    category: "Umum",
    question: "Apa yang harus dilakukan jika aplikasi lambat atau tidak ada koneksi internet?",
    answer:
      "Pastikan koneksi internet (Wi-Fi hotel atau SIM card lokal Arab Saudi seperti STC/Mobily/Zain) aktif. Jika sinyal lemah, data formulir lokal tetap aman dan Anda dapat melakukan refresh halaman setelah koneksi internet kembali stabil.",
    createdAt: new Date().toISOString(),
  },
];

const PRESET_CATEGORIES = [
  "Semua",
  "Umum",
  "Tour Leader",
  "Muthawif",
  "Jamaah & Kloter",
  "Teknis",
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [expandedIds, setExpandedIds] = useState(new Set(["faq-1"]));

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formCategory, setFormCategory] = useState("Umum");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / Alert Notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Load FAQ data: Try Supabase first, fallback to localStorage
  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      // 1. Coba ambil dari Supabase tabel 'faqs'
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        // Normalisasi data dari Supabase
        const normalized = data.map((item) => ({
          id: item.id?.toString(),
          category: item.category || "Umum",
          question: item.question || item.title || "",
          answer: item.answer || item.content || "",
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setFaqs(normalized);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        setLoading(false);
        return;
      }
    } catch {
      // Supabase table mungkin belum dibuat, lanjutkan ke localStorage
    }

    // 2. Fallback ke localStorage
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFaqs(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Gagal membaca FAQ dari localStorage:", e);
    }

    // 3. Fallback ke DEFAULT_FAQS
    setFaqs(DEFAULT_FAQS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAQS));
    } catch {
      // ignore
    }
    setLoading(false);
  };

  // Simpan data FAQ ke state & storage
  const saveFaqsToStorage = async (newList) => {
    setFaqs(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error("Gagal menyimpan ke localStorage:", e);
    }
  };

  // Toggle Accordion Item
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Buka Modal Tambah
  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormCategory("Umum");
    setFormCustomCategory("");
    setFormQuestion("");
    setFormAnswer("");
    setFormError("");
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (item, e) => {
    e.stopPropagation();
    setEditingFaq(item);
    if (["Umum", "Tour Leader", "Muthawif", "Jamaah & Kloter", "Teknis"].includes(item.category)) {
      setFormCategory(item.category);
      setFormCustomCategory("");
    } else {
      setFormCategory("Lainnya");
      setFormCustomCategory(item.category);
    }
    setFormQuestion(item.question);
    setFormAnswer(item.answer);
    setFormError("");
    setIsModalOpen(true);
  };

  // Simpan FAQ (Tambah atau Edit)
  const handleSubmitFaq = async (e) => {
    e.preventDefault();
    const finalCategory =
      formCategory === "Lainnya"
        ? formCustomCategory.trim() || "Umum"
        : formCategory;

    if (!formQuestion.trim()) {
      setFormError("Pertanyaan tidak boleh kosong.");
      return;
    }
    if (!formAnswer.trim()) {
      setFormError("Jawaban tidak boleh kosong.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      if (editingFaq) {
        // Mode Edit
        const updatedItem = {
          ...editingFaq,
          category: finalCategory,
          question: formQuestion.trim(),
          answer: formAnswer.trim(),
        };

        // Coba simpan ke Supabase jika ada
        try {
          await supabase
            .from("faqs")
            .update({
              category: finalCategory,
              question: formQuestion.trim(),
              answer: formAnswer.trim(),
            })
            .eq("id", editingFaq.id);
        } catch {
          // ignore
        }

        const nextList = faqs.map((f) => (f.id === editingFaq.id ? updatedItem : f));
        await saveFaqsToStorage(nextList);
        showToast("FAQ berhasil diperbarui!");
      } else {
        // Mode Tambah Baru
        let createdId = `faq-${Date.now()}`;

        // Coba simpan ke Supabase jika tabel sudah ada
        try {
          const { data, error } = await supabase
            .from("faqs")
            .insert([
              {
                category: finalCategory,
                question: formQuestion.trim(),
                answer: formAnswer.trim(),
              },
            ])
            .select();

          if (!error && data && data.length > 0) {
            createdId = data[0].id?.toString() || createdId;
          }
        } catch {
          // ignore
        }

        const newItem = {
          id: createdId,
          category: finalCategory,
          question: formQuestion.trim(),
          answer: formAnswer.trim(),
          createdAt: new Date().toISOString(),
        };

        const nextList = [newItem, ...faqs];
        await saveFaqsToStorage(nextList);
        setExpandedIds((prev) => new Set([...prev, createdId]));
        showToast("FAQ baru berhasil ditambahkan!");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan FAQ:", err);
      setFormError("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Buka Modal Konfirmasi Hapus
  const handleOpenDeleteModal = (item, e) => {
    e.stopPropagation();
    setFaqToDelete(item);
    setDeleteModalOpen(true);
  };

  // Eksekusi Hapus FAQ
  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;
    setIsDeleting(true);

    try {
      // Coba hapus di Supabase
      try {
        await supabase.from("faqs").delete().eq("id", faqToDelete.id);
      } catch {
        // ignore
      }

      const nextList = faqs.filter((f) => f.id !== faqToDelete.id);
      await saveFaqsToStorage(nextList);
      showToast("FAQ berhasil dihapus.");
      setDeleteModalOpen(false);
      setFaqToDelete(null);
    } catch (err) {
      console.error("Gagal menghapus FAQ:", err);
      alert("Gagal menghapus FAQ.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset ke FAQ Default jika dibutuhkan
  const handleResetDefault = () => {
    if (confirm("Kembalikan daftar pertanyaan ke FAQ bawaan default?")) {
      saveFaqsToStorage(DEFAULT_FAQS);
      setExpandedIds(new Set(["faq-1"]));
      showToast("FAQ dikembalikan ke data default.");
    }
  };

  // Filter FAQ berdasarkan Pencarian dan Kategori
  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchCat =
        selectedCategory === "Semua" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  // Hitung jumlah item per kategori
  const categoryCounts = useMemo(() => {
    const counts = { Semua: faqs.length };
    faqs.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, [faqs]);

  // Warna badge kategori
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Tour Leader":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Muthawif":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Jamaah & Kloter":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "Teknis":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen flex flex-col">
      {/* Topbar Navigasi */}
      <Topbar title="FAQ" breadcrumbs={["Dashboard", "FAQ"]} />

      {/* Main Container */}
      <div className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8 w-full max-w-5xl mx-auto">
        {/* Toast Notifikasi */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#121c2d] text-white text-sm px-4 py-3 rounded-xl shadow-xl border border-yellow-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title="Frequently Asked Questions (FAQ)"
          description="Pusat informasi dan jawaban atas pertanyaan umum seputar operasional umroh, jamaah, kloter, dan teknis aplikasi Retali Sistem."
          icon={<HelpCircle className="w-7 h-7 text-yellow-400" />}
          buttonText="Tambah FAQ"
          buttonIcon={<Plus className="w-4 h-4" />}
          buttonOnClick={handleOpenAddModal}
        />

        {/* Search & Category Filter Section */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 md:p-6 mb-6">
          {/* Input Pencarian */}
          <div className="relative mb-5">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pertanyaan, kata kunci, atau jawaban..."
              className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3167] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-200/70 hover:bg-gray-200 rounded-md px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Kategori Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {PRESET_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#1b3167] text-white shadow-xs"
                      : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter Info & Reset Default Action */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs font-semibold text-gray-500">
            Menampilkan{" "}
            <span className="font-bold text-gray-800">
              {filteredFaqs.length}
            </span>{" "}
            pertanyaan
            {selectedCategory !== "Semua" && ` dalam kategori "${selectedCategory}"`}
          </p>
          {faqs.length > 0 && (
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-gray-400 hover:text-[#1b3167] flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset ke pertanyaan default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          )}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-3"></div>
              <p className="text-sm text-gray-500 font-medium">
                Memuat daftar FAQ...
              </p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 shadow-xs px-4">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800">
                Tidak ada pertanyaan ditemukan
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ada FAQ yang cocok dengan kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
                  : "Belum ada pertanyaan FAQ untuk kategori ini."}
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#1b3167] hover:bg-[#253247] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah FAQ Sekarang
              </button>
            </div>
          ) : (
            filteredFaqs.map((item, index) => {
              const isExpanded = expandedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                    isExpanded
                      ? "border-yellow-500/40 shadow-sm ring-1 ring-yellow-500/20"
                      : "border-gray-200/90 hover:border-gray-300 hover:shadow-xs"
                  }`}
                >
                  {/* Header FAQ: Kategori, Pertanyaan, Chevron */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="p-5 md:p-6 cursor-pointer flex items-start justify-between gap-4 select-none"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          #{index + 1}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-bold tracking-tight transition-colors ${
                          isExpanded
                            ? "text-[#1b3167]"
                            : "text-[#0f172a] hover:text-[#1b3167]"
                        }`}
                      >
                        {item.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
                          isExpanded
                            ? "bg-yellow-50 text-yellow-600 rotate-180"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Body Jawaban (Accordion Collapse/Expand) */}
                  {isExpanded && (
                    <div className="px-5 md:px-6 pb-6 pt-1 border-t border-gray-100 animate-in fade-in duration-150">
                      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-[#f8fafc] p-4 rounded-xl border border-gray-100">
                        {item.answer}
                      </div>

                      {/* Bar Aksi: Edit & Hapus */}
                      <div className="flex items-center justify-end gap-2 mt-4 pt-2">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(item, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-[#1b3167] transition-colors cursor-pointer"
                          title="Edit pertanyaan FAQ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleOpenDeleteModal(item, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Hapus pertanyaan FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Tambah / Edit FAQ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-7 border border-gray-100 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold">
                  {editingFaq ? (
                    <Edit3 className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingFaq ? "Edit Pertanyaan FAQ" : "Tambah Pertanyaan FAQ"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingFaq
                      ? "Perbarui rincian pertanyaan dan jawaban"
                      : "Tambahkan pertanyaan yang sering diajukan"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFaq} className="space-y-4">
              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1b3167] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Tour Leader">Tour Leader</option>
                    <option value="Muthawif">Muthawif</option>
                    <option value="Jamaah & Kloter">Jamaah & Kloter</option>
                    <option value="Teknis">Teknis</option>
                    <option value="Lainnya">Lainnya (Ketik Manual)...</option>
                  </select>
                </div>
                {formCategory === "Lainnya" && (
                  <input
                    type="text"
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="Masukkan nama kategori baru..."
                    className="mt-2 w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1b3167]"
                  />
                )}
              </div>

              {/* Pertanyaan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Pertanyaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Contoh: Bagaimana cara memindai barcode koper?"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1b3167] focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Jawaban */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Jawaban Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban yang jelas dan rinci di sini..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1b3167] focus:bg-white transition-all resize-y"
                  required
                />
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1b3167] hover:bg-[#253247] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingFaq ? "Simpan Perubahan" : "Tambah FAQ"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus FAQ */}
      {deleteModalOpen && faqToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Hapus Pertanyaan FAQ?
            </h3>
            <p className="text-xs text-gray-500 mb-4 px-2 line-clamp-2">
              "{faqToDelete.question}"
            </p>
            <p className="text-xs text-rose-600 mb-6 bg-rose-50 py-2 px-3 rounded-lg">
              Tindakan ini tidak dapat dibatalkan. Pertanyaan ini akan dihapus dari daftar FAQ.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setFaqToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
