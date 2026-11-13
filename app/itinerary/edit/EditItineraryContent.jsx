"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FiArrowLeft,
  FiEdit2, 
  FiTrash2, 
  FiChevronUp,
  FiChevronDown,
  FiPlus,
  FiClock,
  FiMapPin,
  FiCheck
} from "react-icons/fi";
import Topbar from "@/app/components/Topbar";
import { createClient } from "@/lib/supabase";

export default function EditItineraryContent({ id }) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Data penerima dari Supabase profiles
  const [tourleaders, setTourleaders] = useState([]);
  const [muthawifs, setMuthawifs] = useState([]);

  // Accordion state
  const [openDays, setOpenDays] = useState({ 1: true, 2: true });

  const toggleDay = (dayNum) => {
    setOpenDays(prev => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  // State Informasi Utama Itinerary
  const [editData, setEditData] = useState({
    title: "Umrah Plus Eropa",
    start_date: "2026-08-10",
    end_date: "2026-08-11",
    recipient_type: "Pengguna Tertentu",
    selected_users: [],
  });

  // State untuk Hari & Kegiatan yang dapat dikelola secara dinamis
  const [daysData, setDaysData] = useState([
    {
      day_number: 1,
      city: "Jakarta - Mumbai - Jeddah",
      date: "2026-08-10",
      activities: [
        {
          id: "act-1",
          time: "11:24 - 13:24",
          title: "Keberangkatan Umrah Bandara CGK",
          location: "Solaria Terminal 2 Bandara Soetta",
        },
        {
          id: "act-2",
          time: "14:24 - 17:24",
          title: "Take Off",
          location: "Bandara Soekarno Hatta",
        }
      ]
    },
    {
      day_number: 2,
      city: "Jeddah - Madinah",
      date: "2026-08-11",
      activities: [
        {
          id: "act-3",
          time: "12:24 - 14:24",
          title: "Tiba di Bandara Madinah",
          location: "Bandara Internasional Pangeran Mohammad bin Abdulaziz",
        }
      ]
    }
  ]);

  // Modal / Inline tambah kegiatan
  const [addingActivityDay, setAddingActivityDay] = useState(null);
  const [newActivity, setNewActivity] = useState({
    time: "08:00 - 10:00",
    title: "",
    location: ""
  });

  // Fetch recipients dan data itinerary jika ada ID
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchRecipientsData();
    if (id) {
      // eslint-disable-next-line react-hooks/immutability
      fetchExistingActivity(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRecipientsData = async () => {
    try {
      const { data: tlData, error: tlError } = await supabase
        .from("profiles")
        .select("id, username, role")
        .eq("role", "tour_leader");

      if (tlError) console.warn("TL fetch error:", tlError.message);
      if (tlData) {
        setTourleaders(tlData.map(item => ({
          id: item.id,
          name: item.username || "Tanpa Username",
          initial: (item.username || "T").charAt(0).toUpperCase()
        })));
      }

      const { data: muthData, error: muthError } = await supabase
        .from("profiles")
        .select("id, username, role")
        .eq("role", "muthawif");

      if (muthError) console.warn("Muthawif fetch error:", muthError.message);
      if (muthData) {
        setMuthawifs(muthData.map(item => ({
          id: item.id,
          name: item.username || "Tanpa Username",
          initial: (item.username || "M").charAt(0).toUpperCase()
        })));
      }
    } catch (error) {
      console.error("Gagal memuat profil penerima:", error.message);
    }
  };

  const fetchExistingActivity = async (targetId) => {
    try {
      setLoading(true);

      // 1. Coba ambil dari tabel itineraries (karena routing mengoper itineraries.id)
      const { data: itinData } = await supabase
        .from("itineraries")
        .select(`
          *,
          itinerary_days (
            id,
            day_number,
            activity_date,
            title,
            itinerary_activities (
              id,
              activity_time,
              title,
              description,
              location,
              sort_order
            )
          ),
          itinerary_recipient_rules (
            id,
            recipient_role,
            recipient_mode,
            itinerary_recipient_users (
              profile_id
            )
          )
        `)
        .eq("id", targetId)
        .maybeSingle();

      if (itinData) {
        setDataLoaded(true);
        const selectedUserIds = [];
        (itinData.itinerary_recipient_rules || []).forEach(r => {
          (r.itinerary_recipient_users || []).forEach(u => {
            if (u.profile_id) selectedUserIds.push(u.profile_id);
          });
        });

        setEditData({
          title: itinData.title || "",
          start_date: itinData.start_date || "",
          end_date: itinData.end_date || "",
          recipient_type: selectedUserIds.length > 0 ? "Pengguna Tertentu" : "Semua Petugas",
          selected_users: selectedUserIds,
        });

        if (itinData.itinerary_days && itinData.itinerary_days.length > 0) {
          const sorted = itinData.itinerary_days.sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
          setDaysData(sorted.map(d => ({
            day_number: d.day_number,
            city: d.title || "",
            date: d.activity_date || "",
            activities: (d.itinerary_activities || []).map(a => ({
              id: a.id,
              time: a.activity_time || "08:00",
              title: a.title || "",
              location: a.location || "",
              description: a.description || ""
            }))
          })));
        }
        return;
      }

      // 2. Fallback jika targetId adalah id dari itinerary_activities
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
        .eq("id", targetId)
        .single();

      if (error) {
        console.warn("Activity fetch error:", error.message);
        return;
      }

      if (data) {
        setDataLoaded(true);
        const itinTitle = data.itinerary_days?.itineraries?.title || data.title || "Umrah Super Cermat";
        const dayNum = data.itinerary_days?.day_number || 1;
        const actDate = data.itinerary_days?.activity_date || "2026-08-10";

        setEditData(prev => ({
          ...prev,
          title: itinTitle,
          start_date: actDate,
          end_date: actDate,
        }));

        // Sinkronkan ke daftar hari
        setDaysData(prev => {
          const found = prev.find(d => d.day_number === dayNum);
          if (found) {
            return prev.map(d => {
              if (d.day_number === dayNum) {
                return {
                  ...d,
                  activities: [
                    {
                      id: data.id,
                      time: data.activity_time || "08:00 - 10:00",
                      title: data.title || data.location,
                      location: data.location || data.description || "",
                    },
                    ...d.activities.filter(a => a.id !== data.id)
                  ]
                };
              }
              return d;
            });
          } else {
            return [
              {
                day_number: dayNum,
                city: data.location || "Makkah",
                date: actDate,
                activities: [
                  {
                    id: data.id,
                    time: data.activity_time || "08:00",
                    title: data.title || data.location,
                    location: data.location || data.description || "",
                  }
                ]
              },
              ...prev
            ];
          }
        });
      }
    } catch (err) {
      console.error("Gagal mengambil detail aktivitas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (userId) => {
    setEditData((prev) => {
      const exists = prev.selected_users.includes(userId);
      if (exists) {
        return { ...prev, selected_users: prev.selected_users.filter(item => item !== userId) };
      } else {
        return { ...prev, selected_users: [...prev.selected_users, userId] };
      }
    });
  };

  const handleAddActivity = (dayNumber) => {
    if (!newActivity.title.trim()) {
      alert("Judul kegiatan wajib diisi!");
      return;
    }

    setDaysData(prev => prev.map(day => {
      if (day.day_number === dayNumber) {
        return {
          ...day,
          activities: [
            ...day.activities,
            {
              id: `act-${Date.now()}`,
              time: newActivity.time,
              title: newActivity.title,
              location: newActivity.location || day.city,
            }
          ]
        };
      }
      return day;
    }));

    setNewActivity({ time: "08:00 - 10:00", title: "", location: "" });
    setAddingActivityDay(null);
  };

  const handleDeleteActivity = (dayNumber, activityId) => {
    if (!confirm("Hapus kegiatan ini dari daftar?")) return;
    setDaysData(prev => prev.map(day => {
      if (day.day_number === dayNumber) {
        return {
          ...day,
          activities: day.activities.filter(a => a.id !== activityId)
        };
      }
      return day;
    }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // Update data paket itinerary jika id adalah itinerary_id
      if (id) {
        await supabase
          .from("itineraries")
          .update({
            title: editData.title,
            start_date: editData.start_date,
            end_date: editData.end_date,
            updated_at: new Date().toISOString()
          })
          .eq("id", id);

        const { error: actError } = await supabase
          .from("itinerary_activities")
          .update({
            title: editData.title,
            updated_at: new Date().toISOString()
          })
          .eq("id", id);

        if (actError) {
          console.warn("Gagal update aktivitas:", actError.message);
        }
      }

      // Simpan penerima jika ada yang dipilih
      if (editData.selected_users && editData.selected_users.length > 0) {
        for (const profileId of editData.selected_users) {
          const { error } = await supabase.from("itinerary_recipient_users").insert([
            {
              profile_id: profileId,
              rule_id: null
            }
          ]);
          if (error) console.warn("Recipient notice:", error.message);
        }
      }

      alert("Perubahan itinerary berhasil disimpan ke Supabase!");
      router.push("/itinerary");
    } catch (error) {
      console.error("Gagal memperbarui:", error.message);
      alert("Terjadi kesalahan saat memperbarui data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
      <Topbar 
        title="Edit Itinerary" 
        breadcrumbs={["Dashboard", "Itinerary", "Edit Itinerary"]} 
      />
      
      <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Edit Itinerary</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ubah informasi, pilih tourleader / muthawif dari database, dan atur kegiatan harian
            </p>
          </div>
          <button
            onClick={() => router.push("/itinerary")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <FiArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* 01. Informasi Itinerary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-extrabold flex items-center justify-center">01</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Informasi Itinerary</h3>
                  <p className="text-[11px] text-slate-400">Judul dan rentang tanggal</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Judul Paket / Agenda <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  placeholder="Contoh: Umrah Plus Turki / Umrah Super Cermat..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={editData.start_date}
                    onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={editData.end_date}
                    onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Kirim Ke</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["Semua Tourleader", "Semua Muthawif", "Semua Pengguna", "Pengguna Tertentu"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEditData({ ...editData, recipient_type: type })}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        editData.recipient_type === type 
                          ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 shadow-sm" 
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOURLEADER SECTION */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Tourleader ({tourleaders.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Pilih personil bertugas</span>
                </div>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                  {tourleaders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Tidak ada data tour leader di database.</p>
                  ) : (
                    tourleaders.map((leader) => {
                      const isChecked = editData.selected_users.includes(leader.id);
                      return (
                        <label 
                          key={leader.id} 
                          className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked ? "bg-indigo-50/60 border-indigo-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(leader.id)}
                            className="rounded border-slate-300 text-indigo-600 w-4 h-4" 
                          />
                          <div className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {leader.initial}
                          </div>
                          <div className="text-xs flex-1 min-w-0">
                            <p className={`font-bold truncate ${isChecked ? "text-slate-900" : "text-slate-800"}`}>
                              {leader.name}
                            </p>
                            <span className="text-[10px] text-slate-400">Tour Leader</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* MUTHAWIF SECTION */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Muthawif ({muthawifs.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Pilih muthawif pendamping</span>
                </div>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                  {muthawifs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Tidak ada data muthawif di database.</p>
                  ) : (
                    muthawifs.map((muthawif) => {
                      const isChecked = editData.selected_users.includes(muthawif.id);
                      return (
                        <label 
                          key={muthawif.id} 
                          className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked ? "bg-indigo-50/60 border-indigo-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(muthawif.id)}
                            className="rounded border-slate-300 text-indigo-600 w-4 h-4" 
                          />
                          <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {muthawif.initial}
                          </div>
                          <div className="text-xs flex-1 min-w-0">
                            <p className={`font-bold truncate ${isChecked ? "text-slate-900" : "text-slate-800"}`}>
                              {muthawif.name}
                            </p>
                            <span className="text-[10px] text-slate-400">Muthawif</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 02. Hari & Kegiatan */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-extrabold flex items-center justify-center">02</span>
                  <h3 className="font-extrabold text-slate-900 text-base">Hari & Kegiatan</h3>
                </div>
                <p className="text-xs text-slate-400 pl-9">Edit rincian kota, tanggal, dan kegiatan harian tiap hari</p>
              </div>

              {daysData.map((day) => (
                <div key={day.day_number} className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-purple-100 text-purple-700 font-extrabold text-xs px-3 py-1.5 rounded-xl">
                        Hari {day.day_number}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{day.city}</span>
                      <span className="text-xs text-slate-400 font-medium">{day.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleDay(day.day_number)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        title={openDays[day.day_number] ? "Tutup Akordion" : "Buka Akordion"}
                      >
                        {openDays[day.day_number] ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {openDays[day.day_number] && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Kota / Lokasi Umum</label>
                          <input 
                            type="text"
                            value={day.city}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDaysData(prev => prev.map(d => d.day_number === day.day_number ? { ...d, city: val } : d));
                            }}
                            className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal</label>
                          <input 
                            type="date" 
                            value={day.date} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setDaysData(prev => prev.map(d => d.day_number === day.day_number ? { ...d, date: val } : d));
                            }}
                            className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                          />
                        </div>
                      </div>

                      {/* Kotak Kegiatan */}
                      <div className="bg-[#fcf5ff]/50 border border-purple-100 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">Daftar Kegiatan</span>
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
                              {day.activities.length}
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setAddingActivityDay(day.day_number)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            <FiPlus className="w-3.5 h-3.5" /> Tambah Kegiatan
                          </button>
                        </div>

                        {/* Inline Form Add Activity */}
                        {addingActivityDay === day.day_number && (
                          <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-3 shadow-xs">
                            <p className="text-xs font-bold text-purple-900">Tambah Kegiatan Baru di Hari {day.day_number}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Waktu (e.g. 09:00 - 11:00)"
                                value={newActivity.time}
                                onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
                              />
                              <input
                                type="text"
                                placeholder="Judul Kegiatan *"
                                value={newActivity.title}
                                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                className="px-3 py-2 text-xs border border-slate-200 rounded-lg md:col-span-2"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Lokasi / Catatan..."
                              value={newActivity.location}
                              onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setAddingActivityDay(null)}
                                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddActivity(day.day_number)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer"
                              >
                                Simpan Kegiatan
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          {day.activities.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2 text-center">Belum ada agenda kegiatan untuk hari ini.</p>
                          ) : (
                            day.activities.map((act) => (
                              <div key={act.id} className="flex items-center justify-between p-3.5 bg-white border border-purple-100 rounded-xl shadow-sm">
                                <div className="space-y-1">
                                  <span className="inline-block bg-[#7c3aed] text-white text-[11px] font-extrabold px-3 py-1 rounded-lg">
                                    {act.time}
                                  </span>
                                  <p className="text-xs font-extrabold text-slate-900 mt-1">{act.title}</p>
                                  {act.location && (
                                    <p className="text-[11px] text-slate-500 font-medium">{act.location}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteActivity(day.day_number, act.id)}
                                    className="p-2 bg-slate-50 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors border border-slate-100 cursor-pointer"
                                    title="Hapus Kegiatan"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Kanan */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status Hari</h4>
              
              <div className="space-y-3">
                {daysData.map((d) => (
                  <div key={d.day_number} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Hari {d.day_number} — {d.city}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {d.activities.length} Kegiatan
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="w-full py-3 bg-[#c4b5fd] hover:bg-[#a78bfa] text-[#31106a] font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                {loading ? "Menyimpan ke Supabase..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
