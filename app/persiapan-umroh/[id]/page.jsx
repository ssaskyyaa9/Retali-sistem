"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import {
  FaArrowLeft,
  FaPenToSquare,
  FaRegFilePdf,
  FaCheck,
} from "react-icons/fa6";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { exportMateriToPDF } from "@/lib/exportPdf";

// Load React Quill secara dinamis agar kompatibel dengan Next.js App Router
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function DetailMateriPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State langsung memetakan 4 kolom database: title, sub_title, description, content
  const [materi, setMateri] = useState({
    id: "",
    title: "",
    sub_title: "",
    description: "",
    content: "",
  });

  // Konfigurasi toolbar editor ala Microsoft Word
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["clean"],
    ],
  };

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

        // 2. Ambil Data Detail Materi dari Supabase (Langsung 4 Kolom)
        const { data: dataMateri, error } = await supabase
          .from("preparation_assignments")
          .select("id, title, sub_title, description, content")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (dataMateri) {
          setMateri({
            id: dataMateri.id,
            title: dataMateri.title || "",
            sub_title: dataMateri.sub_title || "",
            description: dataMateri.description || "",
            content: dataMateri.content || "",
          });
        }
      } catch (err) {
        console.error("Gagal memuat data dari Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Fungsi membersihkan dan merapikan konten HTML dari Supabase agar tidak miring dan rapih ke bawah
  const formatContent = (html) => {
    if (!html) return "<p>Belum ada materi penjelasan yang diisi.</p>";
    // Ganti non-breaking space (&nbsp; dan \u00a0) agar teks membungkus (wrap) ke bawah secara alami
    return html.replace(/&nbsp;/g, " ").replace(/\u00a0/g, " ");
  };

  // Fungsi Simpan Perubahan saat Edit ke 4 Kolom Database
  const handleSave = async () => {
    try {
      const payload = {
        title: materi.title,
        sub_title: materi.sub_title || null,
        description: materi.description || null,
        content: materi.content,
      };

      const { data, error } = await supabase
        .from("preparation_assignments")
        .update(payload)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase Update Error:", error);
        alert(`Gagal menyimpan: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        alert(
          "Gagal update: Terhalang aturan RLS Supabase (Pastikan Policy UPDATE sudah dibuat).",
        );
        return;
      }

      setIsEditing(false);
      alert("Materi berhasil disimpan!");
    } catch (err) {
      console.error("System Error:", err);
      alert("Terjadi kesalahan sistem saat menyimpan.");
    }
  };

  const handleExportPDF = () => {
    exportMateriToPDF({
      title: materi.title || `BAB ${id}`,
      sub_title: materi.sub_title,
      description: materi.description,
      content: materi.content,
    });
  };

  if (loading) {
    return (
      <div className="w-full bg-[#f8fafc] h-screen flex items-center justify-center text-gray-500 font-medium">
        Memuat data materi...
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen overflow-x-hidden flex flex-col">
      <Topbar
        title="Persiapan Umroh"
        breadcrumbs={[
          "Dashboard",
          "Persiapan",
          "Persiapan Umroh",
          materi.title || `BAB ${id}`,
        ]}
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full max-w-5xl mx-auto">
        {/* Tombol Kembali */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => router.push("/persiapan-umroh")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 transition font-medium shadow-sm group cursor-pointer"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Daftar Materi
          </button>
        </div>

        {/* CONTAINER UTAMA DETAIL MATERI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 w-full box-border">
          
          {/* HEADER ATAS: Badge & Tombol Aksi */}
          <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-gray-100 mb-6 print:hidden">
            <span className="text-xs font-bold tracking-wider text-[#263754] uppercase bg-blue-50 px-2.5 py-1 rounded-md">
              Modul Pembelajaran
            </span>
            
            <div className="flex items-center gap-2.5">
              {!isEditing && (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#263754] hover:bg-[#1e293b] text-white text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold shadow-sm cursor-pointer"
                    >
                      <FaPenToSquare className="w-3.5 h-3.5" />
                      Edit Materi
                    </button>
                  )}
                  <button
                    onClick={handleExportPDF}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold border border-gray-200 cursor-pointer"
                  >
                    <FaRegFilePdf className="w-3.5 h-3.5 text-red-500" />
                    Export to PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* KONTEN UTAMA */}
          <div className="w-full">
            {isEditing ? (
              <div className="space-y-4">
                {/* 1. Judul BAB */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Judul BAB
                  </label>
                  <input
                    type="text"
                    value={materi.title}
                    onChange={(e) =>
                      setMateri({ ...materi, title: e.target.value })
                    }
                    className="text-xl font-bold text-gray-900 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#263754] w-full bg-white"
                    placeholder="Judul BAB..."
                  />
                </div>

                {/* 2. Subjudul */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Subjudul
                  </label>
                  <input
                    type="text"
                    value={materi.sub_title}
                    onChange={(e) =>
                      setMateri({ ...materi, sub_title: e.target.value })
                    }
                    className="text-sm text-gray-900 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#263754] w-full bg-white"
                    placeholder="Masukkan subjudul..."
                  />
                </div>

                {/* 3. Deskripsi Singkat */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Deskripsi Singkat
                  </label>
                  <input
                    type="text"
                    value={materi.description}
                    onChange={(e) =>
                      setMateri({ ...materi, description: e.target.value })
                    }
                    className="text-sm text-gray-900 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#263754] w-full bg-white"
                    placeholder="Masukkan deskripsi singkat..."
                  />
                </div>

                {/* 4. Content (Rich Text Editor) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Materi Penjelasan
                  </label>
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-300 [&_.ql-editor]:text-gray-900 [&_.ql-editor.ql-blank::before]:text-gray-400">
                    <ReactQuill
                      theme="snow"
                      value={materi.content}
                      onChange={(value) =>
                        setMateri({ ...materi, content: value })
                      }
                      modules={modules}
                      placeholder="Tuliskan materi penjelasan di sini..."
                      className="h-64 mb-12"
                    />
                  </div>
                </div>

                {/* Tombol Simpan & Batal */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-[#263754] hover:bg-[#1e293b] text-white px-6 py-2 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <FaCheck className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4">
                {/* 1. Menampilkan Title / Judul BAB */}
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight !not-italic break-words">
                  {materi.title || `BAB ${id}`}
                </h1>

                {/* 2. Menampilkan Sub Title (Subjudul) - Rapi Kebawah */}
                {materi.sub_title && (
                  <h2 className="text-base md:text-lg font-semibold text-gray-700 !not-italic break-words mt-1">
                    {materi.sub_title}
                  </h2>
                )}

                {/* 3. Menampilkan Description (Deskripsi Singkat) - Rapi Kebawah */}
                {materi.description && (
                  <p className="text-sm text-gray-500 font-normal !not-italic leading-relaxed break-words mt-1">
                    {materi.description}
                  </p>
                )}

                {/* Garis Pemisah Antara Header dan Konten Materi */}
                <hr className="border-t border-gray-100 my-4" />

                {/* 4. Menampilkan Content / Materi Penjelasan - Rapi Kebawah & Tidak Miring */}
                <div
                  className="w-full text-sm md:text-base text-gray-800 font-normal !not-italic leading-relaxed break-words whitespace-normal [&_*]:!not-italic [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1.5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-[#0f172a] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:text-[#0f172a] [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:text-[#0f172a] [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:my-3 [&_blockquote]:text-gray-600 [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-justify]:text-justify [&_.ql-indent-1]:pl-6 [&_.ql-indent-2]:pl-12 [&_.ql-indent-3]:pl-18"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(materi.content),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
