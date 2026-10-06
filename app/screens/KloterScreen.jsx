"use client";
import React, { useState } from "react";
import Header from "@/app/components/Header";
import { CalendarIcon, PlusIcon } from "@/app/components/CustomIcons";

export default function KloterScreen() {
  // Toggle between 0 (List View) and 1 (Add Form View)
  const [view, setView] = useState(0);

  return (
    <div className="p-10 w-full max-w-5xl">
      {/* LIST VIEW[cite: 14] */}
      {view === 0 && (
        <div>
          <Header
            title="Daftar Kloter"
            icon={<CalendarIcon />}
            buttonIcon={<PlusIcon />}
            buttonOnClick={() => setView(1)}
            buttonText="Tambah Kloter"
            buttonBgColor="bg-[#2e7d32] hover:bg-green-700"
          />

          <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-center text-sm">
                <thead className="bg-[#263754] text-white">
                  <tr>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      No
                    </th>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      Nama Kloter
                    </th>
                    <th className="px-6 py-4 font-bold border-b border-r border-[#3d547a]">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 font-bold border-b">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800 font-medium">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-gray-200">1</td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      Umrah plus turky
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      20 - 30 Oktober 2025
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="bg-[#263754] hover:bg-[#3d547a] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors">
                          <svg
                            className="w-3 h-3"
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
                          </svg>{" "}
                          Edit
                        </button>
                        <button className="bg-[#e53935] hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors">
                          <svg
                            className="w-3 h-3"
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
                          </svg>{" "}
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-gray-200">2</td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      Umrah plus turky
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      20 - 30 Oktober 2025
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="bg-[#263754] hover:bg-[#3d547a] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors">
                          <svg
                            className="w-3 h-3"
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
                          </svg>{" "}
                          Edit
                        </button>
                        <button className="bg-[#e53935] hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors">
                          <svg
                            className="w-3 h-3"
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
                          </svg>{" "}
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORM VIEW[cite: 15] */}
      {view === 1 && (
        <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          {/* Green Header */}
          <div className="bg-[#2e7d32] px-8 py-5 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Kloter
            </h2>
          </div>

          <div className="p-8">
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  Nama Kloter
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama kloter"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#2e7d32] focus:border-[#2e7d32]"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  Tanggal
                </label>
                <input
                  type="text"
                  placeholder="cth: 13 - 20 September 2025"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#2e7d32] focus:border-[#2e7d32]"
                />
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
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
