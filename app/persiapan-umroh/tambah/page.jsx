"use client";
import React, { useState } from "react";
import Topbar from "@/app/components/Topbar";
import { FaArrowLeft, FaCheck } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function TambahMateriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    bab: "",
    subjudul: "",
    anakSubjudul: "",
    deskripsi: "",
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.bab || !form.deskripsi || form.deskripsi === "<p><br></p>") {
      alert("Judul BAB dan Materi Penjelasan wajib diisi!");
      return;
    }

    try {
      setLoading(true);

      // Ambil user login saat ini (jika ada)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // SIMPAN MASING-MASING KE KOLOM SUPABASE YANG SESUAI:
      // title, sub_title, description, content
      const { error } = await supabase.from("preparation_assignments").insert([
        {
          title: form.bab,
          sub_title: form.subjudul || null,
          description: form.anakSubjudul || null,
          content: form.deskripsi,
          category: "Tour Leader",
          visibility: "public",
          is_published: true,
          created_by: user ? user.id : null,
        },
      ]);

      if (error) throw error;

      alert("Materi berhasil ditambahkan!");
      router.push("/persiapan-umroh");
    } catch (err) {
      console.error("Gagal menyimpan ke Supabase:", err);
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar
        title="Persiapan Umroh"
        breadcrumbs={[
          "Dashboard",
          "Persiapan",
          "Persiapan Umroh",
          "Tambah Materi",
        ]}
      />

      <div className="flex-1 overflow-y-auto p-10 w-full max-w-5xl no-scrollbar mx-auto">
        {/* Tombol Kembali */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/persiapan-umroh")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 transition font-medium shadow-sm group cursor-pointer"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-0.5 transition-transform" />
            Kembali
          </button>
        </div>

        {/* CONTAINER FORM TAMBAH */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
          <h1 className="text-2xl font-extrabold text-[#0f172a] mb-6">
            Tambah Materi Bab Baru
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Judul BAB -> kolom title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Judul BAB
              </label>
              <input
                type="text"
                required
                value={form.bab}
                onChange={(e) => setForm({ ...form, bab: e.target.value })}
                placeholder="Masukkan judul BAB..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#263754] focus:border-transparent outline-none transition bg-white"
              />
            </div>

            {/* Input Subjudul -> kolom sub_title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Subjudul
              </label>
              <input
                type="text"
                value={form.subjudul}
                onChange={(e) => setForm({ ...form, subjudul: e.target.value })}
                placeholder="Masukkan subjudul..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#263754] focus:border-transparent outline-none transition bg-white"
              />
            </div>

            {/* Input Anak Subjudul -> kolom description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Deskripsi
              </label>
              <input
                type="text"
                value={form.anakSubjudul}
                onChange={(e) =>
                  setForm({ ...form, anakSubjudul: e.target.value })
                }
                placeholder="Masukkan anak subjudul..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#263754] focus:border-transparent outline-none transition bg-white"
              />
            </div>

            {/* Editor Word -> kolom content */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Materi Penjelasan
              </label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-300 [&_.ql-editor]:text-gray-900 [&_.ql-editor.ql-blank::before]:text-gray-400">
                <ReactQuill
                  theme="snow"
                  value={form.deskripsi}
                  onChange={(value) => setForm({ ...form, deskripsi: value })}
                  modules={modules}
                  placeholder="Tuliskan materi penjelasan di sini..."
                  className="h-64 mb-12"
                />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/persiapan-umroh")}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#263754] hover:bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FaCheck className="w-3.5 h-3.5" />
                {loading ? "Menyimpan..." : "Simpan Materi Baru"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
