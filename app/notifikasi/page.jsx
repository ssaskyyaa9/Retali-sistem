"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/app/components/PageHeader";
import { PlusIcon } from "@/app/components/CustomIcons";
import Topbar from "@/app/components/Topbar";
import { IoMdNotificationsOutline } from "react-icons/io";
import { supabase } from "@/lib/supabase";

export default function NotifikasiPage() {
  // 0 = Daftar Notifikasi (List), 1 = Buat Notifikasi Baru (Form)
  const [view, setView] = useState(0);

  // State Data Database
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isRead, setIsRead] = useState("true");

  // Fetch Data dari Supabase
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error.message);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle Submit Form Simpan Notifikasi
  const handleSaveNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert("Judul dan pesan wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("notifications").insert([
        {
          title: title.trim(),
          message: message.trim(),
          is_read: isRead === "true",
        },
      ]);

      if (error) {
        alert("Gagal menyimpan notifikasi: " + error.message);
      } else {
        // Reset form & kembali ke tabel list
        setTitle("");
        setMessage("");
        setIsRead("true");
        setView(0);
        fetchNotifications();
      }
    } catch (err) {
      console.error("Error inserting notification:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper Formatter Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <Topbar title="Notifikasi" breadcrumbs={["Dashboard", "Notifikasi"]} />

        <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
          {/* LIST VIEW */}
          {view === 0 && (
            <div className="space-y-6">
              <PageHeader
                title="Daftar Notifikasi"
                description="Berisi daftar notifikasi yang dikirimkan kepada tour leader."
                icon={
                  <IoMdNotificationsOutline className="w-26px h-26px text-[#eab308]" />
                }
                buttonIcon={<PlusIcon />}
                buttonOnClick={() => setView(1)}
                buttonText="Buat Notifikasi Baru"
              />

              <div
                className="animate-fade-in-up rounded-2xl bg-white shadow-md border border-gray-100"
                style={{ animationDelay: "200ms" }}
              >
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wide">
                      <tr>
                        <th className="py-5 px-5 rounded-tl-xl w-16 text-center">
                          NO
                        </th>
                        <th className="py-5 px-8">JUDUL</th>
                        <th className="py-5 px-8">PESAN</th>
                        <th className="py-5 px-5 text-center">AKTIF</th>
                        <th className="py-5 px-5 rounded-tr-xl text-center">
                          TANGGAL
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {loading ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-12 text-center text-gray-400 text-xs font-semibold"
                          >
                            Memuat data notifikasi...
                          </td>
                        </tr>
                      ) : notifications.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-12 text-center text-gray-400 text-xs font-semibold"
                          >
                            Belum ada data notifikasi.
                          </td>
                        </tr>
                      ) : (
                        notifications.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            <td className="py-4 px-5 text-center font-semibold text-gray-500 text-xs">
                              {notifications.length - index}
                            </td>
                            <td className="py-4 px-8 font-bold text-gray-900 text-sm">
                              {item.title || "-"}
                            </td>
                            <td className="py-4 px-8 font-bold text-gray-900 text-sm leading-relaxed">
                              {item.message || "-"}
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span
                                className={`inline-block rounded-lg px-3.5 py-1 text-xs font-bold shadow-2xs ${
                                  item.is_read
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                }`}
                              >
                                {item.is_read ? "Ya" : "Tidak"}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-center font-semibold text-gray-600 text-sm whitespace-nowrap">
                              {formatDate(item.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FORM VIEW: Buat Notifikasi Baru */}
          {view === 1 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between bg-[#121c2d] px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 shadow-2xs shrink-0">
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold">Buat Notifikasi Baru</h2>
                </div>
              </div>

              <form onSubmit={handleSaveNotification} className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">
                      Judul Notifikasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masukkan judul notifikasi.."
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#121c2d] focus:outline-none focus:ring-1 focus:ring-[#121c2d]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">
                      Pesan Notifikasi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tulis pesan lengkap di sini..."
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#121c2d] focus:outline-none focus:ring-1 focus:ring-[#121c2d] resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">
                      Status Aktif
                    </label>
                    <select
                      value={isRead}
                      onChange={(e) => setIsRead(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-900 bg-white focus:border-[#121c2d] focus:outline-none focus:ring-1 focus:ring-[#121c2d]"
                    >
                      <option value="true">Ya (Aktif)</option>
                      <option value="false">Tidak (Non-aktif)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 -mx-6 -mb-6 px-6 py-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setView(0)}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#121c2d] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#15254f] transition-colors disabled:opacity-50"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {isSubmitting ? "Menyimpan..." : "Simpan Notifikasi"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </>
  );
}