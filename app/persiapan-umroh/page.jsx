"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { FaKaaba } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PersiapanUmrohPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // Data daftar BAB untuk Persiapan Umroh
  const [materiList, setMateriList] = useState([
    {
      id: 1,
      bab: "BAB 1",
      subjudul: "Panduan Dasar & Manasik Umroh untuk Jamaah",
    },
  ]);

  // Cek role user Supabase
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
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
      } catch (err) {
        console.error("Gagal mengambil role:", err);
      }
    };

    fetchUserRole();
  }, []);

  const handleExportPDF = (e) => {
    e.stopPropagation(); // Biar gak kepicu klik pindah halaman saat pencet export
    window.print();
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar
        title="Persiapan Umroh"
        breadcrumbs={["Dashboard", "Persiapan", "Persiapan Umroh"]}
      />

      <div className="flex-1 overflow-y-auto p-10 w-full max-w-5xl no-scrollbar mx-auto">
        <PageHeader
          title="Materi Persiapan Umroh"
          description="Materi panduan dan tips untuk menjalankan ibadah umroh dengan baik untuk diajari ke jamaah."
          icon={<FaKaaba className="w-[26px] h-[26px] text-[#eab308]" />}
          buttonText={isAdmin ? "Tambah Materi" : undefined}
          buttonIcon={isAdmin ? <FaKaaba className="w-[16px] h-[16px]" /> : undefined}
          buttonOnClick={
            isAdmin
              ? () => router.push("/persiapan-umroh/tambah")
              : undefined
          }
        />

        {/* CONTAINER DAFTAR BAB */}
        <div className="space-y-6 mt-6">
          {materiList.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/persiapan-umroh/${item.id}`)}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-8 relative transition-all duration-200 cursor-pointer hover:border-gray-300 hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div className="w-full mr-4">
                  <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
                    {item.bab}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.subjudul}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 print:hidden">
                  <button
                    onClick={handleExportPDF}
                    className="bg-[#e2e8f0] hover:bg-gray-300 text-gray-800 text-xs px-3 py-1.5 rounded transition font-medium"
                  >
                    Export to pdf
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}