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
  FiEdit3,
  FiTrash2,
  FiMapPin,
  FiList,
  FiUsers,
  FiFileText,
  FiChevronDown,
} from "react-icons/fi";

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

const initialSesiList = [
  { id: 1, judul: "pesawat", jumlahIsi: 1 },
  { id: 2, judul: "Jeddah - Madinah", jumlahIsi: 1 },
  { id: 3, judul: "Bus", jumlahIsi: 2 },
];

const dummyDetailJamaahData = [
  {
    id: 1,
    nama: "YANTO KURNIAWAN",
    paspor: "E5559161",
    noHp: "89652325728",
    jk: "L",
    tglLahir: "10-07-1980",
    kloter: "368",
    bus: "1",
    keterangan: "SINGLE",
    statusHadir: "HADIR",
    catatan: "-",
  },
  {
    id: 2,
    nama: "NENO SUPRIATNA",
    paspor: "X8750190",
    noHp: "811175439",
    jk: "L",
    tglLahir: "04-09-1993",
    kloter: "368",
    bus: "1",
    keterangan: "MOTHER OF KINANTIE",
    statusHadir: "TIDAK HADIR",
    catatan: "-",
  },
  {
    id: 3,
    nama: "HANI NURAENI",
    paspor: "X8750223",
    noHp: "81234520323",
    jk: "P",
    tglLahir: "26-01-1986",
    kloter: "368",
    bus: "1",
    keterangan: "DAUGHTER OF WARSASI",
    statusHadir: "HADIR",
    catatan: "-",
  },
  {
    id: 4,
    nama: "AHMAD SAEFULOH",
    paspor: "X8750191",
    noHp: "82330438928",
    jk: "L",
    tglLahir: "06-12-1994",
    kloter: "368",
    bus: "1",
    keterangan: "SON OF SURATMI",
    statusHadir: "HADIR",
    catatan: "-",
  },
  {
    id: 5,
    nama: "ADE FEBRI ANDREAN",
    paspor: "X9226542",
    noHp: "81231174166",
    jk: "L",
    tglLahir: "23-02-1996",
    kloter: "368",
    bus: "1",
    keterangan: "MOTHER OF KUKUH",
    statusHadir: "HADIR",
    catatan: "-",
  },
];

