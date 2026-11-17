"use client";

import React, { useState } from "react";
import Topbar from "@/app/components/Topbar";
import Link from "next/link";
import { TbArrowLeft, TbPrinter, TbZoomIn, TbX, TbCopy, TbCheck, TbDeviceMobile } from "react-icons/tb";

const koperData = [
  { no_urutan: 1, kode_koper: "KPR-126-001", nama_pemilik: "Ahmad Dahlan", nomor_telepon: "081234567801", kloter: "Kloter 126" },
  { no_urutan: 2, kode_koper: "KPR-126-002", nama_pemilik: "Siti Aminah", nomor_telepon: "081234567802", kloter: "Kloter 126" },
  { no_urutan: 3, kode_koper: "KPR-126-003", nama_pemilik: "Budi Santoso", nomor_telepon: "081234567803", kloter: "Kloter 126" },
  { no_urutan: 4, kode_koper: "KPR-126-004", nama_pemilik: "Nurul Hidayati", nomor_telepon: "081234567804", kloter: "Kloter 126" },
  { no_urutan: 5, kode_koper: "KPR-126-005", nama_pemilik: "Muhammad Rizky", nomor_telepon: "081234567805", kloter: "Kloter 126" },
  { no_urutan: 6, kode_koper: "KPR-126-006", nama_pemilik: "Dewi Sartika", nomor_telepon: "081234567806", kloter: "Kloter 126" },
  { no_urutan: 7, kode_koper: "KPR-126-007", nama_pemilik: "Hendra Wijaya", nomor_telepon: "081234567807", kloter: "Kloter 126" },
  { no_urutan: 8, kode_koper: "KPR-126-008", nama_pemilik: "Fatimah Azzahra", nomor_telepon: "081234567808", kloter: "Kloter 126" },
  { no_urutan: 9, kode_koper: "KPR-126-009", nama_pemilik: "Agus Pratama", nomor_telepon: "081234567809", kloter: "Kloter 126" },
  { no_urutan: 10, kode_koper: "KPR-126-010", nama_pemilik: "Sri Wahyuni", nomor_telepon: "081234567810", kloter: "Kloter 126" },
];

const pasporData = [
  { no_urutan: 1, passport_number: "B1234567", owner_name: "Ahmad Dahlan", phone: "081234567801", kloter: "Kloter 126" },
  { no_urutan: 2, passport_number: "B2345678", owner_name: "Siti Aminah", phone: "081234567802", kloter: "Kloter 126" },
  { no_urutan: 3, passport_number: "B3456789", owner_name: "Budi Santoso", phone: "081234567803", kloter: "Kloter 126" },
  { no_urutan: 4, passport_number: "B4567890", owner_name: "Nurul Hidayati", phone: "081234567804", kloter: "Kloter 126" },
  { no_urutan: 5, passport_number: "B5678901", owner_name: "Muhammad Rizky", phone: "081234567805", kloter: "Kloter 126" },
  { no_urutan: 6, passport_number: "B6789012", owner_name: "Dewi Sartika", phone: "081234567806", kloter: "Kloter 126" },
  { no_urutan: 7, passport_number: "B7890123", owner_name: "Hendra Wijaya", phone: "081234567807", kloter: "Kloter 126" },
  { no_urutan: 8, passport_number: "B8901234", owner_name: "Fatimah Azzahra", phone: "081234567808", kloter: "Kloter 126" },
  { no_urutan: 9, passport_number: "B9012345", owner_name: "Agus Pratama", phone: "081234567809", kloter: "Kloter 126" },
  { no_urutan: 10, passport_number: "B0123456", owner_name: "Sri Wahyuni", phone: "081234567810", kloter: "Kloter 126" },
];

