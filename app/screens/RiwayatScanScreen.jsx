import React from "react";

export default function RiwayatScanScreen() {
  return (
    <div className="p-10 w-full max-w-6xl">
      <h1 className="text-3xl font-bold text-[#263754] mb-8">
        Riwayat Scan Koper
      </h1>

      <div className="flex gap-4 items-end mb-6">
        <div className="w-64">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Tour Leader
          </label>
          <select className="w-full border border-gray-300 rounded px-4 py-2 text-sm bg-white">
            <option>-- Semua Tour Leader --</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Tanggal Scan
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-4 py-2 text-sm text-gray-400"
          />
        </div>
        <button className="bg-[#263754] hover:bg-[#3d547a] text-white px-6 py-2 rounded text-sm font-bold transition-colors mb-0.5">
          Filter
        </button>
        <button className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded text-sm font-bold transition-colors mb-0.5">
          Reset
        </button>
        <button className="bg-[#2e7d32] hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors ml-auto mb-0.5">
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

      <div className="bg-[#e6f4ea] rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-center text-sm">
          <thead className="bg-[#263754] text-white">
            <tr>
              <th className="px-4 py-4 font-bold border-r border-[#3d547a]">
                No
              </th>
              <th className="px-4 py-4 font-bold border-r border-[#3d547a]">
                Kode Koper
              </th>
              <th className="px-4 py-4 font-bold border-r border-[#3d547a]">
                Nama Pemilik
              </th>
              <th className="px-4 py-4 font-bold border-r border-[#3d547a]">
                Nomer Telepon
              </th>
              <th className="px-4 py-4 font-bold border-r border-[#3d547a]">
                Tour Leader
              </th>
              <th className="px-4 py-4 font-bold border-r border-[#3d547a]">
                Kloter
              </th>
              <th className="px-4 py-4 font-bold">Status Scan</th>
            </tr>
          </thead>
          <tbody className="text-gray-900 font-bold">
            <tr className="border-b border-gray-200">
              <td className="px-4 py-4">1</td>
              <td className="px-4 py-4">Koper 001</td>
              <td className="px-4 py-4">Jokowi</td>
              <td className="px-4 py-4">0823456790</td>
              <td className="px-4 py-4">Admin</td>
              <td className="px-4 py-4">001</td>
              <td className="px-4 py-4 flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                2025-10-30 15:54:30
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
