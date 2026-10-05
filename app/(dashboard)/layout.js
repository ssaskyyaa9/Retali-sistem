// app/(dashboard)/layout.js (or app/layouts/DashboardLayout.jsx)
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const [isPenggunaOpen, setIsPenggunaOpen] = useState(true);
  const [isTugasOpen, setIsTugasOpen] = useState(true);

  const isActive = (path) => pathname === path;
  const isParentActive = (paths) => paths.some((p) => pathname.startsWith(p));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar: flex-col and h-full ensures it spans the screen height */}
      <aside className="w-64 bg-[#263754] flex flex-col h-full text-white shadow-xl z-10 shrink-0">
        {/* 1. Fixed Top Section (Logo) */}
        <div className="flex items-center gap-3 px-6 py-8 shrink-0">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-xs font-bold">R</span>
          </div>
          <span className="font-bold text-sm tracking-wide">RETALI SISTEM</span>
        </div>

        {/* 2. Scrollable Middle Section (Navigation Only) */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3">
          <nav className="flex flex-col gap-1 pb-4">
            {/* Dashboard */}
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${
                isActive("/")
                  ? "bg-[#1e2b43] border-l-4 border-yellow-500 text-white"
                  : "text-gray-300 hover:bg-[#1e2b43] hover:text-white"
              }`}
            >
              <svg
                className={`w-5 h-5 ${isActive("/") ? "text-yellow-500" : "text-gray-400"}`}
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
              </svg>
              Dashboard
            </Link>

            {/* Dropdown Menu: Pengguna */}
            <div>
              <button
                onClick={() => setIsPenggunaOpen(!isPenggunaOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors ${
                  isParentActive(["/tour-leader", "/muthawif"])
                    ? "text-white font-medium"
                    : "text-gray-300 hover:bg-[#1e2b43] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 ${isParentActive(["/tour-leader", "/muthawif"]) ? "text-yellow-500" : "text-gray-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="text-sm">Pengguna</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform text-yellow-500 ${isPenggunaOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isPenggunaOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-gray-600 pl-2">
                  <Link
                    href="/tour-leader"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                      isActive("/tour-leader")
                        ? "bg-[#334768] text-white border-l-2 border-yellow-500"
                        : "text-gray-300 hover:text-white hover:bg-[#1e2b43]"
                    }`}
                  >
                    Tour Leader
                  </Link>
                  <Link
                    href="/muthawif"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                      isActive("/muthawif")
                        ? "bg-[#334768] text-white border-l-2 border-yellow-500"
                        : "text-gray-300 hover:text-white hover:bg-[#1e2b43]"
                    }`}
                  >
                    Muthawif
                  </Link>
                </div>
              )}
            </div>

            {/* Dropdown Menu: Tugas */}
            <div>
              <button
                onClick={() => setIsTugasOpen(!isTugasOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors ${
                  isParentActive(["/tugas-tour-leader", "/tugas-ceklis"])
                    ? "text-white font-medium"
                    : "text-gray-300 hover:bg-[#1e2b43] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 ${isParentActive(["/tugas-tour-leader", "/tugas-ceklis"]) ? "text-yellow-500" : "text-gray-400"}`}
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
                  <span className="text-sm">Tugas</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform text-yellow-500 ${isTugasOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isTugasOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-gray-600 pl-2">
                  <Link
                    href="/tugas-tour-leader"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                      isActive("/tugas-tour-leader")
                        ? "bg-[#334768] text-white border-l-2 border-yellow-500"
                        : "text-gray-300 hover:text-white hover:bg-[#1e2b43]"
                    }`}
                  >
                    Tugas Tour Leader
                  </Link>
                  <Link
                    href="/tugas-ceklis"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                      isActive("/tugas-ceklis")
                        ? "bg-[#334768] text-white border-l-2 border-yellow-500"
                        : "text-gray-300 hover:text-white hover:bg-[#1e2b43]"
                    }`}
                  >
                    Tugas Ceklis
                  </Link>
                </div>
              )}
            </div>

            {/* Other single links */}
            {[
              {
                name: "Kloter",
                href: "/kloter",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                ),
              },
              {
                name: "Itenarary",
                href: "/itenarary",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
              {
                name: "Riwayat Absensi",
                href: "/riwayat-absensi",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                ),
              },
              {
                name: "Riwayat Scan",
                href: "/riwayat-scan",
                icon: (
                  <svg
                    className="w-5 h-5"
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
                  </svg>
                ),
              },
              {
                name: "Notifikasi",
                href: "/notifikasi",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                ),
              },
            ].map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${
                    active
                      ? "bg-[#1e2b43] border-l-4 border-yellow-500 text-white"
                      : "text-gray-300 hover:bg-[#1e2b43] hover:text-white"
                  }`}
                >
                  <span
                    className={`${active ? "text-yellow-500" : "text-gray-400"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. Fixed Bottom Section (Admin Profile & Log out) */}
        <div className="p-6 shrink-0 border-t border-[#1e2b43]/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-[#263754] font-bold text-lg">
              A
            </div>
            <div>
              <p className="font-bold text-sm text-white">Admin</p>
              <p className="text-xs text-yellow-500">Administrator</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-[#334768] hover:bg-[#3d547a] text-white py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm">
            Log out
          </button>
        </div>
      </aside>

      {/* Main Dynamic Content Area */}
      <main className="flex-1 bg-white overflow-y-auto">{children}</main>
    </div>
  );
}
