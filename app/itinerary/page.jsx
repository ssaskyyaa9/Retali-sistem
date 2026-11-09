"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { PlusIcon } from "@/app/components/CustomIcons";
import { IoCalendar } from "react-icons/io5";
import { 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiSearch,
  FiFilter
} from "react-icons/fi";
import Topbar from "@/app/components/Topbar";
import { createClient } from "@/lib/supabase";

export default function ItineraryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activitiesList, setActivitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");

  useEffect(() => {
    fetchActivitiesData();
  }, []);

  const fetchActivitiesData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("itinerary_activities")
        .select(`
          *,
          itinerary_days (
            id,
            day_number,
            activity_date,
            itineraries (
              id,
              title,
              status
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        const { data: simpleData, error: simpleErr } = await supabase
          .from("itinerary_activities")
          .select("*")
          .order("created_at", { ascending: false });

        if (simpleErr) throw simpleErr;
        setActivitiesList(simpleData || []);
      } else {
        setActivitiesList(data || []);
      }
    } catch (error) {
      console.error("Gagal memuat aktivitas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data itinerary ini?")) return;

    try {
      const { error } = await supabase
        .from("itinerary_activities")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setActivitiesList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Gagal menghapus:", error.message);
      alert("Gagal menghapus data: " + error.message);
    }
  };

  // Filter list berdasarkan search dan hari
  const filteredList = activitiesList.filter((item) => {
    const titleMatch = (item.title || item.location || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const descMatch = (item.description || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchSearch = titleMatch || descMatch;

    if (selectedDayFilter === "all") return matchSearch;
    const dayNum = item.itinerary_days?.day_number || 1;
    return matchSearch && String(dayNum) === String(selectedDayFilter);
  });

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
      <Topbar title="Itinerary" breadcrumbs={["Dashboard", "Itinerary"]} />
      
      <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Itinerary"
          description="Berisi daftar itinerary perjalanan umroh yang harus diikuti oleh jamaah."
          icon={<IoCalendar className="w-[26px] h-[26px] text-[#eab308]" />}
          buttonIcon={<PlusIcon />}
          buttonOnClick={() => router.push("/itinerary/tambah")}
          buttonText="Tambah Itinerary"
        />

        {/* Filter & Pencarian Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari agenda atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FiFilter className="text-slate-400 w-4 h-4" />
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Hari</option>
              <option value="1">Hari 1</option>
              <option value="2">Hari 2</option>
              <option value="3">Hari 3</option>
              <option value="4">Hari 4</option>
              <option value="5">Hari 5</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Itinerary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 font-bold text-[11px] border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Judul / Lokasi</th>
                  <th className="py-4 px-6">Waktu</th>
                  <th className="py-4 px-6 text-center">Hari</th>
                  <th className="py-4 px-6">Deskripsi / Catatan</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Dibuat</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-slate-400 text-center text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Memuat data itinerary dari Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-slate-400 text-center text-xs">
                      {activitiesList.length === 0 
                        ? "Belum ada data aktivitas di database. Klik tombol 'Tambah Itinerary' di atas untuk membuat."
                        : "Tidak ada data yang sesuai dengan pencarian atau filter."}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {item.title || item.location || "Tanpa Judul"}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs font-semibold">
                        {item.activity_time || "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl font-bold text-xs shadow-xs border border-indigo-100/50">
                          <span>{item.itinerary_days?.day_number || 1}</span>
                          <span className="text-[9px] font-normal uppercase">hari</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 truncate max-w-xs">
                        {item.description || "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
                          {item.itinerary_days?.itineraries?.status || "Terkirim"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => router.push(`/itinerary/lihat/${item.id}`)} 
                            className="p-2 bg-slate-100/70 hover:bg-indigo-50 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Lihat Detail Itinerary"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => router.push(`/itinerary/edit/${item.id}`)} 
                            className="p-2 bg-slate-100/70 hover:bg-amber-50 rounded-xl text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                            title="Edit Itinerary"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-2 bg-slate-100/70 hover:bg-rose-50 rounded-xl text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Itinerary"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
