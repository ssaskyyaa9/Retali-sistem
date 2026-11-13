"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { FaBook, FaRegFilePdf, FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import { PlusIcon } from "@/app/components/CustomIcons";
import { BsMoonStarsFill } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { exportMateriToPDF } from "@/lib/exportPdf";

export default function PersiapanTourLeaderPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("persiapan_diniyah")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) {
        console.error("Gagal menghapus materi:", error.message);
        alert(`Gagal menghapus materi: ${error.message}`);
        return;
      }

      setMateriList((prev) => prev.filter((m) => m.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Terjadi kesalahan saat menghapus materi.");
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

        // 2. Ambil data daftar materi dari Supabase (termasuk sub_title dan content)
        const { data, error } = await supabase
          .from("persiapan_diniyah")
          .select("id, title, sub_title, description, content")
          .order("created_at", { ascending: true });

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
  }, []);

  // Export PDF yang mencetak isi materi lengkap yang ada di dalam (Judul, Subjudul, Deskripsi, & Isi Konten)
  const handleExportPDF = async (item, e) => {
    e.stopPropagation(); // Mencegah pindah halaman saat tombol export diklik

    let dataToExport = item;
    // Fallback: Jika content belum terisi di object item, ambil detail lengkap dari Supabase
    if (!dataToExport.content && dataToExport.id) {
      try {
        const { data } = await supabase
          .from("persiapan_diniyah")
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

    exportMateriToPDF({
      title: dataToExport.title || dataToExport.bab,
      sub_title: dataToExport.sub_title,
      description: dataToExport.description || dataToExport.anakSubjudul,
      content: dataToExport.content,
    });
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar
        title="Persiapan Diniyah"
        breadcrumbs={["Dashboard", "Persiapan", "Persiapan Diniyah"]}
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 md:p-10 w-full max-w-5xl no-scrollbar mx-auto">
        <PageHeader
          title="Materi Persiapan Diniyah"
          description="Berisi materi persiapan diniyah untuk calon jamaah umroh, termasuk informasi penting dan panduan yang perlu diketahui sebelum keberangkatan."
          icon={<BsMoonStarsFill className="w-[26px] h-[26px] text-[#eab308]" />}
          buttonText={isAdmin ? "Tambah Materi" : undefined}
          buttonIcon={
            isAdmin ? <PlusIcon className="w-[16px] h-[16px]" /> : undefined
          }
          buttonOnClick={
            isAdmin
              ? () => router.push("/persiapan-tour-leader/tambah")
              : undefined
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
                Belum ada materi persiapan diniyah yang tersedia saat ini.
              </p>
            </div>
          ) : (
            materiList.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/persiapan-tour-leader/${item.id}`)}
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
                      onClick={(e) => handleExportPDF(item, e)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3.5 py-2.5 rounded-lg font-medium transition-all cursor-pointer border border-transparent flex items-center gap-2 shadow-xs"
                      title="Export to PDF"
                    >
                      <FaRegFilePdf className="w-3.5 h-3.5 text-red-500" />
                      Export to pdf
                    </button>

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/persiapan-tour-leader/${item.id}?edit=true`);
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
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-all duration-300 ease-in-out ${
          deleteModalOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-in-out ${
            deleteModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between bg-[#1b3167] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
                <FaTrashCan className="w-4 h-4 text-rose-400" />
              </div>
              <h2 className="text-sm font-bold">Hapus Materi</h2>
            </div>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="text-gray-300 hover:text-white transition-colors p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-6 text-center">
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <p className="text-base font-bold text-gray-900 mt-2 line-clamp-2">
              "{itemToDelete?.title || itemToDelete?.bab}"
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
