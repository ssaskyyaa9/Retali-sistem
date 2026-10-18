"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { TbScan } from "react-icons/tb";
import { LiaUserClockSolid } from "react-icons/lia";
import { IoCalendarOutline } from "react-icons/io5";
import { HiOutlineLightBulb } from "react-icons/hi";
import { TbPlaneDeparture } from "react-icons/tb";

import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isPenggunaOpen, setIsPenggunaOpen] = useState(true);
  const [isPersiapanOpen, setIsPersiapanOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [userEmail, setUserEmail] = useState("Loading...");
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("Loading...");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = (path) => pathname === path;
  const isParentActive = (paths) => paths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email);

        const displayName = user.user_metadata?.display_name;
        if (!displayName) {
          setShowNamePrompt(true);
        } else {
          setUserName(displayName);
        }

        // Fetch the user's role from the profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
    }
    checkUser();
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);

    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: nameInput.trim() },
    });

    if (!error) {
      setUserName(nameInput.trim());
      setShowNamePrompt(false);
    } else {
      console.error("Error updating name:", error);
    }

    setIsSavingName(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleCopyEmail = async () => {
    if (userEmail && userEmail !== "Loading...") {
      try {
        await navigator.clipboard.writeText(userEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Gagal menyalin email", err);
      }
    }
  };

  const getInitial = (name) => {
    return name !== "Loading..." && name.length > 0
      ? name.charAt(0).toUpperCase()
      : "U";
  };

  const formatRole = (role) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "tour_leader":
        return "Tour Leader";
      case "muthawif":
        return "Muthawif";
      case "Loading...":
        return "Loading...";
      default:
        return "User"; // Fallback
    }
  };

  return (
    <>
      <aside className="w-64 bg-[#0d1523] flex flex-col h-full text-white shadow-xl z-10 shrink-0 select-none relative">
        {/* 1. Header & Logo */}
        <div className="flex items-center gap-3 px-6 py-5 shrink-0 border-b border-[#1e2b43]/60">
          <Image
            src="/logoretali-kuning.png"
            alt="Retali Logo"
            width={36}
            height={36}
            className="rounded-md object-cover"
          />
          <span className="font-bold text-xl tracking-tight text-white">
            RETALI <span className="text-yellow-500">SISTEM</span>
          </span>
        </div>

        {/* 2. Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">
          <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Menu Utama
          </h3>

          <nav className="flex flex-col gap-1.5 pb-4">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/dashboard") ? "bg-[#1e2b43] text-white relative overflow-hidden" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/kloter") ? "bg-[#1e2b43] text-white relative overflow-hidden" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
            >
              {isActive("/kloter") && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
              )}
              <TbPlaneDeparture
                className={`w-5 h-5 ${isActive("/kloter") ? "text-yellow-500" : "text-gray-400"}`}
              />
              Kloter
            </Link>

            <div>
              <button
                onClick={() => setIsPenggunaOpen(!isPenggunaOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 ${isParentActive(["/tour-leader", "/muthawif"]) ? "text-white font-medium" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
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
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isPenggunaOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-[#1e2b43] pl-3 py-1">
                    <Link
                      href="/tour-leader"
                      className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/tour-leader") ? "text-white font-medium bg-[#1e2b43]/50" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"}`}
                    >
                      Tour Leader
                    </Link>
                    <Link
                      href="/muthawif"
                      className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/muthawif") ? "text-white font-medium bg-[#1e2b43]/50" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"}`}
                    >
                      Muthawif
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsPersiapanOpen(!isPersiapanOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 ${isParentActive(["/persiapan-tour-leader", "/persiapan-umroh"]) ? "text-white font-medium" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineLightBulb
                    className={`w-5 h-5 ${isParentActive(["/persiapan-tour-leader", "/persiapan-umroh"]) ? "text-yellow-500" : "text-gray-400"}`}
                  />
                  <span>Persiapan</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${isPersiapanOpen ? "rotate-180" : "rotate-0"} ${isParentActive(["/persiapan-tour-leader", "/persiapan-umroh"]) ? "text-yellow-500" : "text-gray-400"}`}
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
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isPersiapanOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-[#1e2b43] pl-3 py-1">
                    <Link
                      href="/persiapan-tour-leader"
                      className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/persiapan-tour-leader") ? "text-white font-medium bg-[#1e2b43]/50" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"}`}
                    >
                      Persiapan Tour Leader
                    </Link>
                    <Link
                      href="/persiapan-umroh"
                      className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/persiapan-umroh") ? "text-white font-medium bg-[#1e2b43]/50" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"}`}
                    >
                      Persiapan Umroh
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/tugas-ceklis"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/tugas-ceklis") ? "bg-[#1e2b43] text-white relative overflow-hidden" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
            >
              {isActive("/tugas-ceklis") && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
              )}
              <svg
                className={`w-5 h-5 ${isActive("/tugas-ceklis") ? "text-yellow-500" : "text-gray-400"}`}
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
              Tugas Ceklis
            </Link>

            <Link
              href="/itinerary"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/itinerary") ? "bg-[#1e2b43] text-white relative overflow-hidden" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
            >
              {isActive("/itinerary") && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
              )}
              <IoCalendarOutline
                className={`w-5 h-5 ${isActive("/itinerary") ? "text-yellow-500" : "text-gray-400"}`}
              />
              Itinerary
            </Link>

            <Link
              href="/riwayat-absensi"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/riwayat-absensi") ? "bg-[#1e2b43] text-white relative overflow-hidden" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
            >
              {isActive("/riwayat-absensi") && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
              )}
              <LiaUserClockSolid
                className={`w-5 h-5 ${isActive("/riwayat-absensi") ? "text-yellow-500" : "text-gray-400"}`}
              />
              Riwayat Absensi
            </Link>

            <Link
              href="/riwayat-scan"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/riwayat-scan") ? "bg-[#1e2b43] text-white relative overflow-hidden" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
            >
              {isActive("/riwayat-scan") && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
              )}
              <TbScan
                className={`w-5 h-5 ${isActive("/riwayat-scan") ? "text-yellow-500" : "text-gray-400"}`}
              />
              Riwayat Scan
            </Link>

            <Link
              href="/notifikasi"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/notifikasi") ? "bg-[#1e2b43] text-white relative overflow-hidden" : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"}`}
            >
              {isActive("/notifikasi") && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
              )}
              <svg
                className={`w-5 h-5 ${isActive("/notifikasi") ? "text-yellow-500" : "text-gray-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Notifikasi
            </Link>
          </nav>
        </div>

        {/* 3. Bottom Profile Section */}
        <div className="px-4 py-4 shrink-0 border-t border-[#1e2b43]/60 flex flex-col">
          <div
            className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${isProfileDropdownOpen ? "grid-rows-[1fr] opacity-100 mb-2" : "grid-rows-[0fr] opacity-0 mb-0"}`}
          >
            <div className={copied ? "overflow-visible" : "overflow-hidden"}>
              <div className="bg-[#121c2d] rounded-xl border border-[#1e2b43] p-3 shadow-inner">
                <div className="relative w-full mb-2">
                  {/* Copied Popup Tooltip */}
                  <div
                    className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#2c3e5d] text-white text-[10px] font-medium rounded shadow-lg transition-all duration-200 pointer-events-none flex flex-col items-center z-50 ${
                      copied
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1"
                    }`}
                  >
                    Email Copied!
                    {/* Small downward pointing arrow */}
                    <div className="absolute top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#2c3e5d]"></div>
                  </div>

                  {/* Email Button */}
                  <button
                    onClick={handleCopyEmail}
                    title="Klik untuk menyalin email"
                    className="w-full bg-[#1a2538] text-gray-300 hover:bg-[#223047] hover:text-white text-xs px-4 py-2.5 rounded-lg truncate text-center cursor-pointer transition-colors active:scale-[0.98]"
                  >
                    {userEmail}
                  </button>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm text-rose-400 font-medium hover:bg-[#1a2538] hover:text-rose-300 transition-colors"
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
          </div>

          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${isProfileDropdownOpen ? "bg-[#1e2b43]" : "hover:bg-[#1e2b43]/50"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {getInitial(userName)}
              </div>
              <div className="text-left w-28">
                <p className="font-bold text-sm text-white leading-tight truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-gray-400 font-medium truncate">
                  {formatRole(userRole)}
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${isProfileDropdownOpen ? "rotate-180" : "rotate-0"}`}
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

      {/* Floating Logout Confirmation Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          showLogoutConfirm
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`bg-[#121c2d] border border-[#1e2b43] p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transition-all duration-300 ease-in-out ${
            showLogoutConfirm ? "scale-100" : "scale-95"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 text-center">
            Yakin ingin keluar?
          </h3>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Sesi Anda akan berakhir dan Anda harus masuk kembali untuk mengakses
            sistem.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-2.5 bg-[#1e2b43] text-white rounded-xl hover:bg-[#263754] transition-colors font-medium text-sm"
            >
              Batal
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-medium text-sm shadow-lg shadow-rose-500/20"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Force Display Name Setup Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#121c2d] border border-[#1e2b43] p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-bold text-white mb-2">
              Selamat Datang! 👋
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Sebelum Anda mulai, silakan masukkan nama lengkap Anda. Nama ini
              akan ditampilkan di profil Anda. Proses ini hanya perlu dilakukan
              sekali saja.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                className="w-full bg-[#0d1523] border border-[#1e2b43] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={!nameInput.trim() || isSavingName}
              className="w-full px-4 py-3 bg-yellow-500 text-[#0d1523] rounded-xl hover:bg-yellow-400 transition-colors font-bold text-sm shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSavingName ? "Menyimpan..." : "Simpan & Lanjutkan"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
