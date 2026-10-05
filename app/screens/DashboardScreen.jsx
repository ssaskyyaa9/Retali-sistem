// app/screens/DashboardScreen.jsx
import React from "react";

export default function DashboardScreen() {
  return (
    <div className="p-10 w-full max-w-6xl">
      <h1 className="text-3xl font-bold text-black mb-2">Dashboard Admin</h1>
      <p className="text-gray-800 font-medium mb-10">
        Atur semua data dengan mudah
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Scan Card[cite: 14] */}
        <div className="bg-[#263754] rounded-xl shadow-md py-10 px-6 flex flex-col items-center justify-center text-white">
          <svg
            className="w-14 h-14 text-yellow-500 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <h2 className="text-xl font-bold mb-3">Total Scan</h2>
          <p className="text-2xl font-bold">1</p>
        </div>

        {/* Total Pengguna Card[cite: 14] */}
        <div className="bg-[#263754] rounded-xl shadow-md py-10 px-6 flex flex-col items-center justify-center text-white">
          <svg
            className="w-14 h-14 text-yellow-500 mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <h2 className="text-xl font-bold mb-3">Total Pengguna</h2>
          <p className="text-2xl font-bold">1</p>
        </div>

        {/* Total Notifikasi Card[cite: 14] */}
        <div className="bg-[#263754] rounded-xl shadow-md py-10 px-6 flex flex-col items-center justify-center text-white">
          <svg
            className="w-14 h-14 text-yellow-500 mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-3">Total Notifikasi</h2>
          <p className="text-2xl font-bold">2</p>
        </div>
      </div>
    </div>
  );
}
