"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import { CalendarIcon, PlusIcon } from "@/app/components/CustomIcons";

const initialForm = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "aktif",
};

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPeriod(start, end) {
  if (!start && !end) return "-";
  if (start && end) {
    return `${formatDate(start)}\n${formatDate(end)}`;
  }

  return formatDate(start || end);
}

export default function KloterPage() {
  const [view, setView] = useState(0);
  const [kloters, setKloters] = useState([
    {
      id: 1,
      name: "Kloter 1 - Jakarta",
      description: "Kloter pertama keberangkatan jamaah",
      start_date: "2026-06-01",
      end_date: "2026-06-15",
      status: "aktif",
    },
    {
      id: 2,
      name: "Kloter 2 - Surabaya",
      description: "Kloter kedua keberangkatan jamaah",
      start_date: "2026-06-10",
      end_date: "2026-06-25",
      status: "nonaktif",
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
      status: kloter.status || "aktif",
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

    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        setKloters((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, ...form } : item,
          ),
        );
        setSuccess("Kloter berhasil diperbarui (mode lokal).");
      } else {
        const newKloter = {
          id: Date.now(),
          ...form,
        };
        setKloters((prev) => [...prev, newKloter]);
        setSuccess("Kloter berhasil ditambahkan (mode lokal).");
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
      `Yakin ingin menghapus kloter "${kloter.name}"?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    setKloters((prev) => prev.filter((item) => item.id !== kloter.id));
    setSuccess("Kloter berhasil dihapus (mode lokal).");
  }

  function goBack() {
    setView(0);
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
  }

  return (
    <div className="w-full max-w-5xl p-10">
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {view === 0 && (
        <div>
          <Header
            title="Daftar Kloter"
            icon={<CalendarIcon />}
            buttonIcon={<PlusIcon />}
            buttonOnClick={openCreateForm}
            buttonText="Tambah Kloter"
            buttonBgColor="bg-[#2e7d32] hover:bg-green-700"
          />

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-center text-sm">
                <thead className="bg-[#263754] text-white">
                  <tr>
                    <th className="border-b border-r border-[#3d547a] px-6 py-4 font-bold">
                      No
                    </th>
                    <th className="border-b border-r border-[#3d547a] px-6 py-4 font-bold">
                      Nama Kloter
                    </th>
                    <th className="border-b border-r border-[#3d547a] px-6 py-4 font-bold">
                      Tanggal
                    </th>
                    <th className="border-b border-r border-[#3d547a] px-6 py-4 font-bold">
                      Status
                    </th>
                    <th className="border-b px-6 py-4 font-bold">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-gray-500">
                        Memuat data kloter...
                      </td>
                    </tr>
                  ) : kloters.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-gray-500">
                        Belum ada data kloter.
                      </td>
                    </tr>
                  ) : (
                    kloters.map((kloter, index) => (
                      <tr key={kloter.id} className="hover:bg-gray-50">
                        <td className="border-r border-gray-200 px-6 py-4">
                          {index + 1}
                        </td>

                        <td className="border-r border-gray-200 px-6 py-4 text-left">
                          <div className="font-bold">{kloter.name}</div>
                          {kloter.description && (
                            <div className="mt-1 text-xs font-normal text-gray-500">
                              {kloter.description}
                            </div>
                          )}
                        </td>

                        <td className="border-r border-gray-200 px-6 py-4 whitespace-pre-line">
                          {formatPeriod(kloter.start_date, kloter.end_date)}
                        </td>

                        <td className="border-r border-gray-200 px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              kloter.status === "aktif"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {kloter.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(kloter)}
                              className="flex items-center gap-1 rounded-md bg-[#263754] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#3d547a]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(kloter)}
                              className="flex items-center gap-1 rounded-md bg-[#e53935] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={loadKloters}
              disabled={loading}
              className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "Memuat..." : "Refresh Data"}
            </button>
          </div>
        </div>
      )}

      {view === 1 && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_0_15px_rgba(0,0,0,0.05)]">
          <div className="bg-[#2e7d32] px-8 py-5 text-white">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              {editingId ? "Edit Kloter" : "Tambah Kloter"}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-8">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-base font-bold text-gray-900"
                >
                  Nama Kloter *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama kloter..."
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#2e7d32] focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-base font-bold text-gray-900"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Deskripsi kloter (opsional)..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#2e7d32] focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="start_date"
                    className="mb-2 block text-base font-bold text-gray-900"
                  >
                    Tanggal Mulai
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-[#2e7d32] focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_date"
                    className="mb-2 block text-base font-bold text-gray-900"
                  >
                    Tanggal Selesai
                  </label>
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    min={form.start_date || undefined}
                    value={form.end_date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-[#2e7d32] focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-base font-bold text-gray-900"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#2e7d32] focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-8 py-6">
              <button
                type="button"
                onClick={goBack}
                disabled={saving}
                className="rounded-lg bg-gray-400 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gray-500 disabled:opacity-50"
              >
                Kembali
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2e7d32] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
