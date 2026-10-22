"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { FaKaaba } from "react-icons/fa6";
import { HiDocumentText } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PersiapanUmrohPage() {
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

        // 2. Ambil data daftar materi persiapan umroh dari Supabase
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
        title="Persiapan Umroh"
        breadcrumbs={["Dashboard", "Persiapan", "Persiapan Umroh"]}
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 md:p-10 w-full max-w-5xl no-scrollbar mx-auto">
        <PageHeader
          title="Materi Persiapan Umroh"
          description="Materi panduan dan tips untuk menjalankan ibadah umroh dengan baik untuk diajari ke jamaah."
          icon={<FaKaaba className="w-[26px] h-[26px] text-[#eab308]" />}
          buttonText={isAdmin ? "Tambah Materi" : undefined}
          buttonIcon={
            isAdmin ? <FaKaaba className="w-[16px] h-[16px]" /> : undefined
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
                Belum ada materi persiapan umroh yang tersedia saat ini.
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

                  {/* Bagian Kanan: Tombol Export */}
                  <div className="shrink-0 self-end md:self-center pt-2 md:pt-0">
                    <button
                      onClick={handleExportPDF}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer border border-transparent"
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
