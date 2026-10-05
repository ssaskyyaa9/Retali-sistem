"use client";
import React, { useState } from "react";

export default function TugasTourLeaderScreen() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-10 w-full max-w-5xl">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        {/* STEP 1[cite: 5] */}
        {step === 1 && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <svg
                  className="w-6 h-6 text-[#263754]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Form Tugas - Langkah 1
              </h2>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50">
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
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Judul Tugas
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul tugas.."
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-[#263754] focus:border-[#263754]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Jumlah Soal
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm appearance-none bg-white">
                    <option>Pilih Jumlah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Waktu Di Buka
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Waktu Di Tutup
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-500"
                  />
                </div>
              </div>

              <div className="w-1/3 pr-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Kirim ke siapa
                </label>
                <select className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm appearance-none bg-white">
                  <option>Pilih Tujuan</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-[#263754] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#3d547a]"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {/* STEP 2[cite: 6] */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 mb-1">
                <svg
                  className="w-6 h-6 text-[#263754]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Form Tugas - Langkah 2
              </h2>
              <p className="text-sm text-gray-600">
                Isi 2 soal untuk tugas:{" "}
                <span className="font-bold text-gray-900">tugas</span>
              </p>
            </div>

            <div className="border-l-4 border-[#263754] pl-3 mb-6">
              <h3 className="font-bold text-gray-900">Daftar Soal</h3>
              <p className="text-xs text-gray-500">
                Lengkapi pertanyaan di bawah ini.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Soal 1
                </label>
                <input
                  type="text"
                  placeholder="Masukkan soalnya.."
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Soal 2
                </label>
                <input
                  type="text"
                  placeholder="Masukkan soalnya.."
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="border-l-4 border-[#3b82f6] pl-3 mb-4">
              <h3 className="font-bold text-gray-900">Pilih Tour Leader</h3>
              <p className="text-xs text-gray-500">
                Centang tour leader yang ingin dikirimkan tugas ini.
              </p>
            </div>

            <div className="border border-gray-300 rounded-md p-4 space-y-3 mb-8">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#263754] rounded border-gray-300"
                />
                <span className="text-sm font-medium">Fio</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#263754] rounded border-gray-300"
                />
                <span className="text-sm font-medium">Surya</span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50"
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
              <button className="bg-[#263754] text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#3d547a]">
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
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
