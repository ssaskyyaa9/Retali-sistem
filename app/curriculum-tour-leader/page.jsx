"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { FaBook, FaRegFilePdf } from "react-icons/fa6";
import { PlusIcon } from "@/app/components/CustomIcons";
import { HiDocumentText } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { exportMateriToPDF } from "@/lib/exportPdf";

export default function CurriculumTourLeaderPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cek role user Supabase & ambil data daftar materi kurikulum
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

        // 2. Ambil data daftar materi kurikulum tour leader
        const { data, error } = await supabase
          .from("curriculum_tour_leader")
          .select("id, title, sub_title, description, content")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          setMateriList(data);
        }
      } catch (err) {
        console.error("Gagal memuat data kurikulum:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Export PDF yang mencetak isi materi kurikulum lengkap
  const handleExportPDF = async (item, e) => {
    e.stopPropagation(); // Mencegah pindah halaman saat tombol export diklik

    let dataToExport = item;
    // Fallback: Jika content belum terisi di object item, ambil detail lengkap dari Supabase
    if (!dataToExport.content && dataToExport.id) {
      try {
        const { data } = await supabase
          .from("curriculum_tour_leader")
          .select("id, title, sub_title, description, content")
          .eq("id", dataToExport.id)
          .single();
        if (data) {
          dataToExport = data;
        }
      } catch (err) {
        console.error("Gagal memuat detail kurikulum untuk PDF:", err);
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
        title="Curriculum Tour Leader"
        breadcrumbs={["Dashboard", "Curriculum Tour Leader"]}
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 md:p-10 w-full max-w-5xl no-scrollbar mx-auto">
        <PageHeader
          title="Curriculum Tour Leader"
          description="Berisi materi dan standar kurikulum pelatihan untuk tour leader dalam memimpin serta membimbing jamaah."
          icon={<FaBook className="w-[26px] h-[26px] text-[#eab308]" />}
          buttonText={isAdmin ? "Tambah Materi" : undefined}
          buttonIcon={
            isAdmin ? <PlusIcon className="w-[16px] h-[16px]" /> : undefined
          }
          buttonOnClick={
            isAdmin
              ? () => router.push("/curriculum-tour-leader/tambah")
              : undefined
          }
        />

        {/* CONTAINER DAFTAR BAB / MATERI */}
        <div className="space-y-4 mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-3"></div>
              <p className="text-sm text-gray-500 font-medium">
                Memuat daftar kurikulum...
              </p>
            </div>
          ) : materiList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm px-4">
              <HiDocumentText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-800">
                Belum ada materi
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Belum ada materi curriculum tour leader yang tersedia saat ini.
              </p>
            </div>
          ) : (
            materiList.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/curriculum-tour-leader/${item.id}`)}
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
                        "Belum ada deskripsi untuk materi kurikulum ini."}
                    </p>
                  </div>

                  {/* Bagian Kanan: Tombol Export */}
                  <div className="shrink-0 self-end md:self-center pt-2 md:pt-0">
                    <button
                      onClick={(e) => handleExportPDF(item, e)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer border border-transparent flex items-center gap-2"
                    >
                      <FaRegFilePdf className="w-3.5 h-3.5 text-red-500" />
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
