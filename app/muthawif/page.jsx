"use client";
import React, { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import PageHeader from "../components/PageHeader";
import { FaUserCheck, FaUserPlus } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { supabase } from "../../lib/supabase";

export default function MuthawifPage() {
  const [muthawifList, setMuthawifList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // State Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  // State Modal & Form
  const [showAddModal, setShowAddModal] = useState(false);

  // Gunakan dummy kloter sementara tabel kloter belum siap
  const [kloterOptions, setKloterOptions] = useState([
    {
      id: "dummy-1",
      name: "umrah plus turkey (13 febuari 2026 - 25 febuari 2026)",
    },
    {
      id: "dummy-2",
      name: "Umrah Itikaf Mandiri (21 Februari - 6 Maret 2027)",
    },
  ]);

  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelepon: "",
    password: "",
    kloterId: "",
  });

  // Tambahkan searchTerm agar pencarian berjalan otomatis saat mengetik
  useEffect(() => {
    fetchMuthawif();
  }, [currentPage, searchTerm]);

  const fetchMuthawif = async () => {
    setLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // 1. Buat variabel query dasar
    let query = supabase
      .from("profiles")
      .select(`id, full_name, email, phone, is_active, created_at`, {
        count: "exact",
      })
      .eq("role", "muthawif");

    // 2. Tambahkan filter pencarian jika searchTerm ada nilainya
    if (searchTerm) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`,
      );
    }

    // 3. Eksekusi query (JANGAN panggil supabase.from() lagi di sini)
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
        name: profile.full_name || "Unknown",
        initial: profile.full_name
          ? profile.full_name.charAt(0).toUpperCase()
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Perbaikan Dummy Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Simulasi Data Siap Dikirim ke Backend:", formData);

    setShowAddModal(false);

    // Reset Form
    setFormData({
      namaLengkap: "",
      email: "",
      noTelepon: "",
      password: "",
      kloterId: "",
    });

    alert(
      "Simulasi Sukses: Data form berhasil disubmit (Backend belum terhubung)",
    );
    fetchMuthawif();
  };

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col relative">
      <Topbar
        title="Muthawif"
        breadcrumbs={["Dashboard", "Petugas", "Muthawif"]}
      />

      <main className="p-8 w-full max-w-7xl mx-auto flex-1 no-scrollbar overflow-y-auto">
        <PageHeader
          title="Manajemen Muthawif"
          description="Kelola data muthawif pembimbing ibadah yang bertugas mendampingi jamaah selama perjalanan."
          icon={<FaUserCheck className="w-[26px] h-[26px] text-[#eab308]" />}
        />

        <div
          className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          style={{ animationDelay: "200ms" }}
        >
          {/* TOOLBAR */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
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
                      <td className="px-6 py-4 text-gray-500">{mt.joinDate}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          {/* Actions Icons */}
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
      </main>

      {/* FLOATING MODAL TAMBAH MUTHAWIF */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ease-in-out ${showAddModal ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}`}
      >
        <div
          className={`bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transition-all duration-300 ease-in-out ${showAddModal ? "scale-100" : "scale-95"}`}
        >
          <div className="bg-[#1a2538] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <FaUserPlus className="text-[#eab308] w-5 h-5" />
              <h2 className="text-lg font-bold">Tambah Muthawif</h2>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IoMdClose size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <input
                type="text"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleInputChange}
                placeholder="Nama Lengkap"
                className="w-full placeholder:text-gray-400 text-gray-700 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538] focus:border-[#1a2538]"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full placeholder:text-gray-400 text-gray-700 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538] focus:border-[#1a2538]"
                required
              />
            </div>

            {/* Input Nomor Telepon yang sebelumnya hilang */}
            <div>
              <input
                type="tel"
                name="noTelepon"
                value={formData.noTelepon}
                onChange={handleInputChange}
                placeholder="Nomor Telepon (Cth: 08123456789)"
                className="w-full placeholder:text-gray-400 text-gray-700 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538] focus:border-[#1a2538]"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full placeholder:text-gray-400 text-gray-700 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538] focus:border-[#1a2538]"
                required
              />
            </div>

            <div className="relative">
              <select
                name="kloterId"
                value={formData.kloterId}
                onChange={handleInputChange}
                className="w-full placeholder:text-gray-400 text-gray-700 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538] focus:border-[#1a2538] bg-white"
                required
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
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

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#1a2538] rounded-lg hover:bg-[#2c3e5d] transition-colors"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
