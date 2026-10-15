"use client";
import React, { useState } from "react";
import Topbar from "../components/Topbar";

export default function MuthawifPage() {
  const [view, setView] = useState(0);

  const [muthawifList] = useState([
    {
      id: "MT-001",
      name: "Ustadz Hasan Basri",
      email: "hasan@retali.id",
      phone: "+62 811-7788-001",
      kloter: "Kloter 12",
      joinDate: "10 Feb 2024",
      status: "Aktif",
    },
    {
      id: "MT-002",
      name: "Ustadzah Aminah Salim",
      email: "aminah@retali.id",
      phone: "+62 812-6612-334",
      kloter: "Kloter 12",
      joinDate: "10 Feb 2024",
      status: "Aktif",
    },
    {
      id: "MT-003",
      name: "Ustadz Yusuf Mansur",
      email: "yusuf@retali.id",
      phone: "+62 813-4478-556",
      kloter: "Kloter 13",
      joinDate: "01 Mar 2024",
      status: "Aktif",
    },
    {
      id: "MT-004",
      name: "Ustadzah Fatimah Zahra",
      email: "fatimah@retali.id",
      phone: "+62 815-8890-223",
      kloter: "Kloter 13",
      joinDate: "15 Mar 2024",
      status: "Cuti",
    },
    {
      id: "MT-005",
      name: "Ustadz Ibrahim Malik",
      email: "ibrahim@retali.id",
      phone: "+62 817-2234-778",
      kloter: "Kloter 11",
      joinDate: "20 Jan 2024",
      status: "Aktif",
    },
  ]);

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      {/* TOP NAVBAR / HEADER ATAS (NOTIFIKASI & PROFIL) */}
      <Topbar
        title="Muthawif"
        breadcrumbs={["Dashboard", "Pengguna", "Muthawif"]}
      />

      {/* MAIN CONTENT AREA */}
      <main className="p-8 w-full max-w-7xl mx-auto flex-1 no-scrollbar overflow-y-auto">
        {view === 0 && (
          <div>
            {/* Header Title */}
            <div className="mb-6">
              <div className="flex items-start gap-3.5">
                <div className="bg-[#263754] p-2.5 rounded-lg text-white shadow-sm flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Manajemen Muthawif
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Kelola data muthawif pembimbing ibadah yang bertugas
                    mendampingi jamaah selama perjalanan.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
              {/* Filter & Add Button Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
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
                      placeholder="Cari muthawif..."
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#263754]"
                    />
                  </div>

                  {/* Status Dropdown Filter */}
                  <div className="relative">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 cursor-pointer">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                      <select className="bg-transparent border-none focus:outline-none text-gray-700 cursor-pointer pr-2">
                        <option>Semua Status</option>
                        <option>Aktif</option>
                        <option>Cuti</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tambah Muthawif Button */}
                <button
                  onClick={() => setView(1)}
                  className="w-full sm:w-auto bg-[#1b2a47] hover:bg-[#263754] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tambah Muthawif
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-400 font-semibold text-xs tracking-wider uppercase border-b border-gray-100">
                      <th className="pb-3 px-4">Pengguna</th>
                      <th className="pb-3 px-4">Kontak</th>
                      <th className="pb-3 px-4">Kloter</th>
                      <th className="pb-3 px-4">Bergabung</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {muthawifList.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Pengguna */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                              U
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-400 font-normal">
                                {item.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Kontak */}
                        <td className="py-3 px-4">
                          <div className="text-gray-900 font-medium">
                            {item.phone}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.email}
                          </div>
                        </td>

                        {/* Kloter */}
                        <td className="py-3 px-4 text-gray-800 font-medium">
                          {item.kloter}
                        </td>

                        {/* Bergabung */}
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {item.joinDate}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === "Aktif"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                                : "bg-amber-50 text-amber-600 border border-amber-200/60"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-3 text-gray-400">
                            <button
                              className="hover:text-gray-600 transition-colors"
                              title="Lihat"
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
                                  strokeWidth="1.5"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              className="hover:text-amber-500 transition-colors"
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
                                  strokeWidth="1.5"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              className="hover:text-red-500 transition-colors"
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
                                  strokeWidth="1.5"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 gap-4">
                <div>
                  Menampilkan halaman{" "}
                  <span className="font-semibold text-gray-800">1</span> dari 2
                  • 8 pengguna
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-400">
                    &lt;
                  </button>
                  <button className="w-8 h-8 bg-[#263754] text-white rounded-lg font-semibold flex items-center justify-center">
                    1
                  </button>
                  <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-700">
                    2
                  </button>
                  <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-700">
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORM VIEW (Tambah Muthawif) */}
        {view === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl mx-auto">
            <div className="bg-[#263754] px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Muthawif
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Nama Muthawif
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama muthawif..."
                    className="w-full border placeholder:text-gray-400 text-gray-900 border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#263754]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Masukkan email muthawif..."
                    className="w-full border placeholder:text-gray-400 text-gray-900 border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#263754]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Kloter
                  </label>
                  <select className="w-full border text-gray-700 border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#263754]">
                    <option>-- Pilih Kloter --</option>
                    <option>Kloter 11</option>
                    <option>Kloter 12</option>
                    <option>Kloter 13</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setView(0)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setView(0)}
                  className="bg-[#263754] hover:bg-[#1e2c43] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
