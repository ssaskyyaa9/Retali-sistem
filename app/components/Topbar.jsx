"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchPetugasReadNotifications } from "@/lib/notifications";
import { useSidebar } from "@/app/context/SidebarContext";

const VIEWED_STORAGE_KEY = "retali_viewed_notif_ids";

export default function Topbar({
  title = "Muthawif",
  breadcrumbs = ["Dashboard", "Pengguna", "Muthawif"],
}) {
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("Loading...");
  const [userRole, setUserRole] = useState("Loading...");

  // Daftar notifikasi yang dibaca oleh petugas (Tour Leader / Muthawif)
  const [notificationList, setNotificationList] = useState([]);

  // Set ID notifikasi yang sudah permanen dilihat (greyed-out)
  const [viewedIds, setViewedIds] = useState(new Set());

  // Ref untuk menampung item yang terview selama dropdown sedang terbuka
  const pendingViewedRef = useRef(new Set());

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Load viewed IDs dari localStorage saat pertama kali dimuat
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEWED_STORAGE_KEY);
      if (stored) {
        setViewedIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Gagal membaca localStorage:", e);
    }
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchPetugasReadNotifications(20);
      setNotificationList(data);
    } catch (err) {
      console.error("Gagal memuat notifikasi:", err);
    }
  };

  useEffect(() => {
    async function getUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email);

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role);
        }

        const authDisplayName = user.user_metadata?.display_name;
        if (authDisplayName) {
          setUserName(authDisplayName);
        } else if (profile?.username) {
          setUserName(profile.username);
        } else {
          setUserName("Pengguna");
        }
      }
    }

    getUserData();
    loadNotifications();

    // Supabase Realtime: saat petugas menandai notif dibaca di mobile, listview web langsung update
    const channel = supabase
      .channel("realtime-topbar-notif")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_recipients",
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    const timer = setInterval(() => {
      loadNotifications();
    }, 30000);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email);

          const { data: profile } = await supabase
            .from("profiles")
            .select("role, username")
            .eq("id", session.user.id)
            .single();

          if (profile?.role) {
            setUserRole(profile.role);
          }

          const authDisplayName = session.user.user_metadata?.display_name;
          if (authDisplayName) {
            setUserName(authDisplayName);
          } else if (profile?.username) {
            setUserName(profile.username);
          } else {
            setUserName("Pengguna");
          }

          loadNotifications();
        }
      }
    );

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Mengecek notifikasi mana saja yang sedang terlihat (terview) di scroll container
  // Item yang terlihat dimasukkan ke pendingViewedRef (BELUM langsung di-greyout atau dikurangi saat masih terbuka)
  const checkVisibleItems = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight > 0 ? container.clientHeight : 320;
    const scrollBottom = scrollTop + clientHeight;

    const items = container.querySelectorAll("[data-notif-id]");

    items.forEach((item) => {
      const id = item.getAttribute("data-notif-id");
      if (!id || viewedIds.has(id)) return;

      // Cek 1: Berdasarkan offsetTop relatif terhadap scroll container
      const itemTop = item.offsetTop;
      const itemHeight = item.offsetHeight || 65;
      const itemBottom = itemTop + itemHeight;
      const isVisibleOffset = itemBottom > scrollTop && itemTop < scrollBottom;

      // Cek 2: Berdasarkan getBoundingClientRect
      let isVisibleRect = false;
      if (containerRect.height > 0) {
        const itemRect = item.getBoundingClientRect();
        isVisibleRect =
          itemRect.bottom > containerRect.top &&
          itemRect.top < containerRect.bottom;
      }

      if (isVisibleOffset || isVisibleRect) {
        pendingViewedRef.current.add(id);
      }
    });
  }, [viewedIds]);

  // Fungsi komit: saat dropdown ditutup, item yang terview baru diubah ke viewedIds & disimpan ke localStorage
  const commitPendingViewed = useCallback(() => {
    checkVisibleItems();

    if (pendingViewedRef.current.size > 0) {
      const newItems = Array.from(pendingViewedRef.current);
      setViewedIds((prev) => {
        const updated = new Set([...prev, ...newItems]);
        try {
          localStorage.setItem(
            VIEWED_STORAGE_KEY,
            JSON.stringify(Array.from(updated))
          );
        } catch (e) {
          console.error("Gagal menyimpan ke localStorage:", e);
        }
        return updated;
      });
      pendingViewedRef.current = new Set();
    }
  }, [checkVisibleItems]);

  // Handler buka/tutup dropdown lonceng notifikasi
  const handleToggleNotif = () => {
    if (isNotifOpen) {
      // Saat ditutup sehabis diopen: baru greyout dan nomor berkurang!
      commitPendingViewed();
      setIsNotifOpen(false);
    } else {
      setIsNotifOpen(true);
      setIsProfileOpen(false);
    }
  };

  // Click outside listener: bila klik di luar saat dropdown terbuka, komit & tutup
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        if (isNotifOpen) {
          commitPendingViewed();
          setIsNotifOpen(false);
        }
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen, commitPendingViewed]);

  // Saat dropdown terbuka, deteksi item mana saja yang terlihat
  useEffect(() => {
    if (isNotifOpen) {
      checkVisibleItems();
      const t1 = setTimeout(checkVisibleItems, 80);
      const t2 = setTimeout(checkVisibleItems, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isNotifOpen, notificationList, checkVisibleItems]);

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
        return "User";
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const getInitial = (name) => {
    return name && name !== "Loading..." && name.length > 0
      ? name.charAt(0).toUpperCase()
      : "U";
  };

  // Jumlah notifikasi yang belum terview/greyed-out
  const unviewedCount = notificationList.filter(
    (n) => !viewedIds.has(n.id)
  ).length;

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            title={isCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
            aria-label={isCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
            className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer flex items-center justify-center group"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
            ) : (
              <PanelLeftClose className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
            )}
          </button>
          <div>
            <h1
              className="animate-fade-in-left text-base font-bold text-gray-900 leading-tight uppercase"
              style={{ animationDelay: "-200ms" }}
            >
              {title}
            </h1>
            <div className="text-xs text-gray-400 hidden sm:block">
              {breadcrumbs.map((crumb, index) => (
                <span
                  key={index}
                  className="inline-block animate-fade-in-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-800 font-medium">{crumb}</span>
                  ) : (
                    <span className="mr-1">{crumb} &gt;</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div ref={notifRef} className="relative">
            <button
              onClick={handleToggleNotif}
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
              {unviewedCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {unviewedCount > 9 ? "9+" : unviewedCount}
                </span>
              )}
            </button>

            <div
              className={`absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 transition-all duration-200 ease-in-out ${
                isNotifOpen
                  ? "opacity-100 scale-100 visible pointer-events-auto"
                  : "opacity-0 scale-95 invisible pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Notifikasi</h3>
                {unviewedCount > 0 && (
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    {unviewedCount} baru
                  </span>
                )}
              </div>
              <div
                ref={scrollContainerRef}
                onScroll={checkVisibleItems}
                className="max-h-80 overflow-y-auto divide-y divide-gray-50 no-scrollbar relative"
              >
                {notificationList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 font-medium">
                    Belum ada notifikasi baru.
                  </div>
                ) : (
                  notificationList.map((notif, idx) => {
                    const isViewed = viewedIds.has(notif.id);

                    return (
                      <div
                        key={notif.id || idx}
                        data-notif-id={notif.id}
                        className={`p-4 transition-colors duration-300 hover:bg-gray-50 flex gap-3 ${
                          isViewed ? "bg-white" : "bg-amber-50/30"
                        }`}
                      >
                        {/* Ikon biru jika belum pernah dilihat, sedikit greyed-out jika sudah terview di sesi sebelumnya */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 ${
                            isViewed
                              ? "bg-gray-100 text-gray-400"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
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
                          <p
                            className={`text-xs ${
                              isViewed
                                ? "font-medium text-gray-600"
                                : "font-bold text-gray-900"
                            } leading-snug transition-colors duration-300`}
                          >
                            {notif.title}
                          </p>
                          <p
                            className={`text-[11px] ${
                              isViewed ? "text-gray-400" : "text-gray-500"
                            } mt-0.5 leading-relaxed line-clamp-2 transition-colors duration-300`}
                          >
                            {notif.desc}
                          </p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="pt-2 px-4 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    commitPendingViewed();
                    setIsNotifOpen(false);
                    router.push("/notifikasi");
                  }}
                  className="text-xs font-bold text-gray-900 hover:text-indigo-600 py-1 cursor-pointer"
                >
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          </div>

          <div ref={profileRef} className="relative">
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
                <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
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
                  {formatRole(userRole)}
                </div>
              </div>
            </button>

            <div
              className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 origin-top-right transition-all duration-200 ease-in-out ${
                isProfileOpen
                  ? "opacity-100 scale-100 visible pointer-events-auto"
                  : "opacity-0 scale-95 invisible pointer-events-none"
              }`}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{userName}</p>
                <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                  {userEmail}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    router.push("/profile");
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                >
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
              </div>

              <div className="pt-1 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
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
          </div>
        </div>
      </header>

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
              className="flex-1 px-4 py-2.5 bg-[#1e2b43] text-white rounded-xl hover:bg-[#263754] transition-colors font-medium text-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-medium text-sm shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
