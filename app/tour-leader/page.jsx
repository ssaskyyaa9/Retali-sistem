"use client";
import React, { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import PageHeader from "../components/PageHeader";
import { FaUserTie, FaUserPlus } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { supabase } from "../../lib/supabase";
import { createTourLeaderAction } from "../actions/tourLeader";

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

  // Modal Edit & Delete states
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

    // Call the server action
    const result = await createTourLeaderAction(formData);

    if (!result.success) {
      console.error("Error inserting Tour Leader:", result.error);
      alert("Gagal menambahkan data: " + result.error);
      return;
    }

    // Close modal and reset form on success
    setShowAddModal(false);
    setFormData({
      namaLengkap: "",
      email: "",
      noTelepon: "",
      password: "",
      kloterId: "",
    });

    // Refresh the table data
    fetchTourLeaders();
  };

  const fetchTourLeaders = async () => {
    setLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // Buat query dasar
    let query = supabase
      .from("profiles")
      .select(`id, full_name, email, phone, is_active, created_at`, {
        count: "exact",
      })
      .eq("role", "tour_leader");

    // Jika ada kata kunci pencarian, gunakan .or() untuk memfilter berdasarkan nama, email, atau telepon
    if (searchTerm) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`,
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
        name: profile.full_name || "Unknown",
        initial: profile.full_name
          ? profile.full_name.charAt(0).toUpperCase()
          : "?",
        phone: profile.phone || "-", // Diambil dari database[cite: 12]
        email: profile.email || "-",
        kloter: "Belum Ditentukan",
        joinDate: new Date(profile.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: profile.is_active ? "Aktif" : "Tidak Aktif",
      }));

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
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar
        title="Tour Leader"
        breadcrumbs={["Dashboard", "Petugas", "Tour Leader"]}
      />

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
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#1a2538] hover:bg-[#2c3e5d] transition-colors text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
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
                              <div className="w-9 h-9 rounded-full bg-[#eef2f6] text-[#6b7280] font-bold flex items-center justify-center text-xs">
                                {tl.initial}
                              </div>
                              <div>
                                <p className="font-bold text-[#1a2538]">
                                  {tl.name}
                                </p>
                                <p className="text-xs text-gray-400">{tl.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-700">
                              {tl.phone}
                            </p>
                            <p className="text-xs text-gray-400">{tl.email}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-600">
                            {tl.kloter}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {tl.joinDate}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  // Logika untuk set data form dan buka modal edit
                                  setEditingId(tl.id);
                                  setFormData({
                                    namaLengkap:
                                      tl.name === "Unknown" ? "" : tl.name,
                                    email: tl.email === "-" ? "" : tl.email,
                                    noTelepon: tl.phone === "-" ? "" : tl.phone,
                                    kloterId: "",
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
                                  setUserToDelete(tl);
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
            {/* Modal Tambah / Edit Tour Leader */}
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
                      {/* editingId adalah state penanda apakah sedang mode edit atau tambah */}
                      {editingId ? "Edit Tour Leader" : "Tambah Tour Leader"}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
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
                      onClick={() => setShowAddModal(false)}
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
            {/* Modal Hapus Tour Leader */}
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 ${
                deleteModalOpen
                  ? "opacity-100 visible pointer-events-auto"
                  : "opacity-0 invisible pointer-events-none"
              }`}
            >
              <div
                className={`w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150 ${
                  deleteModalOpen
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0"
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
                    <h2 className="text-sm font-bold">Hapus Tour Leader</h2>
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
                    onClick={() => {
                      // Panggil fungsi handle delete Anda di sini
                      // handleDeleteUser(userToDelete.id);
                    }}
                    className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-colors"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
