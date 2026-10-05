// app/screens/MuthawifScreen.jsx
"use client";
import React, { useState } from "react";

export default function MuthawifScreen() {
  // 0 = List View, 1 = Form View (Tambah/Edit)
  const [view, setView] = useState(0);

  return (
    <div className="p-10 w-full max-w-6xl">
      {/* LIST VIEW */}
      {view === 0 && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#263754]">
              Daftar Muthawif
            </h1>
            <button
              onClick={() => setView(1)}
              className="bg-[#263754] hover:bg-[#3d547a] text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
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
              Tambah muthawif
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#263754] text-white">
                  <tr>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      Nama
                    </th>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      Email
                    </th>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      Kloter
                    </th>
                    <th className="px-6 py-4 font-bold border-b text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800 font-medium">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-gray-200">Fio</td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      Fio@gmail.com
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <div className="font-bold">Umrah daurah ramadhan</div>
                      <div className="text-xs text-gray-500">
                        22 februari - 2 maret 2026
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="bg-[#ffc107] hover:bg-amber-500 text-gray-900 px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm">
                          Edit
                        </button>
                        <button className="bg-[#e53935] hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-gray-200">
                      Surya
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      Surya@gmail.com
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <div className="font-bold">Umrah plus turky</div>
                      <div className="text-xs text-gray-500">
                        20 - 30 Oktober 2025
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="bg-[#ffc107] hover:bg-amber-500 text-gray-900 px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm">
                          Edit
                        </button>
                        <button className="bg-[#e53935] hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORM VIEW: Tambah Muthawif */}
      {view === 1 && (
        <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="bg-[#263754] px-8 py-5 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-500"
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

          <div className="p-8">
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nama Muthawif
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama muthawif"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#263754] focus:border-[#263754]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan email muthawif"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#263754] focus:border-[#263754]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Kloter
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#263754]">
                  <option>-- Pilih Kloter --</option>
                  <option>Umrah plus turky (20 - 30 Oktober 2025)</option>
                  <option>
                    Umrah daurah ramadhan (22 februari - 2 maret 2026)
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-6">
              <button
                onClick={() => setView(0)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
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
                onClick={() => setView(0)}
                className="bg-[#2e7d32] hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
