"use client";

import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import { PlusIcon } from "@/app/components/CustomIcons";
import { TbPlaneDepartureFilled } from "react-icons/tb";
import { supabase } from "@/lib/supabase";

const initialForm = {
  name: "",
  date_range: "",
};

export default function KloterPage() {
  const [view, setView] = useState(0); // 0 = Tabel List, 1 = Modal Form Tambah/Edit
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [kloterToDelete, setKloterToDelete] = useState(null);

  const [kloters, setKloters] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Ambil data dari Supabase saat komponen dimuat
  useEffect(() => {
    fetchKloters();
  }, []);

  async function fetchKloters() {
    setLoading(true);
    const { data, error } = await supabase
      .from("kloter")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal memuat data kloter:", error.message);
    } else {
      // Mapping database description ke date_range agar sesuai dengan UI form kamu
      const formattedData = data.map((item) => ({
        ...item,
        date_range: item.description || "",
      }));
      setKloters(formattedData);
    }
    setLoading(false);
  }

  function openCreateForm() {
    setForm(initialForm);
    setEditingId(null);
    setSuccess("");
    setView(1);
  }

  function openEditForm(kloter) {
    setForm({
      name: kloter.name || "",
      date_range: kloter.date_range || kloter.description || "",
    });
    setEditingId(kloter.id);
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
    setSuccess("");

    if (!form.name.trim()) return;

    if (editingId) {
      // Update data ke Supabase
      const { error } = await supabase
        .from("kloter")
        .update({
          name: form.name,
          description: form.date_range, // Menyimpan date_range ke kolom description di Supabase
        })
        .eq("id", editingId);

      if (error) {
        console.error("Gagal memperbarui kloter:", error.message);
        return;
      }

      setSuccess("Kloter berhasil diperbarui.");
    } else {
      // Insert data baru ke Supabase
      const { error } = await supabase.from("kloter").insert([
        {
          name: form.name,
          description: form.date_range,
          status: "aktif",
        },
      ]);

      if (error) {
        console.error("Gagal menambahkan kloter:", error.message);
        return;
      }

      setSuccess("Kloter berhasil ditambahkan.");
    }

    setForm(initialForm);
    setEditingId(null);
    setView(0);
    fetchKloters(); // Refresh data dari database
  }

  function confirmDelete(kloter) {
    setKloterToDelete(kloter);
    setDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!kloterToDelete) return;

    // Hapus data dari Supabase
    const { error } = await supabase
      .from("kloter")
      .delete()
      .eq("id", kloterToDelete.id);

    if (error) {
      console.error("Gagal menghapus kloter:", error.message);
      return;
    }

    setSuccess("Kloter berhasil dihapus.");
    setDeleteModalOpen(false);
    setKloterToDelete(null);
    fetchKloters(); // Refresh data dari database
  }

  function closeModal() {
    setView(0);
    setEditingId(null);
    setForm(initialForm);
  }

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

      <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
        {/* Topbar Persis seperti Dashboard */}
        <Topbar title="Kloter" breadcrumbs={["Dashboard", "Kloter"]} />

        {/* MAIN CONTENT AREA DENGAN NO-SCROLLBAR */}
        <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
          {success && (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm"
            >
              {success}
            </div>
          )}

          {/* Header Card dengan Judul, Subtitle, Icon Stack Kloter, dan Tombol Tambah Kloter */}
          <PageHeader
            title="Daftar Kloter"
            description="Kelola data tour leader yang mendampingi jamaah pada setiap kloter perjalanan umrah."
            icon={
              <TbPlaneDepartureFilled className="w-[26px] h-[26px] text-[#eab308]" />
            }
            buttonText="Tambah Kloter"
            buttonIcon={<PlusIcon />}
            buttonOnClick={openCreateForm}
          />

          {/* Tabel Daftar Kloter */}
          <div
            className="animate-fade-in-up rounded-2xl bg-white shadow-md border border-gray-100"
            style={{ animationDelay: "200ms" }}
          >
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-[#1b3167] text-white text-xs font-bold tracking-wide">
                  <tr>
                    <th className="py-5 px-5 rounded-tl-xl w-16 text-center">
                      NO
                    </th>
                    <th className="py-5 px-8">NAMA KLOTER</th>
                    <th className="py-5 px-8">TANGGAL</th>
                    <th className="py-5 px-5 rounded-tr-xl text-center">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-gray-400 text-xs font-semibold"
                      >
                        Memuat data dari Supabase...
                      </td>
                    </tr>
                  ) : kloters.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-gray-400 text-xs font-semibold"
                      >
                        Belum ada data kloter.
                      </td>
                    </tr>
                  ) : (
                    kloters.map((kloter, index) => (
                      <tr
                        key={kloter.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="py-4 px-5 text-center font-semibold text-gray-500 text-xs">
                          {index + 1}
                        </td>
                        <td className="py-4 px-8 font-bold text-gray-900">
                          {kloter.name}
                        </td>
                        <td className="py-4 px-8 font-medium">
                          <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200/60 shadow-2xs">
                            {kloter.date_range || kloter.description || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditForm(kloter)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(kloter)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50/60 px-3.5 py-1.5 text-xs font-bold text-rose-600 shadow-2xs hover:bg-rose-100 transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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
          </div>
        </main>
      </div>

      {/* Modal Form Tambah / Edit Kloter */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-all duration-300 ease-in-out ${
          view === 1
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl  transition-all duration-300 ease-in-out ${
            view === 1 ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between bg-[#1b3167] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 shadow-2xs shrink-0">
                <TbPlaneDepartureFilled className="text-[#EAB308]" />
              </div>
              <h2 className="text-sm font-bold">
                {editingId ? "Edit Kloter" : "Tambah Kloter"}
              </h2>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-300 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-bold text-gray-700"
                >
                  Nama Kloter <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama Kloter"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#1b3167] focus:outline-none focus:ring-1 focus:ring-[#1b3167]"
                />
              </div>

              <div>
                <label
                  htmlFor="date_range"
                  className="mb-1.5 block text-xs font-bold text-gray-700"
                >
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  id="date_range"
                  name="date_range"
                  type="text"
                  value={form.date_range}
                  onChange={handleChange}
                  placeholder="cth: 17-25 November 2026"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#1b3167] focus:outline-none focus:ring-1 focus:ring-[#1b3167]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1b3167] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#15254f] transition-colors"
              >
                <svg
                  className="w-4 h-4 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Hapus Simple & Clean */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-all duration-300 ease-in-out ${
          deleteModalOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl  transition-all duration-300 ease-in-out ${
            deleteModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between bg-[#1b3167] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 shadow-2xs shrink-0">
                <TbPlaneDepartureFilled className="text-[#EAB308]" />
              </div>
              <h2 className="text-sm font-bold">Hapus Kloter</h2>
            </div>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="text-gray-300 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 text-center">
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              Yakin Untuk Menghapus Kloter Ini? <br />
              <span className="text-lg font-bold text-gray-900 mt-1 block">
                "{kloterToDelete?.name}"
              </span>
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
            >
              Tidak
            </button>
            <button
              type="button"
              value="Hapus"
              onClick={handleDelete}
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
