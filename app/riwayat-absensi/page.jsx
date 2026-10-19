"use client";

import React, { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import Topbar from "@/app/components/Topbar";
import { FaUserClock } from "react-icons/fa";
import {
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiPlus,
  FiArrowLeft,
  FiX,
  FiEdit,
  FiTrash2,
  FiMapPin,
} from "react-icons/fi";

// Dummy Data Tour Leader
const initialTourLeaderData = [
  {
    id: 1,
    jam: "10:54",
    tanggal: "2026-08-11",
    nama: "Muhammad Fio Ramadhan",
    kloter: "Umrah Itikaf Mandiri",
    kloterDate: "21 Februari - 6 Maret 2027",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    koordinat: "21.4238395, 39.8255130",
  },
  {
    id: 2,
    jam: "10:53",
    tanggal: "2026-08-11",
    nama: "Muhammad Fio Ramadhan",
    kloter: "Umrah Itikaf Mandiri",
    kloterDate: "21 Februari - 6 Maret 2027",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    koordinat: "-6.3402248, 106.8354146",
  },
  {
    id: 3,
    jam: "15:08",
    tanggal: "2026-07-22",
    nama: "Ustadz Dedi Muhammad",
    kloter: "Umrah Ultimo Minimalis",
    kloterDate: "17-25 Agustus 2026",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    koordinat: "-6.3401166, 106.8353800",
  },
];

// Dummy Data Muthawif
const initialMuthawifData = [
  {
    id: 1,
    jam: "14:20",
    tanggal: "2026-08-10",
    nama: "Ustadz Hanif Ali",
    kloter: "Umrah Plus Turkey",
    kloterDate: "13 Februari - 25 Februari 2026",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    koordinat: "21.422487, 39.826201",
  },
];

// Dummy Data Jamaah
const initialJamaahList = [
  {
    id: 1,
    kloter: "Umrah Itikaf Mandiri",
    kloterDate: "21 Februari - 6 Maret 2027",
    sesi: "Jeddah - Madinah – Bus Jeddah - Madinah",
    tourLeader: "Muhammad Fio Ramadhan",
    dibuat: "10 Aug 2026, 11:37",
    totalJamaah: 40,
  },
  {
    id: 2,
    kloter: "Umrah Itikaf Mandiri",
    kloterDate: "21 Februari - 6 Maret 2027",
    sesi: "Bus – Jakarta - mekkah",
    tourLeader: "Muhammad Fio Ramadhan",
    dibuat: "10 Aug 2026, 11:33",
    totalJamaah: 40,
  },
  {
    id: 3,
    kloter: "umrah plus turkey",
    kloterDate: "13 februari 2026 - 25 februari 2026",
    sesi: "Bus – Jakarta - mekkah",
    tourLeader: "Surya",
    dibuat: "08 Jul 2026, 20:59",
    totalJamaah: 55,
  },
];

// Dummy Data Sesi Absen
const initialSesiList = [
  { id: 1, judul: "Jeddah - Madinah", jumlahIsi: 1 },
  { id: 2, judul: "Bus", jumlahIsi: 2 },
];

export default function RiwayatAbsensiPage() {
  const [activeTab, setActiveTab] = useState("tour_leader");
  const [jamaahView, setJamaahView] = useState("list");

  // Modal State
  const [showAddSesiModal, setShowAddSesiModal] = useState(false);
  const [judulSesi, setJudulSesi] = useState("");
  const [isiSesiList, setIsiSesiList] = useState(["Isi 1"]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // Data States
  const [tlData, setTlData] = useState(initialTourLeaderData);
  const [muthawifData, setMuthawifData] = useState(initialMuthawifData);
  const [jamaahList, setJamaahList] = useState(initialJamaahList);
  const [sesiList, setSesiList] = useState(initialSesiList);

  const handleFilter = (e) => {
    e.preventDefault();
  };

  const handleReset = () => {
    setSearchName("");
    setSearchDate("");
  };

  // Filter Logic
  const filteredTlData = tlData.filter((item) => {
    const matchName = item.nama.toLowerCase().includes(searchName.toLowerCase());
    const matchDate = searchDate ? item.tanggal === searchDate : true;
    return matchName && matchDate;
  });

  const filteredMuthawifData = muthawifData.filter((item) => {
    const matchName = item.nama.toLowerCase().includes(searchName.toLowerCase());
    const matchDate = searchDate ? item.tanggal === searchDate : true;
    return matchName && matchDate;
  });

  const openDeleteConfirmation = (id, type, name) => {
    setItemToDelete({ id, type, name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "tour_leader") {
      setTlData(tlData.filter((i) => i.id !== itemToDelete.id));
    } else if (itemToDelete.type === "muthawif") {
      setMuthawifData(muthawifData.filter((i) => i.id !== itemToDelete.id));
    } else if (itemToDelete.type === "jamaah") {
      setJamaahList(jamaahList.filter((i) => i.id !== itemToDelete.id));
    } else if (itemToDelete.type === "sesi") {
      setSesiList(sesiList.filter((i) => i.id !== itemToDelete.id));
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleAddIsiField = () => {
    setIsiSesiList([...isiSesiList, `Isi ${isiSesiList.length + 1}`]);
  };

  const handleRemoveIsiField = (index) => {
    setIsiSesiList(isiSesiList.filter((_, i) => i !== index));
  };

  const handleSaveNewSesi = (e) => {
    e.preventDefault();
    if (!judulSesi.trim()) return;
    const newSesi = {
      id: Date.now(),
      judul: judulSesi,
      jumlahIsi: isiSesiList.length,
    };
    setSesiList([...sesiList, newSesi]);
    setJudulSesi("");
    setIsiSesiList(["Isi 1"]);
    setShowAddSesiModal(false);
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
        <Topbar
          title="Riwayat Absensi"
          breadcrumbs={["Dashboard", "Riwayat Absensi"]}
        />

        <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
          <PageHeader
            title="Riwayat Absensi"
            description="Berisi daftar riwayat absensi tour leader, jamaah, dan muthawif yang telah dilakukan."
            icon={<FaUserClock className="w-26px h-26px text-[#eab308]" />}
          />

          <div className="border-b border-gray-200 flex gap-8">
            <button
              onClick={() => {
                setActiveTab("tour_leader");
                setJamaahView("list");
              }}
              className={`pb-3 text-base font-bold transition-all ${
                activeTab === "tour_leader"
                  ? "border-b-2 border-blue-600 text-[#121c2d]"
                  : "border-b-2 border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              Tour Leader
            </button>
            <button
              onClick={() => {
                setActiveTab("jamaah");
                setJamaahView("list");
              }}
              className={`pb-3 text-base font-bold transition-all ${
                activeTab === "jamaah"
                  ? "border-b-2 border-blue-600 text-[#121c2d]"
                  : "border-b-2 border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              Jamaah
            </button>
            <button
              onClick={() => {
                setActiveTab("muthawif");
                setJamaahView("list");
              }}
              className={`pb-3 text-base font-bold transition-all ${
                activeTab === "muthawif"
                  ? "border-b-2 border-blue-600 text-[#121c2d]"
                  : "border-b-2 border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              Muthawif
            </button>
          </div>

          {activeTab !== "jamaah" && (
            <div className="space-y-6">
              {/* CONTROL BAR */}
              <form
                onSubmit={handleFilter}
                className="flex flex-wrap gap-4 items-end"
              >
                <div className="w-64">
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder={`Cari nama ${
                      activeTab === "tour_leader" ? "tour leader" : "muthawif"
                    }...`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xs text-gray-900 bg-white placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Tanggal Absen
                  </label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-3 text-xs text-gray-900 bg-white focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-6 py-3 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <FiFilter className="w-3.5 h-3.5" />
                    Filter
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <FiRefreshCw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => alert("Export Excel")}
                  className="bg-[#2e7d32] hover:bg-green-700 text-white px-6 py-3 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ml-auto shadow-xs"
                >
                  <FiDownload className="w-4 h-4" />
                  Export Excel
                </button>
              </form>

              {/* TABEL LIST */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wide">
                      <tr>
                        <th className="py-4 px-5 w-16 text-center">NO</th>
                        <th className="py-4 px-6 text-center">TANGGAL</th>
                        <th className="py-4 px-6">NAMA</th>
                        <th className="py-4 px-8 text-center">KLOTER</th>
                        <th className="py-4 px-8 text-center">FOTO</th>
                        <th className="py-4 px-8">KOORDINAT</th>
                        <th className="py-4 px-6 text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(activeTab === "tour_leader"
                        ? filteredTlData
                        : filteredMuthawifData
                      ).length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="py-12 text-center text-gray-400 text-sm font-semibold"
                          >
                            Tidak ada data yang ditemukan.
                          </td>
                        </tr>
                      ) : (
                        (activeTab === "tour_leader"
                          ? filteredTlData
                          : filteredMuthawifData
                        ).map((item, index) => {
                          const currentList =
                            activeTab === "tour_leader"
                              ? filteredTlData
                              : filteredMuthawifData;
                          const rowNumber = currentList.length - index;

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50/80 transition-colors"
                            >
                              <td className="py-4 px-5 text-center font-bold text-gray-500 text-sm">
                                {rowNumber}
                              </td>

                              {/* TANGGAL CENTER (JAM DI ATAS, TANGGAL DI BAWAH) */}
                              <td className="py-4 px-6 text-center whitespace-nowrap">
                                <span className="block font-bold text-gray-900 text-sm">
                                  {item.jam}
                                </span>
                                <span className="block text-xs font-semibold text-gray-500 mt-0.5">
                                  {item.tanggal}
                                </span>
                              </td>

                              <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                                {item.nama}
                              </td>

                              {/* KLOTER CENTER: KOTAK NAMA DI ATAS, TANGGAL DI BAWAH */}
                              <td className="py-4 px-8 text-center">
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                  <span className="inline-block rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-200/60 shadow-2xs whitespace-nowrap">
                                    {item.kloter}
                                  </span>
                                  <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                                    {item.kloterDate}
                                  </span>
                                </div>
                              </td>

                              {/* FOTO */}
                              <td className="py-4 px-8 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-2xs mx-auto flex items-center justify-center">
                                  <img
                                    src={item.foto}
                                    alt="Absen"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>

                              {/* KOORDINAT */}
                              <td className="py-4 px-8 text-xs font-bold text-gray-800 font-mono">
                                {item.koordinat}
                              </td>

                              {/* TOMBOL AKSI */}
                              <td className="py-4 px-6 text-center">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <a
                                    href={`https://maps.google.com/?q=${item.koordinat}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 transition-colors w-28 justify-center whitespace-nowrap"
                                  >
                                    <FiMapPin className="w-3.5 h-3.5 text-blue-600" />
                                    Lihat Maps
                                  </a>

                                  <button
                                    onClick={() =>
                                      openDeleteConfirmation(
                                        item.id,
                                        activeTab,
                                        item.nama
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/80 px-3.5 py-1.5 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-100 transition-colors w-28 justify-center whitespace-nowrap"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5 text-red-500" />
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB JAMAAH */}
          {activeTab === "jamaah" && (
            <div className="space-y-6">
              {jamaahView === "list" && (
                <div className="space-y-6">
                  <div className="bg-[#121c2d] text-white p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold">Data Absen Jamaah</h3>
                      <p className="text-xs text-gray-300 mt-1">
                        Kelola sesi absen dan pantau progres tiap Tour Leader.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setJamaahView("sesi_absen")}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all border border-white/20"
                      >
                        Sesi Absen
                      </button>
                      <button
                        onClick={() => setJamaahView("tambah_absen")}
                        className="bg-white text-[#121c2d] hover:bg-gray-100 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <FiPlus className="w-4 h-4" />
                        Tambah Absen
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {jamaahList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-base">
                              {item.kloter}
                            </h4>
                            <span className="text-xs text-gray-500 font-bold">
                              ({item.kloterDate})
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium">
                            Sesi:{" "}
                            <span className="font-bold text-gray-900">
                              {item.sesi}
                            </span>
                          </p>
                          <p className="text-xs text-gray-700 font-medium">
                            Tour Leader:{" "}
                            <span className="font-bold text-gray-900">
                              {item.tourLeader}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            Dibuat: {item.dibuat}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200/80 px-3.5 py-1.5 rounded-lg text-xs font-bold">
                            {item.totalJamaah} Jamaah
                          </span>
                          <button
                            onClick={() =>
                              alert(`Detail Absen Jamaah ID: ${item.id}`)
                            }
                            className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() =>
                              openDeleteConfirmation(
                                item.id,
                                "jamaah",
                                item.kloter
                              )
                            }
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {jamaahView === "tambah_absen" && (
                <div className="space-y-6">
                  <div className="bg-[#121c2d] text-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold">Import Absen Jamaah</h3>
                    <p className="text-xs text-gray-300 mt-1">
                      Upload data jamaah per Tour Leader untuk sesi absen
                      tertentu.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="bg-blue-50/70 px-6 py-3 border-b border-blue-100">
                      <h4 className="text-xs font-bold text-blue-900">
                        1. Pilih Konteks Sesi
                      </h4>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 mb-2">
                          Kloter
                        </label>
                        <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#121c2d]">
                          <option>-- Pilih Kloter --</option>
                          <option>Umrah Itikaf Mandiri</option>
                          <option>Umrah Ultimo Minimalis</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 mb-2">
                          Sesi Absen
                        </label>
                        <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#121c2d]">
                          <option>-- Pilih Sesi --</option>
                          <option>Jeddah - Madinah</option>
                          <option>Bus</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 mb-2">
                          Bagian Sesi Absen
                        </label>
                        <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-800 bg-gray-100 focus:outline-none">
                          <option>-- Pilih Bagian --</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="bg-blue-50/70 px-6 py-3 border-b border-blue-100">
                      <h4 className="text-xs font-bold text-blue-900">
                        2. Upload File Excel per Tour Leader
                      </h4>
                    </div>
                    <div className="p-8">
                      <p className="text-xs text-gray-500 mb-6 font-medium">
                        Pilih kloter terlebih dahulu untuk menampilkan daftar
                        tour leader.
                      </p>

                      <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                        <button
                          onClick={() => setJamaahView("list")}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <FiArrowLeft className="w-4 h-4" />
                          Kembali
                        </button>
                        <button
                          disabled
                          className="bg-gray-200 text-gray-400 px-6 py-2.5 rounded-lg text-xs font-bold cursor-not-allowed"
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {jamaahView === "sesi_absen" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-gray-900">
                      Sesi Absen
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setJamaahView("list")}
                        className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5" />
                        Kembali
                      </button>
                      <button
                        onClick={() => setShowAddSesiModal(true)}
                        className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                        Tambah Sesi
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wide">
                          <tr>
                            <th className="py-4 px-5 w-16 text-center">No</th>
                            <th className="py-4 px-6">Judul Sesi</th>
                            <th className="py-4 px-6 text-center">Jumlah Isi</th>
                            <th className="py-4 px-6 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {sesiList.map((item, index) => (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50/80 transition-colors"
                            >
                              <td className="py-4 px-5 text-center font-semibold text-gray-500 text-xs">
                                {index + 1}
                              </td>
                              <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                                {item.judul}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white text-xs font-bold">
                                  {item.jumlahIsi}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="inline-flex items-center justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      alert(`Detail Sesi: ${item.judul}`)
                                    }
                                    className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                                  >
                                    Detail
                                  </button>
                                  <button
                                    onClick={() =>
                                      alert(`Edit Sesi: ${item.judul}`)
                                    }
                                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                                  >
                                    <FiEdit className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      openDeleteConfirmation(
                                        item.id,
                                        "sesi",
                                        item.judul
                                      )
                                    }
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                                  >
                                    <FiTrash2 className="w-3 h-3" />
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl border border-gray-100 animate-fade-in-up">
            <div className="flex items-center justify-between bg-[#121c2d] px-6 py-4 text-white">
              <h2 className="text-sm font-bold">Hapus Data</h2>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center">
              <p className="text-base text-gray-600 font-medium leading-relaxed">
                Apakah Anda yakin ingin menghapus data ini? <br />
                <span className="text-base font-bold text-gray-900 mt-1 block">
                  "{itemToDelete?.name}"
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SESI ABSEN */}
      {showAddSesiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="bg-[#121c2d] px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-base font-bold">Tambah Sesi Absen</h3>
              <button
                onClick={() => setShowAddSesiModal(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewSesi}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">
                    Judul Sesi
                  </label>
                  <input
                    type="text"
                    value={judulSesi}
                    onChange={(e) => setJudulSesi(e.target.value)}
                    placeholder="Contoh: Bus / Pesawat"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#121c2d] focus:ring-1 focus:ring-[#121c2d]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">
                    Isi Sesi Absen
                  </label>
                  <div className="space-y-3">
                    {isiSesiList.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={val}
                          placeholder={`Isi ${idx + 1}`}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#121c2d]"
                        />
                        {isiSesiList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIsiField(idx)}
                            className="p-2.5 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddIsiField}
                    className="mt-3 border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    + Tambah Isi
                  </button>
                </div>
              </div>

              <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#2e7d32] hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}