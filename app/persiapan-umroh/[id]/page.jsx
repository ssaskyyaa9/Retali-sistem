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
          .from("preparation_materials")
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
        .from("preparation_materials")
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
    window.print();
  };

  if (loading) {
    return (
      <div className="w-full bg-[#f8fafc] h-screen flex items-center justify-center text-gray-500 font-medium">
        Memuat data materi...
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar
        title="Persiapan Tour Leader"
        breadcrumbs={[
          "Dashboard",
          "Persiapan",
          "Persiapan Tour Leader",
          materi.title || `BAB ${id}`,
        ]}
      />

      <div className="flex-1 overflow-y-auto p-10 w-full max-w-5xl no-scrollbar mx-auto">
        {/* Tombol Kembali */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => router.push("/persiapan-tour-leader")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 transition font-medium shadow-sm group cursor-pointer"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Daftar Materi
          </button>
        </div>

        {/* CONTAINER UTAMA DETAIL MATERI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full mr-4">
              {isEditing ? (
                <div className="space-y-4">
                  {/* 1. Judul BAB (kolom title) */}
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

                  {/* 2. Subjudul (kolom sub_title) */}
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

                  {/* 3. Child Subjudul / Deskripsi (kolom description) */}
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
                      placeholder="Masukkan child subjudul..."
                    />
                  </div>

                  {/* 4. Content (Materi Penjelasan / Rich Text Editor) */}
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

                  {/* Tombol Simpan & Batal Edit */}
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
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#263754] uppercase bg-blue-50 px-2.5 py-1 rounded-md">
                    Modul Pembelajaran
                  </span>

                  {/* Menampilkan Title */}
                  <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mt-2">
                    {materi.title || `BAB ${id}`}
                  </h1>

                  {/* Menampilkan Sub Title & Description */}
                  {(materi.sub_title || materi.description) && (
                    <div className="text-sm text-gray-500 font-semibold mt-1 space-x-2">
                      {materi.sub_title && <span>{materi.sub_title}</span>}
                      {materi.sub_title && materi.description && <span>•</span>}
                      {materi.description && <span>{materi.description}</span>}
                    </div>
                  )}

                  {/* Menampilkan Content (Materi Penjelasan HTML) */}
                  <div
                    className="text-sm text-gray-600 mt-4 font-medium leading-relaxed prose max-w-none border-t border-gray-100 pt-4"
                    dangerouslySetInnerHTML={{
                      __html:
                        materi.content ||
                        "Belum ada materi penjelasan yang diisi.",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tombol Edit & Export to PDF */}
            <div className="flex items-center gap-2.5 shrink-0 print:hidden self-end md:self-auto">
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
        </div>
      </div>
    </div>
  );
}
