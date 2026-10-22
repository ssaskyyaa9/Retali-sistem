"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/app/components/PageHeader";
import Topbar from "@/app/components/Topbar";
import { IoMdNotificationsOutline } from "react-icons/io";
import { 
  FiEye, 
  FiEdit, 
  FiBarChart2, 
  FiTrash2, 
  FiPlus, 
  FiUserCheck, 
  FiUser, 
  FiUsers, 
  FiSearch, 
  FiCheck, 
  FiX,
  FiMapPin
} from "react-icons/fi";
import { FaUserGraduate } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

export default function NotifikasiPage() {
  const [view, setView] = useState(0); // 0: List, 1: Form
  const [notifications, setNotifications] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [kloters, setKloters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all_tl"); // all_tl, all_muthawif, all_users, custom
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchStaff, setSearchStaff] = useState("");
  const [filterKloter, setFilterKloter] = useState("");

  // Modal Popups
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [hasilModalItem, setHasilModalItem] = useState(null);

  // Fetch Data Notifikasi & Recipients
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select(`
    *,
    notification_recipients (
      is_read,
      read_at,
      user_id
    )
  `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error.message);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Daftar Petugas (Tour Leader & Muthawif) & Kloter
  const fetchInitialData = async () => {
    try {
      const { data: staffData } = await supabase
        .from("profiles")
        .select("id, username, role, email, kloter_id")
        .in("role", ["tour_leader", "muthawif"]);

      const { data: kloterData } = await supabase
        .from("kloter")
        .select("id, name");

      setStaffList(staffData || []);
      setKloters(kloterData || []);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchInitialData();
  }, []);

  // Set Otomatis Pilihan User Berdasarkan Kategori Penerima
  useEffect(() => {
    if (recipientType === "all_tl") {
      const tlIds = staffList.filter((s) => s.role === "tour_leader").map((s) => s.id);
      setSelectedUserIds(tlIds);
    } else if (recipientType === "all_muthawif") {
      const muthawifIds = staffList.filter((s) => s.role === "muthawif").map((s) => s.id);
      setSelectedUserIds(muthawifIds);
    } else if (recipientType === "all_users") {
      setSelectedUserIds(staffList.map((s) => s.id));
    }
  }, [recipientType, staffList]);

  // Handle Checkbox Pilihan Pengguna Tertentu
  const toggleUserSelection = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((item) => item !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStaff.map((s) => s.id);
    setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...filteredIds])));
  };

  const handleDeselectAllFiltered = () => {
    const filteredIds = new Set(filteredStaff.map((s) => s.id));
    setSelectedUserIds(selectedUserIds.filter((id) => !filteredIds.has(id)));
  };

  // Handler Buka Form Tambah
  const handleOpenAdd = () => {
    setEditId(null);
    setTitle("");
    setMessage("");
    setRecipientType("all_tl");
    setView(1);
  };

  // Handler Buka Form Edit
  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setTitle(item.title || "");
    setMessage(item.message || "");
    const recipientIds = item.recipients?.map((r) => r.user_id) || [];
    setSelectedUserIds(recipientIds);
    setRecipientType("custom");
    setView(1);
  };

  // Handler Simpan (Create / Update)
  const handleSaveNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert("Judul dan pesan wajib diisi!");
      return;
    }
    if (selectedUserIds.length === 0) {
      alert("Pilih minimal 1 orang penerima!");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editId) {
        // Update Induk Notifikasi
        const { error: notifError } = await supabase
          .from("notifications")
          .update({ title: title.trim(), message: message.trim() })
          .eq("id", editId);

        if (notifError) throw notifError;

        // Hapus penerima lama dan masukkan baru
        await supabase.from("notification_recipients").delete().eq("notification_id", editId);

        const newRecipients = selectedUserIds.map((userId) => ({
          notification_id: editId,
          user_id: userId,
          is_read: false,
        }));

        await supabase.from("notification_recipients").insert(newRecipients);

        alert("Notifikasi berhasil diperbarui!");
      } else {
        // Create Baru
        const { data: newNotif, error: notifError } = await supabase
          .from("notifications")
          .insert([{ title: title.trim(), message: message.trim(), type: "info" }])
          .select()
          .single();

        if (notifError) throw notifError;

        const recipients = selectedUserIds.map((userId) => ({
          notification_id: newNotif.id,
          user_id: userId,
          is_read: false,
        }));

        await supabase.from("notification_recipients").insert(recipients);

        alert("Notifikasi berhasil dikirim!");
      }

      setView(0);
      fetchNotifications();
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Hapus Permanen
  const handleDeleteNotification = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus notifikasi ini secara permanen?")) return;

    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id);

      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Kalkulasi Status Baca (Warna Merah, Kuning, Hijau)
  const renderReadStatus = (recipients = []) => {
  const total = recipients ? recipients.length : 0;

  // Jika tidak ada data penerima (misal data lama)
  if (total === 0) {
    return (
      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
        Belum Dibaca
      </span>
    );
  }

  // Hitung berapa banyak penerima yang sudah membaca (is_read === true)
  const readCount = recipients.filter((r) => r.is_read).length;

  // 1. Jika BELUM ADA sama sekali yang baca (0 orang) -> Merah
  if (readCount === 0) {
    return (
      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
        Belum Dibaca
      </span>
    );
  }

  // 2. Jika SUDAH SEMUA membaca -> Hijau
  if (readCount === total) {
    return (
      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
        Sudah Dibaca
      </span>
    );
  }

  // 3. Jika SEBAGIAN / BEBERAPA sudah membaca (di antara 0 dan total) -> Kuning
  return (
    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
      Dibaca Beberapa
    </span>
  );
};

  // Truncate Teks
  const truncateText = (str, maxLength = 30) => {
    if (!str) return "-";
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter Petugas pada Pilihan "Pengguna Tertentu"
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.username?.toLowerCase().includes(searchStaff.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchStaff.toLowerCase());
    const matchesKloter = filterKloter ? staff.kloter_id === filterKloter : true;
    return matchesSearch && matchesKloter;
  });

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
      <Topbar title="Notifikasi" breadcrumbs={["Dashboard", "Notifikasi"]} />

      <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
        {view === 0 && (
          <div className="space-y-6">
            <PageHeader
              title="Daftar Notifikasi"
              description="Berisi daftar notifikasi yang dikirimkan kepada tour leader dan muthawif."
              icon={<IoMdNotificationsOutline className="w-[26px] h-[26px] text-[#eab308]" />}
              buttonIcon={<FiPlus className="w-4 h-4" />}
              buttonOnClick={handleOpenAdd}
              buttonText="Buat Notifikasi Baru"
            />

            <div className="animate-fade-in-up rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wide">
                    <tr>
                      <th className="py-5 px-5 text-center w-14">NO</th>
                      <th className="py-5 px-6">JUDUL</th>
                      <th className="py-5 px-6">PESAN</th>
                      <th className="py-5 px-5 text-center">STATUS BACA</th>
                      <th className="py-5 px-5 text-center">TANGGAL</th>
                      <th className="py-5 px-6 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-400 text-xs font-semibold">
                          Memuat data notifikasi...
                        </td>
                      </tr>
                    ) : notifications.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-400 text-xs font-semibold">
                          Belum ada data notifikasi.
                        </td>
                      </tr>
                    ) : (
                      notifications.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-5 text-center font-semibold text-gray-500 text-xs">
                            {index + 1}
                          </td>
                          <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                            {truncateText(item.title, 25)}
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {truncateText(item.message, 35)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {renderReadStatus(item.notification_recipients)}
                          </td>
                          <td className="py-4 px-5 text-center font-semibold text-gray-600 text-xs whitespace-nowrap">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            {/* Tombol Aksi dalam Bentuk Icon */}
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Detail Modal Button */}
                              <button
                                onClick={() => setDetailModalItem(item)}
                                title="Detail Pesan"
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEdit(item)}
                                title="Edit Notifikasi"
                                className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-gray-200 rounded-lg transition-colors"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>

                              {/* Hasil Status Button */}
                              <button
                                onClick={() => setHasilModalItem(item)}
                                title="Hasil Status Baca"
                                className="p-2 text-white bg-[#121c2d] hover:bg-[#1a2942] rounded-lg transition-colors"
                              >
                                <FiBarChart2 className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteNotification(item.id)}
                                title="Hapus Notifikasi"
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100 rounded-lg transition-colors"
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

        {/* FORM VIEW: Buat / Edit Notifikasi */}
        {view === 1 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-[#121c2d] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 shrink-0">
                  <IoMdNotificationsOutline className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-sm font-bold">
                  {editId ? "Edit Notifikasi" : "Buat Notifikasi Baru"}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSaveNotification} className="p-6 space-y-6">
              {/* OPSI PENERIMA NOTIFIKASI (Kaya Gambar 2) */}
              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Penerima Notifikasi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Card 1: Semua Tour Leader */}
                  <button
                    type="button"
                    onClick={() => setRecipientType("all_tl")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      recipientType === "all_tl"
                        ? "border-[#121c2d] bg-slate-50 text-[#121c2d] shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <FiUser className="w-6 h-6 text-amber-500" />
                    <span className="text-xs font-bold">Semua Tour Leader</span>
                  </button>

                  {/* Card 2: Semua Muthawif */}
                  <button
                    type="button"
                    onClick={() => setRecipientType("all_muthawif")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      recipientType === "all_muthawif"
                        ? "border-[#121c2d] bg-slate-50 text-[#121c2d] shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <FaUserGraduate className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold">Semua Muthawif</span>
                  </button>

                  {/* Card 3: Semua Pengguna */}
                  <button
                    type="button"
                    onClick={() => setRecipientType("all_users")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      recipientType === "all_users"
                        ? "border-[#121c2d] bg-slate-50 text-[#121c2d] shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <FiUsers className="w-6 h-6 text-amber-500" />
                    <span className="text-xs font-bold">Semua Pengguna</span>
                  </button>

                  {/* Card 4: Pengguna Tertentu */}
                  <button
                    type="button"
                    onClick={() => setRecipientType("custom")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      recipientType === "custom"
                        ? "border-[#121c2d] bg-slate-50 text-[#121c2d] shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <FiUserCheck className="w-6 h-6 text-amber-500" />
                    <span className="text-xs font-bold">Pengguna Tertentu</span>
                  </button>
                </div>
              </div>

              {/* LIST PENERIMA CUSTOME / PILIHAN CHECKBOX */}
              {recipientType === "custom" && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <FiSearch className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Cari nama pengguna..."
                        value={searchStaff}
                        onChange={(e) => setSearchStaff(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#121c2d]"
                      />
                    </div>
                    <div>
                      <select
                        value={filterKloter}
                        onChange={(e) => setFilterKloter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#121c2d]"
                      >
                        <option value="">Semua Kloter</option>
                        {kloters.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
                      >
                        <FiCheck className="w-3.5 h-3.5" /> Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllFiltered}
                        className="px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <FiX className="w-3.5 h-3.5" /> Hapus Semua
                      </button>
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {selectedUserIds.length} dipilih
                    </span>
                  </div>

                  {/* List Pengguna Terfilter */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-gray-100 bg-white">
                    {filteredStaff.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        Tidak ada pengguna ditemukan.
                      </div>
                    ) : (
                      filteredStaff.map((staff) => (
                        <label
                          key={staff.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(staff.id)}
                            onChange={() => toggleUserSelection(staff.id)}
                            className="w-4 h-4 rounded text-[#121c2d] focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="text-xs font-bold text-gray-900">
                              {staff.username || staff.email}
                            </div>
                            <div className="text-[10px] text-gray-400 capitalize">
                              {staff.role.replace("_", " ")}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* JUDUL & PESAN */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Judul Notifikasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukkan judul notifikasi..."
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-[#121c2d]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Pesan Notifikasi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis pesan lengkap..."
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-[#121c2d] resize-none"
                  ></textarea>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setView(0)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#121c2d] hover:bg-[#1a2942] rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : editId ? "Perbarui Notifikasi" : "Kirim Notifikasi"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL POPUP 1: DETAIL NOTIFIKASI */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Detail Pesan Notifikasi</h3>
              <button
                onClick={() => setDetailModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Judul</span>
                <p className="text-xs font-bold text-gray-900">{detailModalItem.title}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Pesan Lengkap</span>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {detailModalItem.message}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Tanggal Pembuatan</span>
                <p className="text-xs text-gray-600">{formatDate(detailModalItem.created_at)}</p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#121c2d] rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP 2: HASIL STATUS BACA (Kaya Gambar 3) */}
      {hasilModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 max-h-[85vh] flex flex-col space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Hasil Status Baca Penerima</h3>
                <p className="text-xs text-gray-500 mt-0.5">{hasilModalItem.title}</p>
              </div>
              <button
                onClick={() => setHasilModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-6 flex-1 pr-1">
              {/* Grup Tour Leader */}
              {(() => {
                const tlRecipients = (hasilModalItem.recipients || []).filter(
                  (r) => r.profiles?.role === "tour_leader"
                );
                const readCount = tlRecipients.filter((r) => r.is_read).length;
                const unreadCount = tlRecipients.length - readCount;

                return (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-[#121c2d] text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-amber-400" />
                        <span className="text-xs font-bold">Tour Leader</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-300 rounded-full">
                          ✓ {readCount} Selesai
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-white/10 text-white rounded-full">
                          ⏰ {unreadCount} Belum
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100 bg-white">
                      {tlRecipients.length === 0 ? (
                        <div className="p-3 text-xs text-gray-400 text-center">
                          Tidak ada Tour Leader di daftar penerima.
                        </div>
                      ) : (
                        tlRecipients.map((r, idx) => (
                          <div key={r.id} className="p-3 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800">
                              {idx + 1}. {r.profiles?.username || r.profiles?.email || "Tanpa Nama"}
                            </span>
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                                r.is_read
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {r.is_read ? `Sudah Dibaca (${formatDate(r.read_at)})` : "Belum Dibaca"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Grup Muthawif */}
              {(() => {
                const muthawifRecipients = (hasilModalItem.recipients || []).filter(
                  (r) => r.profiles?.role === "muthawif"
                );
                const readCount = muthawifRecipients.filter((r) => r.is_read).length;
                const unreadCount = muthawifRecipients.length - readCount;

                return (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-[#121c2d] text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaUserGraduate className="text-amber-400" />
                        <span className="text-xs font-bold">Muthawif</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-300 rounded-full">
                          ✓ {readCount} Selesai
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-white/10 text-white rounded-full">
                          ⏰ {unreadCount} Belum
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100 bg-white">
                      {muthawifRecipients.length === 0 ? (
                        <div className="p-3 text-xs text-gray-400 text-center">
                          Tidak ada Muthawif di daftar penerima.
                        </div>
                      ) : (
                        muthawifRecipients.map((r, idx) => (
                          <div key={r.id} className="p-3 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800">
                              {idx + 1}. {r.profiles?.username || r.profiles?.email || "Tanpa Nama"}
                            </span>
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                                r.is_read
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {r.is_read ? `Sudah Dibaca (${formatDate(r.read_at)})` : "Belum Dibaca"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 text-right border-t border-gray-100">
              <button
                onClick={() => setHasilModalItem(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#121c2d] rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}