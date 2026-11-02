"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/app/components/PageHeader";
import { PlusIcon } from "@/app/components/CustomIcons";
import { IoCalendar } from "react-icons/io5";
import { FiEye, FiEdit2, FiTrash2, FiMapPin, FiClock } from "react-icons/fi";
import Topbar from "@/app/components/Topbar";
import { createClient } from "@/lib/supabase";

export default function ItineraryPage() {
  const supabase = createClient();

  const [view, setView] = useState(0); // 0 = List View, 1 = Add Form, 2 = Detail View
  const [activitiesList, setActivitiesList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    package_name: "Umrah Super Cermat",
    city: "Makkah",
    day_number: 1,
    activity_time: "08:00",
    duration: 0,
    activity_date: "",
    location: "",
    description: "",
  });

  // Ambil data langsung dari tabel itinerary_activities
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
            day_number,
            activity_date,
            itineraries (
              title
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "day_number") {
      const dayNum = Math.max(1, parseInt(value) || 1);
      setFormData((prev) => ({ ...prev, day_number: dayNum }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Simpan Data ke Supabase
  const handleSave = async (isPublished = false) => {
    if (!formData.location) {
      alert("Lokasi/judul kegiatan wajib diisi!");
      return;
    }

    try {
      setLoading(true);

      const { data: dayData, error: dayErr } = await supabase
        .from("itinerary_days")
        .select("id")
        .limit(1);

      let dayIdToUse = "";

      if (dayErr || !dayData || dayData.length === 0) {
        const { data: newItin } = await supabase
          .from("itineraries")
          .insert([{ title: formData.package_name, status: isPublished ? "Terkirim" : "Draft" }])
          .select()
          .single();

        const { data: newDay } = await supabase
          .from("itinerary_days")
          .insert([{ itinerary_id: newItin?.id, day_number: formData.day_number, activity_date: formData.activity_date || null }])
          .select()
          .single();

        dayIdToUse = newDay?.id;
      } else {
        dayIdToUse = dayData[0].id;
      }

      const { error: actError } = await supabase.from("itinerary_activities").insert([
        {
          itinerary_day_id: dayIdToUse,
          activity_time: formData.activity_time,
          title: formData.location,
          description: formData.description,
          location: formData.location,
          sort_order: activitiesList.length + 1,
        },
      ]);

      if (actError) throw actError;

      alert(isPublished ? "Itinerary berhasil dipublikasikan!" : "Itinerary berhasil disimpan!");
      setView(0);
      fetchActivitiesData();
    } catch (error) {
      console.error("Gagal menyimpan:", error.message);
      alert("Terjadi kesalahan saat menyimpan data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hapus Data
  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase
        .from("itinerary_activities")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setActivitiesList(activitiesList.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Gagal menghapus:", error.message);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar title="Itinerary" breadcrumbs={["Dashboard", "Itinerary"]} />
      
      <div className="flex-1 overflow-y-auto p-10 w-full max-w-7xl mx-auto">
        {/* LIST VIEW */}
        {view === 0 && (
          <div>
            <PageHeader
              title="Itinerary"
              description="Berisi daftar itinerary perjalanan umroh yang harus diikuti oleh jamaah."
              icon={<IoCalendar className="w-[26px] h-[26px] text-[#eab308]" />}
              buttonIcon={<PlusIcon />}
              buttonOnClick={() => setView(1)}
              buttonText="Tambah Itinerary"
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-gray-400 font-semibold text-xs border-b border-gray-100 uppercase tracking-wider">
                      <th className="py-4 px-4">Judul / Lokasi</th>
                      <th className="py-4 px-4">Waktu</th>
                      <th className="py-4 px-4 text-center">Hari</th>
                      <th className="py-4 px-4">Deskripsi / Catatan</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Dibuat</th>
                      <th className="py-4 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-gray-400 text-center">
                          Memuat data dari Supabase...
                        </td>
                      </tr>
                    ) : activitiesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-gray-400 text-center">
                          Belum ada data aktivitas di database.
                        </td>
                      </tr>
                    ) : (
                      activitiesList.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-4 font-bold text-gray-900">
                            {item.title || item.location || "Tanpa Judul"}
                          </td>
                          <td className="py-4 px-4 text-gray-500 text-xs">
                            {item.activity_time || "-"}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex flex-col items-center justify-center bg-[#e0e7ff] text-[#3730a3] px-3 py-1 rounded-xl font-bold text-xs shadow-sm">
                              <span>{item.itinerary_days?.day_number || 1}</span>
                              <span className="text-[10px] font-normal">hari</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-600 truncate max-w-xs">
                            {item.description || "-"}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#d1fae5] text-[#065f46]">
                              Terkirim
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-500">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedItem(item);
                                  setView(2);
                                }} 
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                title="Lihat"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setView(1)} 
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-orange-500 transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)} 
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                                title="Hapus"
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
        )}

        {/* ADD FORM VIEW */}
        {view === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-[#263754] mb-8 pb-4 border-b">
              Tambah Aktivitas Itinerary Baru
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Paket Umrah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="package_name"
                  value={formData.package_name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama paket umrah"
                  className="w-full border text-gray-900 border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#263754]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Kota <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border text-gray-700 border-gray-300 rounded px-4 py-2.5 text-sm bg-white"
                  >
                    <option value="Makkah">Makkah</option>
                    <option value="Madinah">Madinah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Hari <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="day_number"
                    min="1"
                    value={formData.day_number}
                    onChange={handleInputChange}
                    placeholder="1"
                    className="w-full border text-gray-700 border-gray-300 rounded px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Waktu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="activity_time"
                    value={formData.activity_time}
                    onChange={handleInputChange}
                    className="w-full border text-gray-700 border-gray-300 rounded px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Durasi <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full border text-gray-700 border-gray-300 rounded px-4 py-2.5 text-sm"
                    />
                    <span className="flex items-center text-sm font-medium text-gray-500">jam</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="activity_date"
                  value={formData.activity_date}
                  onChange={handleInputChange}
                  className="w-full border text-gray-900 border-gray-300 rounded px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Lokasi / Judul Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Masukkan lokasi kegiatan"
                  className="w-full border text-gray-900 border-gray-300 rounded px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Catatan / Deskripsi
                </label>
                <textarea
                  rows="4"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tambahkan catatan jika diperlukan"
                  maxLength={500}
                  className="w-full border placeholder:text-gray-400 text-gray-900 border-gray-300 rounded px-4 py-2.5 text-sm"
                ></textarea>
                <span className="text-xs text-gray-400">Opsional • maksimal 500 karakter</span>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setView(0)}
                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded font-bold text-sm hover:bg-gray-300 transition-colors"
              >
                Kembali
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded font-bold text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={loading}
                  className="bg-[#172554] text-white px-8 py-2.5 rounded font-bold text-sm hover:bg-[#1e3a8a] disabled:opacity-50 transition-colors"
                >
                  {loading ? "Memproses..." : "Publikasikan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL VIEW (Sesuai Desain Gambar) */}
        {view === 2 && (
          <div className="space-y-6">
            {/* Header Card Navy */}
            <div className="bg-[#121c38] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#34d399]"></span> Terkirim
                  </span>
                  <span className="bg-white/10 text-gray-200 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-2">
                    <IoCalendar className="text-blue-400" /> 
                    {selectedItem?.itinerary_days?.activity_date 
                      ? new Date(selectedItem.itinerary_days.activity_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : "10 Aug 2026 — 11 Aug 2026"}
                  </span>
                  <span className="bg-white/10 text-gray-200 text-xs font-medium px-3 py-1 rounded-full">
                    📦 2 Hari
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setView(1)}
                    className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" /> Edit Itinerary
                  </button>
                  <button 
                    onClick={() => setView(0)}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-white/10"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight mb-4">
                {selectedItem?.itinerary_days?.itineraries?.title || "Umrah Plus Eropa"}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                <span className="text-gray-400 font-medium">Penerima:</span>
                <span className="bg-[#3730a3]/60 border border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-medium">
                  Muhammad Fio Ramadhan <span className="opacity-70">(Umrah Itikaf Mandiri)</span>
                </span>
                <span className="bg-[#047857]/50 border border-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-xs font-medium">
                  Fio <span className="opacity-70">(Umrah Itikaf Mandiri)</span>
                </span>
              </div>
            </div>

            {/* Content Day List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <h3 className="font-bold text-gray-900 text-base">
                    Hari {selectedItem?.itinerary_days?.day_number || 1}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    {selectedItem?.itinerary_days?.activity_date 
                      ? new Date(selectedItem.itinerary_days.activity_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : "10 Aug 2026"}
                  </span>
                  <span className="bg-[#f3e8ff] text-[#6b21a8] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" /> {selectedItem?.location || "Jakarta - Mumbai - Jeddah"}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  1 kegiatan ▾
                </span>
              </div>

              {/* Activity Card Inside Day */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-[#4338ca] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>{selectedItem?.activity_time || "11:24 - 13:24"}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {selectedItem?.title || selectedItem?.location || "Keberangkatan Umrah Bandara CGK"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {selectedItem?.description || "Solaria Terminal 2 Bandara Soetta"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-400">#1</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}