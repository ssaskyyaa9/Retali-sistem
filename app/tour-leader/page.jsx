"use client";
import React, { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import PageHeader from "../components/PageHeader";
import { FaUserTie, FaUserPlus } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { FiTrash2, FiAlertCircle } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import {
  createTourLeaderAction,
  updateTourLeaderAction,
  deleteTourLeaderAction,
} from "../actions/tourLeader";

export default function TourLeaderPage() {
  const [view, setView] = useState(0);
  const [tourLeaders, setTourLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [kloterOptions, setKloterOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Edit & Delete states
  const [editingId, setEditingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    user: null,
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

  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelepon: "",
    password: "",
    kloterId: "",
  });

  // Trigger fetch ketika currentPage atau searchTerm berubah
  useEffect(() => {
    fetchTourLeaders();
    fetchKloterOptions();
  }, [currentPage, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchKloterOptions = async () => {
    const { data, error } = await supabase
      .from("kloter")
      .select("id, name, description");

    if (error) {
      console.error("Error fetching Kloter options:", error.message);
      return;
    }

    if (data) {
      // Map the data to match your select options format
      const formattedKloter = data.map((kloter) => ({
        id: kloter.id,
        // Combines name and description to mimic your dummy data format
        name: kloter.description
          ? `${kloter.name} (${kloter.description})`
          : kloter.name,
      }));
      setKloterOptions(formattedKloter);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat melakukan pencarian
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let result;

    // Cek apakah ini mode Edit atau mode Tambah
    if (editingId) {
      // Mode Edit
      result = await updateTourLeaderAction(editingId, formData);
    } else {
      // Mode Tambah
      result = await createTourLeaderAction(formData);
    }

    if (!result.success) {
      console.error("Error saving Tour Leader:", result.error);
      showToast("Gagal menyimpan data: " + result.error, "error");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    // Tutup modal dan reset form jika sukses
    setShowAddModal(false);
    setEditingId(null); // Pastikan reset editingId
    setFormData({
      namaLengkap: "",
      email: "",
      noTelepon: "",
      password: "",
      kloterId: "",
    });

    showToast(
      editingId
        ? "Tour Leader berhasil diperbarui!"
        : "Tour Leader berhasil ditambahkan!"
    );

    // Refresh data tabel
    fetchTourLeaders();
  };

  const handleDeleteUser = async () => {
    const targetUser = confirmModal.user;
    if (!targetUser || !targetUser.realId) return;

    setConfirmModal({ show: false, user: null });

    // Panggil action delete menggunakan realId (UUID asli)
    const result = await deleteTourLeaderAction(targetUser.realId);

    if (!result.success) {
      console.error("Error deleting Tour Leader:", result.error);
      showToast("Gagal menghapus data: " + result.error, "error");
      return;
    }

    showToast("Tour Leader berhasil dihapus secara permanen.");

    // Refresh tabel
    fetchTourLeaders();
  };

  const fetchTourLeaders = async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // 1. Tambahkan "description" di dalam pemanggilan relasi kloter
    let query = supabase
      .from("profiles")
      .select(
        `
        id, username, email, phone, is_active, created_at, kloter_id,
        kloter (name, description) 
      `,
        {
          count: "exact",
        },
      )
      .eq("role", "tour_leader");

    if (searchTerm) {
      query = query.or(
        `username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`,
      );
    }

    const { data, count, error } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching Tour Leaders:", error.message);
      setLoading(false);
      return;
    }

    if (data) {
      const formattedData = data.map((profile, index) => ({
        id: `TL-${String(from + index + 1).padStart(3, "0")}`,
        realId: profile.id,
        name: profile.username || "Unknown",
        initial: profile.username
          ? profile.username.charAt(0).toUpperCase()
          : "?",
        phone: profile.phone || "-",
        email: profile.email || "-",

        // 2. Ambil name dan description dari relasi kloter
        kloter: profile.kloter?.name || "Belum Ditentukan",
        kloterDate: profile.kloter?.description || "", // <-- Simpan deskripsi/tanggal di sini
        kloterId: profile.kloter_id || "",

        joinDate: new Date(profile.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: profile.is_active ? "Aktif" : "Tidak Aktif",
      }));

      // Sesuaikan dengan state Anda (bisa setTourLeaders atau setMuthawifList)
      setTourLeaders(formattedData);
      setTotalItems(count || 0);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col relative">
      <Topbar
        title="Tour Leader"
        breadcrumbs={["Dashboard", "Petugas", "Tour Leader"]}
      />

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

      <main className="p-8 w-full max-w-7xl mx-auto flex-1 no-scrollbar overflow-y-auto">
        {view === 0 && (
          <>
            <PageHeader
              title="Manajemen Tour Leader"
              description="Kelola data tour leader yang mendampingi jamaah pada setiap kloter perjalanan umrah."
              icon={<FaUserTie className="w-[26px] h-[26px] text-[#eab308]" />}
            />

            <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Search Input */}
                  <div className="relative w-72">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      placeholder="Cari nama, email, telepon..."
                      className="w-full pl-9 pr-4 py-2 placeholder:text-gray-400 text-gray-700 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      namaLengkap: "",
                      email: "",
                      noTelepon: "",
                      password: "",
                      kloterId: "",
                    });
                    setShowAddModal(true);
                  }}
                  className="bg-[#1b3167] hover:bg-[#1a2538] transition-colors text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <FaUserPlus className="w-4 h-4" />
                  Tambah Tour Leader
                </button>
              </div>

              {/* TABLE LIST */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left">PENGGUNA</th>
                      <th className="px-6 py-4 text-left">KONTAK</th>
                      <th className="px-6 py-4 text-left">KLOTER</th>
                      <th className="px-6 py-4 text-center">BERGABUNG</th>
                      <th className="px-6 py-4 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          Memuat data...
                        </td>
                      </tr>
                    ) : tourLeaders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {searchTerm
                            ? "Tidak ada hasil pencarian yang sesuai."
                            : "Tidak ada data tour leader."}
                        </td>
                      </tr>
                    ) : (
                      tourLeaders.map((tl, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#eef2f6] text-[#6b7280] font-bold flex items-center justify-center text-xs shrink-0">
                                {tl.initial}
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-[#1a2538] capitalize">
                                  {tl.name}
                                </p>
                                <p className="text-xs text-gray-400">{tl.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <p className="font-semibold text-gray-700">
                              {tl.phone}
                            </p>
                            <p className="text-xs text-gray-400">{tl.email}</p>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <p className="font-semibold text-gray-700">
                              {tl.kloter}
                            </p>
                            {/* Tampilkan tanggal dalam kurung jika kloterDate tersedia */}
                            {tl.kloterDate && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                ({tl.kloterDate})
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-500">
                            {tl.joinDate}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  // Logika untuk set data form dan buka modal edit
                                  setEditingId(tl.realId);
                                  setFormData({
                                    namaLengkap:
                                      tl.name === "Unknown" ? "" : tl.name,
                                    email: tl.email === "-" ? "" : tl.email,
                                    noTelepon: tl.phone === "-" ? "" : tl.phone,
                                    kloterId: tl.kloterId,
                                  });
                                  setShowAddModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-[#1b3167] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  // Logika untuk set user yang akan dihapus dan buka modal hapus
                                  setConfirmModal({ show: true, user: tl });
                                }}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Menampilkan halaman <strong>{currentPage}</strong> dari{" "}
                  <strong>{totalPages || 1}</strong> - {totalItems} pengguna
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${currentPage === i + 1 ? "bg-[#1b3167] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === totalPages || totalPages === 0 ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Popup Modal Tambah / Edit Tour Leader */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-gray-100 overflow-hidden animate-scale-up">
                  {/* Modal Header */}
                  <div className="bg-[#121c2d] px-6 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 shrink-0">
                        <svg
                          className="w-5 h-5 text-amber-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <h2 className="text-sm font-bold">
                        {editingId ? "Edit Tour Leader" : "Tambah Tour Leader"}
                      </h2>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                          Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="namaLengkap"
                          value={formData.namaLengkap}
                          onChange={handleInputChange}
                          placeholder="Contoh: Ahmad Fauzi"
                          required
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#121c2d]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="email@contoh.com"
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#121c2d]"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-gray-700">
                            Nomor Telepon <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="noTelepon"
                            value={formData.noTelepon}
                            onChange={handleInputChange}
                            placeholder="Cth: 08123456789"
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#121c2d]"
                          />
                        </div>
                      </div>

                      {/* Render Password HANYA saat Create (editingId bernilai null) */}
                      {!editingId && (
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-gray-700">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="••••••••"
                              required={!editingId}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#121c2d] pr-10"
                            />
                            <button
                              type="button"
                              onMouseDown={() => setShowPassword(true)}
                              onMouseUp={() => setShowPassword(false)}
                              onMouseLeave={() => setShowPassword(false)}
                              onTouchStart={() => setShowPassword(true)}
                              onTouchEnd={() => setShowPassword(false)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showPassword ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                          Pilih Kloter <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="kloterId"
                            value={formData.kloterId}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-[#121c2d] appearance-none"
                          >
                            <option value="" disabled>
                              -- Pilih Kloter --
                            </option>
                            {kloterOptions.map((kloter) => (
                              <option key={kloter.id} value={kloter.id}>
                                {kloter.name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Kembali
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-xs font-bold text-white bg-[#121c2d] hover:bg-[#1a2942] rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isSubmitting
                          ? "Menyimpan..."
                          : editingId
                          ? "Perbarui Tour Leader"
                          : "Simpan Tour Leader"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Popup Modal Konfirmasi Hapus Tour Leader */}
            {confirmModal.show && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4 text-center animate-scale-up">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <FiTrash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Hapus Tour Leader
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Apakah Anda yakin ingin menghapus akses petugas{" "}
                      <span className="font-bold text-gray-800">
                        "{confirmModal.user?.name}"
                      </span>{" "}
                      secara permanen?
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmModal({ show: false, user: null })
                      }
                      className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteUser}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}