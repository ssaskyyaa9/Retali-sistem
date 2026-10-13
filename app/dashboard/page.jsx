// This is the main dashboard page for the admin panel. It displays key statistics and provides an overview of the system's status.
"use client";

import React, { useState } from "react";

export default function DashboardPage() {
  const [stats] = useState({
    total_scan: 120,
    total_pengguna: 15,
    total_notifikasi: 8,
  });

  const cards = [
    {
      title: "Total Scan",
      value: stats.total_scan,
      icon: (
        <svg className="mb-4 h-14 w-14 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      title: "Total Pengguna",
      value: stats.total_pengguna,
      icon: (
        <svg className="mb-4 h-14 w-14 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      title: "Total Notifikasi",
      value: stats.total_notifikasi,
      icon: (
        <svg className="mb-4 h-14 w-14 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl p-10">
      <h1 className="mb-2 text-3xl font-bold text-black">
        Dashboard Admin
      </h1>

      <p className="mb-10 font-medium text-gray-800">
        Atur semua data dengan mudah
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col items-center justify-center rounded-xl bg-[#263754] px-6 py-10 text-white shadow-md"
          >
            {card.icon}
            <h2 className="mb-3 text-xl font-bold">{card.title}</h2>
            <p className="text-2xl font-bold">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}