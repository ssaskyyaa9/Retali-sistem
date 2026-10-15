"use client";

import React, { useState } from "react";

export default function DashboardPage() {
  const [stats] = useState({
    total_scan: "12.480",
    total_pengguna: "156",
    total_notifikasi: "38",
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const activeKloter = [
    { kloter: "Kloter 12 — Gelombang I", code: "KLR-D12", jamaah: "45 orang", leader: "Muhammad Rizki", progress: 78, status: "Berlangsung" },
    { kloter: "Kloter 13 — Gelombang I", code: "KLR-D13", jamaah: "42 orang", leader: "Abdul Karim", progress: 45, status: "Persiapan" },
    { kloter: "Kloter 11 — Gelombang I", code: "KLR-D11", jamaah: "45 orang", leader: "Umar Hidayat", progress: 100, status: "Selesai" },
  ];

  const recentActivities = [
    { 
      title: "Scan kedatangan Kloter 12", 
      desc: "38 dari 45 jamaah terverifikasi", 
      time: "5 menit lalu", 
      iconBg: "bg-blue-50 text-blue-600",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    { 
      title: "Absensi kegiatan pagi", 
      desc: "Masjidil Haram • dipimpin", 
      time: "42 menit lalu", 
      iconBg: "bg-emerald-50 text-emerald-600",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      title: "Tugas ceklis diselesaikan", 
      desc: "Kloter 11 • 4 tour leader", 
      time: "2 jam lalu", 
      iconBg: "bg-amber-50 text-amber-600",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  const notificationList = [
    { title: "Tugas ceklis baru dikirim", desc: "Tugas Ceklis Kloter 12 telah tour leader untuk diisi.", time: "2 menit lalu", unread: true },
    { title: "Absensi terlambat", desc: "Ustadz Hasan belum melakukan absensi kegiatan pagi di Masjidil...", time: "35 menit lalu", unread: true },
    { title: "Tour leader baru ditambahkan", desc: "Akun tour leader atas nama Muhammad Rizki berhasil dibuat.", time: "1 jam lalu", unread: true }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 flex flex-col overflow-x-hidden">
      
      <header className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-800 focus:outline-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Dashboard</h1>
            <p className="text-[11px] text-gray-400 font-medium">Dashboard &gt; Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
              className="relative cursor-pointer p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">Notifikasi</h3>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">3 baru</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notificationList.map((notif, idx) => (
                    <div key={idx} className={`p-4 transition-colors hover:bg-gray-50 flex gap-3 ${notif.unread ? 'bg-amber-50/30' : ''}`}>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900">{notif.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.desc}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 px-4 border-t border-gray-100 text-center">
                  <button className="text-xs font-bold text-gray-900 hover:text-indigo-600 py-1">
                    Lihat semua notifikasi
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              className="flex items-center gap-3 pl-2 border-l border-gray-200 cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                A
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  Ahmad Fauzi
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">Administrator</div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">Ahmad Fauzi</p>
                  <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">asd@retali.id</p>
                </div>

                <div className="py-1">
                  <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profil Saya
                  </button>

                  <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pengaturan
                  </button>
                </div>

                <div className="pt-1 border-t border-gray-100">
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-indigo-950 to-purple-950 p-6 lg:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
              Selasa, 13 Oktober 2026
            </span>
            <h2 className="mt-3 text-2xl lg:text-3xl font-bold">
              Assalamu'alaikum, Ahmad Fauzi 👋
            </h2>
            <p className="mt-1 text-sm text-gray-300 max-w-xl">
              Berikut ringkasan operasional umrah hari ini. Pantau scan, absensi, dan tugas pembimbing dalam satu tampilan.
            </p>
          </div>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-semibold px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 text-sm shrink-0">
            <span>+ Tambah Tugas</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 relative flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Scan</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">{stats.total_scan}</h3>
              </div>
              <div className="p-3 bg-gray-900 text-yellow-400 rounded-xl">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium mt-4 flex items-center gap-1">
              <span className="bg-green-50 px-1.5 py-0.5 rounded font-bold">+8,4%</span> Sepanjang bulan ini
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 relative flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">{stats.total_pengguna}</h3>
              </div>
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <span className="text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">+6 baru</span> Tour leader & muthawif
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 relative flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Notifikasi</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">{stats.total_notifikasi}</h3>
              </div>
              <div className="p-3 bg-yellow-100 text-yellow-700 rounded-xl">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <span className="font-semibold text-gray-700">3 belum dibaca</span> • 7 hari terakhir
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-bold text-base text-gray-900">Tren Scan & Absensi</h4>
                <p className="text-xs text-gray-500">Aktivitas 7 hari terakhir</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-900"></span> Scan</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Absensi</span>
              </div>
            </div>

            <div className="h-72 w-full bg-white rounded-xl relative flex flex-col justify-end pt-4">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[10px] text-gray-400 font-medium w-8 text-right">800</span>
                  <div className="border-b border-gray-100 flex-1"></div>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[10px] text-gray-400 font-medium w-8 text-right">600</span>
                  <div className="border-b border-gray-100 flex-1"></div>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[10px] text-gray-400 font-medium w-8 text-right">400</span>
                  <div className="border-b border-gray-100 flex-1"></div>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[10px] text-gray-400 font-medium w-8 text-right">200</span>
                  <div className="border-b border-gray-100 flex-1"></div>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[10px] text-gray-400 font-medium w-8 text-right">0</span>
                  <div className="border-b border-gray-100 flex-1"></div>
                </div>
              </div>

              <div className="pl-11 pr-2">
                <svg className="w-full h-52 overflow-visible" viewBox="0 0 700 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#111827" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#111827" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="absensiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FACC15" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#FACC15" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path d="M 0,110 Q 116,90 233,100 T 466,70 T 700,50 L 700,160 L 0,160 Z" fill="url(#scanGradient)" />
                  <path d="M 0,130 Q 116,120 233,125 T 466,95 T 700,80 L 700,160 L 0,160 Z" fill="url(#absensiGradient)" />

                  <path d="M 0,110 Q 116,90 233,100 T 466,70 T 700,50" fill="none" stroke="#111827" strokeWidth="2.5" />
                  <path d="M 0,130 Q 116,120 233,125 T 466,95 T 700,80" fill="none" stroke="#E11D48" strokeWidth="2.5" />

                  <circle cx="233" cy="100" r="4" fill="#111827" />
                  <circle cx="466" cy="70" r="4" fill="#111827" />
                  <circle cx="700" cy="50" r="4" fill="#111827" />

                  <circle cx="233" cy="125" r="4" fill="#E11D48" />
                  <circle cx="466" cy="95" r="4" fill="#E11D48" />
                  <circle cx="700" cy="80" r="4" fill="#E11D48" />
                </svg>

                <div className="flex justify-between text-xs text-gray-400 pt-2 px-1 border-t border-gray-100">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span>Sab</span>
                  <span>Min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h4 className="font-bold text-base text-gray-900">Aktivitas Terbaru</h4>
                <p className="text-xs text-gray-500">3 kejadian terakhir</p>
              </div>

              <div className="space-y-4">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-none last:pb-0">
                    <div className={`p-2.5 rounded-xl text-xs font-bold ${act.iconBg} shrink-0`}>
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{act.title}</p>
                      <p className="text-[11px] text-gray-500 truncate">{act.desc}</p>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-base text-gray-900">Kloter Aktif</h4>
              <p className="text-xs text-gray-500">Ringkasan perjalanan yang sedang berjalan</p>
            </div>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Lihat semua
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 font-semibold">Kloter</th>
                  <th className="pb-3 font-semibold">Jamaah</th>
                  <th className="pb-3 font-semibold">Tour Leader</th>
                  <th className="pb-3 font-semibold">Progres</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeKloter.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 font-bold text-gray-900">
                      {item.kloter}
                      <div className="text-[10px] text-gray-400 font-normal">{item.code}</div>
                    </td>
                    <td className="py-3.5 text-gray-600 font-medium">{item.jamaah}</td>
                    <td className="py-3.5 text-gray-600 font-medium">{item.leader}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-gray-900 to-rose-600 h-1.5 rounded-full" 
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-600">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        item.status === 'Berlangsung' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'Persiapan' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}