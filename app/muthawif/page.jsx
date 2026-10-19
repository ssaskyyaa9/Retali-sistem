"use client";
import React, { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import PageHeader from "../components/PageHeader";
import { FaUserCheck, FaUserPlus } from "react-icons/fa6";
import { supabase } from "../../lib/supabase";
import {
  createMuthawifAction,
  updateMuthawifAction,
  deleteMuthawifAction,
} from "..//actions/muthawif";

export default function MuthawifPage() {
  const [view, setView] = useState(0);
  const [muthawifList, setMuthawifList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  // Modal & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [kloterOptions, setKloterOptions] = useState([]);

  // Edit & Delete States
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelepon: "",
    password: "",
    kloterId: "",
  });

  // Trigger fetch ketika currentPage atau searchTerm berubah
  useEffect(() => {
    fetchMuthawif();
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
      const formattedKloter = data.map((kloter) => ({
        id: kloter.id,
        name: kloter.description
          ? `${kloter.name} (${kloter.description})`
          : kloter.name,
      }));
      setKloterOptions(formattedKloter);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat mencari
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (editingId) {
      result = await updateMuthawifAction(editingId, formData);
    } else {
      result = await createMuthawifAction(formData);
    }

    if (!result.success) {
      console.error("Error saving Muthawif:", result.error);
      alert("Gagal menyimpan data: " + result.error);
      return;
    }

    closeAddModal();
    fetchMuthawif();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.realId) return;

    const result = await deleteMuthawifAction(userToDelete.realId);

    if (!result.success) {
      console.error("Error deleting Muthawif:", result.error);
      alert("Gagal menghapus data: " + result.error);
      return;
    }

    setDeleteModalOpen(false);
    setUserToDelete(null);
    fetchMuthawif();
  };

  const fetchMuthawif = async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("profiles")
      .select(`id, username, email, phone, is_active, created_at`, {
        count: "exact",
      })
      .eq("role", "muthawif");

    if (searchTerm) {
      query = query.or(
        `username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`,
      );
    }

    const { data, count, error } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching Muthawif:", error.message);
      setLoading(false);
      return;
    }

    if (data) {
      const formattedData = data.map((profile, index) => ({
        id: `MT-${String(from + index + 1).padStart(3, "0")}`,
        realId: profile.id, // Menyimpan ID asli dari database untuk keperluan update/delete
        name: profile.username || "Unknown",
        initial: profile.username
          ? profile.username.charAt(0).toUpperCase()
          : "?",
        phone: profile.phone || "-",
        email: profile.email || "-",
        kloter: "Belum Ditentukan",
        joinDate: new Date(profile.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: profile.is_active ? "Aktif" : "Tidak Aktif",
      }));

      setMuthawifList(formattedData);
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

  const closeAddModal = () => {
    setShowAddModal(false);
    // Beri jeda sedikit agar form tidak langsung kosong saat animasi fade-out berjalan
    setTimeout(() => {
      setEditingId(null);
      setFormData({
        namaLengkap: "",
        email: "",
        noTelepon: "",
        password: "",
        kloterId: "",
      });
    }, 200);
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col relative">
      <Topbar
        title="Muthawif"
        breadcrumbs={["Dashboard", "Petugas", "Muthawif"]}
      />

      <main className="p-8 w-full max-w-7xl mx-auto flex-1 no-scrollbar overflow-y-auto">
        {view === 0 && (
          <>
            <PageHeader
              title="Manajemen Muthawif"
              description="Kelola data muthawif pembimbing ibadah yang bertugas mendampingi jamaah selama perjalanan."
              icon={
                <FaUserCheck className="w-[26px] h-[26px] text-[#eab308]" />
              }
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
                  className="bg-[#1a2538] hover:bg-[#2c3e5d] transition-colors text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <FaUserPlus className="w-4 h-4" />
                  Tambah Muthawif
                </button>
              </div>

              {/* TABLE LIST */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">PENGGUNA</th>
                      <th className="px-6 py-4">KONTAK</th>
                      <th className="px-6 py-4">KLOTER</th>
                      <th className="px-6 py-4">BERGABUNG</th>
                      <th className="px-6 py-4 text-right">AKSI</th>
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
                    ) : muthawifList.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {searchTerm
                            ? "Tidak ada hasil pencarian yang sesuai."
                            : "Tidak ada data muthawif."}
                        </td>
                      </tr>
                    ) : (
                      muthawifList.map((mt, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#eef2f6] text-[#6b7280] font-bold flex items-center justify-center text-xs">
                                {mt.initial}
                              </div>
                              <div>
                                <p className="font-bold text-[#1a2538]">
                                  {mt.name}
                                </p>
                                <p className="text-xs text-gray-400">{mt.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-700">
                              {mt.phone}
                            </p>
                            <p className="text-xs text-gray-400">{mt.email}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-600">
                            {mt.kloter}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {mt.joinDate}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* EDIT BUTTON */}
                              <button
                                onClick={() => {
                                  setEditingId(mt.realId);
                                  setFormData({
                                    namaLengkap:
                                      mt.name === "Unknown" ? "" : mt.name,
                                    email: mt.email === "-" ? "" : mt.email,
                                    noTelepon: mt.phone === "-" ? "" : mt.phone,
                                    password: "",
                                    kloterId: "", // Idealnya dari relasi data kloter
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

                              {/* DELETE BUTTON */}
                              <button
                                onClick={() => {
                                  setUserToDelete(mt);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  <strong>{totalPages || 1}</strong>
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
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${currentPage === i + 1 ? "bg-[#1a2538] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
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
          </>
        )}
      </main>

      {/* MODAL TAMBAH / EDIT MUTHAWIF (Dengan animasi CSS mulus) */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-all duration-300 ease-in-out ${
          showAddModal
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 transition-all duration-300 ease-in-out ${
            showAddModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between bg-[#1b3167] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 shadow-2xs shrink-0">
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
                {editingId ? "Edit Muthawif" : "Tambah Muthawif"}
              </h2>
            </div>
            <button
              onClick={closeAddModal}
              className="text-gray-300 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#1b3167] focus:outline-none focus:ring-1 focus:ring-[#1b3167]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#1b3167] focus:outline-none focus:ring-1 focus:ring-[#1b3167]"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#1b3167] focus:outline-none focus:ring-1 focus:ring-[#1b3167]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Password{" "}
                  {editingId && (
                    <span className="text-gray-400 font-normal">
                      (Kosongkan jika tidak diubah)
                    </span>
                  )}{" "}
                  {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required={!editingId}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#1b3167] focus:outline-none focus:ring-1 focus:ring-[#1b3167] pr-10"
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-900 focus:border-[#1b3167] focus:outline-none focus:ring-1 focus:ring-[#1b3167] appearance-none"
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
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1b3167] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#15254f] transition-colors"
              >
                <svg
                  className="w-4 h-4 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL HAPUS MUTHAWIF */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-all duration-300 ease-in-out ${
          deleteModalOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 transition-all duration-300 ease-in-out ${
            deleteModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between bg-[#1b3167] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 shadow-2xs shrink-0">
                <svg
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-sm font-bold">Hapus Muthawif</h2>
            </div>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="text-gray-300 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Yakin ingin menghapus akses petugas ini? <br />
              <span className="text-lg font-bold text-gray-900 mt-2 block">
                "{userToDelete?.name}"
              </span>
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteUser}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
