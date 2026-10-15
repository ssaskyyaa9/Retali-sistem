"use client";

import React, { useState } from "react";
import Topbar from "../components/Topbar";

export default function DashboardPage() {
  // State untuk switcher Tour Leader & Muthawif Aktif
  const [activeTab, setActiveTab] = useState("tour_leader");

  const [stats] = useState({
    total_scan: "34",
    total_tour_leader: "6",
    total_muthawif: "1",
    total_absen_jamaah: "135",
    total_itinerary: "3",
  });

  const recentActivities = [
    {
      title: "Ustadz Dedi Muhammad",
      desc: "Scan koper 6",
      time: "51 hari lalu",
    },
    {
      title: "Ustadz Dedi Muhammad",
      desc: "Scan koper 26",
      time: "51 hari lalu",
    },
    {
      title: "Ustadz Dedi Muhammad",
      desc: "Scan koper 10",
      time: "51 hari lalu",
    },
    {
      title: "Ustadz Dedi Muhammad",
      desc: "Scan koper 14",
      time: "51 hari lalu",
    },
    {
      title: "Ustadz Dedi Muhammad",
      desc: "Scan koper 40",
      time: "51 hari lalu",
    },
  ];

  const tourLeadersActive = [
    { name: "Muchammad Amar Aziim", aktivitas: "-", jam: "-", status: "Tidak Aktif" },
    { name: "Fio Ramadhan", aktivitas: "Absen masuk", jam: "10:54", status: "Tidak Aktif" },
    { name: "Muhammad Hanif Ali", aktivitas: "-", jam: "-", status: "Tidak Aktif" },
    { name: "Surya", aktivitas: "Absensi jamaah", jam: "11:37", status: "Tidak Aktif" },
  ];

  const muthawifActive = [
    { name: "Fio", aktivitas: "-", jam: "-", status: "Tidak Aktif" },
  ];

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
        {/* Topbar preserved */}
        <Topbar title="Dashboard" breadcrumbs={["Dashboard", "Dashboard"]} />

        {/* MAIN CONTENT AREA DENGAN NO-SCROLLBAR */}
        <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
          
          {/* 5 Card Statistik Clean & Seragam dengan Bayangan Soft */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Total Scan */}
            <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Total Scan</p>
                  <h3 className="text-3xl font-black text-[#1b3167] mt-2">{stats.total_scan}</h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#1b3167] text-yellow-400 flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2: Total Tour Leader */}
            <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Total Tour Leader</p>
                  <h3 className="text-3xl font-black text-[#1b3167] mt-2">{stats.total_tour_leader}</h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#1b3167] text-yellow-400 flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 3: Total Muthawif */}
            <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Total Muthawif</p>
                  <h3 className="text-3xl font-black text-[#1b3167] mt-2">{stats.total_muthawif}</h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#1b3167] text-yellow-400 flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4-3a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-3a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h.01a1 1 0 100-2H10zm3 0a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 4: Total Absen Jamaah */}
            <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Absen Jamaah</p>
                  <h3 className="text-3xl font-black text-[#1b3167] mt-2">{stats.total_absen_jamaah}</h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#1b3167] text-yellow-400 flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 5: Total Itinerary */}
            <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-32 sm:col-span-2 md:col-span-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Total Itinerary</p>
                  <h3 className="text-3xl font-black text-[#1b3167] mt-2">{stats.total_itinerary}</h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#1b3167] text-yellow-400 flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Status Operasional & Aktivitas Terbaru */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Operasional */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-base text-gray-900 mb-1">Status Operasional Hari Ini</h4>
                <div className="space-y-5 mt-5">
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-gray-800">Tugas Tour Leader</span>
                      <span className="text-gray-700">0%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">0 dari 0 selesai</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-gray-800">Checklist</span>
                      <span className="text-gray-700">0%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">0 dari 0 checklist selesai</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-gray-800">Absensi Jamaah</span>
                      <span className="text-gray-700">30%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">41 dari 135 jamaah</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aktivitas Terbaru */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
              <div className="mb-4">
                <h4 className="font-bold text-base text-gray-900">Aktivitas Terbaru</h4>
              </div>
              <div className="space-y-4">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-none last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1b3167] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        U
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{act.title}</p>
                        <p className="text-[11px] text-gray-500">{act.desc}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tour Leader & Muthawif Aktif */}
          <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
            {/* Header section dengan Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h4 className="font-bold text-lg text-gray-900">
                    {activeTab === "tour_leader" ? "Tour Leader Aktif" : "Muthawif Aktif"}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Status dan aktivitas terakhir petugas di lapangan
                </p>
              </div>

              {/* Modern Segmented Tab Switcher */}
              <div className="flex bg-gray-100/80 p-1.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("tour_leader")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === "tour_leader"
                      ? "bg-[#1b3167] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tour Leader
                </button>
                <button
                  onClick={() => setActiveTab("muthawif")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === "muthawif"
                      ? "bg-[#1b3167] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Muthawif
                </button>
              </div>
            </div>

            {/* Clean Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#1b3167] text-white text-xs font-bold tracking-wide">
                    <th className="py-3.5 px-5 rounded-l-xl">NAMA PETUGAS</th>
                    <th className="py-3.5 px-5">AKTIVITAS TERAKHIR</th>
                    <th className="py-3.5 px-5">JAM</th>
                    <th className="py-3.5 px-5 rounded-r-xl text-right">STATUS HARI INI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {activeTab === "tour_leader" ? (
                    tourLeadersActive.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-full bg-[#1b3167] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {item.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-gray-800">{item.name}</span>
                        </td>
                        <td className="py-4 px-5 font-medium">
                          {item.aktivitas !== "-" ? (
                            <span className="text-gray-800 bg-gray-100/90 border border-gray-200/60 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs">
                              {item.aktivitas}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-semibold text-base">-</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-gray-700 font-semibold text-sm">
                          {item.jam !== "-" ? item.jam : <span className="text-gray-300 text-base font-semibold">-</span>}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    muthawifActive.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-full bg-[#1b3167] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {item.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-gray-800">{item.name}</span>
                        </td>
                        <td className="py-4 px-5 font-medium">
                          {item.aktivitas !== "-" ? (
                            <span className="text-gray-800 bg-gray-100/90 border border-gray-200/60 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs">
                              {item.aktivitas}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-semibold text-base">-</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-gray-700 font-semibold text-sm">
                          {item.jam !== "-" ? item.jam : <span className="text-gray-300 text-base font-semibold">-</span>}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}