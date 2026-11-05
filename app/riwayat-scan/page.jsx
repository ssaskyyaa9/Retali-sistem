"use client";

import React, { useState, useEffect } from "react";
import { TbRefresh, TbDownload, TbTrash, TbAlertTriangle, TbX, TbSearch, TbChevronLeft, TbChevronRight, TbLoader2 } from "react-icons/tb";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setLoading(true);
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "koper") {
        let queryKoper = supabase.from("koper").select("*");
        if (searchQuery.trim() !== "") {
          queryKoper = queryKoper.ilike("nama_pemilik", `%${searchQuery}%`);
        }
        if (filterTanggal) {
          queryKoper = queryKoper.gte("created_at", `${filterTanggal}T00:00:00`)
                               .lte("created_at", `${filterTanggal}T23:59:59`);
        }
        const { data: resKoper } = await queryKoper.order("created_at", { ascending: false });
        setDataKoper(resKoper || []);
      } else {
        let queryPaspor = supabase.from("passport_scans").select("*");
        if (searchQuery.trim() !== "") {
          queryPaspor = queryPaspor.ilike("owner_name", `%${searchQuery}%`);
        }
        if (filterTanggal) {
          queryPaspor = queryPaspor.gte("scanned_at", `${filterTanggal}T00:00:00`)
                               .lte("scanned_at", `${filterTanggal}T23:59:59`);
        }
        const { data: resPaspor } = await queryPaspor.order("scanned_at", { ascending: false });
        setDataPaspor(resPaspor || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounce = setTimeout(() => { fetchData(); }, 250);

    return () => clearTimeout(delayDebounce);
  }, [activeTab, searchQuery, filterTanggal]);

  const handleReset = () => {
    setSearchQuery("");
    setFilterTanggal("");
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
        rows.push([
          index + 1,
          item.kode_koper || "-",
          item.nama_pemilik || "-",
          item.nomor_telepon || "-",
          item.kloter || "-",
          item.created_at ? new Date(item.created_at).toLocaleString("id-ID") : "-"
        ]);
      });
    } else {
      rows.push(["No", "No Paspor", "Nama Pemilik", "Telepon", "Kloter", "Waktu Scan"]);
      activeData.forEach((item, index) => {
        rows.push([
          index + 1,
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
          <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="w-77">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <TbSearch className="w-4 h-4" />
                  </span>
                  <input type="text" placeholder={activeTab === "koper" ? "Cari pemilik koper..." : "Cari pemilik paspor..."} value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-gray-700 bg-gray-50 focus:outline-none focus:border-[#263754] transition-colors"
                  />
                </div>
              </div>

              <div className="w-48">
                <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-xs text-gray-600 bg-gray-50 focus:outline-none focus:border-[#263754] transition-colors" />
              </div>

              <button onClick={handleReset} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all" >
                <TbRefresh className="w-4 h-4" /> Reset
              </button>
            </div>

            <div>
              <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all" >
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
                  <th className="px-5 py-4 text-center w-20">Aksi</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-5 py-4 text-center w-16">No</th>
                  <th className="px-5 py-4">No Paspor</th>
                  <th className="px-5 py-4">Nama Pemilik</th>
                  <th className="px-5 py-4">Telepon</th>
                  <th className="px-5 py-4">Kloter</th>
                  <th className="px-5 py-4 text-center">Waktu Scan</th>
                  <th className="px-5 py-4 text-center w-20">Aksi</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-normal transition-opacity duration-150">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <TbLoader2 className="w-7 h-7 animate-spin text-[#263754]" />
                      <span className="text-xs font-medium">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    {activeTab === "koper" ? "Belum ada data scan koper" : "Data kosong"}
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-center text-gray-500 text-sm whitespace-nowrap">
                      {indexOfFirstItem + index + 1}
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
                      <button 
                        onClick={() => openDeleteModal(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Hapus Data"
                      >
                        <TbTrash className="w-4 h-4" />
                      </button>
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