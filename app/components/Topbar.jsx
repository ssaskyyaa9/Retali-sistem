"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Topbar({
  title = "Muthawif",
  breadcrumbs = ["Dashboard", "Pengguna", "Muthawif"],
}) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("Loading...");

  const notificationList = [
    {
      title: "Tugas ceklis baru dikirim",
      desc: "Tugas Ceklis Kloter 12 telah tour leader untuk diisi.",
      time: "2 menit lalu",
      unread: true,
    },
    {
      title: "Absensi terlambat",
      desc: "Ustadz Hasan belum melakukan absensi kegiatan pagi di Masjidil...",
      time: "35 menit lalu",
      unread: true,
    },
    {
      title: "Tour leader baru ditambahkan",
      desc: "Akun tour leader atas nama Muhammad Rizki berhasil dibuat.",
      time: "1 jam lalu",
      unread: true,
    },
  ];

  useEffect(() => {
    // 1. Initial fetch when the component first loads
    async function getUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        setUserName(user.user_metadata?.display_name || "Pengguna");
      }
    }
    getUserData();

    // 2. Listen for live updates (like when Sidebar saves the popup)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email);
          setUserName(session.user.user_metadata?.display_name || "Pengguna");
        }
      },
    );

    // 3. Cleanup the listener if the component is removed
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const getInitial = (name) => {
    return name && name !== "Loading..." && name.length > 0
      ? name.charAt(0).toUpperCase()
      : "U";
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Left Section: Breadcrumb & Title */}
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-800 focus:outline-none">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {title}
            </h1>
            <div className="text-xs text-gray-400 hidden sm:block">
              {breadcrumbs.map((crumb, index) => (
                <span key={index}>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-800 font-medium">{crumb}</span>
                  ) : (
                    <>{crumb} &gt; </>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="relative cursor-pointer p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors focus:outline-none"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {notificationList.filter((n) => n.unread).length}
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">
                    Notifikasi
                  </h3>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    {notificationList.filter((n) => n.unread).length} baru
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notificationList.map((notif, idx) => (
                    <div
                      key={idx}
                      className={`p-4 transition-colors hover:bg-gray-50 flex gap-3 ${notif.unread ? "bg-amber-50/30" : ""}`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                          {notif.desc}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {notif.time}
                        </span>
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

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-3 pl-2 border-l border-gray-200 cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {getInitial(userName)}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  {userName}
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                  Administrator
                </div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{userName}</p>
                  <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                    {userEmail}
                  </p>
                </div>

                <div className="py-1">
                  <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profil Saya
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Pengaturan
                  </button>
                </div>

                <div className="pt-1 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                  >
                    <svg
                      className="w-4 h-4 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#121c2d] border border-[#1e2b43] p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto mb-4">
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
              Sesi Anda akan berakhir dan Anda harus masuk kembali untuk
              mengakses sistem.
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
      )}
    </>
  );
}
