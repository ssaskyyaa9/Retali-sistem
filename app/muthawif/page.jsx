"use client";
import React, { useState } from "react";
import Topbar from "../components/Topbar";
import PageHeader from "../components/PageHeader";
import { FaUserCheck } from "react-icons/fa6";

export default function MuthawifPage() {
  const [view, setView] = useState(0);

  const [muthawifList] = useState([
    {
      id: "MT-001",
      initial: "U",
      name: "Ustadz Hasan Basri",
      email: "hasan@retali.id",
      phone: "+62 811-7788-001",
      kloter: "Kloter 12",
      joinDate: "10 Feb 2024",
      status: "Aktif",
    },
    {
      id: "MT-002",
      initial: "U",
      name: "Ustadzah Aminah Salim",
      email: "aminah@retali.id",
      phone: "+62 812-6612-334",
      kloter: "Kloter 12",
      joinDate: "10 Feb 2024",
      status: "Aktif",
    },
    {
      id: "MT-003",
      initial: "U",
      name: "Ustadz Yusuf Mansur",
      email: "yusuf@retali.id",
      phone: "+62 813-4478-556",
      kloter: "Kloter 13",
      joinDate: "01 Mar 2024",
      status: "Aktif",
    },
    {
      id: "MT-004",
      initial: "U",
      name: "Ustadzah Fatimah Zahra",
      email: "fatimah@retali.id",
      phone: "+62 815-8890-223",
      kloter: "Kloter 13",
      joinDate: "15 Mar 2024",
      status: "Cuti",
    },
    {
      id: "MT-005",
      initial: "U",
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
        breadcrumbs={["Dashboard", "Petugas", "Muthawif"]}
      />

      {/* MAIN CONTENT AREA */}
      <main className="p-8 w-full max-w-7xl mx-auto flex-1 no-scrollbar overflow-y-auto">
        {view === 0 && (
          <div>
            {/* Header Title */}
            <PageHeader
              title="Manajemen Muthawif"
              description="Kelola data muthawif pembimbing ibadah yang bertugas mendampingi jamaah selama perjalanan."
              icon={
                <FaUserCheck className="w-[26px] h-[26px] text-[#eab308]" />
              }
            />

            {/* MAIN CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* TOOLBAR: Search, Filter, Add Button */}
              <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-4">
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
                      placeholder="Cari tour leader..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538]"
                    />
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => setView(1)}
                  className="bg-[#1a2538] hover:bg-[#2c3e5d] transition-colors text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
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
                    {muthawifList.map((tl, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* PENGGUNA */}
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
                        {/* KONTAK */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-700">
                            {tl.phone}
                          </p>
                          <p className="text-xs text-gray-400">{tl.email}</p>
                        </td>
                        {/* KLOTER */}
                        <td className="px-6 py-4 font-semibold text-gray-600">
                          {tl.kloter}
                        </td>
                        {/* BERGABUNG */}
                        <td className="px-6 py-4 text-gray-500">
                          {tl.joinDate}
                        </td>

                        {/* AKSI */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 text-gray-400">
                            <button className="hover:text-blue-500 transition-colors">
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
                            </button>
                            <button className="hover:text-yellow-500 transition-colors">
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
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                            <button className="hover:text-red-500 transition-colors">
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Menampilkan halaman <strong>1</strong> dari <strong>2</strong>{" "}
                  - 9 pengguna
                </span>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
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
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a2538] text-white font-medium text-sm">
                    1
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">
                    2
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
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