export default function RiwayatAbsensiPage() {
  const [activeTab, setActiveTab] = useState("tour_leader");

  const [jamaahView, setJamaahView] = useState("list");
  const [selectedJamaah, setSelectedJamaah] = useState(null);

  // Form Tambah Absen States
  const [selectedKloter, setSelectedKloter] = useState("");
  const [selectedSesiAbsen, setSelectedSesiAbsen] = useState("");
  const [selectedBagianSesi, setSelectedBagianSesi] = useState("");

  const [showAddSesiModal, setShowAddSesiModal] = useState(false);
  const [editingSesi, setEditingSesi] = useState(null);
  const [judulSesi, setJudulSesi] = useState("");
  const [isiSesiList, setIsiSesiList] = useState(["Isi 1"]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

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

  const filteredTlData = tlData.filter((item) => {
    const matchName = item.nama
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchDate = searchDate ? item.tanggal === searchDate : true;
    return matchName && matchDate;
  });

  const filteredMuthawifData = muthawifData.filter((item) => {
    const matchName = item.nama
      .toLowerCase()
      .includes(searchName.toLowerCase());
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

  const handleOpenAddSesi = () => {
    setEditingSesi(null);
    setJudulSesi("");
    setIsiSesiList(["Isi 1"]);
    setShowAddSesiModal(true);
  };

  const handleOpenEditSesi = (item) => {
    setEditingSesi(item);
    setJudulSesi(item.judul);
    setIsiSesiList(
      Array.from({ length: item.jumlahIsi }, (_, i) => `Isi ${i + 1}`)
    );
    setShowAddSesiModal(true);
  };

  const handleAddIsiField = () => {
    setIsiSesiList([...isiSesiList, `Isi ${isiSesiList.length + 1}`]);
  };

  const handleRemoveIsiField = (index) => {
    setIsiSesiList(isiSesiList.filter((_, i) => i !== index));
  };

  const handleSaveSesi = (e) => {
    e.preventDefault();
    if (!judulSesi.trim()) return;

    if (editingSesi) {
      setSesiList(
        sesiList.map((s) =>
          s.id === editingSesi.id
            ? { ...s, judul: judulSesi, jumlahIsi: isiSesiList.length }
            : s
        )
      );
    } else {
      const newSesi = {
        id: Date.now(),
        judul: judulSesi,
        jumlahIsi: isiSesiList.length,
      };
      setSesiList([...sesiList, newSesi]);
    }

    setJudulSesi("");
    setIsiSesiList(["Isi 1"]);
    setShowAddSesiModal(false);
    setEditingSesi(null);
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
            icon={<FaUserClock className="w-[26px] h-[26px] text-[#eab308]" />}
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
              <form
                onSubmit={handleFilter}
                className="flex flex-wrap gap-4 items-end"
              >
                <div className="w-64">
                  <label className="block text-[14px] font-bold text-gray-800 mb-1.5">
                    {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder={`Cari nama ${
                      activeTab === "tour_leader" ? "tour leader" : "muthawif"
                    }...`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-900 bg-white placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-gray-800 mb-1.5">
                    Tanggal Absen
                  </label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-900 bg-white focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-6 py-3 rounded-lg text-[14px] font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <FiFilter className="w-3.5 h-3.5" />
                    Filter
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-[14px] font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <FiRefreshCw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </form>

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
                              <td className="py-4 px-8 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-2xs mx-auto flex items-center justify-center">
                                  <img
                                    src={item.foto}
                                    alt="Absen"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>
                              <td className="py-4 px-8 text-xs font-bold text-gray-800 font-mono">
                                {item.koordinat}
                              </td>
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

          {activeTab === "jamaah" && (
            <div className="space-y-6">
              {jamaahView === "list" && (
                <div className="space-y-6">
                  <div className="bg-[#121c2d] text-white p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold">Data Absen Jamaah</h3>
                      <p className="text-xm text-gray-300 mt-1">
                        Kelola sesi absen dan pantau riwayat absen jamaah per
                        kloter.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setJamaahView("sesi_absen")}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
                      >
                        <FiList className="w-4 h-4" />
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {item.kloter}
                            </h4>
                            <span className="text-sm text-gray-500 font-semibold">
                              ({item.kloterDate})
                            </span>
                          </div>
                          <p className="text-[14px] text-gray-700 font-medium">
                            Sesi:{" "}
                            <span className="font-bold text-gray-900">
                              {item.sesi}
                            </span>
                          </p>
                          <p className="text-[14px] text-gray-700 font-medium">
                            Tour Leader:{" "}
                            <span className="font-bold text-gray-900">
                              {item.tourLeader}
                            </span>
                          </p>
                          <p className="text-[14px] text-gray-400 font-medium pt-0.5">
                            Dibuat: {item.dibuat}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          <span className="inline-flex items-center justify-center min-w-[100px] h-10 px-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold shadow-2xs">
                            {item.totalJamaah} Jamaah
                          </span>
                          <button
                            onClick={() => {
                              setSelectedJamaah(item);
                              setJamaahView("detail_jamaah");
                            }}
                            className="inline-flex items-center justify-center min-w-[100px] h-10 px-4 bg-[#121c2d] hover:bg-[#1f2d47] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
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
                            className="inline-flex items-center justify-center min-w-[100px] h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-lg text-xs font-bold transition-all shadow-2xs"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 2: TAMBAH ABSEN */}
              {jamaahView === "tambah_absen" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    Pilihan sebelumnya dipulihkan otomatis. File Excel perlu diupload ulang.
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="bg-blue-50/70 px-6 py-3.5 border-b border-blue-100">
                      <h4 className="text-sm font-bold text-blue-900">
                        1. Pilih Konteks Sesi
                      </h4>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Kloter
                        </label>
                        <div className="relative">
                          <select
                            value={selectedKloter}
                            onChange={(e) => setSelectedKloter(e.target.value)}
                            className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Kloter --</option>
                            <option value="Umrah Ultimo Minimalis (17-25 Agustus 2026)">
                              Umrah Ultimo Minimalis (17-25 Agustus 2026)
                            </option>
                            <option value="Umrah Itikaf Mandiri (21 Februari - 6 Maret 2027)">
                              Umrah Itikaf Mandiri (21 Februari - 6 Maret 2027)
                            </option>
                          </select>
                          <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Sesi Absen
                        </label>
                        <div className="relative">
                          <select
                            value={selectedSesiAbsen}
                            onChange={(e) => setSelectedSesiAbsen(e.target.value)}
                            className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Sesi Absen --</option>
                            <option value="Bus">Bus</option>
                            <option value="Jeddah - Madinah">Jeddah - Madinah</option>
                          </select>
                          <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Bagian Sesi Absen
                        </label>
                        <div className="relative">
                          <select
                            value={selectedBagianSesi}
                            onChange={(e) => setSelectedBagianSesi(e.target.value)}
                            className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Bagian Sesi Absen --</option>
                            <option value="Jakarta - mekkah">Jakarta - mekkah</option>
                            <option value="Jeddah - Madinah – Bus Jeddah - Madinah">
                              Jeddah - Madinah – Bus Jeddah - Madinah
                            </option>
                          </select>
                          <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="bg-blue-50/70 px-6 py-3.5 border-b border-blue-100">
                      <h4 className="text-sm font-bold text-blue-900">
                        2. Upload File Excel per Tour Leader
                      </h4>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="border border-blue-200/80 rounded-xl p-5 bg-blue-50/20">
                        <div className="mb-3.5">
                          <h5 className="text-sm font-bold text-gray-900">
                            Tour Leader: Ustadz Dedi Muhammad
                          </h5>
                          <p className="text-xs text-gray-600 mt-1">
                            Format Excel: nama_jamaah, no_paspor, no_hp, jenis_kelamin, tanggal_lahir, kode_kloter, nomor_bus, keterangan
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-bold shadow-2xs transition-all inline-flex items-center">
                            Choose File
                            <input type="file" accept=".xlsx, .xls" className="hidden" />
                          </label>
                          <span className="text-sm text-gray-400 italic">No file chosen</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setJamaahView("list")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Kembali
                    </button>

                    <button
                      onClick={() => alert("Data absen berhasil disimpan!")}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-400 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-xs cursor-not-allowed"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 3: SESI ABSEN (TOMBOL EDIT & HAPUS DISESUAIKAN SAMA DENGAN GAMBAR REFERENSI 1) */}
              {jamaahView === "sesi_absen" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Kelola Sesi Absen
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Daftar master sesi absen yang tersedia untuk digunakan
                        pada setiap kloter.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setJamaahView("list")}
                        className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5" />
                        Kembali
                      </button>
                      <button
                        onClick={handleOpenAddSesi}
                        className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                        Tambah Sesi
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wider uppercase">
                          <tr>
                            <th className="py-4 px-6 w-16 text-center">No</th>
                            <th className="py-4 px-8">Judul Sesi</th>
                            <th className="py-4 px-8 text-center">Jumlah Isi</th>
                            <th className="py-4 px-8 text-center w-52">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {sesiList.map((item, index) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="py-4 px-6 text-center font-bold text-gray-400 text-xs">
                                {index + 1}
                              </td>
                              <td className="py-4 px-8">
                                <span className="font-bold text-gray-900 text-sm">
                                  {item.judul}
                                </span>
                              </td>
                              <td className="py-4 px-8 text-center">
                                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-200">
                                  {item.jumlahIsi}
                                </span>
                              </td>
                              <td className="py-4 px-8 text-center">
                                <div className="inline-flex items-center justify-center gap-3">
                                  {/* TOMBOL EDIT KELAS (WARNA PUTIH, BORDER ABU SOFT, TEKS ABU TUA) */}
                                  <button
                                    onClick={() => handleOpenEditSesi(item)}
                                    className="bg-white hover:bg-gray-50 text-slate-800 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
                                  >
                                    <FiEdit3 className="w-4 h-4 text-slate-600" />
                                    Edit
                                  </button>
                                  {/* TOMBOL HAPUS KELAS (WARNA MERAH SOFT, BORDER MERAH SOFT, TEKS MERAH) */}
                                  <button
                                    onClick={() =>
                                      openDeleteConfirmation(
                                        item.id,
                                        "sesi",
                                        item.judul
                                      )
                                    }
                                    className="bg-red-50/60 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
                                  >
                                    <FiTrash2 className="w-4 h-4 text-red-500" />
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

              {/* VIEW 4: DETAIL JAMAAH */}
              {jamaahView === "detail_jamaah" && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Detail Absen Jamaah: {selectedJamaah?.kloter}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Sesi: <span className="font-bold text-gray-800">{selectedJamaah?.sesi}</span> | Tour Leader: <span className="font-bold text-gray-800">{selectedJamaah?.tourLeader}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setJamaahView("list")}
                      className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <FiArrowLeft className="w-3.5 h-3.5" />
                      Kembali
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="max-h-[520px] overflow-y-auto w-full no-scrollbar">
                      <table className="w-full text-left border-collapse text-sm table-auto">
                        <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wider uppercase sticky top-0 z-30 shadow-xs">
                          <tr>
                            <th className="py-4 px-3 text-center w-12 bg-[#121c2d]">#</th>
                            <th className="py-4 px-4 bg-[#121c2d]">Nama Jamaah</th>
                            <th className="py-4 px-4 bg-[#121c2d]">No. Paspor</th>
                            <th className="py-4 px-4 bg-[#121c2d]">No HP</th>
                            <th className="py-4 px-3 text-center bg-[#121c2d]">JK</th>
                            <th className="py-4 px-4 text-center bg-[#121c2d]">Tgl Lahir</th>
                            <th className="py-4 px-3 text-center bg-[#121c2d]">Kloter</th>
                            <th className="py-4 px-3 text-center bg-[#121c2d]">Bus</th>
                            <th className="py-4 px-4 bg-[#121c2d]">Keterangan</th>
                            <th className="py-4 px-4 text-center bg-[#121c2d]">Status Hadir</th>
                            <th className="py-4 px-4 text-center bg-[#121c2d]">Catatan</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {dummyDetailJamaahData.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-5 px-3 text-center font-bold text-gray-500 text-sm">
                                {idx + 1}
                              </td>
                              <td className="py-5 px-4 font-bold text-gray-900 text-sm leading-snug">
                                {item.nama}
                              </td>
                              <td className="py-5 px-4 text-sm text-gray-800 font-mono whitespace-nowrap">
                                {item.paspor}
                              </td>
                              <td className="py-5 px-4 text-sm text-gray-800 whitespace-nowrap">
                                {item.noHp}
                              </td>
                              <td className="py-5 px-3 text-center font-bold text-gray-800 text-sm">
                                {item.jk}
                              </td>
                              <td className="py-5 px-4 text-center text-sm text-gray-800 whitespace-nowrap">
                                {item.tglLahir}
                              </td>
                              <td className="py-5 px-3 text-center text-sm text-gray-800">
                                {item.kloter}
                              </td>
                              <td className="py-5 px-3 text-center text-sm text-gray-800">
                                {item.bus}
                              </td>
                              <td className="py-5 px-4 text-sm text-gray-700 font-semibold leading-snug">
                                {item.keterangan}
                              </td>
                              <td className="py-5 px-4 text-center whitespace-nowrap">
                                {item.statusHadir === 'HADIR' ? (
                                  <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                                    HADIR
                                  </span>
                                ) : (
                                  <span className="inline-flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs leading-tight">
                                    <span>TIDAK</span>
                                    <span>HADIR</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-5 px-4 text-center text-sm text-gray-500 font-medium">
                                {item.catatan}
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

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
            <p className="text-xs text-gray-600">
              Apakah Anda yakin ingin menghapus data <span className="font-bold text-gray-900">{itemToDelete?.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT SESI ABSEN (SESUAI DENGAN GAMBAR REFERENSI 2: TANPA GARIS BORDER DAN TEKS LEBIH BESAR) */}
      {showAddSesiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#121c2d]">
                {editingSesi ? "Edit Sesi Absen" : "Tambah Sesi Absen"}
              </h3>
              <button
                onClick={() => setShowAddSesiModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveSesi} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Judul Sesi
                </label>
                <input
                  type="text"
                  value={judulSesi}
                  onChange={(e) => setJudulSesi(e.target.value)}
                  placeholder="Contoh: Pesawat, Bus, Hotel..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#121c2d] placeholder:text-gray-400 transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Bagian / Isi Sesi
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIsiField}
                    className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" /> Tambah Bagian
                  </button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {isiSesiList.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const newList = [...isiSesiList];
                          newList[idx] = e.target.value;
                          setIsiSesiList(newList);
                        }}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#121c2d] transition-all"
                        placeholder={`Isi bagian ${idx + 1}`}
                      />
                      {isiSesiList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIsiField(idx)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSesiModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-xs"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}