export default function DummyQrPage() {
  const [activeTab, setActiveTab] = useState("koper");
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);

  const currentList = activeTab === "koper" ? koperData : pasporData;

  const handleCopyPayload = (item) => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen flex flex-col">
      <Topbar title="Testing Dummy QR Scanner" breadcrumbs={["Dashboard", "Riwayat Scan", "Dummy QR"]} />

      <div className="flex-1 p-6 w-full max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1e293b] to-[#263754] text-white p-6 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/20 text-blue-300 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Testing Tools
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Dummy QR Code Scanner (No. Urut 1 - 10)</h1>
            <p className="text-slate-300 text-xs mt-1">
              Arahkan kamera aplikasi mobile Retali Anda langsung ke QR Code di layar ini untuk menguji scan berurutan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/riwayat-scan"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs border border-white/10"
            >
              <TbArrowLeft className="w-4 h-4" /> Kembali ke Riwayat Scan
            </Link>

            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <TbPrinter className="w-4 h-4" /> Cetak / Print
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("koper")}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "koper"
                ? "border-[#263754] text-[#263754]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            🧳 QR Scan Koper (No. 1 - 10)
          </button>
          <button
            onClick={() => setActiveTab("paspor")}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "paspor"
                ? "border-[#263754] text-[#263754]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            🛂 QR Scan Paspor (No. 1 - 10)
          </button>
        </div>

        {/* Instructions banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <TbDeviceMobile className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">Tips Pengujian di Aplikasi Mobile:</span> Buka menu scanner di aplikasi mobile Retali, pastikan mode scan sesuai (<span className="font-semibold">{activeTab === "koper" ? "Scan Koper" : "Scan Paspor"}</span>), lalu arahkan kamera ke QR Code di bawah secara berurutan mulai dari <span className="font-bold text-blue-700">No. 1 sampai No. 10</span>. Klik tombol <span className="font-semibold">"Perbesar Layar"</span> untuk memperbesar tampilan QR agar lebih mudah terfokus oleh kamera ponsel.
          </div>
        </div>

        {/* QR Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {currentList.map((item) => {
            const imgSrc =
              activeTab === "koper"
                ? `/dummy-qr/koper/koper_no_${item.no_urutan}.png`
                : `/dummy-qr/paspor/paspor_no_${item.no_urutan}.png`;

            const title = activeTab === "koper" ? item.nama_pemilik : item.owner_name;
            const code = activeTab === "koper" ? item.kode_koper : item.passport_number;
            const phone = activeTab === "koper" ? item.nomor_telepon : item.phone;

            return (
              <div
                key={item.no_urutan}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center relative group"
              >
                {/* No. Urutan Badge */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                    No. Urut: {item.no_urutan}
                  </span>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    {activeTab}
                  </span>
                </div>

                {/* QR Image */}
                <div
                  onClick={() => setSelectedItem(item)}
                  className="bg-white p-2 rounded-xl border border-gray-100 shadow-inner my-2 cursor-pointer group-hover:scale-105 transition-transform"
                  title="Klik untuk perbesar"
                >
                  <img src={imgSrc} alt={`QR ${code}`} className="w-36 h-36 object-contain" />
                </div>

                {/* Info */}
                <div className="w-full mt-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate" title={title}>
                    {title}
                  </h3>
                  <div className="inline-block font-mono text-xs font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md my-1">
                    {code}
                  </div>
                  <p className="text-[11px] text-gray-500">{phone}</p>
                  <p className="text-[11px] font-semibold text-[#263754]">{item.kloter}</p>
                </div>

                {/* Action button */}
                <button
                  onClick={() => setSelectedItem(item)}
                  className="mt-3 w-full bg-gray-50 hover:bg-[#263754] text-gray-700 hover:text-white border border-gray-200 hover:border-[#263754] rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <TbZoomIn className="w-3.5 h-3.5" /> Perbesar QR
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Zoom */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
            >
              <TbX className="w-4 h-4" />
            </button>

            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-3 py-1 rounded-full">
              No. Urut: {selectedItem.no_urutan}
            </span>

            <h2 className="text-lg font-bold text-gray-900 mt-3">
              {activeTab === "koper" ? selectedItem.nama_pemilik : selectedItem.owner_name}
            </h2>
            <p className="font-mono text-xs text-blue-600 font-bold mt-0.5">
              {activeTab === "koper" ? selectedItem.kode_koper : selectedItem.passport_number} • {selectedItem.kloter}
            </p>

            <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-gray-200 my-4 inline-block">
              <img
                src={
                  activeTab === "koper"
                    ? `/dummy-qr/koper/koper_no_${selectedItem.no_urutan}.png`
                    : `/dummy-qr/paspor/paspor_no_${selectedItem.no_urutan}.png`
                }
                alt="QR Zoom"
                className="w-56 h-56 object-contain"
              />
            </div>

            <p className="text-xs text-emerald-600 font-bold mb-3">✓ Siap discan dengan kamera ponsel</p>

            {/* Payload box & copy */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Payload JSON</span>
                <button
                  onClick={() => handleCopyPayload(selectedItem)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <TbCheck className="w-3.5 h-3.5 text-emerald-600" /> : <TbCopy className="w-3.5 h-3.5" />}
                  {copied ? "Tersalin!" : "Salin"}
                </button>
              </div>
              <pre className="text-[11px] text-gray-700 font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
