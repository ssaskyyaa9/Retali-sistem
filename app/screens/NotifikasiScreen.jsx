// app/screens/NotifikasiScreen.jsx
"use client";
import React, { useState } from "react";
import Header from "@/app/components/Header";
import { PlusIcon } from "@/app/components/CustomIcons";

export default function NotifikasiScreen() {
  // 0 = Daftar Notifikasi (List), 1 = Buat Notifikasi Baru (Form)
  const [view, setView] = useState(0);

  return (
    <div className="p-10 w-full max-w-5xl">
      {/* LIST VIEW */}
      {view === 0 && (
        <div>
          <Header
            title="Daftar Notifikasi"
            buttonIcon={<PlusIcon />}
            buttonOnClick={() => setView(1)}
            buttonText="Buat Notifikasi Baru"
          />
          <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 p-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-center text-sm">
                <thead className="bg-[#263754] text-white">
                  <tr>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      No
                    </th>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      Judul
                    </th>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a] w-1/3">
                      Pesan
                    </th>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      Aktif
                    </th>
                    <th className="px-6 py-4 font-bold border-b">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800 font-bold bg-white">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-gray-200">1</td>
                    <td className="px-6 py-4 border-r border-gray-200">y</td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      HAYYYYYYYYYYY
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className="bg-[#2e7d32] text-white px-4 py-1.5 rounded-md text-xs font-bold shadow-sm">
                        Ya
                      </span>
                    </td>
                    <td className="px-6 py-4">15 Oct 2025 15:55</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-gray-200">2</td>
                    <td className="px-6 py-4 border-r border-gray-200">y</td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      HAYYYYYYYYYYY
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className="bg-[#e53935] text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">
                        Tidak
                      </span>
                    </td>
                    <td className="px-6 py-4">15 Oct 2025 15:55</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORM VIEW: Buat Notifikasi Baru */}
      {view === 1 && (
        <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          {/* Header matching system style */}
          <div className="bg-[#263754] px-8 py-5 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Buat Notifikasi Baru
            </h2>
          </div>

          <div className="p-8">
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Judul Notifikasi
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul notifikasi.."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#263754] focus:border-[#263754]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Pesan Notifikasi
                </label>
                <textarea
                  rows="4"
                  placeholder="Tulis pesan lengkap di sini..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#263754] focus:border-[#263754]"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Status Aktif
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#263754]">
                  <option value="ya">Ya (Aktif)</option>
                  <option value="tidak">Tidak (Non-aktif)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-6">
              <button
                onClick={() => setView(0)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
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
                onClick={() => setView(0)}
                className="bg-[#2e7d32] hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Simpan Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
