"use client";
import React, { useState } from "react";
import Topbar from "../components/Topbar";

export default function TourLeaderPage() {
  const [view, setView] = useState(0);

  // Data dummy sesuai gambar referensi
  const tourLeaders = [
    {
      id: "TL-001",
      name: "Muhammad Rizki",
      initial: "M",
      phone: "+62 811-2201-451",
      email: "rizki@retali.id",
      kloter: "Kloter 12",
      joinDate: "12 Feb 2024",
      status: "Aktif",
    },
    {
      id: "TL-002",
      name: "Abdul Karim",
      initial: "A",
      phone: "+62 812-3387-902",
      email: "karim@retali.id",
      kloter: "Kloter 13",
      joinDate: "03 Mar 2024",
      status: "Aktif",
    },
    {
      id: "TL-003",
      name: "Umar Hidayat",
      initial: "U",
      phone: "+62 813-9945-771",
      email: "umar@retali.id",
      kloter: "Kloter 11",
      joinDate: "18 Jan 2024",
      status: "Aktif",
    },
    {
      id: "TL-004",
      name: "Fahmi Nurhadi",
      initial: "F",
      phone: "+62 815-2210-633",
      email: "fahmi@retali.id",
      kloter: "Kloter 14",
      joinDate: "27 Apr 2024",
      status: "Cuti",
    },
    {
      id: "TL-005",
      name: "Izhar Maulana",
      initial: "I",
      phone: "+62 817-5567-118",
      email: "izhar@retali.id",
      kloter: "Kloter 12",
      joinDate: "09 Mei 2024",
      status: "Aktif",
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      {/* TOP NAVBAR / HEADER ATAS (NOTIFIKASI & PROFIL) */}
      <Topbar
        title="Tour Leader"
        breadcrumbs={["Dashboard", "Pengguna", "Tour Leader"]}
      />

      {/* MAIN CONTENT AREA */}
      <main className="p-8 w-full max-w-7xl mx-auto flex-1 no-scrollbar overflow-y-auto">
        {view === 0 && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#1a2538] p-3 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#eab308]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11l-2 2m0-2l2 2"
                  />{" "}
                  {/* Star/Badge mock icon */}
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a2538]">
                  Manajemen Tour Leader
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Kelola data tour leader yang mendampingi jamaah pada setiap
                  kloter perjalanan umrah.
                </p>
              </div>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* TOOLBAR: Search, Filter, Add Button */}
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
                      placeholder="Cari tour leader..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2538]"
                    />
                  </div>
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <select className="appearance-none bg-white border border-gray-200 rounded-lg pl-10 pr-8 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1a2538] cursor-pointer">
                      <option>Semua Status</option>
                      <option>Aktif</option>
                      <option>Cuti</option>
                    </select>
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
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
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                    </span>
                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
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
                    </span>
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
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {tourLeaders.map((tl, idx) => (
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
                        {/* STATUS */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              tl.status === "Aktif"
                                ? "bg-green-100/60 text-green-600"
                                : "bg-orange-100/60 text-orange-500"
                            }`}
                          >
                            {tl.status}
                          </span>
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
          </>
        )}

        {/* FORM VIEW Placeholder (Jika tombol 'Tambah Tour Leader' diklik) */}
        {view === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-xl font-bold mb-4">Form Tambah Tour Leader</h2>
            <p className="text-gray-500 mb-6">
              Komponen form dapat dimasukkan di sini.
            </p>
            <button
              onClick={() => setView(0)}
              className="bg-gray-400 text-white px-5 py-2 rounded-md hover:bg-gray-500"
            >
              Kembali
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
