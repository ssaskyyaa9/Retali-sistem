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
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiHelpCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { FaUserGraduate } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import {
  getNotificationStatus,
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  formatTimeAgo,
} from "@/lib/notifications";

export default function NotifikasiPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Tab view untuk admin: 'kelola' | 'saya'
  const [adminTab, setAdminTab] = useState("kelola");

  // Form view: 0 = list, 1 = create/edit
  const [view, setView] = useState(0);

  // Data Notifikasi
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [myNotifications, setMyNotifications] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [kloters, setKloters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter untuk user view
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  // Form states
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [recipientType, setRecipientType] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchStaff, setSearchStaff] = useState("");
  const [filterKloter, setFilterKloter] = useState("");

  // Modals
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [hasilModalItem, setHasilModalItem] = useState(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    id: null,
    title: "",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // 1. Cek User yang sedang login
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, email, role")
            .eq("id", user.id)
            .single();

          setCurrentUser(
            profile || { id: user.id, email: user.email, role: "user" }
          );
        }
      } catch (err) {
        console.error("Gagal memeriksa sesi login:", err);
      } finally {
        setIsAuthLoaded(true);
      }
    }
    checkAuth();
  }, []);

  const isAdmin = currentUser?.role === "admin";

  // 2. Fetch Notifikasi Admin (Semua notifikasi)
  const fetchAdminNotifications = async () => {
    try {
      setLoading(true);
      const { data: notifData, error: notifError } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (notifError) throw notifError;

      const { data: recipientData, error: recipError } = await supabase
        .from("notification_recipients")
        .select("id, notification_id, is_read, read_at, user_id");

      const { data: profileData, error: profError } = await supabase
        .from("profiles")
        .select("id, username, email, role");

      if (recipError) throw recipError;
      if (profError) throw profError;

      const combined = (notifData || []).map((item) => {
        const matchingRecipients = (recipientData || []).filter(
          (r) => r.notification_id === item.id
        );
        const recipientsWithProfiles = matchingRecipients.map((r) => {
          const userProfile =
            (profileData || []).find((p) => p.id === r.user_id) || null;
          return { ...r, profiles: userProfile };
        });

        return { ...item, notification_recipients: recipientsWithProfiles };
      });

      setAdminNotifications(combined || []);
    } catch (err) {
      console.error("Error fetching admin notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Notifikasi User (Hanya yang dituju untuk user yang sedang login)
  const fetchMyNotificationsData = async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const list = await fetchUserNotifications(userId, true);
      setMyNotifications(list);
    } catch (err) {
      console.error("Error fetching user notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Staff & Kloter untuk form pembuat notifikasi (admin)
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
      console.error("Error fetching initial staff data:", err);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded) return;

    if (isAdmin) {
      fetchAdminNotifications();
      fetchInitialData();
      if (currentUser?.id) {
        fetchMyNotificationsData(currentUser.id);
      }
    } else if (currentUser?.id) {
      fetchMyNotificationsData(currentUser.id);
    }

    // Realtime channel
    const channel = supabase
      .channel("notifikasi-page-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          if (isAdmin) fetchAdminNotifications();
          if (currentUser?.id) fetchMyNotificationsData(currentUser.id);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notification_recipients" },
        () => {
          if (isAdmin) fetchAdminNotifications();
          if (currentUser?.id) fetchMyNotificationsData(currentUser.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthLoaded, currentUser?.id, isAdmin]);

  // Handle pilihan penerima notifikasi
  const handleSelectRecipientType = (type) => {
    setRecipientType(type);
    if (type === "all_tl") {
      const tlIds = staffList
        .filter((s) => s.role === "tour_leader")
        .map((s) => s.id);
      setSelectedUserIds(tlIds);
    } else if (type === "all_muthawif") {
      const muthawifIds = staffList
        .filter((s) => s.role === "muthawif")
        .map((s) => s.id);
      setSelectedUserIds(muthawifIds);
    } else if (type === "all_users") {
      setSelectedUserIds(staffList.map((s) => s.id));
    } else if (type === "custom") {
      setSelectedUserIds([]);
    }
  };

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

  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setTitle("");
    setMessage("");
    setStartDate("");
    setEndDate("");
    setRecipientType("");
    setSelectedUserIds([]);
    setView(1);
  };

  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setTitle(item.title || "");
    setMessage(item.message || "");
    setStartDate(formatDateTimeLocal(item.start_date));
    setEndDate(formatDateTimeLocal(item.end_date));

    const recipientIds =
      item.notification_recipients?.map((r) => r.user_id) || [];
    setSelectedUserIds(recipientIds);

    const allTlIds = staffList
      .filter((s) => s.role === "tour_leader")
      .map((s) => s.id);
    const allMuthawifIds = staffList
      .filter((s) => s.role === "muthawif")
      .map((s) => s.id);
    const allUserIds = staffList.map((s) => s.id);
    const isSameElements = (a, b) =>
      a.length === b.length && a.every((val) => b.includes(val));

    if (isSameElements(recipientIds, allTlIds) && allTlIds.length > 0) {
      setRecipientType("all_tl");
    } else if (
      isSameElements(recipientIds, allMuthawifIds) &&
      allMuthawifIds.length > 0
    ) {
      setRecipientType("all_muthawif");
    } else if (
      isSameElements(recipientIds, allUserIds) &&
      allUserIds.length > 0
    ) {
      setRecipientType("all_users");
    } else {
      setRecipientType("custom");
    }

    setView(1);
  };

  const handleSaveNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast("Judul dan pesan wajib diisi!", "error");
      return;
    }
    if (selectedUserIds.length === 0) {
      showToast("Pilih minimal 1 orang penerima!", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: title.trim(),
        message: message.trim(),
        type: "info",
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        user_id: currentUser?.id || null,
      };

      if (editId) {
        const { error: notifError } = await supabase
          .from("notifications")
          .update(payload)
          .eq("id", editId);

        if (notifError) throw notifError;

        await supabase
          .from("notification_recipients")
          .delete()
          .eq("notification_id", editId);

        const newRecipients = selectedUserIds.map((userId) => ({
          notification_id: editId,
          user_id: userId,
          is_read: false,
        }));

        await supabase.from("notification_recipients").insert(newRecipients);
        showToast("Notifikasi berhasil diperbarui!");
      } else {
        const { data: newNotif, error: notifError } = await supabase
          .from("notifications")
          .insert([payload])
          .select()
          .single();

        if (notifError) throw notifError;

        const recipients = selectedUserIds.map((userId) => ({
          notification_id: newNotif.id,
          user_id: userId,
          is_read: false,
        }));
        await supabase.from("notification_recipients").insert(recipients);
        showToast("Notifikasi berhasil dibuat dan dijadwalkan!");
      }

      setView(0);
      fetchAdminNotifications();
    } catch (err) {
      showToast("Terjadi kesalahan: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteNotification = async () => {
    const id = confirmModal.id;
    setConfirmModal({ show: false, id: null, title: "" });

    try {
      await supabase
        .from("notification_recipients")
        .delete()
        .eq("notification_id", id);
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setAdminNotifications((prev) => prev.filter((item) => item.id !== id));
      showToast("Notifikasi berhasil dihapus secara permanen.");
    } catch (err) {
      showToast("Gagal menghapus: " + err.message, "error");
    }
  };

  // Render Badge 4 Status (Abu-abu, Merah, Kuning, Hijau)
  const renderStatusBadge = (startDate) => {
    const status = getNotificationStatus(startDate);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${status.badgeClass}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${status.dotClass} ${
            status.key !== "abu-abu" ? "animate-pulse" : ""
          }`}
        ></span>
        {status.label}
      </span>
    );
  };

  // Handler Baca Notifikasi User
  const handleOpenUserDetail = async (notif) => {
    setDetailModalItem(notif);
    if (!notif.isRead) {
      await markNotificationAsRead(notif.recipientId);
      setMyNotifications((prev) =>
        prev.map((n) =>
          n.recipientId === notif.recipientId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
    }
  };

  const handleMarkAllUserRead = async () => {
    if (!currentUser?.id) return;
    await markAllNotificationsAsRead(currentUser.id);
    setMyNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString(),
      }))
    );
    showToast("Semua notifikasi ditandai sudah dibaca.");
  };

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

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.username?.toLowerCase().includes(searchStaff.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchStaff.toLowerCase());
    const matchesKloter = filterKloter ? staff.kloter_id === filterKloter : true;
    return matchesSearch && matchesKloter;
  });

  const filteredMyNotifications = myNotifications.filter((n) => {
    if (userStatusFilter === "all") return true;
    if (userStatusFilter === "unread") return !n.isRead;
    return n.status?.key === userStatusFilter;
  });

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans relative">
      <Topbar title="Notifikasi" breadcrumbs={["Dashboard", "Notifikasi"]} />

      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <FiAlertCircle className="w-4 h-4" />
            {toast.message}
          </div>
        </div>
      )}

      <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
        {/* TAMPILAN JIKA USER ADALAH ADMIN */}
        {isAdmin ? (
          <>
            {view === 0 && (
              <div className="space-y-6">
                <div className="relative">
                  <PageHeader
                    title="Manajemen Notifikasi"
                    description="Berisi daftar notifikasi dan pengingat yang dibuat untuk petugas (tour leader dan muthawif)."
                    icon={
                      <IoMdNotificationsOutline className="w-[26px] h-[26px] text-[#eab308]" />
                    }
                    buttonIcon={<FiPlus className="w-4 h-4" />}
                    buttonOnClick={handleOpenAdd}
                    buttonText="Buat Notifikasi Baru"
                  />

                  <div className="absolute right-[215px] top-1/2 -translate-y-1/2 hidden md:block">
                    <button
                      onClick={() => setGuideModalOpen(true)}
                      title="Panduan Status Warna"
                      className="p-3 bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 text-amber-500 hover:text-amber-600 rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      <FiHelpCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tabs Admin: Kelola Notifikasi vs Notifikasi Saya */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <button
                    onClick={() => setAdminTab("kelola")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      adminTab === "kelola"
                        ? "bg-[#121c2d] text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    Semua Notifikasi ({adminNotifications.length})
                  </button>
                  <button
                    onClick={() => setAdminTab("saya")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      adminTab === "saya"
                        ? "bg-[#121c2d] text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    Notifikasi Saya ({myNotifications.length})
                  </button>
                </div>

                {adminTab === "kelola" ? (
                  /* Tabel Manajemen Admin */
                  <div className="animate-fade-in-up rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wide">
                          <tr>
                            <th className="py-5 px-5 text-center w-14">NO</th>
                            <th className="py-5 px-6">JUDUL & PESAN</th>
                            <th className="py-5 px-5 text-center">
                              JADWAL KEGIATAN
                            </th>
                            <th className="py-5 px-5 text-center">
                              STATUS PERINGATAN
                            </th>
                            <th className="py-5 px-6 text-center">AKSI</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 bg-white">
                          {loading ? (
                            <tr>
                              <td
                                colSpan="5"
                                className="py-12 text-center text-gray-400 text-xs font-semibold"
                              >
                                Memuat data notifikasi...
                              </td>
                            </tr>
                          ) : adminNotifications.length === 0 ? (
                            <tr>
                              <td
                                colSpan="5"
                                className="py-12 text-center text-gray-400 text-xs font-semibold"
                              >
                                Belum ada data notifikasi.
                              </td>
                            </tr>
                          ) : (
                            adminNotifications.map((item, index) => (
                              <tr
                                key={item.id}
                                className="hover:bg-gray-50/80 transition-colors"
                              >
                                <td className="py-4 px-5 text-center font-semibold text-gray-500 text-xs">
                                  {index + 1}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="font-bold text-gray-900 text-sm">
                                    {truncateText(item.title, 25)}
                                  </div>
                                  <div className="text-gray-500 text-xs mt-0.5">
                                    {truncateText(item.message, 35)}
                                  </div>
                                </td>
                                <td className="py-4 px-5 text-center text-xs text-gray-600 whitespace-nowrap">
                                  {item.start_date ? (
                                    <div>
                                      <span className="font-semibold text-gray-900">
                                        {formatDate(item.start_date)}
                                      </span>
                                      <span className="block text-[10px] text-gray-400">
                                        s/d {formatDate(item.end_date)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                  {renderStatusBadge(item.start_date)}
                                </td>
                                <td className="py-4 px-6 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => setDetailModalItem(item)}
                                      title="Detail & Penerima"
                                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <FiEye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleOpenEdit(item)}
                                      title="Edit Notifikasi"
                                      className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <FiEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setHasilModalItem(item)}
                                      title="Statistik Status Baca Penerima"
                                      className="p-2 text-white bg-[#121c2d] hover:bg-[#1a2942] rounded-lg transition-colors cursor-pointer"
                                    >
                                      <FiBarChart2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setConfirmModal({
                                          show: true,
                                          id: item.id,
                                          title: item.title,
                                        })
                                      }
                                      title="Hapus Notifikasi"
                                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100 rounded-lg transition-colors cursor-pointer"
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
                ) : (
                  /* Tampilan Notifikasi Saya untuk Admin */
                  <div className="space-y-4">
                    {renderUserNotificationsList(
                      filteredMyNotifications,
                      loading,
                      handleOpenUserDetail,
                      handleMarkAllUserRead,
                      userStatusFilter,
                      setUserStatusFilter
                    )}
                  </div>
                )}
              </div>
            )}

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <FiCalendar className="text-amber-500" /> Tanggal & Waktu
                        Mulai Kegiatan
                      </label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-[#121c2d]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <FiClock className="text-amber-500" /> Tanggal & Waktu
                        Selesai Kegiatan
                      </label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-[#121c2d]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500">
                      Penerima Notifikasi <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        type="button"
                        onClick={() => handleSelectRecipientType("all_tl")}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          recipientType === "all_tl"
                            ? "border-[#121c2d] bg-slate-50 text-[#121c2d] shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <FiUser className="w-6 h-6 text-amber-500" />
                        <span className="text-xs font-bold">Semua Tour Leader</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectRecipientType("all_muthawif")}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          recipientType === "all_muthawif"
                            ? "border-[#121c2d] bg-slate-50 text-[#121c2d] shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <FaUserGraduate className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-bold">Semua Muthawif</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectRecipientType("all_users")}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          recipientType === "all_users"
                            ? "border-[#121c2d] bg-slate-50 text-[#121c2d] shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <FiUsers className="w-6 h-6 text-amber-500" />
                        <span className="text-xs font-bold">Semua Pengguna</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectRecipientType("custom")}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
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

                        <div className="relative flex items-center">
                          <select
                            value={filterKloter}
                            onChange={(e) => setFilterKloter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#121c2d] pr-10"
                          >
                            <option value="">Semua Kloter</option>
                            {kloters.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.name}
                              </option>
                            ))}
                          </select>
                          {filterKloter && (
                            <button
                              type="button"
                              onClick={() => setFilterKloter("")}
                              className="absolute right-3 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                              title="Reset Kloter"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllFiltered}
                            className="px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FiCheck className="w-3.5 h-3.5" /> Pilih Semua
                          </button>
                          <button
                            type="button"
                            onClick={handleDeselectAllFiltered}
                            className="px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FiX className="w-3.5 h-3.5" /> Hapus Semua
                          </button>
                        </div>
                        <span className="text-xs font-bold text-gray-500">
                          {selectedUserIds.length} dipilih
                        </span>
                      </div>

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

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-700">
                        Judul Notifikasi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Kumpul di Lobby Hotel"
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
                        placeholder="Tulis pesan lengkap yang akan dibaca oleh petugas..."
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-[#121c2d] resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setView(0)}
                      className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-xs font-bold text-white bg-[#121c2d] hover:bg-[#1a2942] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting
                        ? "Menyimpan..."
                        : editId
                        ? "Perbarui Notifikasi"
                        : "Kirim Notifikasi"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          /* TAMPILAN JIKA USER BUKAN ADMIN (Tour Leader / Muthawif / User) */
          <div className="space-y-6">
            <div className="relative">
              <PageHeader
                title="Notifikasi Saya"
                description="Daftar pemberitahuan dan pengingat kegiatan yang dikirimkan khusus untuk Anda."
                icon={
                  <IoMdNotificationsOutline className="w-[26px] h-[26px] text-[#eab308]" />
                }
                buttonIcon={<FiCheckCircle className="w-4 h-4" />}
                buttonOnClick={handleMarkAllUserRead}
                buttonText="Tandai Semua Dibaca"
              />

              <div className="absolute right-[215px] top-1/2 -translate-y-1/2 hidden md:block">
                <button
                  onClick={() => setGuideModalOpen(true)}
                  title="Panduan Status Warna"
                  className="p-3 bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 text-amber-500 hover:text-amber-600 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <FiHelpCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {renderUserNotificationsList(
              filteredMyNotifications,
              loading,
              handleOpenUserDetail,
              handleMarkAllUserRead,
              userStatusFilter,
              setUserStatusFilter
            )}
          </div>
        )}
      </main>

      {/* Modal Panduan Status Warna */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <FiHelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Panduan Status Peringatan
                </h3>
              </div>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="w-3 h-3 rounded-full bg-gray-400 shrink-0 mt-0.5"></span>
                <div>
                  <span className="font-bold text-gray-900 block">
                    Abu-Abu (Belum Terkirim)
                  </span>
                  <span className="text-gray-500 leading-relaxed block mt-0.5">
                    Notifikasi telah dibuat oleh admin namun belum terkirim ke
                    petugas karena jadwal kegiatan masih lebih dari 24 jam lagi.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 mt-0.5 animate-pulse"></span>
                <div>
                  <span className="font-bold text-rose-950 block">
                    Merah (Peringatan 24 Jam)
                  </span>
                  <span className="text-rose-700 leading-relaxed block mt-0.5">
                    Sudah masuk jangka waktu 24 jam sebelum kegiatan. Petugas
                    menerima notifikasi otomatis:{" "}
                    <em>"24 jam lagi [nama kegiatan] harus dilaksanakan"</em>.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 mt-0.5 animate-pulse"></span>
                <div>
                  <span className="font-bold text-amber-950 block">
                    Kuning (Peringatan 12 Jam)
                  </span>
                  <span className="text-amber-700 leading-relaxed block mt-0.5">
                    Sudah masuk jangka waktu 12 jam sebelum kegiatan. Petugas
                    menerima notifikasi otomatis:{" "}
                    <em>"12 jam lagi [nama kegiatan] harus dilaksanakan"</em>.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 mt-0.5 animate-pulse"></span>
                <div>
                  <span className="font-bold text-emerald-950 block">
                    Hijau (Saat Kegiatan Berlangsung)
                  </span>
                  <span className="text-emerald-700 leading-relaxed block mt-0.5">
                    Waktu kegiatan telah tiba atau sedang berjalan. Petugas
                    menerima notifikasi:{" "}
                    <em>"Saat ini [nama kegiatan] sedang dilaksanakan"</em>.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setGuideModalOpen(false)}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#121c2d] hover:bg-[#1a2942] rounded-xl transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Notifikasi Admin / User */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-scale-up space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                {detailModalItem.dynamicTitle
                  ? detailModalItem.dynamicTitle
                  : "Detail Notifikasi"}
              </h3>
              <button
                onClick={() => setDetailModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Judul Asli Notifikasi
                </span>
                <p className="text-xs font-bold text-gray-900">
                  {detailModalItem.originalTitle || detailModalItem.title}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Status Peringatan
                </span>
                <div className="mt-1">
                  {renderStatusBadge(
                    detailModalItem.startDate || detailModalItem.start_date
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Pesan Lengkap
                </span>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {detailModalItem.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    Mulai Kegiatan
                  </span>
                  <p className="text-xs text-gray-700 font-semibold">
                    {formatDate(
                      detailModalItem.startDate || detailModalItem.start_date
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    Selesai Kegiatan
                  </span>
                  <p className="text-xs text-gray-700 font-semibold">
                    {formatDate(
                      detailModalItem.endDate || detailModalItem.end_date
                    )}
                  </p>
                </div>
              </div>

              {/* Jika Admin, tampilkan daftar penerima */}
              {isAdmin && detailModalItem.notification_recipients && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">
                    Daftar Penerima Notifikasi (
                    {detailModalItem.notification_recipients?.length || 0} Orang)
                  </span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto divide-y divide-gray-100 bg-white">
                    {detailModalItem.notification_recipients.length === 0 ? (
                      <div className="p-3 text-xs text-gray-400 text-center">
                        Tidak ada penerima.
                      </div>
                    ) : (
                      detailModalItem.notification_recipients.map((r, idx) => (
                        <div
                          key={r.id}
                          className="p-2.5 px-3 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-gray-800">
                            {idx + 1}.{" "}
                            {r.profiles?.username ||
                              r.profiles?.email ||
                              "Tanpa Nama"}
                          </span>
                          <span className="text-[10px] text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-md">
                            {r.profiles?.role
                              ? r.profiles.role.replace("_", " ")
                              : "-"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#121c2d] hover:bg-[#1a2942] rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Statistik Status Baca Penerima (Admin Only) */}
      {hasilModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 max-h-[85vh] flex flex-col space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Statistik Status Baca Penerima
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hasilModalItem.title}
                </p>
              </div>
              <button
                onClick={() => setHasilModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-[#121c2d] text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUsers className="text-amber-400" />
                    <span className="text-xs font-bold">
                      Daftar Siapa Saja yang Sudah / Belum Membaca
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-300 rounded-full">
                    Total: {hasilModalItem.notification_recipients?.length || 0}{" "}
                    Orang
                  </span>
                </div>
                <div className="divide-y divide-gray-100 bg-white">
                  {!hasilModalItem.notification_recipients ||
                  hasilModalItem.notification_recipients.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 text-center">
                      Tidak ada penerima di daftar ini.
                    </div>
                  ) : (
                    hasilModalItem.notification_recipients.map((r, idx) => (
                      <div
                        key={r.id}
                        className="p-3 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">
                            {idx + 1}.{" "}
                            {r.profiles?.username ||
                              r.profiles?.email ||
                              "Tanpa Nama"}
                          </span>
                          <span className="text-[10px] text-gray-400 capitalize">
                            {r.profiles?.role
                              ? r.profiles.role.replace("_", " ")
                              : "-"}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                            r.is_read
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.is_read
                            ? `Sudah Dibaca (${formatDate(r.read_at)})`
                            : "Belum Dibaca"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus (Admin Only) */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Hapus Notifikasi
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus notifikasi{" "}
                <span className="font-bold text-gray-800">
                  "{confirmModal.title}"
                </span>{" "}
                secara permanen?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ show: false, id: null, title: "" })
                }
                className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteNotification}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Komponen pembantu untuk menampilkan daftar notifikasi yang ditujukan kepada user yang sedang login
 */
function renderUserNotificationsList(
  notifications,
  loading,
  handleOpenDetail,
  handleMarkAllRead,
  filter,
  setFilter
) {
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

  const truncateText = (str, maxLength = 30) => {
    if (!str) return "-";
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  };

  return (
    <div className="space-y-4">
      {/* Filter Kategori Status */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === "all"
              ? "bg-[#121c2d] text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === "unread"
              ? "bg-rose-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Belum Dibaca
        </button>
        <button
          onClick={() => setFilter("merah")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === "merah"
              ? "bg-rose-500 text-white"
              : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
          }`}
        >
          24 Jam Lagi
        </button>
        <button
          onClick={() => setFilter("kuning")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === "kuning"
              ? "bg-amber-500 text-white"
              : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
          }`}
        >
          12 Jam Lagi
        </button>
        <button
          onClick={() => setFilter("hijau")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === "hijau"
              ? "bg-emerald-600 text-white"
              : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          Saat Kegiatan
        </button>
      </div>

      {/* Tabel Notifikasi User */}
      <div className="animate-fade-in-up rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wide">
              <tr>
                <th className="py-5 px-5 text-center w-14">NO</th>
                <th className="py-5 px-6">PERINGATAN & PESAN</th>
                <th className="py-5 px-5 text-center">JADWAL KEGIATAN</th>
                <th className="py-5 px-5 text-center">STATUS PERINGATAN</th>
                <th className="py-5 px-5 text-center">STATUS BACA</th>
                <th className="py-5 px-6 text-center">AKSI</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-12 text-center text-gray-400 text-xs font-semibold"
                  >
                    Memuat data notifikasi...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-14 text-center text-gray-400 text-xs font-medium"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 mx-auto flex items-center justify-center mb-3">
                      <IoMdNotificationsOutline className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-gray-700 text-sm">
                      Belum ada notifikasi untuk Anda
                    </p>
                    <p className="text-gray-400 mt-1 max-w-sm mx-auto">
                      Notifikasi peringatan kegiatan akan terkirim secara otomatis
                      24 jam sebelum kegiatan dimulai.
                    </p>
                  </td>
                </tr>
              ) : (
                notifications.map((item, index) => {
                  const status = item.status;
                  const isUnread = !item.isRead;

                  return (
                    <tr
                      key={item.recipientId}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isUnread ? "bg-amber-50/15" : ""
                      }`}
                    >
                      <td className="py-4 px-5 text-center font-semibold text-gray-500 text-xs">
                        {index + 1}
                      </td>

                      <td className="py-4 px-6">
                        {/* Dynamic alert title */}
                        <div className="font-bold text-gray-950 text-sm flex items-center gap-2">
                          {item.dynamicTitle}
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {truncateText(item.message, 45)}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Nama kegiatan: {item.originalTitle} •{" "}
                          {formatTimeAgo(item.createdAt)}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-center text-xs text-gray-600 whitespace-nowrap">
                        {item.startDate ? (
                          <div>
                            <span className="font-semibold text-gray-900">
                              {formatDate(item.startDate)}
                            </span>
                            {item.endDate && (
                              <span className="block text-[10px] text-gray-400">
                                s/d {formatDate(item.endDate)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${status.badgeClass}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${status.dotClass} animate-pulse`}
                          ></span>
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {item.isRead ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                            Sudah Dibaca
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full">
                            Belum Dibaca
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          title="Lihat Detail Pesan"
                          className="px-3.5 py-1.5 text-xs font-bold text-[#121c2d] hover:text-white bg-slate-100 hover:bg-[#121c2d] border border-gray-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <FiEye className="w-3.5 h-3.5" /> Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
