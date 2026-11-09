"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FiMapPin, 
  FiPackage, 
  FiArrowLeft,
  FiSave,
  FiSend
} from "react-icons/fi";
import Topbar from "@/app/components/Topbar";
import { createClient } from "@/lib/supabase";

export default function TambahItineraryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    package_name: "Umrah Super Cermat",
    city: "Makkah",
    day_number: 1,
    activity_time: "08:00",
    duration: 1,
    activity_date: "",
    location: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "day_number") {
      const dayNum = Math.max(1, parseInt(value, 10) || 1);
      setFormData((prev) => ({ ...prev, day_number: dayNum }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (isPublished = false) => {
    if (!formData.location.trim()) {
      alert("Lokasi / judul kegiatan wajib diisi!");
      return;
    }

    try {
      setLoading(true);

      // Cari atau buat itinerary day yang sesuai
      const { data: dayData, error: dayErr } = await supabase
        .from("itinerary_days")
        .select("id")
        .eq("day_number", formData.day_number)
        .limit(1);

      let dayIdToUse = "";

      if (dayErr || !dayData || dayData.length === 0) {
        // Coba cari itinerary yang sudah ada atau buat baru
        const { data: existingItin } = await supabase
          .from("itineraries")
          .select("id")
          .limit(1);

        let itineraryId = existingItin?.[0]?.id;

        if (!itineraryId) {
          const { data: newItin, error: itinErr } = await supabase
            .from("itineraries")
            .insert([{ 
              title: formData.package_name, 
              status: isPublished ? "Terkirim" : "Draft" 
            }])
            .select()
            .single();

          if (itinErr) console.warn("Notice itineraries insert:", itinErr.message);
          itineraryId = newItin?.id;
        }

        const { data: newDay, error: insertDayErr } = await supabase
          .from("itinerary_days")
          .insert([{ 
            itinerary_id: itineraryId || null, 
            day_number: formData.day_number, 
            activity_date: formData.activity_date || null,
            title: `Hari ${formData.day_number}`
          }])
          .select()
          .single();

        if (insertDayErr) {
          // Jika insert gagal, coba ambil day pertama yang tersedia
          const { data: fallbackDay } = await supabase
            .from("itinerary_days")
            .select("id")
            .limit(1);
          dayIdToUse = fallbackDay?.[0]?.id;
        } else {
          dayIdToUse = newDay?.id;
        }
      } else {
        dayIdToUse = dayData[0].id;
      }

      // Hitung order aktivitas
      const { count } = await supabase
        .from("itinerary_activities")
        .select("*", { count: "exact", head: true });

      const { error: actError } = await supabase.from("itinerary_activities").insert([
        {
          itinerary_day_id: dayIdToUse,
          activity_time: formData.activity_time,
          title: formData.location,
          description: formData.description,
          location: formData.location,
          sort_order: (count || 0) + 1,
        },
      ]);

      if (actError) throw actError;

      alert(isPublished ? "Itinerary berhasil dipublikasikan!" : "Itinerary berhasil disimpan sebagai draft!");
      router.push("/itinerary");
    } catch (error) {
      console.error("Gagal menyimpan aktivitas:", error.message);
      alert("Terjadi kesalahan saat menyimpan data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
      <Topbar 
        title="Tambah Itinerary" 
        breadcrumbs={["Dashboard", "Itinerary", "Tambah Itinerary"]} 
      />
      
      <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 md:p-10 max-w-4xl mx-auto transition-all">
          {/* Header Card */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-100">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Tambah Aktivitas Itinerary
              </h2>
              <p className="text-xs text-slate-400">
                Lengkapi informasi mendetail mengenai agenda perjalanan dan aktivitas jamaah.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/itinerary")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200/80 transition-all shadow-sm cursor-pointer"
            >
              <FiArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nama Paket Umrah <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FiPackage className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="package_name"
                  value={formData.package_name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama paket umrah..."
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Kota <span className="text-rose-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="Makkah">Makkah</option>
                  <option value="Madinah">Madinah</option>
                  <option value="Jeddah">Jeddah</option>
                  <option value="Transit">Transit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hari Ke <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="day_number"
                  min="1"
                  value={formData.day_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Waktu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  name="activity_time"
                  value={formData.activity_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Durasi <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    name="duration"
                    min="1"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full pr-14 pl-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <span className="absolute right-4 text-xs font-bold text-slate-400 pointer-events-none">
                    jam
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tanggal Kegiatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="activity_date"
                value={formData.activity_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Lokasi / Judul Kegiatan <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Contoh: Ziarah Raudhah / Tawaf Wada / Keberangkatan Bandara"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Catatan / Deskripsi Aktivitas
              </label>
              <textarea
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tuliskan petunjuk teknis atau detail aktivitas untuk jamaah..."
                maxLength={500}
                className="w-full p-4 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
              ></textarea>
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[11px] text-slate-400 font-medium">Opsional untuk petunjuk rincian jamaah.</span>
                <span className="text-[11px] font-bold text-slate-400">
                  {formData.description.length}/500 karakter
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/itinerary")}
              className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Batal
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-all cursor-pointer"
              >
                <FiSave className="w-4 h-4" />
                {loading ? "Menyimpan..." : "Simpan Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-xs text-white bg-[#1e1b4b] hover:bg-[#2e2a72] active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-indigo-950/25 cursor-pointer"
              >
                <FiSend className="w-4 h-4" />
                {loading ? "Memproses..." : "Publikasikan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
