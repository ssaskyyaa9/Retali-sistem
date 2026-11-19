"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { FaKaaba, FaRegFilePdf, FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import { HiDocumentText } from "react-icons/hi2";
import { PlusIcon } from "@/app/components/CustomIcons";
import { FaPassport } from "react-icons/fa";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { exportMateriToPDF } from "@/lib/exportPdf";

export default function PersiapanUmrohPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("persiapan_teknis")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) {
        console.error("Gagal menghapus materi:", error.message);
        showToast(`Gagal menghapus materi: ${error.message}`, "error");
        return;
      }

      setMateriList((prev) => prev.filter((m) => m.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      showToast("Materi persiapan teknis berhasil dihapus.", "success");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Terjadi kesalahan saat menghapus materi.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cek role user Supabase & ambil data daftar materi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Cek Role User Login
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile) {
            setIsAdmin(profile.role === "admin");
          }
        }

        // 2. Ambil data daftar materi persiapan umroh dari Supabase (termasuk sub_title dan content)
        const { data, error } = await supabase
          .from("persiapan_teknis")
          .select("id, title, sub_title, description, content")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setMateriList(data);
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

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

  // Export PDF yang mencetak isi materi lengkap yang ada di dalam (Judul, Subjudul, Deskripsi, & Isi Konten)
  const handleExportPDF = async (item, e) => {
    e.stopPropagation(); // Mencegah pindah halaman saat tombol export diklik

    let dataToExport = item;
    // Fallback: Jika content belum terisi di object item, ambil detail lengkap dari Supabase
    if (!dataToExport.content && dataToExport.id) {
      try {
        const { data } = await supabase
          .from("persiapan_teknis")
          .select("id, title, sub_title, description, content")
          .eq("id", dataToExport.id)
          .single();
        if (data) {
          dataToExport = data;
        }
      } catch (err) {
        console.error("Gagal memuat detail materi untuk PDF:", err);
      }
    }

    try {
      setExportingId(item.id);
      exportMateriToPDF({
        title: dataToExport.title || dataToExport.bab,
        sub_title: dataToExport.sub_title,
        description: dataToExport.description || dataToExport.anakSubjudul,
        content: dataToExport.content,
        onAfterPrint: () => {
          setExportingId(null);
          showToast("Materi berhasil diekspor ke PDF!", "success");
        },
        onError: (err) => {
          setExportingId(null);
          showToast("Gagal mengekspor PDF: " + err.message, "error");
        },
      });
    } catch (err) {
      console.error("Export PDF error:", err);
      setExportingId(null);
      showToast("Gagal mengekspor PDF: " + err.message, "error");
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar
        title="Persiapan Teknis"
        breadcrumbs={["Dashboard", "Persiapan", "Persiapan Teknis"]}
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 md:p-10 w-full max-w-5xl no-scrollbar mx-auto">
        <PageHeader
          title="Materi Persiapan Teknis"
          description="Berisi materi persiapan teknis untuk calon jamaah umroh, termasuk informasi penting dan panduan yang perlu diketahui sebelum keberangkatan."
          icon={<FaPassport className="w-[26px] h-[26px] text-[#eab308]" />}
          buttonText={isAdmin ? "Tambah Materi" : undefined}
          buttonIcon={
            isAdmin ? <PlusIcon className="w-[16px] h-[16px]" /> : undefined
          }
          buttonOnClick={
            isAdmin ? () => router.push("/persiapan-umroh/tambah") : undefined
          }
        />

        {/* CONTAINER DAFTAR BAB */}
        <div className="space-y-4 mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-3"></div>
              <p className="text-sm text-gray-500 font-medium">
                Memuat daftar materi...
              </p>
            </div>
          ) : materiList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm px-4">
              <HiDocumentText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-800">
                Belum ada materi
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Belum ada materi persiapan teknis yang tersedia saat ini.
              </p>
            </div>
          ) : (
            materiList.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/persiapan-umroh/${item.id}`)}
                className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-6 md:p-7 relative transition-all duration-200 cursor-pointer hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Bagian Kiri: Judul & Deskripsi */}
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] tracking-tight group-hover:text-amber-600 transition-colors">
                      {item.title || item.bab}
                    </h2>
                    <p className="text-sm text-gray-500 font-normal leading-relaxed line-clamp-2">
                      {item.description ||
                        item.subjudul ||
                        "Belum ada deskripsi untuk materi ini."}
                    </p>
                  </div>

                  {/* Bagian Kanan: Tombol Aksi */}
                  <div className="shrink-0 self-end md:self-center pt-2 md:pt-0 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={exportingId === item.id}
                      onClick={(e) => handleExportPDF(item, e)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3.5 py-2.5 rounded-lg font-medium transition-all cursor-pointer border border-transparent flex items-center gap-2 shadow-xs disabled:opacity-60"
                      title="Export to PDF"
                    >
                      <FaRegFilePdf className="w-3.5 h-3.5 text-red-500" />
                      {exportingId === item.id ? "Menyiapkan PDF..." : "Export to pdf"}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/persiapan-umroh/${item.id}?edit=true`);
                        }}
                        className="bg-[#263754] hover:bg-[#1e293b] text-white text-xs px-3.5 py-2.5 rounded-lg font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                        title="Edit Materi"
                      >
                        <FaPenToSquare className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(item);
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs px-3.5 py-2.5 rounded-lg font-semibold transition-all cursor-pointer border border-rose-200/80 flex items-center gap-1.5 shadow-xs"
                        title="Hapus Materi"
                      >
                        <FaTrashCan className="w-3.5 h-3.5 text-rose-600" />
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <FaTrashCan className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Hapus Materi Persiapan Teknis</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus materi <span className="font-bold text-gray-800">"{itemToDelete?.title || itemToDelete?.bab}"</span> secara permanen?
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
                onClick={handleDelete}
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
