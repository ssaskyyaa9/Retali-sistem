// app/screens/TourLeaderScreen.jsx
import React from "react";

export default function TourLeaderScreen() {
  return (
    <div className="p-10 w-full max-w-6xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Daftar Tour Leader
        </h1>
        {/* Add Button[cite: 4] */}
        <button className="bg-[#263754] hover:bg-[#3d547a] text-white px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
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
            ></path>
          </svg>
          Tambah tour leader
        </button>
      </header>

      {/* Data Table[cite: 4] */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mt-4">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#263754] text-white">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Kloter</th>
              <th className="px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {/* Row 1[cite: 4] */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">Fio</td>
              <td className="px-6 py-4">Fio@gmail.com</td>
              <td className="px-6 py-4">
                <p>Umrah daurah ramadhan</p>
                <p className="text-gray-500 text-xs mt-1">
                  22 februari - 2 maret 2026
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-1 rounded text-xs font-medium transition-colors">
                    Edit
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 2[cite: 4] */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">Surya</td>
              <td className="px-6 py-4">Surya@gmail.com</td>
              <td className="px-6 py-4">
                <p>Umrah plus turky</p>
                <p className="text-gray-500 text-xs mt-1">
                  20 - 30 Oktober 2025
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-1 rounded text-xs font-medium transition-colors">
                    Edit
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
