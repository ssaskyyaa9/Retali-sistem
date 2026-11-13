"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { TbScan, TbPlaneDeparture } from "react-icons/tb";
import { LiaUserClockSolid } from "react-icons/lia";
import { IoCalendarOutline } from "react-icons/io5";
import { HiOutlineLightBulb } from "react-icons/hi";
import { LuBookText } from "react-icons/lu";

import { supabase } from "@/lib/supabase";
import { useSidebar } from "@/app/context/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed } = useSidebar();

  const [isPenggunaOpen, setIsPenggunaOpen] = useState(true);
  const [isPersiapanOpen, setIsPersiapanOpen] = useState(true);
  const [isAbsensiOpen, setIsAbsensiOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [userEmail, setUserEmail] = useState("Loading...");
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("Loading...");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [copied, setCopied] = useState(false);

  // State untuk flyout menu / tooltip saat sidebar diciutkan (collapsed)
  const [activeFlyout, setActiveFlyout] = useState(null);
  const flyoutTimeoutRef = useRef(null);
  const collapsedProfileRef = useRef(null);

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");
  const isParentActive = (paths) => paths.some((p) => pathname.startsWith(p));

  // Reset flyout saat collapsed state berubah atau rute berpindah
  useEffect(() => {
    setActiveFlyout(null);
    setIsProfileDropdownOpen(false);
  }, [isCollapsed, pathname]);

  // Tutup flyout saat layar di-scroll
  useEffect(() => {
    const handleScroll = () => {
      if (activeFlyout) setActiveFlyout(null);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [activeFlyout]);

  // Tutup flyout / profile dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        collapsedProfileRef.current &&
        !collapsedProfileRef.current.contains(e.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (activeFlyout && activeFlyout.type === "submenu") {
        const flyoutEl = document.getElementById("sidebar-flyout-menu");
        if (flyoutEl && !flyoutEl.contains(e.target)) {
          setActiveFlyout(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeFlyout, isProfileDropdownOpen]);

  const handleItemMouseEnter = (e, itemData) => {
    if (!isCollapsed) return;
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveFlyout({ ...itemData, rect });
  };

  const handleItemMouseLeave = () => {
    if (!isCollapsed) return;
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 180);
  };

  const handleFlyoutMouseEnter = () => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
  };

  const handleFlyoutMouseLeave = () => {
    handleItemMouseLeave();
  };

  const handleSubmenuClick = (e, itemData, toggleAccordion) => {
    if (!isCollapsed) {
      toggleAccordion();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
      setActiveFlyout((prev) =>
        prev?.id === itemData.id ? null : { ...itemData, rect, type: "submenu" }
      );
    }
  };

  const getSubmenuStyle = (rect) => {
    if (!rect) return {};
    const left = rect.right + 10;
    const estimatedHeight = 170;
    let top = rect.top;
    if (typeof window !== "undefined" && top + estimatedHeight > window.innerHeight) {
      top = Math.max(16, window.innerHeight - estimatedHeight - 16);
    }
    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
    };
  };

  const getTooltipStyle = (rect) => {
    if (!rect) return {};
    const left = rect.right + 10;
    const top = rect.top + rect.height / 2;
    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      transform: "translateY(-50%)",
      zIndex: 9999,
    };
  };

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email);

        // 1. Ambil data role dan username dari tabel profiles TERLEBIH DAHULU
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", user.id)
          .single();

        const role = profile?.role || "User";
        setUserRole(role);

        // 2. Cek apakah ada display_name di metadata auth
        const authDisplayName = user.user_metadata?.display_name;

        if (authDisplayName) {
          // Jika sudah punya nama di auth metadata, gunakan itu
          setUserName(authDisplayName);
        } else if (role === "admin") {
          // JIKA ADMIN dan belum punya display_name, tampilkan pop-up wajib isi nama
          setShowNamePrompt(true);
        } else if (profile?.username) {
          // JIKA BUKAN ADMIN (Tour Leader/Muthawif), langsung gunakan nama dari database profiles
          setUserName(profile.username);
        } else {
          // Fallback
          setUserName("Pengguna");
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
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
      <aside
        className={`bg-[#0d1523] flex flex-col h-full text-white shadow-xl z-20 shrink-0 select-none relative transition-[width] duration-300 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {/* 1. Header & Logo */}
        <div
          className={`flex items-center shrink-0 border-b border-[#1e2b43]/60 h-[77px] transition-all duration-300 ${
            isCollapsed ? "justify-center px-2" : "px-6 gap-3"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden"
            title="Retali Sistem"
          >
            <Image
              src="/logoretali-kuning.png"
              alt="Retali Logo"
              width={36}
              height={36}
              className="rounded-md object-cover shrink-0 hover:scale-105 transition-transform"
            />
            {!isCollapsed && (
              <span className="font-bold text-xl tracking-tight text-white whitespace-nowrap overflow-hidden transition-opacity duration-200">
                RETALI <span className="text-yellow-500">SISTEM</span>
              </span>
            )}
          </Link>
        </div>

        {/* 2. Navigation */}
        <div
          className={`flex-1 overflow-y-auto no-scrollbar py-4 transition-all duration-300 ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          {isCollapsed ? (
            <div className="my-2 border-t border-[#1e2b43]/60 mx-2" />
          ) : (
            <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 whitespace-nowrap overflow-hidden">
              Menu Utama
            </h3>
          )}

          <nav className="flex flex-col gap-1.5 pb-4">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              onMouseEnter={(e) =>
                handleItemMouseEnter(e, {
                  id: "dashboard",
                  type: "tooltip",
                  title: "Dashboard",
                  isActive: isActive("/dashboard"),
                })
              }
              onMouseLeave={handleItemMouseLeave}
              className={`flex items-center rounded-lg font-medium text-sm transition-all duration-200 relative group ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto"
                  : "gap-3 px-4 py-3"
              } ${
                isActive("/dashboard")
                  ? "bg-[#1e2b43] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
              }`}
            >
              {isActive("/dashboard") && (
                <div
                  className={`absolute left-0 bg-yellow-500 rounded-r-md ${
                    isCollapsed
                      ? "top-1/2 -translate-y-1/2 h-6 w-1"
                      : "top-0 bottom-0 w-1"
                  }`}
                ></div>
              )}
              <svg
                className={`w-5 h-5 shrink-0 ${
                  isActive("/dashboard")
                    ? "text-yellow-500"
                    : "text-gray-400 group-hover:text-white"
                }`}
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
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">Dashboard</span>
              )}
            </Link>

            {/* Kloter */}
            <Link
              href="/kloter"
              onMouseEnter={(e) =>
                handleItemMouseEnter(e, {
                  id: "kloter",
                  type: "tooltip",
                  title: "Kloter",
                  isActive: isActive("/kloter"),
                })
              }
              onMouseLeave={handleItemMouseLeave}
              className={`flex items-center rounded-lg font-medium text-sm transition-all duration-200 relative group ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto"
                  : "gap-3 px-4 py-3"
              } ${
                isActive("/kloter")
                  ? "bg-[#1e2b43] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
              }`}
            >
              {isActive("/kloter") && (
                <div
                  className={`absolute left-0 bg-yellow-500 rounded-r-md ${
                    isCollapsed
                      ? "top-1/2 -translate-y-1/2 h-6 w-1"
                      : "top-0 bottom-0 w-1"
                  }`}
                ></div>
              )}
              <TbPlaneDeparture
                className={`w-5 h-5 shrink-0 ${
                  isActive("/kloter")
                    ? "text-yellow-500"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">Kloter</span>
              )}
            </Link>

            {/* Petugas (Submenu) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) =>
                  handleSubmenuClick(
                    e,
                    {
                      id: "petugas",
                      title: "Petugas",
                      items: [
                        { title: "Tour Leader", href: "/tour-leader" },
                        { title: "Muthawif", href: "/muthawif" },
                      ],
                    },
                    () => setIsPenggunaOpen(!isPenggunaOpen)
                  )
                }
                onMouseEnter={(e) =>
                  handleItemMouseEnter(e, {
                    id: "petugas",
                    type: "submenu",
                    title: "Petugas",
                    items: [
                      { title: "Tour Leader", href: "/tour-leader" },
                      { title: "Muthawif", href: "/muthawif" },
                    ],
                  })
                }
                onMouseLeave={handleItemMouseLeave}
                className={`flex items-center rounded-lg text-sm transition-all duration-200 cursor-pointer relative group ${
                  isCollapsed
                    ? "justify-center w-11 h-11 mx-auto"
                    : "w-full justify-between px-4 py-3"
                } ${
                  isParentActive(["/tour-leader", "/muthawif"])
                    ? isCollapsed
                      ? "bg-[#1e2b43] text-white font-medium"
                      : "text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
                }`}
              >
                {isCollapsed && isParentActive(["/tour-leader", "/muthawif"]) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-yellow-500 rounded-r-md"></div>
                )}
                <div
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "gap-3"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 shrink-0 ${
                      isParentActive(["/tour-leader", "/muthawif"])
                        ? "text-yellow-500"
                        : "text-gray-400 group-hover:text-white"
                    }`}
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
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">Petugas</span>
                  )}
                </div>
                {!isCollapsed && (
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                      isPenggunaOpen ? "rotate-180" : "rotate-0"
                    } ${
                      isParentActive(["/tour-leader", "/muthawif"])
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }`}
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
                )}
              </button>

              {/* Accordion when expanded */}
              {!isCollapsed && (
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
              )}
            </div>

            {/* Persiapan Umroh (Submenu) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) =>
                  handleSubmenuClick(
                    e,
                    {
                      id: "persiapan",
                      title: "Persiapan Umroh",
                      items: [
                        { title: "Persiapan Diniyah", href: "/persiapan-tour-leader" },
                        { title: "Persiapan Teknis", href: "/persiapan-umroh" },
                      ],
                    },
                    () => setIsPersiapanOpen(!isPersiapanOpen)
                  )
                }
                onMouseEnter={(e) =>
                  handleItemMouseEnter(e, {
                    id: "persiapan",
                    type: "submenu",
                    title: "Persiapan Umroh",
                    items: [
                      { title: "Persiapan Diniyah", href: "/persiapan-tour-leader" },
                      { title: "Persiapan Teknis", href: "/persiapan-umroh" },
                    ],
                  })
                }
                onMouseLeave={handleItemMouseLeave}
                className={`flex items-center rounded-lg text-sm transition-all duration-200 cursor-pointer relative group ${
                  isCollapsed
                    ? "justify-center w-11 h-11 mx-auto"
                    : "w-full justify-between px-4 py-3"
                } ${
                  isParentActive(["/persiapan-tour-leader", "/persiapan-umroh"])
                    ? isCollapsed
                      ? "bg-[#1e2b43] text-white font-medium"
                      : "text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
                }`}
              >
                {isCollapsed &&
                  isParentActive([
                    "/persiapan-tour-leader",
                    "/persiapan-umroh",
                  ]) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-yellow-500 rounded-r-md"></div>
                  )}
                <div
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "gap-3"
                  }`}
                >
                  <HiOutlineLightBulb
                    className={`w-5 h-5 shrink-0 ${
                      isParentActive([
                        "/persiapan-tour-leader",
                        "/persiapan-umroh",
                      ])
                        ? "text-yellow-500"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">
                      Persiapan Umroh
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                      isPersiapanOpen ? "rotate-180" : "rotate-0"
                    } ${
                      isParentActive([
                        "/persiapan-tour-leader",
                        "/persiapan-umroh",
                      ])
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }`}
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
                )}
              </button>

              {/* Accordion when expanded */}
              {!isCollapsed && (
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isPersiapanOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-[#1e2b43] pl-3 py-1">
                      <Link
                        href="/persiapan-tour-leader"
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive("/persiapan-tour-leader")
                            ? "text-white font-medium bg-[#1e2b43]/50"
                            : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"
                        }`}
                      >
                        Persiapan Diniyah
                      </Link>
                      <Link
                        href="/persiapan-umroh"
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive("/persiapan-umroh")
                            ? "text-white font-medium bg-[#1e2b43]/50"
                            : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"
                        }`}
                      >
                        Persiapan Teknis
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Curriculum Tour Leader */}
            <Link
              href="/curriculum-tour-leader"
              onMouseEnter={(e) =>
                handleItemMouseEnter(e, {
                  id: "curriculum",
                  type: "tooltip",
                  title: "Curriculum Tour Leader",
                  isActive: isActive("/curriculum-tour-leader"),
                })
              }
              onMouseLeave={handleItemMouseLeave}
              className={`flex items-center rounded-lg font-medium text-sm transition-all duration-200 relative group ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto"
                  : "gap-3 px-4 py-3"
              } ${
                isActive("/curriculum-tour-leader")
                  ? "bg-[#1e2b43] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
              }`}
            >
              {isActive("/curriculum-tour-leader") && (
                <div
                  className={`absolute left-0 bg-yellow-500 rounded-r-md ${
                    isCollapsed
                      ? "top-1/2 -translate-y-1/2 h-6 w-1"
                      : "top-0 bottom-0 w-1"
                  }`}
                ></div>
              )}
              <LuBookText
                className={`w-5 h-5 shrink-0 ${
                  isActive("/curriculum-tour-leader")
                    ? "text-yellow-500"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">
                  Curriculum Tour Leader
                </span>
              )}
            </Link>

            {/* Tugas Ceklis */}
            <Link
              href="/tugas-ceklis"
              onMouseEnter={(e) =>
                handleItemMouseEnter(e, {
                  id: "tugas-ceklis",
                  type: "tooltip",
                  title: "Tugas Ceklis",
                  isActive: isActive("/tugas-ceklis"),
                })
              }
              onMouseLeave={handleItemMouseLeave}
              className={`flex items-center rounded-lg font-medium text-sm transition-all duration-200 relative group ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto"
                  : "gap-3 px-4 py-3"
              } ${
                isActive("/tugas-ceklis")
                  ? "bg-[#1e2b43] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
              }`}
            >
              {isActive("/tugas-ceklis") && (
                <div
                  className={`absolute left-0 bg-yellow-500 rounded-r-md ${
                    isCollapsed
                      ? "top-1/2 -translate-y-1/2 h-6 w-1"
                      : "top-0 bottom-0 w-1"
                  }`}
                ></div>
              )}
              <svg
                className={`w-5 h-5 shrink-0 ${
                  isActive("/tugas-ceklis")
                    ? "text-yellow-500"
                    : "text-gray-400 group-hover:text-white"
                }`}
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
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">Tugas Ceklis</span>
              )}
            </Link>

            {/* Itinerary */}
            <Link
              href="/itinerary"
              onMouseEnter={(e) =>
                handleItemMouseEnter(e, {
                  id: "itinerary",
                  type: "tooltip",
                  title: "Itinerary",
                  isActive: isActive("/itinerary"),
                })
              }
              onMouseLeave={handleItemMouseLeave}
              className={`flex items-center rounded-lg font-medium text-sm transition-all duration-200 relative group ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto"
                  : "gap-3 px-4 py-3"
              } ${
                isActive("/itinerary")
                  ? "bg-[#1e2b43] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
              }`}
            >
              {isActive("/itinerary") && (
                <div
                  className={`absolute left-0 bg-yellow-500 rounded-r-md ${
                    isCollapsed
                      ? "top-1/2 -translate-y-1/2 h-6 w-1"
                      : "top-0 bottom-0 w-1"
                  }`}
                ></div>
              )}
              <IoCalendarOutline
                className={`w-5 h-5 shrink-0 ${
                  isActive("/itinerary")
                    ? "text-yellow-500"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">Itinerary</span>
              )}
            </Link>

            {/* Riwayat Absensi (Submenu) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) =>
                  handleSubmenuClick(
                    e,
                    {
                      id: "absensi",
                      title: "Riwayat Absensi",
                      items: [
                        { title: "Absensi Jamaah", href: "/riwayat-absensi/jamaah" },
                        { title: "Absensi Petugas", href: "/riwayat-absensi/petugas" },
                      ],
                    },
                    () => setIsAbsensiOpen(!isAbsensiOpen)
                  )
                }
                onMouseEnter={(e) =>
                  handleItemMouseEnter(e, {
                    id: "absensi",
                    type: "submenu",
                    title: "Riwayat Absensi",
                    items: [
                      { title: "Absensi Jamaah", href: "/riwayat-absensi/jamaah" },
                      { title: "Absensi Petugas", href: "/riwayat-absensi/petugas" },
                    ],
                  })
                }
                onMouseLeave={handleItemMouseLeave}
                className={`flex items-center rounded-lg text-sm transition-all duration-200 cursor-pointer relative group ${
                  isCollapsed
                    ? "justify-center w-11 h-11 mx-auto"
                    : "w-full justify-between px-4 py-3"
                } ${
                  isParentActive(["/riwayat-absensi"])
                    ? isCollapsed
                      ? "bg-[#1e2b43] text-white font-medium"
                      : "text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
                }`}
              >
                {isCollapsed && isParentActive(["/riwayat-absensi"]) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-yellow-500 rounded-r-md"></div>
                )}
                <div
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "gap-3"
                  }`}
                >
                  <LiaUserClockSolid
                    className={`w-5 h-5 shrink-0 ${
                      isParentActive(["/riwayat-absensi"])
                        ? "text-yellow-500"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">
                      Riwayat Absensi
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                      isAbsensiOpen ? "rotate-180" : "rotate-0"
                    } ${
                      isParentActive(["/riwayat-absensi"])
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }`}
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
                )}
              </button>

              {/* Accordion when expanded */}
              {!isCollapsed && (
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isAbsensiOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-[#1e2b43] pl-3 py-1">
                      <Link
                        href="/riwayat-absensi/jamaah"
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive("/riwayat-absensi/jamaah")
                            ? "text-white font-medium bg-[#1e2b43]/50"
                            : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"
                        }`}
                      >
                        Absensi Jamaah
                      </Link>
                      <Link
                        href="/riwayat-absensi/petugas"
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive("/riwayat-absensi/petugas")
                            ? "text-white font-medium bg-[#1e2b43]/50"
                            : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/30"
                        }`}
                      >
                        Absensi Petugas
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Riwayat Scan */}
            <Link
              href="/riwayat-scan"
              onMouseEnter={(e) =>
                handleItemMouseEnter(e, {
                  id: "riwayat-scan",
                  type: "tooltip",
                  title: "Riwayat Scan",
                  isActive: isActive("/riwayat-scan"),
                })
              }
              onMouseLeave={handleItemMouseLeave}
              className={`flex items-center rounded-lg font-medium text-sm transition-all duration-200 relative group ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto"
                  : "gap-3 px-4 py-3"
              } ${
                isActive("/riwayat-scan")
                  ? "bg-[#1e2b43] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
              }`}
            >
              {isActive("/riwayat-scan") && (
                <div
                  className={`absolute left-0 bg-yellow-500 rounded-r-md ${
                    isCollapsed
                      ? "top-1/2 -translate-y-1/2 h-6 w-1"
                      : "top-0 bottom-0 w-1"
                  }`}
                ></div>
              )}
              <TbScan
                className={`w-5 h-5 shrink-0 ${
                  isActive("/riwayat-scan")
                    ? "text-yellow-500"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">Riwayat Scan</span>
              )}
            </Link>

            {/* Notifikasi */}
            <Link
              href="/notifikasi"
              onMouseEnter={(e) =>
                handleItemMouseEnter(e, {
                  id: "notifikasi",
                  type: "tooltip",
                  title: "Notifikasi",
                  isActive: isActive("/notifikasi"),
                })
              }
              onMouseLeave={handleItemMouseLeave}
              className={`flex items-center rounded-lg font-medium text-sm transition-all duration-200 relative group ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto"
                  : "gap-3 px-4 py-3"
              } ${
                isActive("/notifikasi")
                  ? "bg-[#1e2b43] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1e2b43]/50"
              }`}
            >
              {isActive("/notifikasi") && (
                <div
                  className={`absolute left-0 bg-yellow-500 rounded-r-md ${
                    isCollapsed
                      ? "top-1/2 -translate-y-1/2 h-6 w-1"
                      : "top-0 bottom-0 w-1"
                  }`}
                ></div>
              )}
              <svg
                className={`w-5 h-5 shrink-0 ${
                  isActive("/notifikasi")
                    ? "text-yellow-500"
                    : "text-gray-400 group-hover:text-white"
                }`}
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
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">Notifikasi</span>
              )}
            </Link>
          </nav>
        </div>

        {/* 3. Bottom Profile Section */}
        {isCollapsed ? (
          <div className="p-3 shrink-0 border-t border-[#1e2b43]/60 flex justify-center relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              onMouseEnter={(e) => {
                if (!isProfileDropdownOpen) {
                  handleItemMouseEnter(e, {
                    id: "profile",
                    type: "tooltip",
                    title: userName || "Profil Pengguna",
                  });
                }
              }}
              onMouseLeave={handleItemMouseLeave}
              className={`w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-all duration-200 cursor-pointer ${
                isProfileDropdownOpen
                  ? "ring-2 ring-yellow-500 ring-offset-2 ring-offset-[#0d1523]"
                  : "hover:scale-105"
              }`}
              title={userName}
            >
              {getInitial(userName)}
            </button>
          </div>
        ) : (
          <div className="px-4 py-4 shrink-0 border-t border-[#1e2b43]/60 flex flex-col">
            <div
              className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
                isProfileDropdownOpen
                  ? "grid-rows-[1fr] opacity-100 mb-2"
                  : "grid-rows-[0fr] opacity-0 mb-0"
              }`}
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
                      type="button"
                      onClick={handleCopyEmail}
                      title="Klik untuk menyalin email"
                      className="w-full bg-[#1a2538] text-gray-300 hover:bg-[#223047] hover:text-white text-xs px-4 py-2.5 rounded-lg truncate text-center cursor-pointer transition-colors active:scale-[0.98]"
                    >
                      {userEmail}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm text-rose-400 font-medium hover:bg-[#1a2538] hover:text-rose-300 transition-colors cursor-pointer"
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
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                isProfileDropdownOpen ? "bg-[#1e2b43]" : "hover:bg-[#1e2b43]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
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
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${
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
        )}
      </aside>

      {/* Floating Submenu Popover in Collapsed Mode */}
      {isCollapsed && activeFlyout && activeFlyout.type === "submenu" && (
        <div
          id="sidebar-flyout-menu"
          style={getSubmenuStyle(activeFlyout.rect)}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
          className="w-56 bg-[#121c2d] border border-[#1e2b43] rounded-xl shadow-2xl p-2 select-none animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Arrow */}
          <div className="absolute -left-1.5 top-4 w-3 h-3 bg-[#121c2d] border-l border-b border-[#1e2b43] transform rotate-45 pointer-events-none" />

          <div className="relative z-10">
            <div className="px-3 py-2 border-b border-[#1e2b43]/80 mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                {activeFlyout.title}
              </span>
              <span className="text-[10px] font-semibold text-yellow-500 uppercase tracking-wider bg-yellow-500/10 px-1.5 py-0.5 rounded">
                Menu
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {activeFlyout.items.map((sub) => {
                const isSubActive = isActive(sub.href);
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setActiveFlyout(null)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSubActive
                        ? "bg-[#1e2b43] text-white font-semibold shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-[#1e2b43]/60"
                    }`}
                  >
                    <span>{sub.title}</span>
                    {isSubActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Tooltip in Collapsed Mode */}
      {isCollapsed && activeFlyout && activeFlyout.type === "tooltip" && (
        <div
          style={getTooltipStyle(activeFlyout.rect)}
          className="px-3 py-1.5 bg-[#121c2d] border border-[#1e2b43] text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap pointer-events-none select-none animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2"
        >
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#121c2d] border-l border-b border-[#1e2b43] transform rotate-45" />
          <span className="relative z-10">{activeFlyout.title}</span>
          {activeFlyout.isActive && (
            <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
          )}
        </div>
      )}

      {/* Floating Profile Dropdown in Collapsed Mode */}
      {isCollapsed && isProfileDropdownOpen && (
        <div
          ref={collapsedProfileRef}
          style={{
            position: "fixed",
            bottom: "16px",
            left: "82px",
            zIndex: 9999,
          }}
          className="w-64 bg-[#121c2d] border border-[#1e2b43] rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-left-2 duration-200 select-none"
        >
          <div className="absolute -left-1.5 bottom-5 w-3 h-3 bg-[#121c2d] border-l border-b border-[#1e2b43] transform rotate-45 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1e2b43]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                {getInitial(userName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-white leading-tight truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                  {formatRole(userRole)}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="relative w-full mb-2">
                {copied && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#2c3e5d] text-white text-[10px] font-medium rounded shadow-lg">
                    Email Copied!
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title="Klik untuk menyalin email"
                  className="w-full bg-[#1a2538] text-gray-300 hover:bg-[#223047] hover:text-white text-xs px-3 py-2 rounded-lg truncate text-center cursor-pointer transition-colors active:scale-[0.98]"
                >
                  {userEmail}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 font-medium hover:bg-[#1a2538] hover:text-rose-300 transition-colors cursor-pointer"
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
      )}

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
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-2.5 bg-[#1e2b43] text-white rounded-xl hover:bg-[#263754] transition-colors font-medium text-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-medium text-sm shadow-lg shadow-rose-500/20 cursor-pointer"
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
              type="button"
              onClick={handleSaveName}
              disabled={!nameInput.trim() || isSavingName}
              className="w-full px-4 py-3 bg-yellow-500 text-[#0d1523] rounded-xl hover:bg-yellow-400 transition-colors font-bold text-sm shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
            >
              {isSavingName ? "Menyimpan..." : "Simpan & Lanjutkan"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
