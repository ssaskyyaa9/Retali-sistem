"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { FaBook } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PersiapanTourLeaderPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cek role user Supabase & ambil data daftar materi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Cek Role User Login
        const { data: { user } } = await supabase.auth.getUser();
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

        // 2. Ambil data daftar materi dari Supabase (Hanya mengambil kolom yang diperlukan)
       const { data, error } = await supabase
  .from("preparation_materials")
  .select("id, title, description")
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

  const handleExportPDF = (e) => {
    e.stopPropagation(); // Mencegah pindah halaman saat tombol export diklik
    window.print();
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar
        title="Persiapan Tour Leader"
        breadcrumbs={["Dashboard", "Persiapan", "Persiapan Tour Leader"]}
      />

      <div className="flex-1 overflow-y-auto p-10 w-full max-w-5xl no-scrollbar mx-auto">
        <PageHeader
          title="Materi Persiapan Tour Leader"
          description="Materi persiapan untuk tour leader, termasuk panduan dan tips untuk menjalankan tour dengan efektif."
          icon={<FaBook className="w-[26px] h-[26px] text-[#eab308]" />}
          buttonText={isAdmin ? "Tambah Materi" : undefined}
          buttonIcon={isAdmin ? <FaBook className="w-[16px] h-[16px]" /> : undefined}
          buttonOnClick={
            isAdmin
              ? () => router.push("/persiapan-tour-leader/tambah")
              : undefined
          }
        />

        {/* CONTAINER DAFTAR BAB */}
        <div className="space-y-6 mt-6">
          {loading ? (
            <div className="text-center text-gray-500 py-6 font-medium">Memuat daftar materi...</div>
          ) : materiList.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-white rounded-xl border border-gray-200">
              Belum ada materi persiapan.
            </div>
          ) : (
            materiList.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/persiapan-tour-leader/${item.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 relative transition-all duration-200 cursor-pointer hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="w-full mr-4 space-y-1">
                    {/* Menampilkan Title (Judul BAB) */}
                    <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
                      {item.title}
                    </h2>
                    
                    {/* Menampilkan Description (Subjudul / Keterangan di bawah judul) */}
                    <p className="text-sm text-gray-500 font-medium">
                      {item.description || "Belum ada deskripsi"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 print:hidden self-end md:self-auto">
                    <button
                      onClick={handleExportPDF}
                      className="bg-[#e2e8f0]/60 hover:bg-[#cbd5e1]/70 text-[#334155] text-xs px-3.5 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 cursor-pointer border border-transparent"
                    >
                      Export to pdf
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}