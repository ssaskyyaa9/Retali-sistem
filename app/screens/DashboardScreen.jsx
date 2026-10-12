"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function DashboardScreen() {
  const router = useRouter();

  const [stats, setStats] = useState({
    total_scan: 0,
    total_pengguna: 0,
    total_notifikasi: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/dashboard/stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");

          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.detail || `Request gagal (${response.status})`
          );
        }

        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Gagal mengambil data dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

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

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col items-center justify-center rounded-xl bg-[#263754] px-6 py-10 text-white shadow-md"
          >
            {card.icon}
            <h2 className="mb-3 text-xl font-bold">{card.title}</h2>
            <p className="text-2xl font-bold">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Memuat statistik dashboard...
        </p>
      )}
    </div>
  );
}
