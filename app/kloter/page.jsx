"use client";

import React, { useCallback, useEffect, useState } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "../components/PageHeader";
import { PlusIcon } from "@/app/components/CustomIcons";

const initialForm = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "Persiapan",
  gelombang: "Gelombang I",
  code: "KLR-015",
  jamaah_count: 40,
  tour_leader: "Hafiz Anwar",
  progress: 0,
};

function formatDate(date) {
  if (!date) return "-";
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPeriod(start, end) {
  if (!start && !end) return "-";
  if (start && end) {
    return `${formatDate(start)} – ${formatDate(end)}`;
  }
  return formatDate(start || end);
}

export default function KloterPage() {
  const [view, setView] = useState(0);
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [kloters, setKloters] = useState([
    {
      id: 1,
      name: "Kloter 12",
      gelombang: "Gelombang I",
      code: "KLR-012",
      description: "Kloter pertama keberangkatan jamaah",
      start_date: "2026-09-10",
      end_date: "2026-09-22",
      status: "Berlangsung",
      jamaah_count: 45,
      tour_leader: "Muhammad Rizki",
      progress: 78,
    },
    {
      id: 2,
      name: "Kloter 13",
      gelombang: "Gelombang I",
      code: "KLR-013",
      description: "Kloter kedua keberangkatan jamaah",
      start_date: "2026-09-18",
      end_date: "2026-09-30",
      status: "Persiapan",
      jamaah_count: 42,
      tour_leader: "Abdul Karim",
      progress: 45,
    },
    {
      id: 3,
      name: "Kloter 11",
      gelombang: "Gelombang I",
      code: "KLR-011",
      description: "Kloter awal",
      start_date: "2026-08-28",
      end_date: "2026-09-09",
      status: "Selesai",
      jamaah_count: 45,
      tour_leader: "Umar Hidayat",
      progress: 100,
    },
    {
      id: 4,
      name: "Kloter 14",
      gelombang: "Gelombang II",
      code: "KLR-014",
      description: "Kloter tambahan",
      start_date: "2026-09-25",
      end_date: "2026-10-07",
      status: "Persiapan",
      jamaah_count: 40,
      tour_leader: "Hafiz Anwar",
      progress: 30,
    },
  ]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadKloters = useCallback(async () => {
    setLoading(true);
    setError("");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadKloters();
  }, [loadKloters]);

  function openCreateForm() {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    setView(1);
  }

  function openEditForm(kloter) {
    setForm({
      name: kloter.name || "",
      description: kloter.description || "",
      start_date: kloter.start_date || "",
      end_date: kloter.end_date || "",
      status: kloter.status || "Persiapan",
      gelombang: kloter.gelombang || "Gelombang I",
      code: kloter.code || "KLR-015",
      jamaah_count: kloter.jamaah_count || 40,
      tour_leader: kloter.tour_leader || "Hafiz Anwar",
      progress: kloter.progress || 0,
    });

    setEditingId(kloter.id);
    setError("");
    setSuccess("");
    setView(1);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Nama kloter wajib diisi.");
      return;
    }

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        setKloters((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, ...form } : item
          )
        );
        setSuccess("Kloter berhasil diperbarui.");
      } else {
        const newKloter = {
          id: Date.now(),
          ...form,
        };
        setKloters((prev) => [...prev, newKloter]);
        setSuccess("Kloter berhasil ditambahkan.");
      }

      setForm(initialForm);
      setEditingId(null);
      setView(0);
    } catch (err) {
      setError("Gagal menyimpan kloter.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(kloter) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kloter "${kloter.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    setKloters((prev) => prev.filter((item) => item.id !== kloter.id));
    setSuccess("Kloter berhasil dihapus.");
  }

  function goBack() {
    setView(0);
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
  }

  const filteredKloters = kloters.filter((kloter) => {
    if (statusFilter === "Semua Status") return true;
    return kloter.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="w-full max-w-7xl p-6 font-sans">
      {/* Topbar Component */}
      <div className="mb-6">
        <Topbar
          title="Kloter"
          breadcrumbs={["Dashboard", "Kloter"]}
        />
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {view === 0 && (
        <div>
          {/* Header Atas: Manajemen Kloter, Filter Status, dan Tombol Tambah Kloter Sejajar */}
         <PageHeader
              title="Riwayat Scan Koper"
              description="Kelola data tour leader yang mendampingi jamaah pada setiap kloter perjalanan umrah."
              buttonText="Tambah Tour Leader"
              buttonOnClick={() => setView(1)}
              buttonIcon={
                <svg
                  className="w-[16px] h-[16px] text-[#eab308]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11l-2 2m0-2l2 2"
                  />
                </svg>
              }
              icon={
                <svg
                  className="w-[26px] h-[26px] text-[#eab308]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11l-2 2m0-2l2 2"
                  />
                </svg>
              }
            />

          {/* Grid Kloter Cards (Diatur menjadi 3 Kolom) */}
          {loading ? (
            <div className="py-12 text-center text-gray-500">Memuat data kloter...</div>
          ) : filteredKloters.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Belum ada data kloter sesuai filter.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {filteredKloters.map((kloter) => {
                let badgeStyle = "bg-yellow-50 text-yellow-700 border border-yellow-200";
                if (kloter.status === "Berlangsung") {
                  badgeStyle = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                } else if (kloter.status === "Selesai") {
                  badgeStyle = "bg-gray-100 text-gray-600 border border-gray-200";
                }

                return (
                  <div
                    key={kloter.id}
                    className="relative flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Top card info */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1E38] text-white">
                            ✈️
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-900">{kloter.name}</h3>
                            <p className="text-xs text-gray-400">
                              {kloter.gelombang || "Gelombang I"} · {kloter.code || "KLR-00X"}
                            </p>
                          </div>
                        </div>

                        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${badgeStyle}`}>
                          {kloter.status}
                        </span>
                      </div>

                      {/* Detail info */}
                      <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">👥</span>
                          <span>{kloter.jamaah_count || 40} jamaah</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">👤</span>
                          <span className="truncate">{kloter.tour_leader || "Pembimbing"}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span className="text-gray-400">📅</span>
                          <span>{formatPeriod(kloter.start_date, kloter.end_date)}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-5">
                        <div className="mb-1.5 flex justify-between text-xs font-medium">
                          <span className="text-gray-500">Progres persiapan</span>
                          <span className="text-gray-900 font-bold">{kloter.progress || 0}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#E51B48] transition-all"
                            style={{ width: `${kloter.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => openEditForm(kloter)}
                        className="flex-1 rounded-lg bg-gray-50 py-2.5 text-center text-xs font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        ⚙️ Edit Kloter
                      </button>
                      <button
                        onClick={() => handleDelete(kloter)}
                        className="rounded-lg bg-red-50 px-4 py-2.5 text-center text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 1 && (
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Top Bubble Header */}
          <div className="m-4 rounded-xl bg-[#00875a] p-6 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-lg">
                +
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {editingId ? "Edit Kloter" : "Tambah Kloter"}
                </h2>
                <p className="text-xs text-emerald-100">
                  Buat kloter keberangkatan umrah baru.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-8 pt-4">
              {/* Nama Kloter */}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-bold text-gray-900">
                  Nama Kloter <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                    ✈️
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama kloter"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00875a] focus:outline-none focus:ring-1 focus:ring-[#00875a]"
                  />
                </div>
              </div>

              {/* Tanggal Mulai & Selesai */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      📅
                    </span>
                    <input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-[#00875a] focus:outline-none focus:ring-1 focus:ring-[#00875a]"
                    />
                  </div>
                  <span className="hidden text-center text-gray-400 sm:inline">–</span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      📅
                    </span>
                    <input
                      id="end_date"
                      name="end_date"
                      type="date"
                      min={form.start_date || undefined}
                      value={form.end_date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-[#00875a] focus:outline-none focus:ring-1 focus:ring-[#00875a]"
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">cth: 13 - 20 September 2025</p>
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs text-gray-600">
                <span className="text-blue-500 font-bold text-sm">ℹ️</span>
                <p>
                  Saat ini terdapat <strong className="text-gray-900">{kloters.length} kloter</strong> terdaftar. Data jamaah, tour leader, dan akomodasi dapat dilengkapi setelah kloter dibuat.
                </p>
              </div>
            </div>

            {/* Footer Form */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-white px-8 py-5">
              <button
                type="button"
                onClick={goBack}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                ← Kembali
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#00875a] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#007048] disabled:opacity-60"
              >
                💾 {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}