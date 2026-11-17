"use client";

import React, { useState, useEffect } from "react";
import { TbRefresh, TbDownload, TbTrash, TbAlertTriangle, TbX, TbSearch, TbChevronLeft, TbChevronRight, TbLoader2, TbQrcode, TbCopy, TbCheck, TbEye } from "react-icons/tb";
import Topbar from "@/app/components/Topbar";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

export default function RiwayatScanPage() {
  const [activeTab, setActiveTab] = useState("koper");
  const [dataKoper, setDataKoper] = useState([]);
  const [dataPaspor, setDataPaspor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterKloter, setFilterKloter] = useState("");
  const [listKloter, setListKloter] = useState([]); // <-- State untuk menampung kloter unik dari database
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  // State untuk Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [tourLeaderInfo, setTourLeaderInfo] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setLoading(true);
    setActiveTab(tab);
    setFilterKloter("");
    setCurrentPage(1);
  };

  // Fungsi untuk mengambil SEMUA daftar kloter unik yang ada di Supabase
  const fetchAllKloterList = async () => {
    try {
      const tableName = activeTab === "koper" ? "koper" : "passport_scans";
      const { data, error } = await supabase.from(tableName).select("kloter");
      
      if (!error && data) {
        // Ambil nilai kloter yang unik, buang yang null/kosong, lalu urutkan
        const uniqueKloter = [...new Set(data.map((item) => item.kloter).filter(Boolean))].sort((a, b) => {
          // Sorting natural agar urut misal Kloter 1, Kloter 2, dst atau angka biasa
          return String(a).localeCompare(String(b), undefined, { numeric: true });
        });
        setListKloter(uniqueKloter);
      }
    } catch (err) {
      console.error("Error fetching unique kloter:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "koper") {
        let queryKoper = supabase.from("koper").select("*, profiles:scanned_by(id, username, role, email)");
        if (searchQuery.trim() !== "") {
          queryKoper = queryKoper.ilike("nama_pemilik", `%${searchQuery}%`);
        }
        if (filterTanggal) {
          queryKoper = queryKoper.gte("created_at", `${filterTanggal}T00:00:00`)
                                 .lte("created_at", `${filterTanggal}T23:59:59`);
        }
        if (filterKloter) {
          queryKoper = queryKoper.eq("kloter", filterKloter);
        }
        let { data: resKoper, error: errKoper } = await queryKoper.order("no_urutan", { ascending: true, nullsFirst: false });
        if (errKoper) {
          // Fallback order by created_at jika kolom no_urutan belum dibuat di Supabase
          const resFallback = await queryKoper.order("created_at", { ascending: false });
          resKoper = resFallback.data;
        } else if (resKoper) {
          resKoper.sort((a, b) => {
            if (a.no_urutan != null && b.no_urutan != null) return a.no_urutan - b.no_urutan;
            if (a.no_urutan != null) return -1;
            if (b.no_urutan != null) return 1;
            return 0;
          });
        }
        setDataKoper(resKoper || []);
      } else {
        let queryPaspor = supabase.from("passport_scans").select("*, profiles:scanned_by(id, username, role, email)");
        if (searchQuery.trim() !== "") {
          queryPaspor = queryPaspor.ilike("owner_name", `%${searchQuery}%`);
        }
        if (filterTanggal) {
          queryPaspor = queryPaspor.gte("scanned_at", `${filterTanggal}T00:00:00`)
                                 .lte("scanned_at", `${filterTanggal}T23:59:59`);
        }
        if (filterKloter) {
          queryPaspor = queryPaspor.eq("kloter", filterKloter);
        }
        let { data: resPaspor, error: errPaspor } = await queryPaspor.order("no_urutan", { ascending: true, nullsFirst: false });
        if (errPaspor) {
          // Fallback order by scanned_at jika kolom no_urutan belum dibuat di Supabase
          const resFallback = await queryPaspor.order("scanned_at", { ascending: false });
          resPaspor = resFallback.data;
        } else if (resPaspor) {
          resPaspor.sort((a, b) => {
            if (a.no_urutan != null && b.no_urutan != null) return a.no_urutan - b.no_urutan;
            if (a.no_urutan != null) return -1;
            if (b.no_urutan != null) return 1;
            return 0;
          });
        }
        setDataPaspor(resPaspor || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetch list kloter setiap kali tab berubah
  useEffect(() => {
    fetchAllKloterList();
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    const delayDebounce = setTimeout(() => { fetchData(); }, 250);

    return () => clearTimeout(delayDebounce);
  }, [activeTab, searchQuery, filterTanggal, filterKloter]);

  // Realtime subscription agar saat di-scan di mobile, tabel langsung terupdate
  useEffect(() => {
    const channel = supabase
      .channel("realtime-scan-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "koper" }, () => {
        fetchData();
        fetchAllKloterList();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "passport_scans" }, () => {
        fetchData();
        fetchAllKloterList();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const handleReset = () => {
    setSearchQuery("");
    setFilterTanggal("");
    setFilterKloter("");
    setCurrentPage(1);
  };

  const activeData = activeTab === "koper" ? dataKoper : dataPaspor;

  const handleExportExcel = () => {
    if (activeData.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    let rows = [];
    if (activeTab === "koper") {
      rows.push(["No", "Kode Koper", "Nama Pemilik", "No Telepon", "Kloter", "Waktu Scan"]);
      activeData.forEach((item, index) => {
        const petugas = item.profiles?.username
          ? `${item.profiles.username} (${item.profiles.role === "muthawif" ? "Muthawif" : "Tour Leader"})`
          : "-";
        rows.push([
          item.no_urutan != null ? item.no_urutan : index + 1,
          item.kode_koper || "-",
          item.nama_pemilik || "-",
          item.nomor_telepon || "-",
          item.kloter || "-",
          item.created_at ? new Date(item.created_at).toLocaleString("id-ID") : "-"
        ]);
      });
    } else {
      rows.push(["No", "No Paspor", "Nama Pemilik", "Telepon", "Kloter", "Petugas Scan", "Waktu Scan"]);
      activeData.forEach((item, index) => {
        const petugas = item.profiles?.username
          ? `${item.profiles.username} (${item.profiles.role === "muthawif" ? "Muthawif" : "Tour Leader"})`
          : "-";
        rows.push([
          item.no_urutan != null ? item.no_urutan : index + 1,
          item.passport_number || "-",
          item.owner_name || "-",
          item.phone || "-",
          item.kloter || "-",
          item.scanned_at ? new Date(item.scanned_at).toLocaleString("id-ID") : "-"
        ]);
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === "koper" ? "Riwayat Koper" : "Riwayat Paspor");

    const headerStyle = {
      fill: { fgColor: { rgb: "263754" } },
      font: { color: { rgb: "FFFFFF" }, bold: true, sz: 11 },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;
      worksheet[address].s = headerStyle;
    }

    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 18 }, // Kode Koper / Paspor
      { wch: 25 }, // Nama Pemilik
      { wch: 18 }, // Telepon
      { wch: 15 }, // Kloter
      { wch: 22 }, // Waktu Scan
    ];

    const fileName = `Laporan_Riwayat_Scan_${activeTab === "koper" ? "Koper" : "Paspor"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const openDeleteModal = (id) => {
    setSelectedIdToDelete(id);
    setShowDeleteModal(true);
  };

  // Fungsi untuk membuka Modal Detail & Mencari Tour Leader / Muthawif yang melakukan scan
  const openDetailModal = async (item) => {
    setSelectedDetailItem(item);
    setShowDetailModal(true);
    setTourLeaderInfo(null);
    setLoadingDetail(true);

    try {
      // 1. Cek apakah relasi profiles sudah ada dari query awal
      if (item.profiles && item.profiles.username) {
        setTourLeaderInfo(item.profiles);
        setLoadingDetail(false);
        return;
      }

      // 2. Cek id petugas dari scanned_by atau user_id
      const userId = item.scanned_by || item.user_id || item.created_by;
      
      if (userId) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, username, role, email")
          .eq("id", userId)
          .maybeSingle();

        if (!error && profileData && profileData.username) {
          setTourLeaderInfo(profileData);
          setLoadingDetail(false);
          return;
        }
      }

      // 3. Fallback cerdas: cari Tour Leader / Muthawif dari kloter terkait jika belum terhubung
      if (item.kloter) {
        const { data: kloterData } = await supabase
          .from("kloter")
          .select("id, name")
          .ilike("name", item.kloter.trim())
          .maybeSingle();

        if (kloterData?.id) {
          const { data: tlProfile } = await supabase
            .from("profiles")
            .select("id, username, role, email")
            .eq("kloter_id", kloterData.id)
            .in("role", ["tour_leader", "muthawif"])
            .limit(1)
            .maybeSingle();

          if (tlProfile && tlProfile.username) {
            setTourLeaderInfo(tlProfile);

            // Perbarui scanned_by di Supabase agar permanen
            const tableName = activeTab === "koper" ? "koper" : "passport_scans";
            await supabase.from(tableName).update({ scanned_by: tlProfile.id }).eq("id", item.id);

            setLoadingDetail(false);
            return;
          }
        }
      }

      setTourLeaderInfo({ username: "Data Tour Leader tidak terikat langsung", role: "-" });
    } catch (err) {
      console.error("Error fetching tour leader detail:", err);
      setTourLeaderInfo({ username: "Gagal memuat data Tour Leader", role: "-" });
    } finally {
      setLoadingDetail(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedIdToDelete) return;
    setIsDeleting(true);

    try {
      const tableName = activeTab === "koper" ? "koper" : "passport_scans";
      const { error } = await supabase.from(tableName).delete().eq("id", selectedIdToDelete);
      
      if (error) throw error;

      setShowDeleteModal(false);
      setSelectedIdToDelete(null);
      fetchData();
      fetchAllKloterList();
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(activeData.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = activeData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col">
      <Topbar title="Riwayat Scan" breadcrumbs={["Dashboard", "Riwayat Scan"]} />

      <div className="flex-1 overflow-y-auto p-6 w-full max-w-7xl mx-auto no-scrollbar">
        <div className="bg-gradient-to-r from-[#1e293b] to-[#263754] text-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-wide">
              {activeTab === "koper" ? "Riwayat Scan Koper" : "Riwayat Scan Paspor"}
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              {activeTab === "koper"
                ? "Pantau status pemindaian koper jemaah secara real-time."
                : "Pantau status pemindaian paspor jemaah secara praktis dan terintegrasi."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-200 mt-6 mb-5">
          <button onClick={() => handleTabChange("koper")} className={`pb-2.5 px-5 text-sm font-bold border-b-2 transition-all duration-200 ${
              activeTab === "koper"
                ? "border-[#263754] text-[#263754]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Scan Koper
          </button>
          <button
            onClick={() => handleTabChange("paspor")}
            className={`pb-2.5 px-5 text-sm font-bold border-b-2 transition-all duration-200 ${
              activeTab === "paspor"
                ? "border-[#263754] text-[#263754]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Scan Paspor
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all duration-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 flex-nowrap">
              {/* Search Box */}
              <div className="w-64">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <TbSearch className="w-4 h-4" />
                  </span>
                  <input type="text" placeholder={activeTab === "koper" ? "Cari pemilik koper..." : "Cari pemilik paspor..."} value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-gray-700 bg-gray-50 focus:outline-none focus:border-[#263754] transition-colors"
                  />
                </div>
              </div>

              {/* Tanggal */}
              <div className="w-40">
                <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-600 bg-gray-50 focus:outline-none focus:border-[#263754] transition-colors" />
              </div>

              {/* Kloter - Dinamis mengambil seluruh opsi unik dari database */}
              <div className="w-40">
                <select
                  value={filterKloter}
                  onChange={(e) => setFilterKloter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-600 bg-gray-50 focus:outline-none focus:border-[#263754] transition-colors"
                >
                  <option value="">Semua Kloter</option>
                  {listKloter.map((kloterVal, idx) => (
                    <option key={idx} value={kloterVal}>
                      {kloterVal}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              <div>
                <button onClick={handleReset} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap" >
                  <TbRefresh className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer" >
                <TbDownload className="w-4 h-4" /> Export Excel
              </button>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider font-semibold">
              {activeTab === "koper" ? (
                <tr>
                  <th className="px-5 py-4 text-center w-16">No</th>
                  <th className="px-5 py-4">Kode Koper</th>
                  <th className="px-5 py-4">Nama Pemilik</th>
                  <th className="px-5 py-4">No Telepon</th>
                  <th className="px-5 py-4">Kloter</th>
                  <th className="px-5 py-4 text-center">Waktu Scan</th>
                  <th className="px-5 py-4 text-center w-28">Aksi</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-5 py-4 text-center w-16">No</th>
                  <th className="px-5 py-4">No Paspor</th>
                  <th className="px-5 py-4">Nama Pemilik</th>
                  <th className="px-5 py-4">Telepon</th>
                  <th className="px-5 py-4">Kloter</th>
                  <th className="px-5 py-4 text-center">Waktu Scan</th>
                  <th className="px-5 py-4 text-center w-28">Aksi</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-normal transition-opacity duration-150">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <TbLoader2 className="w-7 h-7 animate-spin text-[#263754]" />
                      <span className="text-xs font-medium">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    {filterKloter ? `Belum ada data pada ${filterKloter}` : (activeTab === "koper" ? "Belum ada data scan koper" : "Data kosong")}
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-center text-gray-500 text-sm whitespace-nowrap font-medium">
                      {item.no_urutan != null ? item.no_urutan : indexOfFirstItem + index + 1}
                    </td>
                    
                    {activeTab === "koper" ? (
                      <>
                        <td className="px-5 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">{item.kode_koper}</td>
                        <td className="px-5 py-4 text-gray-800 text-sm whitespace-nowrap">{item.nama_pemilik}</td>
                        <td className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">{item.nomor_telepon}</td>
                        <td className="px-5 py-4 font-semibold text-[#263754] text-sm whitespace-nowrap">
                          {item.kloter || "-"}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {item.created_at ? new Date(item.created_at).toLocaleString("id-ID") : "-"}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">{item.passport_number}</td>
                        <td className="px-5 py-4 text-gray-800 text-sm whitespace-nowrap">{item.owner_name}</td>
                        <td className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">{item.phone}</td>
                        <td className="px-5 py-4 font-semibold text-[#263754] text-sm whitespace-nowrap">
                          {item.kloter || "-"}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {item.scanned_at ? new Date(item.scanned_at).toLocaleString("id-ID") : "-"}
                          </span>
                        </td>
                      </>
                    )}

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openDetailModal(item)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Lihat Detail & Petugas"
                        >
                          <TbEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(item.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Hapus Data"
                        >
                          <TbTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {activeData.length > 0 && !loading && (
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div>
                Menampilkan halaman <span className="font-semibold text-gray-800">{currentPage}</span> dari{" "}
                <span className="font-semibold text-gray-800">{totalPages}</span> -{" "}
                <span className="font-semibold text-gray-800">{activeData.length}</span> data
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <TbChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#263754] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" >
                  <TbChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Informasi & Tour Leader */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs transition-all p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 border border-gray-100">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#1e293b] to-[#263754] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-400">
                  <TbEye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Detail Informasi & Petugas Scan</h3>
                  <p className="text-[11px] text-slate-300">Rangkuman lengkap data pemindaian dan Tour Leader</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <TbX className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Informasi Utama Data Scan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Informasi Data {activeTab === "koper" ? "Koper" : "Paspor"}</h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 gap-3 text-xs">
                  {activeTab === "koper" ? (
                    <>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Kode Koper</span>
                        <span className="font-semibold text-gray-900">{selectedDetailItem?.kode_koper || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Nama Pemilik</span>
                        <span className="font-semibold text-gray-900">{selectedDetailItem?.nama_pemilik || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Nomor Telepon</span>
                        <span className="font-semibold text-gray-800">{selectedDetailItem?.nomor_telepon || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Kloter</span>
                        <span className="font-semibold text-[#263754]">{selectedDetailItem?.kloter || "-"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400 block mb-0.5">Waktu Scan (Created At)</span>
                        <span className="font-semibold text-emerald-600">
                          {selectedDetailItem?.created_at ? new Date(selectedDetailItem.created_at).toLocaleString("id-ID") : "-"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Nomor Paspor</span>
                        <span className="font-semibold text-gray-900">{selectedDetailItem?.passport_number || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Nama Pemilik</span>
                        <span className="font-semibold text-gray-900">{selectedDetailItem?.owner_name || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Nomor Telepon</span>
                        <span className="font-semibold text-gray-800">{selectedDetailItem?.phone || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Kloter</span>
                        <span className="font-semibold text-[#263754]">{selectedDetailItem?.kloter || "-"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400 block mb-0.5">Waktu Scan (Scanned At)</span>
                        <span className="font-semibold text-emerald-600">
                          {selectedDetailItem?.scanned_at ? new Date(selectedDetailItem.scanned_at).toLocaleString("id-ID") : "-"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Informasi Tour Leader / Muthawif yang Melakukan Scan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Petugas Scan (Tour Leader / Muthawif)
                </h4>
                {loadingDetail ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex items-center justify-center gap-2 text-gray-500 text-xs">
                    <TbLoader2 className="w-5 h-5 animate-spin text-[#263754]" />
                    <span>Mencari data petugas...</span>
                  </div>
                ) : (
                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#263754] flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200 uppercase">
                      {tourLeaderInfo?.username &&
                      tourLeaderInfo.username !== "Data Tour Leader tidak terikat langsung" &&
                      tourLeaderInfo.username !== "Tidak ditemukan / Sistem Otomatis" &&
                      tourLeaderInfo.username !== "Gagal memuat data Tour Leader"
                        ? tourLeaderInfo.username.charAt(0).toUpperCase()
                        : "TL"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Nama Petugas
                        </span>
                        {tourLeaderInfo?.role && tourLeaderInfo.role !== "-" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase">
                            {tourLeaderInfo.role === "muthawif" ? "Muthawif" : "Tour Leader"}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 text-sm block truncate">
                        {tourLeaderInfo?.username || "Tidak Diketahui"}
                      </span>
                      {tourLeaderInfo?.email && (
                        <span className="text-[11px] text-gray-500 block truncate">
                          {tourLeaderInfo.email}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-end">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-[#263754] text-white text-xs font-semibold hover:bg-[#1e293b] transition-colors shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 m-4 transform transition-all animate-in fade-in zoom-in-95 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <TbAlertTriangle className="w-5 h-5" />
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors" >
                <TbX className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1"> Konfirmasi Hapus Data </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed"> Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan. </p>

            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors" >
                Batal
              </button>
              <button type="button" onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50" >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}