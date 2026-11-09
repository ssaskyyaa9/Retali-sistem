"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import PageHeader from "@/app/components/PageHeader";
import Topbar from "@/app/components/Topbar";
import { FaUserClock } from "react-icons/fa";
import {
  FiRefreshCw,
  FiPlus,
  FiArrowLeft,
  FiX,
  FiEdit3,
  FiTrash2,
  FiMapPin,
  FiList,
  FiChevronDown,
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiFile,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTanggal(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatJam(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatTanggalPanjang(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-7 h-7 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

// ─── Mapping & Normalization helpers ─────────────────────────────────────────

function normalizeKey(k) {
  return String(k ?? "")
    .toLowerCase()
    .replace(/[\s_\-\.]+/g, "");
}

const COLUMN_MAP = {
  // nama jamaah
  namajama: "jamaah_name",
  namajamaah: "jamaah_name",
  namalengkap: "jamaah_name",
  nama: "jamaah_name",
  fullname: "jamaah_name",
  name: "jamaah_name",
  // passport
  nopaspor: "passport_number",
  nomorpaspor: "passport_number",
  passportnumber: "passport_number",
  passport: "passport_number",
  paspor: "passport_number",
  // phone
  nohp: "phone_number",
  nomorhp: "phone_number",
  hp: "phone_number",
  phone: "phone_number",
  phonenumber: "phone_number",
  telepon: "phone_number",
  notelp: "phone_number",
  nomortelepon: "phone_number",
  // gender
  jeniskelamin: "gender",
  gender: "gender",
  jk: "gender",
  sex: "gender",
  // birth date
  tanggallahir: "birth_date",
  tgllahir: "birth_date",
  birthdate: "birth_date",
  dob: "birth_date",
  // kloter
  kodekloter: "kloter",
  kloter: "kloter",
  kode: "kloter",
  // bus
  nomorbus: "bus",
  nobus: "bus",
  bus: "bus",
  // description / keterangan
  keterangan: "description",
  description: "description",
  ket: "description",
  // attendance status
  statushadir: "attendance_status",
  statuskehadiran: "attendance_status",
  attendancestatus: "attendance_status",
  attendance: "attendance_status",
  status: "attendance_status",
  kehadiran: "attendance_status",
  hadir: "attendance_status",
  // note
  catatan: "note",
  note: "note",
  notes: "note",
};

// Database check constraint: gender IN ('Laki-laki', 'Perempuan') or NULL
function normalizeGender(val) {
  if (!val) return null;
  const s = String(val).trim().toLowerCase();
  if (["l", "laki-laki", "laki", "pria", "male", "m"].includes(s)) return "Laki-laki";
  if (["p", "perempuan", "wanita", "female", "f"].includes(s)) return "Perempuan";
  return null;
}

// Database check constraint: attendance_status IN ('hadir', 'izin', 'sakit', 'alpa', 'belum_hadir')
function normalizeStatus(val) {
  if (!val) return "hadir";
  const s = String(val).trim().toLowerCase();
  if (["hadir", "h", "present", "ya", "1", "true"].includes(s)) return "hadir";
  if (["izin", "i", "permisi"].includes(s)) return "izin";
  if (["sakit", "s", "sick"].includes(s)) return "sakit";
  if (["alpa", "a", "tidak hadir", "tidak_hadir", "absen", "tidak", "0", "false"].includes(s)) return "alpa";
  if (["belum", "belum hadir", "belum_hadir", "pending"].includes(s)) return "belum_hadir";
  return "hadir";
}

// Database type date: must be YYYY-MM-DD or null
function normalizeDate(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split("T")[0];
  }
  const s = String(val).trim();
  if (!s) return null;
  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}`;
  }
  const ymdMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, "0")}-${ymdMatch[3].padStart(2, "0")}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return null;
}

function cleanString(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s === "" ? null : s;
}

function parseExcelRows(workbook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return raw.map((row) => {
    const mapped = {};
    for (const [key, val] of Object.entries(row)) {
      const normKey = normalizeKey(key);
      const dbCol = COLUMN_MAP[normKey];
      if (dbCol) {
        mapped[dbCol] = val;
      }
    }
    return mapped;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RiwayatAbsensiPage() {
  const [activeTab, setActiveTab] = useState("tour_leader");
  const [jamaahView, setJamaahView] = useState("list");
  const [selectedJamaah, setSelectedJamaah] = useState(null);

  // ── Master data ───────────────────────────────────────────────────────────
  const [kloterOptions, setKloterOptions] = useState([]);
  const [tourLeaderProfiles, setTourLeaderProfiles] = useState([]);

  // ── Form Tambah Absen ─────────────────────────────────────────────────────
  const [selectedKloter, setSelectedKloter] = useState("");
  const [selectedSesiAbsen, setSelectedSesiAbsen] = useState("");
  const [selectedBagianSesi, setSelectedBagianSesi] = useState("");

  // ── Excel upload state ────────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const [excelFile, setExcelFile] = useState(null);
  const [excelRows, setExcelRows] = useState([]);
  const [excelError, setExcelError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle|uploading|success|error
  const [uploadMessage, setUploadMessage] = useState("");

  // ── Sesi/Delete modal ────────────────────────────────────────────────────
  const [showAddSesiModal, setShowAddSesiModal] = useState(false);
  const [editingSesi, setEditingSesi] = useState(null);
  const [judulSesi, setJudulSesi] = useState("");
  const [isiSesiList, setIsiSesiList] = useState(["Isi 1"]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // ── Filter ────────────────────────────────────────────────────────────────
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // ── Supabase data ─────────────────────────────────────────────────────────
  const [tlData, setTlData] = useState([]);
  const [muthawifData, setMuthawifData] = useState([]);
  const [jamaahGrupList, setJamaahGrupList] = useState([]);
  const [jamaahDetailList, setJamaahDetailList] = useState([]);
  const [sesiList, setSesiList] = useState([]);

  const [loadingTl, setLoadingTl] = useState(false);
  const [loadingMuthawif, setLoadingMuthawif] = useState(false);
  const [loadingGrup, setLoadingGrup] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingSesi, setLoadingSesi] = useState(false);

  // ── Fetch Tour Leader Absensi (attendance_guide) ───────────────────────────
  const fetchTourLeader = useCallback(async () => {
    setLoadingTl(true);
    try {
      const { data, error } = await supabase
        .from("attendance_guide")
        .select("*")
        .eq("type", "tour_leader")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTlData(data || []);
    } catch (err) {
      console.error("fetchTourLeader:", err.message);
    } finally {
      setLoadingTl(false);
    }
  }, []);

  // ── Fetch Muthawif Absensi (attendance_guide) ──────────────────────────────
  const fetchMuthawif = useCallback(async () => {
    setLoadingMuthawif(true);
    try {
      const { data, error } = await supabase
        .from("attendance_guide")
        .select("*")
        .eq("type", "muthawif")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMuthawifData(data || []);
    } catch (err) {
      console.error("fetchMuthawif:", err.message);
    } finally {
      setLoadingMuthawif(false);
    }
  }, []);

  // ── Fetch Kloters (dari tabel kloter untuk dropdown) ─────────────────────
  const fetchKloters = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("kloter")
        .select("id, name, description, start_date, end_date")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setKloterOptions(data);
      }
    } catch (err) {
      console.error("fetchKloters:", err);
    }
  }, []);

  // ── Fetch Tour Leader Profiles (dari tabel profiles role='tour_leader') ───
  const fetchTourLeaderProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, username, email, phone, kloter_id,
          kloter (id, name, description)
        `)
        .eq("role", "tour_leader");

      if (error) {
        console.error("fetchTourLeaderProfiles error:", error);
        return;
      }
      setTourLeaderProfiles(data || []);
    } catch (err) {
      console.error("fetchTourLeaderProfiles:", err);
    }
  }, []);

  // ── Cari Tour Leader yang ditugaskan ke kloter terpilih ────────────────────
  const getAssignedTourLeader = useCallback(
    (kloterValue) => {
      if (!kloterValue) return "";

      const normalizedSearch = kloterValue.toLowerCase();

      // Cari di data tour leader yang memiliki kloter_id atau nama kloter yang cocok
      const matched = tourLeaderProfiles.filter((tl) => {
        if (!tl) return false;
        // Cocokkan kloter_id jika sama
        if (tl.kloter_id && tl.kloter_id === kloterValue) return true;
        // Cocokkan nama kloter dari relasi kloter
        if (tl.kloter?.name) {
          const tlKloterName = tl.kloter.name.toLowerCase();
          if (
            normalizedSearch === tlKloterName ||
            normalizedSearch.includes(tlKloterName) ||
            tlKloterName.includes(normalizedSearch)
          ) {
            return true;
          }
        }
        return false;
      });

      if (matched.length === 0) return "";
      return matched
        .map((m) => m.username?.trim())
        .filter(Boolean)
        .join(", ");
    },
    [tourLeaderProfiles]
  );

  // ── Fetch Jamaah Grup ─────────────────────────────────────────────────────
  const fetchJamaahGrup = useCallback(async () => {
    setLoadingGrup(true);
    try {
      const { data, error } = await supabase
        .from("attendance_grup")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setJamaahGrupList(data || []);
    } catch (err) {
      console.error("fetchJamaahGrup:", err.message);
    } finally {
      setLoadingGrup(false);
    }
  }, []);

  // ── Fetch Detail per grup (cek via grup_id dan/atau kloter) ───────────────
  const fetchJamaahDetail = useCallback(async (grup) => {
    setLoadingDetail(true);
    try {
      if (!grup) {
        setJamaahDetailList([]);
        return;
      }

      let data = [];
      // 1. Coba cari berdasarkan grup_id
      if (grup.id) {
        const resGrup = await supabase
          .from("attendance_user")
          .select("*")
          .eq("grup_id", grup.id)
          .order("id", { ascending: true });

        if (!resGrup.error && resGrup.data && resGrup.data.length > 0) {
          data = resGrup.data;
        }
      }

      // 2. Jika tidak ditemukan via grup_id, fallback cari berdasarkan kloter
      if (data.length === 0 && grup.kloter) {
        const resKloter = await supabase
          .from("attendance_user")
          .select("*")
          .eq("kloter", grup.kloter)
          .order("id", { ascending: true });

        if (!resKloter.error && resKloter.data) {
          data = resKloter.data;
        }
      }

      setJamaahDetailList(data);
    } catch (err) {
      console.error("fetchJamaahDetail:", err.message);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // ── Fetch Sesi (distinct dari attendance_grup) ───────────────────────────
  const fetchSesi = useCallback(async () => {
    setLoadingSesi(true);
    try {
      const { data, error } = await supabase
        .from("attendance_grup")
        .select("sesi")
        .order("sesi", { ascending: true });
      if (error) throw error;
      const unique = [...new Set((data || []).map((r) => r.sesi).filter(Boolean))];
      setSesiList(unique.map((s, i) => ({ id: i + 1, judul: s, jumlahIsi: 1 })));
    } catch (err) {
      console.error("fetchSesi:", err.message);
    } finally {
      setLoadingSesi(false);
    }
  }, []);

  // ── Delete guide ──────────────────────────────────────────────────────────
  const handleDeleteGuide = useCallback(
    async (id) => {
      const { error } = await supabase.from("attendance_guide").delete().eq("id", id);
      if (error) { alert("Gagal hapus: " + error.message); return; }
      if (activeTab === "tour_leader") setTlData((p) => p.filter((r) => r.id !== id));
      else setMuthawifData((p) => p.filter((r) => r.id !== id));
    },
    [activeTab]
  );

  // ── Delete grup ───────────────────────────────────────────────────────────
  const handleDeleteGrup = useCallback(async (item) => {
    await supabase.from("attendance_user").delete().eq("grup_id", item.id);
    const { error } = await supabase.from("attendance_grup").delete().eq("id", item.id);
    if (error) { alert("Gagal hapus grup: " + error.message); return; }
    setJamaahGrupList((p) => p.filter((r) => r.id !== item.id));
  }, []);

  // ── Initial fetches ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchTourLeader();
    fetchKloters();
    fetchTourLeaderProfiles();
  }, [fetchTourLeader, fetchKloters, fetchTourLeaderProfiles]);

  useEffect(() => {
    if (activeTab === "muthawif") fetchMuthawif();
  }, [activeTab, fetchMuthawif]);

  useEffect(() => {
    if (activeTab === "jamaah") {
      fetchJamaahGrup();
      fetchTourLeaderProfiles();
      fetchKloters();
    }
  }, [activeTab, fetchJamaahGrup, fetchTourLeaderProfiles, fetchKloters]);

  useEffect(() => {
    if (jamaahView === "sesi_absen") fetchSesi();
  }, [jamaahView, fetchSesi]);

  // ── Reset form saat view berubah ──────────────────────────────────────────
  useEffect(() => {
    if (jamaahView !== "tambah_absen") {
      setExcelFile(null);
      setExcelRows([]);
      setExcelError("");
      setUploadStatus("idle");
      setUploadMessage("");
    }
  }, [jamaahView]);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const handleFilter = (e) => e.preventDefault();
  const handleReset = () => { setSearchName(""); setSearchDate(""); };

  const filteredTlData = tlData.filter((item) => {
    const matchName = (item.user_id || "").toLowerCase().includes(searchName.toLowerCase());
    const matchDate = searchDate ? (item.attendance_date || item.created_at || "").startsWith(searchDate) : true;
    return matchName && matchDate;
  });

  const filteredMuthawifData = muthawifData.filter((item) => {
    const matchName = (item.user_id || "").toLowerCase().includes(searchName.toLowerCase());
    const matchDate = searchDate ? (item.attendance_date || item.created_at || "").startsWith(searchDate) : true;
    return matchName && matchDate;
  });

  // ── Delete confirmation ───────────────────────────────────────────────────
  const openDeleteConfirmation = (id, type, name, fullItem = null) => {
    setItemToDelete({ id, type, name, fullItem });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "tour_leader" || itemToDelete.type === "muthawif") {
      await handleDeleteGuide(itemToDelete.id);
    } else if (itemToDelete.type === "jamaah") {
      await handleDeleteGrup(itemToDelete.fullItem || { id: itemToDelete.id });
    } else if (itemToDelete.type === "sesi") {
      setSesiList((p) => p.filter((i) => i.id !== itemToDelete.id));
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // ── Sesi Modal ────────────────────────────────────────────────────────────
  const handleOpenAddSesi = () => {
    setEditingSesi(null); setJudulSesi(""); setIsiSesiList(["Isi 1"]); setShowAddSesiModal(true);
  };
  const handleOpenEditSesi = (item) => {
    setEditingSesi(item); setJudulSesi(item.judul);
    setIsiSesiList(Array.from({ length: item.jumlahIsi }, (_, i) => `Isi ${i + 1}`));
    setShowAddSesiModal(true);
  };
  const handleAddIsiField = () => setIsiSesiList([...isiSesiList, `Isi ${isiSesiList.length + 1}`]);
  const handleRemoveIsiField = (index) => setIsiSesiList(isiSesiList.filter((_, i) => i !== index));

  const handleSaveSesi = (e) => {
    e.preventDefault();
    if (!judulSesi.trim()) return;
    if (editingSesi) {
      setSesiList(sesiList.map((s) => s.id === editingSesi.id ? { ...s, judul: judulSesi, jumlahIsi: isiSesiList.length } : s));
    } else {
      setSesiList([...sesiList, { id: Date.now(), judul: judulSesi, jumlahIsi: isiSesiList.length }]);
    }
    setJudulSesi(""); setIsiSesiList(["Isi 1"]); setShowAddSesiModal(false); setEditingSesi(null);
  };

  const getKoordinat = (item) =>
    item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "-";

  // ═══════════════════════════════════════════════════════════════════════════
  // EXCEL UPLOAD LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelError("");
    setExcelRows([]);
    setUploadStatus("idle");
    setUploadMessage("");

    const allowedExts = [".xlsx", ".xls"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExts.includes(ext)) {
      setExcelError("File harus berformat .xlsx atau .xls");
      return;
    }

    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const rows = parseExcelRows(workbook);

        if (rows.length === 0) {
          setExcelError("File Excel kosong atau tidak ada data yang bisa dibaca.");
          setExcelFile(null);
          return;
        }

        setExcelRows(rows);
      } catch (err) {
        setExcelError("Gagal membaca file Excel: " + err.message);
        setExcelFile(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Simpan ke Supabase (attendance_grup + attendance_user) ─────────────────
  const handleSimpanAbsen = async () => {
    if (!selectedKloter) { alert("Pilih kloter terlebih dahulu."); return; }
    if (!selectedSesiAbsen) { alert("Pilih sesi absen terlebih dahulu."); return; }
    if (!selectedBagianSesi) { alert("Pilih bagian sesi terlebih dahulu."); return; }
    if (excelRows.length === 0) { alert("Upload file Excel terlebih dahulu."); return; }

    const assignedTL = getAssignedTourLeader(selectedKloter);

    setUploadStatus("uploading");
    setUploadMessage("");

    try {
      const sesiGabungan = `${selectedSesiAbsen} – ${selectedBagianSesi}`;

      // 1. Cek atau buat grup di attendance_grup
      const { data: existingGrup, error: grupFetchErr } = await supabase
        .from("attendance_grup")
        .select("id, total_jamaah")
        .eq("kloter", selectedKloter)
        .eq("sesi", sesiGabungan)
        .maybeSingle();

      if (grupFetchErr) throw grupFetchErr;

      let grupId;

      if (existingGrup) {
        grupId = existingGrup.id;
        if (assignedTL) {
          await supabase
            .from("attendance_grup")
            .update({ tour_leader: assignedTL })
            .eq("id", grupId);
        }
      } else {
        const { data: newGrup, error: insertGrupErr } = await supabase
          .from("attendance_grup")
          .insert({
            kloter: selectedKloter,
            sesi: sesiGabungan,
            tour_leader: assignedTL || null,
            total_jamaah: excelRows.length,
          })
          .select("id")
          .single();

        if (insertGrupErr) throw insertGrupErr;
        grupId = newGrup.id;
      }

      // 2. Normalisasi & sanitasi baris untuk attendance_user
      const rowsToInsert = excelRows.map((row) => ({
        jamaah_name: cleanString(row.jamaah_name) || "Jamaah",
        passport_number: cleanString(row.passport_number),
        phone_number: cleanString(row.phone_number),
        gender: normalizeGender(row.gender),
        birth_date: normalizeDate(row.birth_date),
        kloter: cleanString(row.kloter) || selectedKloter,
        bus: cleanString(row.bus),
        description: cleanString(row.description),
        attendance_status: normalizeStatus(row.attendance_status),
        note: cleanString(row.note),
        grup_id: grupId,
      }));

      // 3. Insert ke attendance_user (batch 50)
      const BATCH = 50;
      for (let i = 0; i < rowsToInsert.length; i += BATCH) {
        const batch = rowsToInsert.slice(i, i + BATCH);
        const { error: insertErr } = await supabase
          .from("attendance_user")
          .insert(batch);
        if (insertErr) throw insertErr;
      }

      // 4. Update total_jamaah di attendance_grup
      const { count } = await supabase
        .from("attendance_user")
        .select("*", { count: "exact", head: true })
        .eq("grup_id", grupId);

      if (count !== null) {
        await supabase
          .from("attendance_grup")
          .update({ total_jamaah: count })
          .eq("id", grupId);
      }

      setUploadStatus("success");
      setUploadMessage(
        `✓ ${rowsToInsert.length} data jamaah berhasil disimpan untuk Tour Leader "${assignedTL || "-"}" pada kloter "${selectedKloter}".`
      );

      // Refresh list grup dan kembali ke list
      fetchJamaahGrup();
      setTimeout(() => {
        setJamaahView("list");
      }, 1500);
    } catch (err) {
      setUploadStatus("error");
      setUploadMessage("Gagal menyimpan ke attendance_user: " + err.message);
      console.error("handleSimpanAbsen error:", err);
    }
  };

  const assignedTourLeaderName = getAssignedTourLeader(selectedKloter);

  const isFormReady =
    Boolean(selectedKloter) &&
    Boolean(selectedSesiAbsen) &&
    Boolean(selectedBagianSesi) &&
    excelRows.length > 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col font-sans">
        <Topbar title="Riwayat Absensi" breadcrumbs={["Dashboard", "Riwayat Absensi"]} />

        <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
          <PageHeader
            title="Riwayat Absensi"
            description="Berisi daftar riwayat absensi tour leader, jamaah, dan muthawif yang telah dilakukan."
            icon={<FaUserClock className="w-[26px] h-[26px] text-[#eab308]" />}
          />

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <div className="border-b border-gray-200 flex gap-8">
            {["tour_leader", "jamaah", "muthawif"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setJamaahView("list"); }}
                className={`pb-3 text-base font-bold transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-[#121c2d]"
                    : "border-b-2 border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab === "tour_leader" ? "Tour Leader" : tab === "jamaah" ? "Jamaah" : "Muthawif"}
              </button>
            ))}
          </div>

          {/* ── Tab: Tour Leader & Muthawif ─────────────────────────────── */}
          {activeTab !== "jamaah" && (
            <div className="space-y-6">
              <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
                <div className="w-64">
                  <label className="block text-[14px] font-bold text-gray-800 mb-1.5">
                    {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Cari user ID..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-900 bg-white placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-800 mb-1.5">Tanggal Absen</label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-900 bg-white focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-[14px] font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
              </form>

              <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  {(activeTab === "tour_leader" ? loadingTl : loadingMuthawif) ? (
                    <Spinner />
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wide">
                        <tr>
                          <th className="py-4 px-5 w-16 text-center">NO</th>
                          <th className="py-4 px-6 text-center">TANGGAL</th>
                          <th className="py-4 px-6">USER ID</th>
                          <th className="py-4 px-8 text-center">KLOTER</th>
                          <th className="py-4 px-8 text-center">FOTO</th>
                          <th className="py-4 px-8">KOORDINAT</th>
                          <th className="py-4 px-8 text-center">CATATAN</th>
                          <th className="py-4 px-6 text-center">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {(activeTab === "tour_leader" ? filteredTlData : filteredMuthawifData).length === 0 ? (
                          <tr>
                            <td colSpan="8" className="py-12 text-center text-gray-400 text-sm font-semibold">
                              Tidak ada data yang ditemukan.
                            </td>
                          </tr>
                        ) : (
                          (activeTab === "tour_leader" ? filteredTlData : filteredMuthawifData).map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-4 px-5 text-center font-bold text-gray-500 text-sm">{index + 1}</td>
                              <td className="py-4 px-6 text-center whitespace-nowrap">
                                <span className="block font-bold text-gray-900 text-sm">
                                  {formatJam(item.attendance_date || item.created_at)}
                                </span>
                                <span className="block text-xs font-semibold text-gray-500 mt-0.5">
                                  {formatTanggal(item.attendance_date || item.created_at)}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-bold text-gray-900 text-sm">{item.user_id || "-"}</td>
                              <td className="py-4 px-8 text-center">
                                <span className="inline-block rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-200/60 shadow-2xs whitespace-nowrap">
                                  {item.kloter || "-"}
                                </span>
                              </td>
                              <td className="py-4 px-8 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-2xs mx-auto flex items-center justify-center">
                                  {item.photo_url ? (
                                    <img src={item.photo_url} alt="Absen" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-gray-300 text-xs">–</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-8 text-xs font-bold text-gray-800 font-mono">{getKoordinat(item)}</td>
                              <td className="py-4 px-8 text-xs text-gray-600 max-w-[160px]">{item.note || "-"}</td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  {item.latitude && item.longitude && (
                                    <a
                                      href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 transition-colors w-28 justify-center whitespace-nowrap"
                                    >
                                      <FiMapPin className="w-3.5 h-3.5 text-blue-600" /> Lihat Maps
                                    </a>
                                  )}
                                  <button
                                    onClick={() => openDeleteConfirmation(item.id, activeTab, item.user_id || String(item.id))}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/80 px-3.5 py-1.5 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-100 transition-colors w-28 justify-center whitespace-nowrap"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5 text-red-500" /> Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Jamaah ─────────────────────────────────────────────── */}
          {activeTab === "jamaah" && (
            <div className="space-y-6">

              {/* VIEW 1: LIST GRUP */}
              {jamaahView === "list" && (
                <div className="space-y-6">
                  <div className="bg-[#121c2d] text-white p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold">Data Absen Jamaah</h3>
                      <p className="text-sm text-gray-300 mt-1">Kelola sesi absen dan pantau riwayat absen jamaah per kloter.</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setJamaahView("sesi_absen")}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
                      >
                        <FiList className="w-4 h-4" /> Sesi Absen
                      </button>
                      <button
                        onClick={() => setJamaahView("tambah_absen")}
                        className="bg-white text-[#121c2d] hover:bg-gray-100 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <FiPlus className="w-4 h-4" /> Tambah Absen
                      </button>
                    </div>
                  </div>

                  {loadingGrup ? (
                    <Spinner />
                  ) : (
                    <div className="space-y-4">
                      {jamaahGrupList.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm font-semibold shadow-xs">
                          Belum ada data grup absensi jamaah.
                        </div>
                      ) : (
                        jamaahGrupList.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="font-bold text-gray-900 text-lg">{index + 1}. {item.kloter || "–"}</h4>
                                {item.kloter_date && (
                                  <span className="text-sm text-gray-500 font-semibold">({item.kloter_date})</span>
                                )}
                              </div>
                              <p className="text-[14px] text-gray-700 font-medium">
                                Sesi: <span className="font-bold text-gray-900">{item.sesi || "–"}</span>
                              </p>
                              <p className="text-[14px] text-gray-700 font-medium">
                                Tour Leader: <span className="font-bold text-gray-900">{item.tour_leader || "–"}</span>
                              </p>
                              <p className="text-[14px] text-gray-400 font-medium pt-0.5">
                                Dibuat: {formatTanggalPanjang(item.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 self-end md:self-center">
                              <span className="inline-flex items-center justify-center min-w-[100px] h-10 px-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold shadow-2xs">
                                {item.total_jamaah ?? "–"} Jamaah
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedJamaah(item);
                                  fetchJamaahDetail(item);
                                  setJamaahView("detail_jamaah");
                                }}
                                className="inline-flex items-center justify-center min-w-[100px] h-10 px-4 bg-[#121c2d] hover:bg-[#1f2d47] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => openDeleteConfirmation(item.id, "jamaah", item.kloter || String(item.id), item)}
                                className="inline-flex items-center justify-center min-w-[100px] h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-lg text-xs font-bold transition-all shadow-2xs"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  VIEW 2: TAMBAH ABSEN — sesuai screenshot 2
              ════════════════════════════════════════════════════════════ */}
              {jamaahView === "tambah_absen" && (
                <div className="space-y-6">
                  {/* Step 1: Pilih Konteks Sesi */}
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="bg-blue-50/70 px-6 py-3.5 border-b border-blue-100">
                      <h4 className="text-sm font-bold text-blue-900">1. Pilih Konteks Sesi</h4>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Kloter */}
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Kloter</label>
                        <div className="relative">
                          <select
                            value={selectedKloter}
                            onChange={(e) => setSelectedKloter(e.target.value)}
                            className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Kloter --</option>
                            {kloterOptions.map((k) => {
                              const label = k.description
                                ? `${k.name} - ${k.description}`
                                : k.start_date && k.end_date
                                ? `${k.name} (${formatTanggal(k.start_date)} - ${formatTanggal(k.end_date)})`
                                : k.name;
                              return (
                                <option key={k.id} value={k.name}>
                                  {label}
                                </option>
                              );
                            })}
                            {!kloterOptions.some(k => k.name.includes("394")) && (
                              <option value="394 - Umrah Ultimo (5-13 Desember 2026)">394 - Umrah Ultimo (5-13 Desember 2026)</option>
                            )}
                            {!kloterOptions.some(k => k.name.includes("Ultimo")) && (
                              <option value="Umrah Ultimo Minimalis (17-25 Agustus 2026)">Umrah Ultimo Minimalis (17-25 Agustus 2026)</option>
                            )}
                            {!kloterOptions.some(k => k.name.includes("Itikaf")) && (
                              <option value="Umrah Itikaf Mandiri (21 Februari - 6 Maret 2027)">Umrah Itikaf Mandiri (21 Februari - 6 Maret 2027)</option>
                            )}
                          </select>
                          <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Sesi Absen */}
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Sesi Absen</label>
                        <div className="relative">
                          <select
                            value={selectedSesiAbsen}
                            onChange={(e) => setSelectedSesiAbsen(e.target.value)}
                            className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Sesi --</option>
                            <option value="Bus">Bus</option>
                            <option value="Pesawat">Pesawat</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Jeddah - Madinah">Jeddah - Madinah</option>
                            <option value="Madinah - Mekkah">Madinah - Mekkah</option>
                          </select>
                          <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Bagian Sesi Absen */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-800 mb-2">Bagian Sesi Absen</label>
                        <div className="relative">
                          <select
                            value={selectedBagianSesi}
                            onChange={(e) => setSelectedBagianSesi(e.target.value)}
                            className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Bagian --</option>
                            <option value="Jakarta - mekkah">Jakarta - mekkah</option>
                            <option value="Jeddah - Madinah – Bus Jeddah - Madinah">Jeddah - Madinah – Bus Jeddah - Madinah</option>
                            <option value="Bus 1">Bus 1</option>
                            <option value="Bus 2">Bus 2</option>
                            <option value="Keberangkatan">Keberangkatan</option>
                            <option value="Kepulangan">Kepulangan</option>
                          </select>
                          <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Upload File Excel per Tour Leader (Persis seperti Screenshot 2) */}
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="bg-blue-50/70 px-6 py-3.5 border-b border-blue-100">
                      <h4 className="text-sm font-bold text-blue-900">2. Upload File Excel per Tour Leader</h4>
                    </div>
                    <div className="p-6">
                      <div className="border border-blue-500 rounded-2xl p-5 bg-white space-y-4 shadow-2xs">
                        <div>
                          <h5 className="text-sm font-bold text-gray-900">
                            Tour Leader:{" "}
                            <span className={assignedTourLeaderName ? "text-[#121c2d] font-bold" : "text-gray-400 font-normal italic"}>
                              {assignedTourLeaderName || (selectedKloter ? "Tidak ada Tour Leader yang ditugaskan pada kloter ini" : "- (Pilih kloter terlebih dahulu)")}
                            </span>
                          </h5>
                          <p className="text-xs text-gray-500 mt-1">
                            Format Excel: nama_jamaah, no_paspor, no_hp, jenis_kelamin, tanggal_lahir, kode_kloter, nomor_bus, keterangan
                          </p>
                        </div>

                        {/* File Input container persis screenshot 2 */}
                        <div className="border border-gray-300 rounded-xl p-2 flex items-center gap-3 bg-white">
                          <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center shadow-2xs">
                            Choose File
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".xlsx, .xls"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                          <span className="text-sm text-gray-500 truncate">
                            {excelFile ? excelFile.name : "No file chosen"}
                          </span>
                          {excelFile && (
                            <button
                              type="button"
                              onClick={() => {
                                setExcelFile(null);
                                setExcelRows([]);
                                setExcelError("");
                                setUploadStatus("idle");
                                setUploadMessage("");
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="ml-auto text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1"
                            >
                              Hapus File
                            </button>
                          )}
                        </div>

                        {excelError && (
                          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-red-700 font-semibold">{excelError}</p>
                          </div>
                        )}

                        {/* Preview data */}
                        {excelRows.length > 0 && (
                          <div className="pt-2">
                            <p className="text-xs font-bold text-gray-700 mb-2">
                              Preview Data ({excelRows.length} Jamaah terdeteksi):
                            </p>
                            <div className="overflow-x-auto rounded-xl border border-gray-200 no-scrollbar max-h-48">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0">
                                  <tr>
                                    <th className="px-3 py-2 whitespace-nowrap">#</th>
                                    <th className="px-3 py-2 whitespace-nowrap">Nama Jamaah</th>
                                    <th className="px-3 py-2 whitespace-nowrap">No. Paspor</th>
                                    <th className="px-3 py-2 whitespace-nowrap">No. HP</th>
                                    <th className="px-3 py-2 whitespace-nowrap">JK</th>
                                    <th className="px-3 py-2 whitespace-nowrap">Tgl Lahir</th>
                                    <th className="px-3 py-2 whitespace-nowrap">Bus</th>
                                    <th className="px-3 py-2 whitespace-nowrap">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {excelRows.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 text-gray-500 font-bold">{i + 1}</td>
                                      <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{cleanString(row.jamaah_name) || "-"}</td>
                                      <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">{cleanString(row.passport_number) || "-"}</td>
                                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{cleanString(row.phone_number) || "-"}</td>
                                      <td className="px-3 py-2 text-center text-gray-700">{normalizeGender(row.gender) || "-"}</td>
                                      <td className="px-3 py-2 text-center text-gray-700">{normalizeDate(row.birth_date) || "-"}</td>
                                      <td className="px-3 py-2 text-center text-gray-700">{cleanString(row.bus) || "-"}</td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                          normalizeStatus(row.attendance_status) === "hadir"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                            : "bg-rose-50 text-rose-700 border border-rose-300"
                                        }`}>
                                          {normalizeStatus(row.attendance_status)}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {excelRows.length > 5 && (
                              <p className="text-xs text-gray-400 mt-1.5 font-medium text-right">
                                + {excelRows.length - 5} data lainnya akan otomatis di-insert
                              </p>
                            )}
                          </div>
                        )}

                        {uploadStatus === "success" && (
                          <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                            <FiCheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-emerald-800 font-semibold">{uploadMessage}</p>
                          </div>
                        )}
                        {uploadStatus === "error" && (
                          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-red-700 font-semibold">{uploadMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions persis screenshot 2 */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setJamaahView("list")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FiArrowLeft className="w-4 h-4" /> Kembali
                    </button>

                    <button
                      onClick={handleSimpanAbsen}
                      disabled={!isFormReady || uploadStatus === "uploading"}
                      className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-xs flex items-center gap-2 ${
                        isFormReady && uploadStatus !== "uploading"
                          ? "bg-[#121c2d] hover:bg-[#1f2d47] text-white cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {uploadStatus === "uploading" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Selesai"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 3: SESI ABSEN */}
              {jamaahView === "sesi_absen" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Kelola Sesi Absen</h3>
                      <p className="text-xs text-gray-500 mt-1">Daftar master sesi absen yang tersedia untuk digunakan pada setiap kloter.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setJamaahView("list")}
                        className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5" /> Kembali
                      </button>
                      <button
                        onClick={handleOpenAddSesi}
                        className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <FiPlus className="w-4 h-4" /> Tambah Sesi
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      {loadingSesi ? (
                        <Spinner />
                      ) : (
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
                            {sesiList.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="py-10 text-center text-gray-400 text-sm font-semibold">
                                  Belum ada sesi absen.
                                </td>
                              </tr>
                            ) : (
                              sesiList.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-4 px-6 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                                  <td className="py-4 px-8">
                                    <span className="font-bold text-gray-900 text-sm">{item.judul}</span>
                                  </td>
                                  <td className="py-4 px-8 text-center">
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-200">
                                      {item.jumlahIsi}
                                    </span>
                                  </td>
                                  <td className="py-4 px-8 text-center">
                                    <div className="inline-flex items-center justify-center gap-3">
                                      <button
                                        onClick={() => handleOpenEditSesi(item)}
                                        className="bg-white hover:bg-gray-50 text-slate-800 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
                                      >
                                        <FiEdit3 className="w-4 h-4 text-slate-600" /> Edit
                                      </button>
                                      <button
                                        onClick={() => openDeleteConfirmation(item.id, "sesi", item.judul)}
                                        className="bg-red-50/60 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
                                      >
                                        <FiTrash2 className="w-4 h-4 text-red-500" /> Hapus
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}
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
                        Sesi: <span className="font-bold text-gray-800">{selectedJamaah?.sesi}</span> | Tour Leader:{" "}
                        <span className="font-bold text-gray-800">{selectedJamaah?.tour_leader || "-"}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setJamaahView("list")}
                      className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <FiArrowLeft className="w-3.5 h-3.5" /> Kembali
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="max-h-[520px] overflow-y-auto w-full no-scrollbar">
                      {loadingDetail ? (
                        <Spinner />
                      ) : (
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
                            {jamaahDetailList.length === 0 ? (
                              <tr>
                                <td colSpan="11" className="py-12 text-center text-gray-400 text-sm font-semibold">
                                  Tidak ada data jamaah pada sesi ini.
                                </td>
                              </tr>
                            ) : (
                              jamaahDetailList.map((item, idx) => {
                                const st = (item.attendance_status || "").toLowerCase();
                                return (
                                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="py-5 px-3 text-center font-bold text-gray-500 text-sm">{idx + 1}</td>
                                    <td className="py-5 px-4 font-bold text-gray-900 text-sm leading-snug">{item.jamaah_name || "-"}</td>
                                    <td className="py-5 px-4 text-sm text-gray-800 font-mono whitespace-nowrap">{item.passport_number || "-"}</td>
                                    <td className="py-5 px-4 text-sm text-gray-800 whitespace-nowrap">{item.phone_number || "-"}</td>
                                    <td className="py-5 px-3 text-center font-bold text-gray-800 text-sm">{item.gender || "-"}</td>
                                    <td className="py-5 px-4 text-center text-sm text-gray-800 whitespace-nowrap">{item.birth_date || "-"}</td>
                                    <td className="py-5 px-3 text-center text-sm text-gray-800">{item.kloter || "-"}</td>
                                    <td className="py-5 px-3 text-center text-sm text-gray-800">{item.bus || "-"}</td>
                                    <td className="py-5 px-4 text-sm text-gray-700 font-semibold leading-snug">{item.description || "-"}</td>
                                    <td className="py-5 px-4 text-center whitespace-nowrap">
                                      {st === "hadir" ? (
                                        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs uppercase">
                                          Hadir
                                        </span>
                                      ) : st === "izin" ? (
                                        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs uppercase">
                                          Izin
                                        </span>
                                      ) : st === "sakit" ? (
                                        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs uppercase">
                                          Sakit
                                        </span>
                                      ) : (
                                        <span className="inline-flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs leading-tight uppercase">
                                          <span>{st === "alpa" ? "Alpa" : "Tidak Hadir"}</span>
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-5 px-4 text-center text-sm text-gray-500 font-medium">{item.note || "-"}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Modal Konfirmasi Hapus ──────────────────────────────────────── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
            <p className="text-xs text-gray-600">
              Apakah Anda yakin ingin menghapus data{" "}
              <span className="font-bold text-gray-900">{itemToDelete?.name}</span>?
              Tindakan ini tidak dapat dibatalkan.
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

      {/* ── Modal Tambah/Edit Sesi ──────────────────────────────────────── */}
      {showAddSesiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#121c2d]">
                {editingSesi ? "Edit Sesi Absen" : "Tambah Sesi Absen"}
              </h3>
              <button onClick={() => setShowAddSesiModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveSesi} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Judul Sesi</label>
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
                  <label className="block text-sm font-bold text-gray-800">Bagian / Isi Sesi</label>
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
                        <button type="button" onClick={() => handleRemoveIsiField(idx)} className="text-red-500 hover:text-red-700 p-2">
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
