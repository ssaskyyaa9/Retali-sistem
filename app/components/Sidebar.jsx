"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPenggunaOpen, setIsPenggunaOpen] = useState(true);
  const [isTugasOpen, setIsTugasOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const isActive = (path) => pathname === path;
  const isParentActive = (paths) => paths.some((p) => pathname.startsWith(p));

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <aside className="w-64 bg-[#0d1523] flex flex-col h-full text-white shadow-xl z-10 shrink-0 select-none">
      {/* 1. Header & Logo */}
      <div className="flex items-center gap-3 px-6 py-5 shrink-0 border-b border-[#1e2b43]/60">
        <Image
          src="/logoretali-ungu.png"
          alt="Retali Logo"
          width={36}
          height={36}
          className="rounded-md object-cover"
        />
        <span className="font-bold text-base tracking-wide text-white">
          RETALI <span className="text-[#a760ff]">SISTEM</span>
        </span>
      </div>

      {/* 2. Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">
        <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Menu Utama
        </h3>

        <nav className="flex flex-col gap-1.5 pb-4">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              isActive("/dashboard")
                ? "bg-[#1e2b43] text-white relative overflow-hidden"
                : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
            }`}
          >
            {isActive("/dashboard") && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
            )}
            <svg
              className={`w-5 h-5 ${isActive("/dashboard") ? "text-yellow-500" : "text-gray-400"}`}
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
            Dashboard
          </Link>
          <Link
            href="/kloter"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              isActive("/kloter")
                ? "bg-[#1e2b43] text-white relative overflow-hidden"
                : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
            }`}
          >
            {isActive("/kloter") && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
            )}
            <svg
              className={`w-5 h-5 ${isActive("/kloter") ? "text-yellow-500" : "text-gray-400"}`}
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
            Kloter
          </Link>

          {/* Dropdown Menu: Pengguna */}
          <div>
            <button
              onClick={() => setIsPenggunaOpen(!isPenggunaOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isParentActive(["/tour-leader", "/muthawif"])
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
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
                <span>Petugas</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isPenggunaOpen ? "rotate-180" : "rotate-0"} ${isParentActive(["/tour-leader", "/muthawif"]) ? "text-yellow-500" : "text-gray-400"}`}
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

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isPenggunaOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-[#1e2b43] pl-3 py-1">
                  <Link
                    href="/tour-leader"
                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive("/tour-leader")
                        ? "text-white font-medium bg-[#1e2b43]/50"
                        : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"
                    }`}
                  >
                    Tour Leader
                  </Link>
                  <Link
                    href="/muthawif"
                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive("/muthawif")
                        ? "text-white font-medium bg-[#1e2b43]/50"
                        : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"
                    }`}
                  >
                    Muthawif
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Dropdown Menu: Tugas */}
          <div>
            <button
              onClick={() => setIsTugasOpen(!isTugasOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isParentActive(["/tugas-tour-leader", "/tugas-ceklis"])
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
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
                <span>Tugas</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isTugasOpen ? "rotate-180" : "rotate-0"} ${isParentActive(["/tugas-tour-leader", "/tugas-ceklis"]) ? "text-yellow-500" : "text-gray-400"}`}
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

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isTugasOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-[#1e2b43] pl-3 py-1">
                  <Link
                    href="/tugas-tour-leader"
                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive("/tugas-tour-leader")
                        ? "text-white font-medium bg-[#1e2b43]/50"
                        : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"
                    }`}
                  >
                    Tugas Tour Leader
                  </Link>
                  <Link
                    href="/tugas-ceklis"
                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive("/tugas-ceklis")
                        ? "text-white font-medium bg-[#1e2b43]/50"
                        : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"
                    }`}
                  >
                    Tugas Ceklis
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Other Single Links */}
          {[
            {
              name: "Itinerary",
              href: "/itinerary",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              ),
            },
            {
              name: "Riwayat Absensi",
              href: "/riwayat-absensi",
              // Using a generic outline icon to match styling
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              ),
            },
            {
              name: "Riwayat Scan",
              href: "/riwayat-scan",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              ),
            },
            {
              name: "Notifikasi",
              href: "/notifikasi",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              ),
            },
          ].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#1e2b43] text-white relative overflow-hidden"
                    : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
                )}
                <svg
                  className={`w-5 h-5 ${active ? "text-yellow-500" : "text-gray-400"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {item.icon}
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Bottom Profile & Logout Popover */}
      <div className="relative px-4 py-4 shrink-0 border-t border-[#1e2b43]/60">
        {/* Logout Popover */}
        {isProfileDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#121c2d] rounded-xl shadow-2xl border border-[#1e2b43] overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2">
            {/* Expanded Header (Matches design left-side snippet) */}
            <div
              className="px-4 py-4 flex items-center justify-between border-b border-[#1e2b43]/60 cursor-pointer hover:bg-[#1e2b43]/30 transition-colors"
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#de3b69] flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <div>
                  <p className="font-bold text-sm text-white leading-tight">
                    Ahmad Fauzi
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Administrator
                  </p>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-gray-400"
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
            </div>

            <div className="p-3">
              {/* Email display box */}
              <div className="bg-[#1a2538] text-gray-300 text-xs px-4 py-2.5 rounded-lg mb-2 truncate">
                asd@retali.id
              </div>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-rose-400 font-medium hover:bg-[#1a2538] hover:text-rose-300 transition-colors"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Profile Button */}
        <button
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
            isProfileDropdownOpen ? "bg-[#1e2b43]" : "hover:bg-[#1e2b43]/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#de3b69] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              A
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-white leading-tight">
                Ahmad Fauzi
              </p>
              <p className="text-[11px] text-gray-400 font-medium">
                Administrator
              </p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              isProfileDropdownOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
