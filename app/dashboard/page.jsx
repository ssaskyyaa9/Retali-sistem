"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "../components/Topbar";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("tour_leader");

  const [stats, setStats] = useState({
    total_scan: 0,
    total_tour_leader: 0,
    total_muthawif: 0,
    total_absen_jamaah: 0,
    total_itinerary: 0,
  });

  const [operational, setOperational] = useState({
    taskDone: 0,
    taskTotal: 0,
    checklistDone: 0,
    checklistTotal: 0,
    attendanceDone: 0,
    attendanceTotal: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [tourLeadersActive, setTourLeadersActive] = useState([]);
  const [muthawifActive, setMuthawifActive] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const { count: koperScanCount } = await supabase
        .from("koper")
        .select("*", { count: "exact", head: true });

      const { count: passportScanCount } = await supabase
        .from("passport_scans")
        .select("*", { count: "exact", head: true });

      const totalScanCombined = (koperScanCount || 0) + (passportScanCount || 0);

      const { count: tlCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "tour_leader");

      const { count: muthawifCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "muthawif");

      const { count: absenCount } = await supabase
        .from("attendance_user")
        .select("*", { count: "exact", head: true });

      const { count: itineraryActivityCount } = await supabase
        .from("itinerary_activities")
        .select("*", { count: "exact", head: true });

      setStats({
        total_scan: totalScanCombined,
        total_tour_leader: tlCount || 0,
        total_muthawif: muthawifCount || 0,
        total_absen_jamaah: absenCount || 0,
        total_itinerary: itineraryActivityCount || 0,
      });

      const { count: taskTotal } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true });
      const { count: taskDone } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { count: checklistTotal } = await supabase
        .from("checklist_tasks")
        .select("*", { count: "exact", head: true });
      const { count: checklistDone } = await supabase
        .from("checklist_tasks")
        .select("*", { count: "exact", head: true })
        .eq("is_completed", true);

      const { count: attendanceTotal } = await supabase
        .from("attendance_user")
        .select("*", { count: "exact", head: true });
      const { count: attendanceDone } = await supabase
        .from("attendance_user")
        .select("*", { count: "exact", head: true })
        .eq("status", "hadir");

      setOperational({
        taskDone: taskDone || 0,
        taskTotal: taskTotal || 0,
        checklistDone: checklistDone || 0,
        checklistTotal: checklistTotal || 0,
        attendanceDone: attendanceDone || 0,
        attendanceTotal: attendanceTotal || 0,
      });

      // Mengambil aktivitas koper dengan relasi ke profiles (mengambil kolom username)
      const { data: activitiesData } = await supabase
        .from("koper")
        .select("id, created_at, koper_id, profiles(username)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (activitiesData && activitiesData.length > 0) {
        const formattedActivities = activitiesData.map((item) => {
          const dateObj = new Date(item.created_at);
          const timeString = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
          const name = item.profiles?.username || "Petugas";
          return {
            title: name,
            desc: item.koper_id ? `Scan koper ${item.koper_id}` : "Aktivitas scan koper",
            time: `${timeString} WIB`,
          };
        });
        setRecentActivities(formattedActivities);
      } else {
        setRecentActivities([]);
      }

      // Ambil data dari tabel profiles khusus role tour_leader dan muthawif
      const { data: profilesData, error: profileErr } = await supabase
        .from("profiles")
        .select("username, role, updated_at, created_at")
        .in("role", ["tour_leader", "muthawif"]);

      if (profileErr) {
        console.error("Error fetching profiles:", profileErr.message);
      }

      if (profilesData && profilesData.length > 0) {
        const now = new Date();

        const processProfiles = (targetRole) => {
          return profilesData
            .filter((p) => p.role === targetRole)
            .map((p) => {
              const name = p.username || "Tanpa Nama";
              
              // Cek waktu updated_at (atau created_at sebagai fallback)
              const targetTime = p.updated_at || p.created_at;
              let jamString = "-";
              let isActive = false;

              if (targetTime) {
                const activeDate = new Date(targetTime);
                const diffMs = now - activeDate;
                const diffMinutes = diffMs / (1000 * 60);

                // Jika kurang dari atau sama dengan 3 menit, status Aktif (Hijau)
                if (diffMinutes <= 3) {
                  isActive = true;
                }

                jamString = activeDate.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).replace(".", ":");
              }

              return {
                name: name,
                aktivitas: isActive ? "Membuka Aplikasi" : "Tidak Aktif",
                jam: jamString,
                status: isActive ? "Aktif" : "Tidak Aktif",
                isActive: isActive,
              };
            });
        };

        setTourLeadersActive(processProfiles("tour_leader"));
        setMuthawifActive(processProfiles("muthawif"));
      } else {
        setTourLeadersActive([]);
        setMuthawifActive([]);
      }

    } catch (error) {
      console.error("Gagal memuat data dashboard dari Supabase:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Interval setiap 10 detik untuk memperbarui status waktu secara otomatis
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    const channel = supabase
      .channel("realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "koper" }, () => fetchDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "passport_scans" }, () => fetchDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_user" }, () => fetchDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "itinerary_activities" }, () => fetchDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => fetchDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "checklist_tasks" }, () => fetchDashboardData())
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

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
        <Topbar title="Dashboard" breadcrumbs={["Dashboard", "Dashboard"]} />

        <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <Link
              href="/riwayat-scan"
              className="animate-fade-in-up bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-28 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-black text-[#1b3167]">{stats.total_scan}</h3>
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500">Total Scan</p>
            </Link>

            <Link
              href="/tour-leader"
              className="animate-fade-in-up bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-28 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-black text-[#1b3167]">{stats.total_tour_leader}</h3>
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500">Total Tour Leader</p>
            </Link>

            <Link
              href="/muthawif"
              className="animate-fade-in-up bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-28 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-black text-[#1b3167]">{stats.total_muthawif}</h3>
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4-3a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-3a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h.01a1 1 0 100-2H10zm3 0a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500">Total Muthawif</p>
            </Link>

            <Link
              href="/riwayat-absensi/jamaah"
              className="animate-fade-in-up bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-28 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-black text-[#1b3167]">{stats.total_absen_jamaah}</h3>
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500">Absen Jamaah</p>
            </Link>

            <Link
              href="/itinerary"
              className="animate-fade-in-up bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-28 sm:col-span-2 md:col-span-1 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-black text-[#1b3167]">{stats.total_itinerary}</h3>
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500">Total Itinerary</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-base text-gray-900 mb-1">Status Operasional Hari Ini</h4>
                <div className="space-y-5 mt-5">
                  
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-gray-800">Tugas Tour Leader</span>
                      <span className="text-gray-700">
                        {operational.taskTotal > 0 ? Math.round((operational.taskDone / operational.taskTotal) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${operational.taskTotal > 0 ? (operational.taskDone / operational.taskTotal) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">
                      {operational.taskDone} dari {operational.taskTotal} selesai
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-gray-800">Checklist</span>
                      <span className="text-gray-700">
                        {operational.checklistTotal > 0 ? Math.round((operational.checklistDone / operational.checklistTotal) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${operational.checklistTotal > 0 ? (operational.checklistDone / operational.checklistTotal) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">
                      {operational.checklistDone} dari {operational.checklistTotal} checklist selesai
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-gray-800">Absensi Jamaah</span>
                      <span className="text-gray-700">
                        {operational.attendanceTotal > 0 ? Math.round((operational.attendanceDone / operational.attendanceTotal) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${operational.attendanceTotal > 0 ? (operational.attendanceDone / operational.attendanceTotal) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">
                      {operational.attendanceDone} dari {operational.attendanceTotal} jamaah
                    </p>
                  </div>

                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
              <div className="mb-4">
                <h4 className="font-bold text-base text-gray-900">Aktivitas Terbaru</h4>
              </div>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-none last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1b3167] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {act.title ? act.title.charAt(0) : "P"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{act.title}</p>
                          <p className="text-[11px] text-gray-500">{act.desc}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">{act.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">Belum ada aktivitas terbaru.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h4 className="font-bold text-lg text-gray-900">
                    {activeTab === "tour_leader" ? "Tour Leader Aktif" : "Muthawif Aktif"}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Status dan aktivitas terakhir petugas di lapangan</p>
              </div>

              <div className="flex bg-gray-100/80 p-1.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("tour_leader")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === "tour_leader" ? "bg-[#1b3167] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tour Leader
                </button>
                <button
                  onClick={() => setActiveTab("muthawif")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === "muthawif" ? "bg-[#1b3167] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Muthawif
                </button>
              </div>
            </div>

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
                  {(activeTab === "tour_leader" ? tourLeadersActive : muthawifActive).length > 0 ? (
                    (activeTab === "tour_leader" ? tourLeadersActive : muthawifActive).map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-full bg-[#1b3167] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {item.name ? item.name.charAt(0) : "P"}
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
                          <span
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                              item.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                : "bg-slate-100 text-slate-500 border-slate-200/60"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                              }`}
                            ></span>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                        Tidak ada data petugas di database.
                      </td>
                    </tr>
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