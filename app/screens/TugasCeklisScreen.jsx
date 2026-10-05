"use client";
import React, { useState } from "react";

export default function TugasCeklisScreen() {
  // 0 = List, 1 = Step 1, 2 = Step 2, 3 = Step 3
  const [view, setView] = useState(0);

  return (
    <div className="p-10 w-full max-w-5xl">
      {/* LIST VIEW[cite: 7] */}
      {view === 0 && (
        <div>
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold flex items-center gap-3 text-[#263754]">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Daftar Tugas Ceklis
            </h1>
            <button
              onClick={() => setView(1)}
              className="bg-[#263754] hover:bg-[#3d547a] text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-md transition-colors"
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
              Tambah Tugas Ceklis
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#263754] mb-3">
                    Ceklis 1
                  </h3>
                  <div className="text-xs font-medium text-gray-700 space-y-1.5 flex flex-col">
                    <span className="flex items-center gap-2">
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
                          d="M4 6h16M4 12h8m-8 6h16"
                        />
                      </svg>{" "}
                      Dibuka : 16 oct 2040 - 15:20
                    </span>
                    <span className="flex items-center gap-2">
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>{" "}
                      Ditutup : 16 oct 2040 - 15:20
                    </span>
                    <span className="flex items-center gap-2">
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
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>{" "}
                      Jumlah Soal : 1
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>{" "}
                    Sudah ditutup
                  </button>
                  <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
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
                    </svg>{" "}
                    Detail Soal
                  </button>
                  <button className="bg-black text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1">
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
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>{" "}
                    Detail Hasil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORM STEPS CONTAINER */}
      {view > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 p-8 relative">
          {/* STEP 1[cite: 8] */}
          {view === 1 && (
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#263754] mb-6 border-b pb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Daftar Tugas Ceklis - Langkah 1
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
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
                    </svg>{" "}
                    Judul Tugas
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan judul tugas.."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#263754]"
                  />
                </div>

                <div className="bg-[#e5f6fd] text-[#0288d1] p-3 rounded-lg flex items-center gap-2 text-sm">
                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Kloter akan otomatis diambil dari profil Tour Leader (tidak
                  perlu dipilih manual).
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
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
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>{" "}
                      Jumlah Soal
                    </label>
                    <input
                      type="number"
                      defaultValue={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>{" "}
                      Waktu Dibuka
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>{" "}
                      Waktu ditutup
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>{" "}
                    Kirim ke
                  </label>
                  <input
                    type="text"
                    defaultValue="Semua Tour Leader"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="mt-10 flex justify-between items-center">
                <button
                  onClick={() => setView(0)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Kembali
                </button>
                <button
                  onClick={() => setView(2)}
                  className="bg-[#263754] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#3d547a]"
                >
                  Lanjut
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2[cite: 9, 11] */}
          {view === 2 && (
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#263754] mb-6 border-b pb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Daftar Tugas Ceklis - Langkah 2
              </h2>

              <div className="bg-[#e1f3fa] p-5 rounded-lg border border-blue-100 mb-4">
                <h3 className="text-sm font-bold text-[#0288d1] flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>{" "}
                  Informasi tugas
                </h3>
                <ul className="text-sm text-[#0288d1] space-y-1 font-medium list-disc list-inside">
                  <li>Judul : bebas dah</li>
                  <li>Dibuka : 20 Oct 2025 - 16.12</li>
                  <li>Ditutup : 20 Oct 2025 - 16.40</li>
                </ul>
              </div>

              <div className="bg-gray-100 text-gray-500 p-3 rounded-lg flex items-center gap-2 text-sm mb-6 border border-gray-200">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Kloter akan otomatis diisi berdasarkan profil{" "}
                <span className="font-bold">Tour Leader</span> yang terdaftar di
                sistem.
              </div>

              <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-gray-800">
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>{" "}
                Daftar soal
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    soal 1
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan pertanyaan untuk tugas ini.."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    soal 2
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan pertanyaan untuk tugas ini.."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-gray-800">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>{" "}
                Pilih Tour Leader
              </h3>

              <div className="border border-gray-300 rounded-lg p-5 space-y-4 mb-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-bold block text-gray-900">
                      Fio
                    </span>
                    <span className="text-xs text-gray-500">
                      Umrah plus turky
                    </span>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-bold block text-gray-900">
                      Rizal
                    </span>
                    <span className="text-xs text-gray-500">
                      Umrah daurah ramadhan
                    </span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400 mb-8">
                centang 1 atau lebih Tour Leader yang ingin dikirimi tugas ini.
              </p>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setView(1)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>{" "}
                  Kembali
                </button>
                <button
                  onClick={() => setView(3)}
                  className="bg-[#263754] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#3d547a]"
                >
                  Lanjut{" "}
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3[cite: 10] */}
          {view === 3 && (
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#263754] mb-6 border-b pb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Konfirmasi Tugas Ceklis - Langkah 3
              </h2>

              <div className="bg-[#e1f3fa] p-5 rounded-lg border border-blue-100 mb-6">
                <h3 className="text-sm font-bold text-[#0288d1] flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>{" "}
                  Informasi tugas
                </h3>
                <ul className="text-sm text-[#0288d1] space-y-1 font-medium list-disc list-inside">
                  <li>Judul : bebas dah</li>
                  <li>Jumlah Soal : 2</li>
                  <li>Dibuka : 20 Oct 2025 - 16.12</li>
                  <li>Ditutup : 20 Oct 2025 - 20.20</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm mb-6">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-bold text-gray-900 text-lg">Fio</span>
                </div>
                <span className="bg-white border border-gray-300 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  Umrah plus turky
                </span>
              </div>

              <div className="space-y-3 mb-8">
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm">
                    <span className="font-bold text-gray-900">Soal 1 :</span>{" "}
                    <span className="text-gray-600">Scan koper</span>
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between items-center">
                  <p className="text-sm">
                    <span className="font-bold text-gray-900">Soal 2 :</span>{" "}
                    <span className="text-gray-600">Baca notif</span>
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg flex items-start gap-3 text-sm font-medium mb-8">
                <svg
                  className="w-5 h-5 shrink-0 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Pastikan semua data sudah benar sebelum menekan tombol{" "}
                <strong>Simpan Tugas.</strong>
              </div>

              <div className="flex justify-end items-center gap-3">
                <button
                  onClick={() => setView(2)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>{" "}
                  Kembali
                </button>
                <button
                  onClick={() => setView(0)}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700"
                >
                  Simpan Tugas{" "}
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
