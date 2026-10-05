// app/screens/RiwayatAbsensiScreen.jsx
import React from "react";

export default function RiwayatAbsensiScreen() {
  return (
    <div className="p-10 w-full max-w-6xl">
      <h1 className="text-3xl font-bold text-[#263754] mb-8">
        Riwayat Absensi
      </h1>

      {/* Control Bar (Matching Riwayat Scan)[cite: 15] */}
      <div className="flex gap-4 items-end mb-6">
        <div className="w-64">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Tour Leader
          </label>
          <select className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#263754]">
            <option>-- Semua Tour Leader --</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Tanggal Absen
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#263754]"
          />
        </div>
        <button className="bg-[#334768] hover:bg-[#263754] text-white px-6 py-2.5 rounded text-sm font-bold transition-colors mb-0 shadow-sm">
          Filter
        </button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded text-sm font-bold transition-colors mb-0 shadow-sm">
          Reset
        </button>
        <button className="bg-[#2e7d32] hover:bg-green-700 text-white px-5 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ml-auto mb-0 shadow-sm">
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Export Excel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-center text-sm">
          <thead className="bg-[#263754] text-white">
            <tr>
              <th className="px-6 py-4 font-bold border-r border-[#3d547a]">
                Tanggal
              </th>
              <th className="px-6 py-4 font-bold border-r border-[#3d547a]">
                Nama
              </th>
              <th className="px-6 py-4 font-bold border-r border-[#3d547a]">
                Kloter
              </th>
              <th className="px-6 py-4 font-bold border-r border-[#3d547a]">
                Foto
              </th>
              <th className="px-6 py-4 font-bold border-r border-[#3d547a]">
                Koordinat
              </th>
              <th className="px-6 py-4 font-bold">Maps</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 font-bold">
            <tr className="hover:bg-gray-50 border-b border-gray-200">
              <td className="px-6 py-4">2025 - 10 -30 15:56</td>
              <td className="px-6 py-4">Surya</td>
              <td className="px-6 py-4">Umrah dubai</td>
              <td className="px-6 py-4 flex justify-center">
                <div className="w-12 h-12 bg-gray-200 rounded object-cover overflow-hidden">
                  <div className="w-full h-full bg-red-400"></div>
                </div>
              </td>
              <td className="px-6 py-4 text-xs">-54848394340, 0648349</td>
              <td className="px-6 py-4">
                <button className="bg-[#263754] hover:bg-[#3d547a] text-white px-4 py-2 rounded text-xs transition-colors shadow-sm">
                  Lihat maps
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
