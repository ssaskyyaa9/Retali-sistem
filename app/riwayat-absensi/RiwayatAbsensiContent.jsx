"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  FiClock,
  FiCalendar,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
  FiUsers,
  FiEye,
  FiImage,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

// ─── Default Master Sesi (Fallback jika tabel belum dimigrasi di database) ───
// A. Sesi Khusus Jamaah (kategori: 'jamaah' - pasti untuk semua jamaah)
const DEFAULT_JAMAAH_SESI = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    judul: "Keberangkatan Bandara (Departure)",
    kategori: "jamaah",
    target_jam_mulai: "",
    target_jam_selesai: "",
    keterangan: "Kumpul dan verifikasi kehadiran jamaah di bandara keberangkatan",
    bagianList: ["Terminal 3 Gate 1 (Kumpul Jamaah)", "Boarding Gate & Masuk Pesawat"],
    jumlahIsi: 2,
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    judul: "Pesawat & Transit Penerbangan",
    kategori: "jamaah",
    target_jam_mulai: "",
    target_jam_selesai: "",
    keterangan: "Pengecekan manifes saat boarding dan transit penerbangan",
    bagianList: ["Pesawat Udara (Flight)", "Transit Airport"],
    jumlahIsi: 2,
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    judul: "Kedatangan Bandara Jeddah/Madinah",
    kategori: "jamaah",
    target_jam_mulai: "",
    target_jam_selesai: "",
    keterangan: "Pengecekan jamaah selesai imigrasi dan menaiki bus transfer",
    bagianList: ["Bus 1 (Transfer Hotel)", "Bus 2 (Transfer Hotel)"],
    jumlahIsi: 2,
  },
  {
    id: "a1000000-0000-0000-0000-000000000004",
    judul: "Check-in Hotel Madinah",
    kategori: "jamaah",
    target_jam_mulai: "",
    target_jam_selesai: "",
    keterangan: "Pembagian kunci kamar dan penataan jamaah di hotel Madinah",
    bagianList: ["Lobby & Pembagian Kunci Kamar", "Masuk Kamar & Istirahat"],
    jumlahIsi: 2,
  },
  {
    id: "a1000000-0000-0000-0000-000000000005",
    judul: "Ziarah & City Tour Kota Madinah",
    kategori: "jamaah",
    target_jam_mulai: "",
    target_jam_selesai: "",
    keterangan: "Pengecekan jamaah sebelum keberangkatan bus ziarah",
    bagianList: ["Masjid Quba & Jabal Uhud", "Kebun Kurma & Masjid Qiblatain"],
    jumlahIsi: 2,
  },
  {
    id: "a1000000-0000-0000-0000-000000000006",
    judul: "Perjalanan Madinah ke Makkah (Miqat Bir Ali)",
    kategori: "jamaah",
    target_jam_mulai: "",
    target_jam_selesai: "",
    keterangan: "Pengecekan ihram dan niat miqat di Bir Ali menuju Makkah",
    bagianList: ["Miqat Masjid Bir Ali (Niat Ihram)", "Bus Perjalanan Menuju Makkah"],
    jumlahIsi: 2,
  },
  {
    id: "a1000000-0000-0000-0000-000000000007",
    judul: "Pelaksanaan Tawaf & Sai (Ibadah Umrah)",
    kategori: "jamaah",
    target_jam_mulai: "",
    target_jam_selesai: "",
    keterangan: "Pengecekan regu sebelum masuk Masjidil Haram untuk umrah",
    bagianList: ["Tawaf Qudum & Pelataran Ka'bah", "Sai Shafa-Marwah & Tahallul"],
    jumlahIsi: 2,
  },
  {
    id: "a1000000-0000-0000-0000-000000000008",
    judul: "Kepulangan ke Tanah Air (Return Flight)",
    kategori: "jamaah",
    target_jam_mulai: "",
    target_jam_selesai: "",
    keterangan: "Pengecekan koper dan kelengkapan jamaah saat pulang",
    bagianList: ["Check-out Hotel & Muat Bagasi", "Boarding Bandara Kepulangan"],
    jumlahIsi: 2,
  },
];

// B. Sesi Petugas (kategori: 'semua_petugas', 'tour_leader', 'muthawif' - HANYA untuk petugas dengan target waktu)
const DEFAULT_PETUGAS_SESI = [
  {
    id: "b1000000-0000-0000-0000-000000000001",
    judul: "Briefing & Absensi Kumpul Bandara",
    kategori: "semua_petugas",
    target_jam_mulai: "04:30:00",
    target_jam_selesai: "06:30:00",
    keterangan: "Absensi kehadiran seluruh petugas saat briefing di bandara",
    bagianList: ["Meeting Point Lounge", "Penyerahan Dokumen & Paspor"],
    jumlahIsi: 2,
  },
  {
    id: "b1000000-0000-0000-0000-000000000002",
    judul: "Pengawalan Bus Transfer Antar Kota",
    kategori: "semua_petugas",
    target_jam_mulai: "16:00:00",
    target_jam_selesai: "19:30:00",
    keterangan: "Absensi pendampingan jamaah dalam bus transfer hotel",
    bagianList: ["Bus 1 Rombongan", "Bus 2 Rombongan"],
    jumlahIsi: 2,
  },
  {
    id: "b1000000-0000-0000-0000-000000000003",
    judul: "Distribusi Kamar & Pendampingan Hotel",
    kategori: "semua_petugas",
    target_jam_mulai: "18:00:00",
    target_jam_selesai: "21:00:00",
    keterangan: "Absensi koordinasi kunci dan penataan jamaah di hotel",
    bagianList: ["Lobby Hotel", "Kamar Jamaah"],
    jumlahIsi: 2,
  },
  {
    id: "b1000000-0000-0000-0000-000000000004",
    judul: "Pengawalan Rombongan Umrah di Masjidil Haram",
    kategori: "semua_petugas",
    target_jam_mulai: "20:00:00",
    target_jam_selesai: "23:30:00",
    keterangan: "Absensi pengawalan langsung tawaf dan sai bersama jamaah",
    bagianList: ["Pelataran Ka'bah (Tawaf)", "Mas'a (Sai & Tahallul)"],
    jumlahIsi: 2,
  },
  {
    id: "b1000000-0000-0000-0000-000000000005",
    judul: "Boarding Gate & Manifes Penumpang",
    kategori: "tour_leader",
    target_jam_mulai: "08:00:00",
    target_jam_selesai: "10:00:00",
    keterangan: "Pengecekan tiket, paspor, dan boarding gate jamaah",
    bagianList: ["Gate Boarding Terminal"],
    jumlahIsi: 1,
  },
  {
    id: "b1000000-0000-0000-0000-000000000006",
    judul: "Handling Kepulangan & Bagasi Bandara",
    kategori: "tour_leader",
    target_jam_mulai: "09:30:00",
    target_jam_selesai: "12:30:00",
    keterangan: "Pengecekan bagasi dan paspor sebelum penerbangan pulang",
    bagianList: ["Drop Zone & Bagasi Bandara"],
    jumlahIsi: 1,
  },
  {
    id: "b1000000-0000-0000-0000-000000000007",
    judul: "Penyambutan & Handling Imigrasi Saudi",
    kategori: "muthawif",
    target_jam_mulai: "14:00:00",
    target_jam_selesai: "16:30:00",
    keterangan: "Penyambutan dan pendampingan di bandara kedatangan Saudi",
    bagianList: ["Area Imigrasi Kedatangan"],
    jumlahIsi: 1,
  },
  {
    id: "b1000000-0000-0000-0000-000000000008",
    judul: "Bimbingan Miqat & Niat Ihram Bir Ali",
    kategori: "muthawif",
    target_jam_mulai: "13:30:00",
    target_jam_selesai: "15:30:00",
    keterangan: "Bimbingan tata cara ihram dan niat umrah di Miqat",
    bagianList: ["Masjid Bir Ali"],
    jumlahIsi: 1,
  },
  {
    id: "b1000000-0000-0000-0000-000000000009",
    judul: "Bimbingan Ziarah & Kajian Harian Madinah",
    kategori: "muthawif",
    target_jam_mulai: "07:00:00",
    target_jam_selesai: "09:30:00",
    keterangan: "Pemanduan tausiyah dan ziarah napak tilas Rasulullah",
    bagianList: ["Masjid Quba & Uhud"],
    jumlahIsi: 1,
  },
];

const DEFAULT_SESI_LIST = [...DEFAULT_JAMAAH_SESI, ...DEFAULT_PETUGAS_SESI];

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
  // Cegah tanggal saja (misal "2026-11-13") diparse sebagai waktu karena di WIB (UTC+7) akan selalu menjadi 07.00
  if (typeof isoString === "string" && isoString.length <= 10) return "-";
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

// ── Evaluasi Target Waktu Absensi Petugas ─────────────────────────────────────
function evaluateAttendanceTiming(itemOrTimestamp, targetMulai, targetSelesai) {
  const item = typeof itemOrTimestamp === "object" && itemOrTimestamp !== null ? itemOrTimestamp : null;
  const tMulai = targetMulai ? targetMulai.slice(0, 5) : "";
  const tSelesai = targetSelesai ? targetSelesai.slice(0, 5) : "";

  // 1. Jika di database sudah ada status_waktu resmi (dari submit app mobile / update status)
  if (item?.status_waktu === "terlambat") {
    return {
      status: "terlambat",
      label: "Terlambat",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-300",
      description: tSelesai ? `Lewat batas target (${tSelesai})` : "Lewat batas target",
    };
  }
  if (item?.status_waktu === "tepat_waktu") {
    return {
      status: "tepat_waktu",
      label: "Tepat Waktu",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
      description: tMulai && tSelesai ? `Sesuai target (${tMulai} - ${tSelesai})` : "Sesuai target",
    };
  }

  // 2. Evaluasi jam aktual dari created_at
  const isoString = item ? (item.created_at || item.attendance_date) : itemOrTimestamp;
  if (!isoString || !tMulai || !tSelesai) return null;
  // Jika hanya string tanggal tanpa waktu (YYYY-MM-DD), jangan dihitung
  if (typeof isoString === "string" && isoString.length <= 10) return null;

  const d = new Date(isoString);
  if (isNaN(d.getTime())) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const recordTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (recordTime >= tMulai && recordTime <= tSelesai) {
    return {
      status: "tepat_waktu",
      label: "Tepat Waktu",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
      description: `Sesuai target (${tMulai} - ${tSelesai})`,
    };
  } else if (recordTime > tSelesai) {
    return {
      status: "terlambat",
      label: "Terlambat",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-300",
      description: `Lewat batas target (${tSelesai})`,
    };
  } else {
    return {
      status: "di_luar_jadwal",
      label: "Di Luar Target",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-300",
      description: `Sebelum target (${tMulai})`,
    };
  }
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
  namajama: "jamaah_name",
  namajamaah: "jamaah_name",
  namalengkap: "jamaah_name",
  nama: "jamaah_name",
  fullname: "jamaah_name",
  name: "jamaah_name",
  nopaspor: "passport_number",
  nomorpaspor: "passport_number",
  passportnumber: "passport_number",
  passport: "passport_number",
  paspor: "passport_number",
  nohp: "phone_number",
  nomorhp: "phone_number",
  hp: "phone_number",
  phone: "phone_number",
  phonenumber: "phone_number",
  telepon: "phone_number",
  notelp: "phone_number",
  nomortelepon: "phone_number",
  jeniskelamin: "gender",
  gender: "gender",
  jk: "gender",
  sex: "gender",
  tanggallahir: "birth_date",
  tgllahir: "birth_date",
  birthdate: "birth_date",
  dob: "birth_date",
  kodekloter: "kloter",
  kloter: "kloter",
  kode: "kloter",
  nomorbus: "bus",
  nobus: "bus",
  bus: "bus",
  keterangan: "description",
  description: "description",
  ket: "description",
  statushadir: "attendance_status",
  statuskehadiran: "attendance_status",
  attendancestatus: "attendance_status",
  attendance: "attendance_status",
  status: "attendance_status",
  kehadiran: "attendance_status",
  hadir: "attendance_status",
  catatan: "note",
  note: "note",
  notes: "note",
};

function normalizeGender(val) {
  if (!val) return null;
  const s = String(val).trim().toLowerCase();
  if (["l", "laki-laki", "laki", "pria", "male", "m"].includes(s)) return "Laki-laki";
  if (["p", "perempuan", "wanita", "female", "f"].includes(s)) return "Perempuan";
  return null;
}

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

export default function RiwayatAbsensiContent({ type }) {
  const [activeTab, setActiveTab] = useState(type === "jamaah" ? "jamaah" : "tour_leader");
  const [jamaahView, setJamaahView] = useState("list"); // "list" | "tambah_absen" | "sesi_absen" | "detail_jamaah"
  const [petugasView, setPetugasView] = useState("list"); // "list" | "catat_absen" | "sesi_absen" | "detail"
  const [selectedJamaah, setSelectedJamaah] = useState(null);
  const [selectedPetugasGrup, setSelectedPetugasGrup] = useState(null);

  // ── Master data ───────────────────────────────────────────────────────────
  const [kloterOptions, setKloterOptions] = useState([]);
  const [tourLeaderProfiles, setTourLeaderProfiles] = useState([]);
  const [muthawifProfiles, setMuthawifProfiles] = useState([]);

  // ── Form Tambah Absen Jamaah ──────────────────────────────────────────────
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

  // ── Sesi Master & Modal State ─────────────────────────────────────────────
  const [sesiList, setSesiList] = useState([]);
  const [loadingSesi, setLoadingSesi] = useState(false);
  const [showAddSesiModal, setShowAddSesiModal] = useState(false);
  const [sesiModalContext, setSesiModalContext] = useState("jamaah"); // "jamaah" | "petugas"
  const [editingSesi, setEditingSesi] = useState(null);
  const [judulSesi, setJudulSesi] = useState("");
  const [kategoriSesi, setKategoriSesi] = useState("jamaah"); // "jamaah" | "semua_petugas" | "tour_leader" | "muthawif"
  const [targetMulai, setTargetMulai] = useState("");
  const [targetSelesai, setTargetSelesai] = useState("");
  const [keteranganSesi, setKeteranganSesi] = useState("");
  const [isiSesiList, setIsiSesiList] = useState([""]);
  const [savingSesi, setSavingSesi] = useState(false);

  // Filter Sub-Tabs pada Inline Kelola Sesi Petugas
  const [petugasSesiFilterTab, setPetugasSesiFilterTab] = useState("all"); // "all" | "tour_leader" | "muthawif"

  // ── Form Catat Absen Petugas (Tour Leader & Muthawif) ──────────────────────
  const [petugasGrupForm, setPetugasGrupForm] = useState({
    sesi: "",
    bagianSesi: "",
    tanggalAbsen: "",
    targetJamMulai: "",
    targetJamSelesai: "",
    selectedUserIds: [],
    initialStatus: "belum_absen", // "belum_absen" | "hadir"
    note: "",
  });
  const [savingPetugas, setSavingPetugas] = useState(false);

  // ── Modal Update Kehadiran & Detail Member Petugas ────────────────────────
  const [editingPetugasMember, setEditingPetugasMember] = useState(null);
  const [memberStatusForm, setMemberStatusForm] = useState({
    status: "hadir",
    photoUrl: "",
    latitude: "",
    longitude: "",
    note: "",
  });
  const [showUpdateMemberModal, setShowUpdateMemberModal] = useState(false);

  // Modal Tambah Petugas ke Sesi Berjalan
  const [showAddMemberToGrupModal, setShowAddMemberToGrupModal] = useState(false);
  const [newMemberStaffId, setNewMemberStaffId] = useState("");

  // Modal Preview Foto Absen
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // ── Delete modal ─────────────────────────────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // ── Filter Petugas ────────────────────────────────────────────────────────
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [filterSesi, setFilterSesi] = useState("");

  // ── Supabase data ─────────────────────────────────────────────────────────
  const [tlData, setTlData] = useState([]);
  const [muthawifData, setMuthawifData] = useState([]);
  const [jamaahGrupList, setJamaahGrupList] = useState([]);
  const [jamaahDetailList, setJamaahDetailList] = useState([]);

  const [loadingTl, setLoadingTl] = useState(false);
  const [loadingMuthawif, setLoadingMuthawif] = useState(false);
  const [loadingGrup, setLoadingGrup] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── Helper Pembagian List Sesi Terpisah ────────────────────────────────────
  // Sesi Jamaah: khusus kategori 'jamaah'
  const jamaahSesiList = sesiList.filter((s) => s.kategori === "jamaah");

  // Sesi Petugas: semua kategori selain 'jamaah' (berlaku untuk seluruh petugas)
  const allPetugasSesiList = sesiList.filter((s) => s.kategori !== "jamaah");

  // Sesi Petugas dapat dipilih untuk Tour Leader maupun Muthawif
  const tourLeaderSesiList = allPetugasSesiList;
  const muthawifSesiList = allPetugasSesiList;

  // Filter list sesi petugas pada inline view
  const filteredPetugasSesiList = allPetugasSesiList.filter((item) => {
    if (petugasSesiFilterTab === "all") return true;
    if (petugasSesiFilterTab === "tour_leader") return item.kategori === "tour_leader";
    if (petugasSesiFilterTab === "muthawif") return item.kategori === "muthawif";
    return true;
  });

  // ── Helper Petugas Attendance Status ───────────────────────────────────────
  const getMemberAttendanceStatus = useCallback((item) => {
    if (!item) return "belum_absen";
    if (item.attendance_status) return item.attendance_status.toLowerCase();
    const type = (item.type || "").toLowerCase();
    const note = (item.note || "").toLowerCase();
    if (note.includes("[status: izin]") || note.includes("[izin]") || type === "izin") return "izin";
    if (note.includes("[status: sakit]") || note.includes("[sakit]") || type === "sakit") return "sakit";
    if (note.includes("[status: alpa]") || note.includes("[alpa]") || type === "alpa") return "alpa";
    if (
      note.includes("[status: hadir]") ||
      item.photo_url ||
      item.latitude ||
      (item.status_waktu && item.status_waktu !== "belum_absen")
    ) {
      return "hadir";
    }
    if (note.includes("[belum absen") || note.includes("[ditugaskan") || !item.status_waktu) {
      return "belum_absen";
    }
    return "belum_absen";
  }, []);

  const isMemberHadir = useCallback((item) => {
    return getMemberAttendanceStatus(item) === "hadir";
  }, [getMemberAttendanceStatus]);

  const getMemberStatusInfo = useCallback((item) => {
    const s = getMemberAttendanceStatus(item);
    if (s === "hadir") return { label: "Hadir", color: "bg-emerald-50 text-emerald-700 border-emerald-300" };
    if (s === "izin") return { label: "Izin", color: "bg-amber-50 text-amber-700 border-amber-300" };
    if (s === "sakit") return { label: "Sakit", color: "bg-blue-50 text-blue-700 border-blue-300" };
    if (s === "alpa") return { label: "Alpa", color: "bg-rose-50 text-rose-700 border-rose-300" };
    return { label: "Belum Absen", color: "bg-slate-100 text-slate-700 border-slate-300" };
  }, [getMemberAttendanceStatus]);

  // ── Helper Grup Sesi Petugas ───────────────────────────────────────────────
  const getPetugasGrupList = useCallback((records, role) => {
    const map = new Map();

    (records || []).forEach((item) => {
      const itemRole = item.profiles?.role || item.type;
      if (role === "tour_leader" && itemRole === "muthawif") return;
      if (role === "muthawif" && itemRole === "tour_leader") return;

      const dateKey = item.attendance_date || (item.created_at ? item.created_at.slice(0, 10) : "");
      const sesiKey = item.sesi || "Sesi Umum";
      const bagianKey = item.bagian_sesi || "";
      const groupKey = `${sesiKey}___${bagianKey}___${dateKey}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          id: item.grup_id || groupKey,
          grup_id: item.grup_id || null,
          key: groupKey,
          sesi: sesiKey,
          bagian_sesi: bagianKey,
          tanggal: dateKey,
          sesi_id: item.sesi_id,
          target_jam_mulai: item.target_jam_mulai,
          target_jam_selesai: item.target_jam_selesai,
          created_at: item.created_at,
          members: [],
        });
      }

      if (item.grup_id && !map.get(groupKey).grup_id) {
        map.get(groupKey).grup_id = item.grup_id;
        map.get(groupKey).id = item.grup_id;
      }

      map.get(groupKey).members.push(item);
    });

    const groups = Array.from(map.values());
    groups.forEach((g) => {
      const kloterSet = new Set();
      g.members.forEach((m) => {
        const kName = m.kloter || m.profiles?.kloter?.name;
        if (kName && kName !== "Umum" && kName !== "-") kloterSet.add(kName);
      });
      g.kloters = Array.from(kloterSet);
      g.kloter = g.kloters.length > 0 ? g.kloters.join(", ") : "Umum";
    });

    return groups.sort((a, b) => {
      const da = new Date(a.created_at || a.tanggal || 0).getTime();
      const db = new Date(b.created_at || b.tanggal || 0).getTime();
      return db - da;
    });
  }, []);

  // ── Fetch Tour Leader Absensi (attendance_guide dengan relasi profiles) ────
  const fetchTourLeader = useCallback(async () => {
    setLoadingTl(true);
    try {
      const { data, error } = await supabase
        .from("attendance_guide")
        .select("*, profiles:user_id(id, username, role, email, phone, kloter_id, kloter(id, name))")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const filtered = (data || []).filter(
        (r) =>
          r.profiles?.role === "tour_leader" ||
          r.type === "tour_leader" ||
          (!r.profiles?.role && r.type !== "muthawif")
      );
      setTlData(filtered);
    } catch (err) {
      console.error("fetchTourLeader:", err.message);
    } finally {
      setLoadingTl(false);
    }
  }, []);

  // ── Fetch Muthawif Absensi (attendance_guide dengan relasi profiles) ────────
  const fetchMuthawif = useCallback(async () => {
    setLoadingMuthawif(true);
    try {
      const { data, error } = await supabase
        .from("attendance_guide")
        .select("*, profiles:user_id(id, username, role, email, phone, kloter_id, kloter(id, name))")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const filtered = (data || []).filter(
        (r) =>
          r.profiles?.role === "muthawif" || r.type === "muthawif"
      );
      setMuthawifData(filtered);
    } catch (err) {
      console.error("fetchMuthawif:", err.message);
    } finally {
      setLoadingMuthawif(false);
    }
  }, []);

  // ── Fetch Kloters (dari tabel kloter untuk dropdown) ─────────────────────
  const fetchKloters = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("kloter")
        .select("id, name, description, start_date, end_date")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setKloterOptions(data || []);
    } catch (err) {
      console.error("fetchKloters:", err);
    }
  }, []);

  // ── Fetch Staff Profiles (Tour Leader & Muthawif) ─────────────────────────
  const fetchStaffProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, username, email, phone, role, kloter_id,
          kloter (id, name, description)
        `)
        .in("role", ["tour_leader", "muthawif"]);

      if (error) {
        console.error("fetchStaffProfiles error:", error);
        return;
      }
      const tl = (data || []).filter((p) => p.role === "tour_leader");
      const muth = (data || []).filter((p) => p.role === "muthawif");
      setTourLeaderProfiles(tl);
      setMuthawifProfiles(muth);
    } catch (err) {
      console.error("fetchStaffProfiles:", err);
    }
  }, []);

  // ── Fetch Sesi Absensi & Bagian Sesi (dari Supabase / Fallback Default) ───
  const fetchSesi = useCallback(async () => {
    setLoadingSesi(true);
    try {
      const { data, error } = await supabase
        .from("sesi_absensi")
        .select(`
          id, judul, kategori, target_jam_mulai, target_jam_selesai, keterangan, urutan,
          bagian:bagian_sesi_absensi(id, nama_bagian, urutan, target_jam_mulai, target_jam_selesai)
        `)
        .order("urutan", { ascending: true });

      if (!error && data && data.length > 0) {
        const formatted = data.map((s) => {
          const parts = (s.bagian || []).sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
          return {
            id: s.id,
            judul: s.judul,
            kategori: s.kategori || "jamaah",
            target_jam_mulai: s.target_jam_mulai || "",
            target_jam_selesai: s.target_jam_selesai || "",
            keterangan: s.keterangan || "",
            bagianList: parts.map((p) => p.nama_bagian),
            jumlahIsi: parts.length || 1,
            rawBagian: parts,
          };
        });
        setSesiList(formatted);
        return;
      }

      setSesiList(DEFAULT_SESI_LIST);
    } catch (err) {
      console.warn("fetchSesi fallback default:", err.message);
      setSesiList(DEFAULT_SESI_LIST);
    } finally {
      setLoadingSesi(false);
    }
  }, []);

  // ── Cari Tour Leader yang ditugaskan ke kloter terpilih ────────────────────
  const getAssignedTourLeader = useCallback(
    (kloterValue) => {
      if (!kloterValue) return "";

      const normalizedSearch = kloterValue.toLowerCase();

      const matched = tourLeaderProfiles.filter((tl) => {
        if (!tl) return false;
        if (tl.kloter_id && tl.kloter_id === kloterValue) return true;
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

  // ── Delete guide ──────────────────────────────────────────────────────────
  const handleDeleteGuide = useCallback(
    async (id) => {
      const { error } = await supabase.from("attendance_guide").delete().eq("id", id);
      if (error) {
        alert("Gagal hapus: " + error.message);
        return;
      }
      if (activeTab === "tour_leader") setTlData((p) => p.filter((r) => r.id !== id));
      else setMuthawifData((p) => p.filter((r) => r.id !== id));
    },
    [activeTab]
  );

  // ── Delete grup jamaah ────────────────────────────────────────────────────
  const handleDeleteGrup = useCallback(async (item) => {
    await supabase.from("attendance_user").delete().eq("grup_id", item.id);
    const { error } = await supabase.from("attendance_grup").delete().eq("id", item.id);
    if (error) {
      alert("Gagal hapus grup: " + error.message);
      return;
    }
    setJamaahGrupList((p) => p.filter((r) => r.id !== item.id));
  }, []);

  // ── Initial fetches ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchKloters();
    fetchStaffProfiles();
    fetchSesi();
    fetchTourLeader();
  }, [fetchKloters, fetchStaffProfiles, fetchSesi, fetchTourLeader]);

  useEffect(() => {
    if (activeTab === "muthawif") fetchMuthawif();
    if (activeTab === "tour_leader") fetchTourLeader();
    if (activeTab === "jamaah") fetchJamaahGrup();
  }, [activeTab, fetchMuthawif, fetchTourLeader, fetchJamaahGrup]);

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

  // ── Filter helpers untuk Petugas ──────────────────────────────────────────
  const handleFilter = (e) => e.preventDefault();
  const handleReset = () => {
    setSearchName("");
    setSearchDate("");
    setFilterSesi("");
  };

  const getFilteredPetugasList = (dataList) => {
    return dataList.filter((item) => {
      const nameOrId = `${item.profiles?.username || ""} ${item.user_id || ""}`.toLowerCase();
      const matchName = nameOrId.includes(searchName.toLowerCase());
      const matchDate = searchDate
        ? (item.attendance_date || item.created_at || "").startsWith(searchDate)
        : true;
      const matchSesi = filterSesi
        ? (item.sesi === filterSesi || (item.note || "").includes(filterSesi))
        : true;
      return matchName && matchDate && matchSesi;
    });
  };

  const filteredTlData = getFilteredPetugasList(tlData);
  const filteredMuthawifData = getFilteredPetugasList(muthawifData);

  // Grup Sesi Absensi Petugas (Tour Leader & Muthawif)
  const tlGrupList = useMemo(
    () => getPetugasGrupList(tlData, "tour_leader"),
    [tlData, getPetugasGrupList]
  );
  const muthawifGrupList = useMemo(
    () => getPetugasGrupList(muthawifData, "muthawif"),
    [muthawifData, getPetugasGrupList]
  );

  const filteredTlGrupList = useMemo(() => {
    return tlGrupList.filter((g) => {
      const matchSearch = searchName
        ? g.kloter.toLowerCase().includes(searchName.toLowerCase()) ||
          g.sesi.toLowerCase().includes(searchName.toLowerCase())
        : true;
      const matchDate = searchDate ? g.tanggal === searchDate : true;
      const matchSesi = filterSesi ? g.sesi === filterSesi : true;
      return matchSearch && matchDate && matchSesi;
    });
  }, [tlGrupList, searchName, searchDate, filterSesi]);

  const filteredMuthawifGrupList = useMemo(() => {
    return muthawifGrupList.filter((g) => {
      const matchSearch = searchName
        ? g.kloter.toLowerCase().includes(searchName.toLowerCase()) ||
          g.sesi.toLowerCase().includes(searchName.toLowerCase())
        : true;
      const matchDate = searchDate ? g.tanggal === searchDate : true;
      const matchSesi = filterSesi ? g.sesi === filterSesi : true;
      return matchSearch && matchDate && matchSesi;
    });
  }, [muthawifGrupList, searchName, searchDate, filterSesi]);

  const currentGrupMembers = useMemo(() => {
    if (!selectedPetugasGrup) return [];
    const sourceData = activeTab === "tour_leader" ? tlData : muthawifData;
    return sourceData.filter((item) => {
      const dateKey = item.attendance_date || (item.created_at ? item.created_at.slice(0, 10) : "");
      const sesiKey = item.sesi || "Sesi Umum";
      const bagianKey = item.bagian_sesi || "";
      const groupKey = `${sesiKey}___${bagianKey}___${dateKey}`;
      return groupKey === selectedPetugasGrup.key;
    });
  }, [selectedPetugasGrup, activeTab, tlData, muthawifData]);

  // ── Delete confirmation ───────────────────────────────────────────────────
  const openDeleteConfirmation = (id, delType, name, fullItem = null) => {
    setItemToDelete({ id, type: delType, name, fullItem });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    if (
      itemToDelete.type === "tour_leader" ||
      itemToDelete.type === "muthawif" ||
      itemToDelete.type === "individual_petugas"
    ) {
      await handleDeleteGuide(itemToDelete.id);
    } else if (itemToDelete.type === "petugas_grup") {
      const ids = (itemToDelete.fullItem?.members || []).map((m) => m.id);
      if (ids.length > 0) {
        await supabase.from("attendance_guide").delete().in("id", ids);
        if (activeTab === "tour_leader") {
          setTlData((p) => p.filter((r) => !ids.includes(r.id)));
        } else {
          setMuthawifData((p) => p.filter((r) => !ids.includes(r.id)));
        }
      }
      const grupId = itemToDelete.fullItem?.grup_id || itemToDelete.fullItem?.id;
      if (grupId && typeof grupId === "string" && grupId.length > 20) {
        try {
          await supabase.from("attendance_guide_grup").delete().eq("id", grupId);
        } catch (delGErr) {
          console.warn("Delete attendance_guide_grup error:", delGErr);
        }
      }
      if (petugasView === "detail") setPetugasView("list");
    } else if (itemToDelete.type === "jamaah") {
      await handleDeleteGrup(itemToDelete.fullItem || { id: itemToDelete.id });
    } else if (itemToDelete.type === "sesi") {
      try {
        if (typeof itemToDelete.id === "string" && itemToDelete.id.length > 20) {
          await supabase.from("sesi_absensi").delete().eq("id", itemToDelete.id);
        }
      } catch (err) {
        console.warn("Delete sesi error:", err);
      }
      setSesiList((p) => p.filter((i) => i.id !== itemToDelete.id));
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // ── Sesi Modal (Create, Edit, Delete) ──────────────────────────────────────
  // context: 'jamaah' | 'petugas'
  const handleOpenAddSesi = (context = "jamaah") => {
    setEditingSesi(null);
    setSesiModalContext(context);
    setJudulSesi("");
    if (context === "jamaah") {
      setTargetMulai("");
      setTargetSelesai("");
    } else {
      setTargetMulai("06:00");
      setTargetSelesai("09:00");
    }
    setKeteranganSesi("");
    setIsiSesiList(["Bagian 1"]);
    setShowAddSesiModal(true);
  };

  const handleOpenEditSesi = (item) => {
    setEditingSesi(item);
    const isJamaah = item.kategori === "jamaah";
    setSesiModalContext(isJamaah ? "jamaah" : "petugas");
    setJudulSesi(item.judul);
    setTargetMulai(item.target_jam_mulai ? item.target_jam_mulai.slice(0, 5) : "");
    setTargetSelesai(item.target_jam_selesai ? item.target_jam_selesai.slice(0, 5) : "");
    setKeteranganSesi(item.keterangan || "");
    setIsiSesiList(item.bagianList && item.bagianList.length > 0 ? [...item.bagianList] : ["Bagian 1"]);
    setShowAddSesiModal(true);
  };

  const handleAddIsiField = () => setIsiSesiList([...isiSesiList, `Bagian ${isiSesiList.length + 1}`]);
  const handleRemoveIsiField = (index) => setIsiSesiList(isiSesiList.filter((_, i) => i !== index));

  const handleSaveSesi = async (e) => {
    e.preventDefault();
    if (!judulSesi.trim()) {
      alert("Judul sesi wajib diisi.");
      return;
    }

    const cleanBagianList = isiSesiList.map((s) => s.trim()).filter(Boolean);
    if (cleanBagianList.length === 0) {
      cleanBagianList.push("Sesi Utama");
    }

    // Kategori otomatis: 'jamaah' untuk sesi jamaah, 'all' untuk sesi petugas
    const finalKategori = sesiModalContext === "jamaah" ? "jamaah" : "all";

    setSavingSesi(true);
    try {
      if (editingSesi && typeof editingSesi.id === "string" && editingSesi.id.length > 20) {
        // UPDATE sesi_absensi
        const { error: updateErr } = await supabase
          .from("sesi_absensi")
          .update({
            judul: judulSesi.trim(),
            kategori: finalKategori,
            target_jam_mulai: finalKategori !== "jamaah" && targetMulai ? targetMulai : null,
            target_jam_selesai: finalKategori !== "jamaah" && targetSelesai ? targetSelesai : null,
            keterangan: keteranganSesi || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingSesi.id);

        if (!updateErr) {
          await supabase.from("bagian_sesi_absensi").delete().eq("sesi_id", editingSesi.id);
          const bagianPayload = cleanBagianList.map((bg, idx) => ({
            sesi_id: editingSesi.id,
            nama_bagian: bg,
            urutan: idx + 1,
          }));
          await supabase.from("bagian_sesi_absensi").insert(bagianPayload);
          await fetchSesi();
          setShowAddSesiModal(false);
          setEditingSesi(null);
          return;
        }
      } else {
        // INSERT sesi_absensi
        const { data: newSesi, error: insertErr } = await supabase
          .from("sesi_absensi")
          .insert({
            judul: judulSesi.trim(),
            kategori: finalKategori,
            target_jam_mulai: finalKategori !== "jamaah" && targetMulai ? targetMulai : null,
            target_jam_selesai: finalKategori !== "jamaah" && targetSelesai ? targetSelesai : null,
            keterangan: keteranganSesi || null,
            urutan: sesiList.length + 1,
          })
          .select("id")
          .single();

        if (!insertErr && newSesi) {
          const bagianPayload = cleanBagianList.map((bg, idx) => ({
            sesi_id: newSesi.id,
            nama_bagian: bg,
            urutan: idx + 1,
          }));
          await supabase.from("bagian_sesi_absensi").insert(bagianPayload);
          await fetchSesi();
          setShowAddSesiModal(false);
          setEditingSesi(null);
          return;
        }
      }

      // Fallback state jika tabel database belum dibuat melalui SQL migration
      if (editingSesi) {
        setSesiList((prev) =>
          prev.map((s) =>
            s.id === editingSesi.id
              ? {
                  ...s,
                  judul: judulSesi.trim(),
                  kategori: finalKategori,
                  target_jam_mulai: finalKategori !== "jamaah" && targetMulai ? `${targetMulai}:00` : "",
                  target_jam_selesai: finalKategori !== "jamaah" && targetSelesai ? `${targetSelesai}:00` : "",
                  keterangan: keteranganSesi,
                  bagianList: cleanBagianList,
                  jumlahIsi: cleanBagianList.length,
                }
              : s
          )
        );
      } else {
        const newItem = {
          id: `sesi-${Date.now()}`,
          judul: judulSesi.trim(),
          kategori: finalKategori,
          target_jam_mulai: finalKategori !== "jamaah" && targetMulai ? `${targetMulai}:00` : "",
          target_jam_selesai: finalKategori !== "jamaah" && targetSelesai ? `${targetSelesai}:00` : "",
          keterangan: keteranganSesi,
          bagianList: cleanBagianList,
          jumlahIsi: cleanBagianList.length,
        };
        setSesiList((prev) => [...prev, newItem]);
      }
      setShowAddSesiModal(false);
      setEditingSesi(null);
    } catch (err) {
      console.warn("handleSaveSesi fallback:", err);
    } finally {
      setSavingSesi(false);
    }
  };

  // ── Catat Absen Petugas (Tour Leader & Muthawif) Handlers ─────────────────
  const handleOpenCatatAbsenPetugas = () => {
    const relevantSesiList = activeTab === "tour_leader" ? tourLeaderSesiList : muthawifSesiList;
    const defaultSesiObj = relevantSesiList[0] || null;
    const defaultSesi = defaultSesiObj?.judul || "";
    const defaultBagian = defaultSesiObj?.bagianList?.[0] || "";
    const targetMulai = defaultSesiObj?.target_jam_mulai ? defaultSesiObj.target_jam_mulai.slice(0, 5) : "";
    const targetSelesai = defaultSesiObj?.target_jam_selesai ? defaultSesiObj.target_jam_selesai.slice(0, 5) : "";

    const staffPool = activeTab === "tour_leader" ? tourLeaderProfiles : muthawifProfiles;

    setPetugasGrupForm({
      sesi: defaultSesi,
      bagianSesi: defaultBagian,
      tanggalAbsen: new Date().toISOString().split("T")[0],
      targetJamMulai: targetMulai,
      targetJamSelesai: targetSelesai,
      selectedUserIds: staffPool.map((p) => p.id),
      note: "",
    });
    setPetugasView("catat_absen");
  };

  const handleSesiChangeInCatatAbsen = (sesiTitle) => {
    const relevantSesiList = activeTab === "tour_leader" ? tourLeaderSesiList : muthawifSesiList;
    const matched = relevantSesiList.find((s) => s.judul === sesiTitle);
    setPetugasGrupForm((prev) => ({
      ...prev,
      sesi: sesiTitle,
      bagianSesi: matched?.bagianList?.[0] || "",
      targetJamMulai: matched?.target_jam_mulai ? matched.target_jam_mulai.slice(0, 5) : "",
      targetJamSelesai: matched?.target_jam_selesai ? matched.target_jam_selesai.slice(0, 5) : "",
    }));
  };

  const handleToggleStaffSelection = (id) => {
    setPetugasGrupForm((prev) => {
      const exists = prev.selectedUserIds.includes(id);
      const updated = exists
        ? prev.selectedUserIds.filter((uid) => uid !== id)
        : [...prev.selectedUserIds, id];
      return {
        ...prev,
        selectedUserIds: updated,
      };
    });
  };

  const handleSelectAllStaff = (selectAll = true) => {
    const staffPool = activeTab === "tour_leader" ? tourLeaderProfiles : muthawifProfiles;
    setPetugasGrupForm((prev) => ({
      ...prev,
      selectedUserIds: selectAll ? staffPool.map((p) => p.id) : [],
    }));
  };

  const handleSavePetugasGrupAbsen = async (e) => {
    e?.preventDefault();
    if (!petugasGrupForm.sesi) {
      alert("Pilih sesi kegiatan terlebih dahulu.");
      return;
    }
    if (petugasGrupForm.selectedUserIds.length === 0) {
      alert(
        `Pilih minimal 1 ${
          activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"
        } yang wajib absen.`
      );
      return;
    }

    setSavingPetugas(true);
    try {
      const selectedSesiObj = sesiList.find((s) => s.judul === petugasGrupForm.sesi);
      const now = new Date();

      const sesiLabel = `${petugasGrupForm.sesi}${
        petugasGrupForm.bagianSesi ? ` – ${petugasGrupForm.bagianSesi}` : ""
      }`;

      const staffPool = activeTab === "tour_leader" ? tourLeaderProfiles : muthawifProfiles;

      const userNote = (petugasGrupForm.note || "").trim();
      const formattedNote = userNote
        ? `${userNote} [Belum Absen] [Sesi: ${sesiLabel}]`
        : `[Belum Absen] [Sesi: ${sesiLabel}]`;

      const payloads = petugasGrupForm.selectedUserIds.map((userId) => {
        const staffObj = staffPool.find((p) => p.id === userId);
        const staffKloter =
          staffObj?.kloter?.name ||
          (kloterOptions.find((k) => k.id === staffObj?.kloter_id)?.name) ||
          staffObj?.kloter_id ||
          "Umum";

        const row = {
          user_id: userId,
          kloter: staffKloter,
          type: "masuk", // Memenuhi CHECK constraint: 'masuk', 'pulang', 'izin', 'sakit', 'alpa'
          attendance_date: petugasGrupForm.tanggalAbsen || now.toISOString().split("T")[0],
          note: formattedNote,
          sesi: petugasGrupForm.sesi,
          bagian_sesi: petugasGrupForm.bagianSesi || null,
          target_jam_mulai: selectedSesiObj?.target_jam_mulai || null,
          target_jam_selesai: selectedSesiObj?.target_jam_selesai || null,
          status_waktu: null,
        };

        // Hindari foreign key constraint jika sesi_id berupa ID fallback/dummy
        if (
          selectedSesiObj &&
          typeof selectedSesiObj.id === "string" &&
          !selectedSesiObj.id.startsWith("a1000000") &&
          !selectedSesiObj.id.startsWith("b1000000") &&
          selectedSesiObj.id.length > 20
        ) {
          row.sesi_id = selectedSesiObj.id;
        }

        return row;
      });

      // ── 1. Simpan Parent Record ke attendance_guide_grup ──
      const representativeKloter = payloads[0]?.kloter || "Umum";
      const validSesiId =
        selectedSesiObj &&
        typeof selectedSesiObj.id === "string" &&
        !selectedSesiObj.id.startsWith("a1000000") &&
        !selectedSesiObj.id.startsWith("b1000000") &&
        selectedSesiObj.id.length > 20
          ? selectedSesiObj.id
          : null;

      let createdGrupId = null;
      const fullGrupPayload = {
        kloter: representativeKloter,
        attendance_date: petugasGrupForm.tanggalAbsen || now.toISOString().split("T")[0],
        sesi: petugasGrupForm.sesi,
        bagian_sesi: petugasGrupForm.bagianSesi || null,
        sesi_id: validSesiId,
        target_jam_mulai: selectedSesiObj?.target_jam_mulai || null,
        target_jam_selesai: selectedSesiObj?.target_jam_selesai || null,
        role_kategori: activeTab === "tour_leader" ? "tour_leader" : "muthawif",
        total_petugas: payloads.length,
      };

      try {
        const { data: gData, error: gErr } = await supabase
          .from("attendance_guide_grup")
          .insert(fullGrupPayload)
          .select("id")
          .single();

        if (gErr) throw gErr;
        createdGrupId = gData?.id;
      } catch (firstGErr) {
        console.warn("attendance_guide_grup full insert fallback:", firstGErr.message);
        // Fallback jika constraint lama belum di-drop: pakai 'kegiatan_harian' agar lolos CHECK constraint
        const safeGrupPayload = {
          kloter: representativeKloter,
          attendance_date: petugasGrupForm.tanggalAbsen || now.toISOString().split("T")[0],
          sesi: "kegiatan_harian",
          total_petugas: payloads.length,
        };
        try {
          const { data: fbData } = await supabase
            .from("attendance_guide_grup")
            .insert(safeGrupPayload)
            .select("id")
            .single();
          if (fbData?.id) createdGrupId = fbData.id;
        } catch (fbGErr) {
          console.warn("attendance_guide_grup fallback insert error:", fbGErr.message);
        }
      }

      if (createdGrupId) {
        payloads.forEach((p) => {
          p.grup_id = createdGrupId;
        });
      }

      // ── 2. Simpan Member Records ke attendance_guide ──
      let insertErr = null;
      try {
        const res = await supabase.from("attendance_guide").insert(payloads);
        if (res.error) throw res.error;
      } catch (firstErr) {
        console.warn("Direct insert failed, trying safe payloads fallback:", firstErr);
        const safePayloads = payloads.map((p) => {
          const c = { ...p };
          delete c.sesi;
          delete c.bagian_sesi;
          delete c.sesi_id;
          delete c.target_jam_mulai;
          delete c.target_jam_selesai;
          delete c.status_waktu;
          delete c.grup_id;
          return c;
        });
        const fallbackRes = await supabase.from("attendance_guide").insert(safePayloads);
        if (fallbackRes.error) {
          insertErr = fallbackRes.error;
        }
      }

      if (insertErr) throw insertErr;

      if (activeTab === "tour_leader") {
        await fetchTourLeader();
      } else {
        await fetchMuthawif();
      }

      setPetugasView("list");
      alert(
        `✓ Berhasil menerbitkan absensi ${
          activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"
        } untuk ${payloads.length} petugas!`
      );
    } catch (err) {
      console.error("handleSavePetugasGrupAbsen error:", err);
      alert("Gagal menyimpan absensi petugas: " + err.message);
    } finally {
      setSavingPetugas(false);
    }
  };

  const handleOpenPetugasDetail = (grup) => {
    setSelectedPetugasGrup(grup);
    setPetugasView("detail");
  };

  const handleOpenUpdateMemberModal = (member) => {
    setEditingPetugasMember(member);
    const currentStatus = getMemberAttendanceStatus(member);
    setMemberStatusForm({
      status: currentStatus === "belum_absen" ? "hadir" : currentStatus,
      photoUrl: member.photo_url || "",
      latitude: member.latitude ? String(member.latitude) : "",
      longitude: member.longitude ? String(member.longitude) : "",
      note: member.note ? member.note.replace(/\[.*?\]/g, "").trim() : "",
    });
    setShowUpdateMemberModal(true);
  };

  const handleSaveMemberAttendance = async (e) => {
    e?.preventDefault();
    if (!editingPetugasMember) return;

    setSavingPetugas(true);
    try {
      const now = new Date();
      const selectedSesiObj = sesiList.find((s) => s.judul === editingPetugasMember.sesi);

      let timing = null;
      if (memberStatusForm.status === "hadir" && selectedSesiObj) {
        timing = evaluateAttendanceTiming(
          now.toISOString(),
          selectedSesiObj.target_jam_mulai,
          selectedSesiObj.target_jam_selesai
        );
      }

      const sesiLabel = `${editingPetugasMember.sesi || "Sesi"}${
        editingPetugasMember.bagian_sesi ? ` – ${editingPetugasMember.bagian_sesi}` : ""
      }`;

      const noteTag = `[Status: ${memberStatusForm.status}] [Sesi: ${sesiLabel}${
        timing ? ` | ${timing.label}` : ""
      }]`;
      const fullNote = memberStatusForm.note ? `${memberStatusForm.note} ${noteTag}` : noteTag;

      const updatePayload = {
        type: memberStatusForm.status === "hadir" ? "masuk" : memberStatusForm.status,
        note: fullNote,
        status_waktu:
          timing?.status || (memberStatusForm.status === "hadir" ? "tepat_waktu" : null),
        photo_url: memberStatusForm.photoUrl || editingPetugasMember.photo_url || null,
        latitude: memberStatusForm.latitude
          ? parseFloat(memberStatusForm.latitude)
          : editingPetugasMember.latitude || null,
        longitude: memberStatusForm.longitude
          ? parseFloat(memberStatusForm.longitude)
          : editingPetugasMember.longitude || null,
      };

      const { error: updErr } = await supabase
        .from("attendance_guide")
        .update(updatePayload)
        .eq("id", editingPetugasMember.id);

      if (updErr) throw updErr;

      if (activeTab === "tour_leader") {
        await fetchTourLeader();
      } else {
        await fetchMuthawif();
      }

      setShowUpdateMemberModal(false);
      setEditingPetugasMember(null);
    } catch (err) {
      console.error("handleSaveMemberAttendance error:", err);
      alert("Gagal memperbarui absensi: " + err.message);
    } finally {
      setSavingPetugas(false);
    }
  };

  const handleOpenAddMemberToGrup = () => {
    setNewMemberStaffId("");
    setShowAddMemberToGrupModal(true);
  };

  const handleSaveNewMemberToGrup = async (e) => {
    e?.preventDefault();
    if (!newMemberStaffId || !selectedPetugasGrup) {
      alert("Pilih petugas yang akan ditambahkan.");
      return;
    }

    setSavingPetugas(true);
    try {
      const selectedSesiObj = sesiList.find((s) => s.judul === selectedPetugasGrup.sesi);
      const sesiLabel = `${selectedPetugasGrup.sesi}${
        selectedPetugasGrup.bagian_sesi ? ` – ${selectedPetugasGrup.bagian_sesi}` : ""
      }`;

      const staffPool = activeTab === "tour_leader" ? tourLeaderProfiles : muthawifProfiles;
      const staffObj = staffPool.find((p) => p.id === newMemberStaffId);
      const staffKloter =
        staffObj?.kloter?.name ||
        (kloterOptions.find((k) => k.id === staffObj?.kloter_id)?.name) ||
        staffObj?.kloter_id ||
        selectedPetugasGrup.kloter ||
        "Umum";

      const newRow = {
        user_id: newMemberStaffId,
        kloter: staffKloter,
        type: "masuk", // Memenuhi CHECK constraint: 'masuk', 'pulang', 'izin', 'sakit', 'alpa'
        attendance_date: selectedPetugasGrup.tanggal || new Date().toISOString().split("T")[0],
        note: `[Belum Absen] [Ditugaskan untuk sesi ${sesiLabel}]`,
        sesi: selectedPetugasGrup.sesi,
        bagian_sesi: selectedPetugasGrup.bagian_sesi || null,
        target_jam_mulai: selectedPetugasGrup.target_jam_mulai || null,
        target_jam_selesai: selectedPetugasGrup.target_jam_selesai || null,
        status_waktu: null,
      };

      if (
        selectedSesiObj &&
        typeof selectedSesiObj.id === "string" &&
        !selectedSesiObj.id.startsWith("a1000000") &&
        !selectedSesiObj.id.startsWith("b1000000") &&
        selectedSesiObj.id.length > 20
      ) {
        newRow.sesi_id = selectedSesiObj.id;
      }

      const { error } = await supabase.from("attendance_guide").insert(newRow);
      if (error) throw error;

      if (activeTab === "tour_leader") {
        await fetchTourLeader();
      } else {
        await fetchMuthawif();
      }

      setShowAddMemberToGrupModal(false);
      setNewMemberStaffId("");
    } catch (err) {
      console.error("handleSaveNewMemberToGrup error:", err);
      alert("Gagal menambahkan petugas: " + err.message);
    } finally {
      setSavingPetugas(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMemberStatusForm((p) => ({
          ...p,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
      },
      (err) => {
        alert("Gagal mengambil lokasi: " + err.message);
      }
    );
  };

  const getKoordinat = (item) =>
    item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "-";

  // Helper mencari info sesi untuk baris data petugas
  const getSesiInfoForPetugas = (item) => {
    let matchedSesi = null;
    if (item.sesi) {
      matchedSesi = allPetugasSesiList.find((s) => s.judul === item.sesi);
    }
    if (!matchedSesi && item.note) {
      matchedSesi = allPetugasSesiList.find((s) => item.note.includes(s.judul));
    }
    if (!matchedSesi && item.created_at) {
      const d = new Date(item.created_at);
      if (!isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, "0");
        const t = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        matchedSesi = allPetugasSesiList.find(
          (s) =>
            s.target_jam_mulai &&
            s.target_jam_selesai &&
            t >= s.target_jam_mulai.slice(0, 5) &&
            t <= s.target_jam_selesai.slice(0, 5)
        );
      }
    }
    return matchedSesi;
  };

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
    if (!selectedKloter) {
      alert("Pilih kloter terlebih dahulu.");
      return;
    }
    if (!selectedSesiAbsen) {
      alert("Pilih sesi absen terlebih dahulu.");
      return;
    }
    if (!selectedBagianSesi) {
      alert("Pilih bagian sesi terlebih dahulu.");
      return;
    }
    if (excelRows.length === 0) {
      alert("Upload file Excel terlebih dahulu.");
      return;
    }

    const assignedTL = getAssignedTourLeader(selectedKloter);
    const matchedSesi = jamaahSesiList.find((s) => s.judul === selectedSesiAbsen);

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
        const payloadGrup = {
          kloter: selectedKloter,
          sesi: sesiGabungan,
          tour_leader: assignedTL || null,
          total_jamaah: excelRows.length,
        };

        if (matchedSesi && typeof matchedSesi.id === "string" && matchedSesi.id.length > 20) {
          payloadGrup.sesi_id = matchedSesi.id;
        }

        let newGrup = null;
        try {
          const res = await supabase
            .from("attendance_grup")
            .insert(payloadGrup)
            .select("id")
            .single();
          if (res.error) throw res.error;
          newGrup = res.data;
        } catch {
          delete payloadGrup.sesi_id;
          const fallbackRes = await supabase
            .from("attendance_grup")
            .insert(payloadGrup)
            .select("id")
            .single();
          if (fallbackRes.error) throw fallbackRes.error;
          newGrup = fallbackRes.data;
        }

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
        const { error: insertErr } = await supabase.from("attendance_user").insert(batch);
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
        `✓ ${rowsToInsert.length} data jamaah berhasil disimpan untuk Tour Leader "${
          assignedTL || "-"
        }" pada kloter "${selectedKloter}".`
      );

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
          title={
            type === "jamaah"
              ? "Absensi Jamaah"
              : type === "petugas"
              ? "Absensi Petugas"
              : "Riwayat Absensi"
          }
          breadcrumbs={[
            "Dashboard",
            "Riwayat Absensi",
            ...(type === "jamaah"
              ? ["Absensi Jamaah"]
              : type === "petugas"
              ? ["Absensi Petugas"]
              : []),
          ]}
        />

        <main className="p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto no-scrollbar overflow-y-auto">
          <PageHeader
            title={
              type === "jamaah"
                ? "Absensi Jamaah"
                : type === "petugas"
                ? "Absensi Petugas"
                : "Riwayat Absensi"
            }
            description={
              type === "jamaah"
                ? "Berisi daftar riwayat absensi jamaah umroh yang dikelompokkan berdasarkan kloter, sesi jamaah, dan bagian sesi."
                : type === "petugas"
                ? "Berisi daftar riwayat absensi petugas (Tour Leader & Muthawif) dengan target waktu sesi agar absensi tepat jadwal."
                : "Berisi daftar riwayat absensi tour leader, jamaah, dan muthawif yang telah dilakukan."
            }
            icon={<FaUserClock className="w-[26px] h-[26px] text-[#eab308]" />}
          />

          {/* ── Tabs (hanya tampil jika tipe petugas atau default) ──────────── */}
          {type !== "jamaah" && (
            <div className="border-b border-gray-200 flex gap-8">
              {(type === "petugas"
                ? ["tour_leader", "muthawif"]
                : ["tour_leader", "jamaah", "muthawif"]
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setJamaahView("list");
                    setPetugasView("list");
                  }}
                  className={`pb-3 text-base font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-[#121c2d]"
                      : "border-b-2 border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab === "tour_leader"
                    ? "Tour Leader"
                    : tab === "jamaah"
                    ? "Jamaah"
                    : "Muthawif"}
                </button>
              ))}
            </div>
          )}

          {/* ── Tab: Tour Leader & Muthawif ─────────────────────────────── */}
          {activeTab !== "jamaah" && (
            <div className="space-y-6">

              {/* VIEW A: LIST RIWAYAT ABSENSI PETUGAS (DAFTAR ABSEN YANG PERLU DIPENUHI) */}
              {petugasView === "list" && (
                <div className="space-y-6">
                  {/* Header Banner - Gaya Card Jamaah */}
                  <div className="bg-[#121c2d] text-white p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                       
                        <h3 className="text-lg font-bold">
                          {activeTab === "tour_leader" ? "Data Absen Tour Leader" : "Data Absen Muthawif"}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-300 max-w-2xl">
                        {activeTab === "tour_leader"
                          ? "Kelola sesi absen dan pantau daftar absensi kegiatan yang wajib dipenuhi Tour Leader."
                          : "Kelola sesi absen dan pantau daftar absensi kegiatan yang wajib dipenuhi Muthawif."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 self-stretch md:self-auto flex-wrap">
                      <button
                        onClick={() => setPetugasView("sesi_absen")}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all border border-white/20 flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <FiList className="w-4 h-4" /> Kelola Sesi
                      </button>
                      <button
                        onClick={handleOpenCatatAbsenPetugas}
                        className="bg-white text-[#121c2d] hover:bg-gray-100 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <FiPlus className="w-4 h-4" /> Catat Absen{" "}
                        {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                      </button>
                    </div>
                  </div>

                  {/* Filter Petugas */}
                  <form
                    onSubmit={handleFilter}
                    className="flex flex-wrap gap-4 items-end bg-white p-5 rounded-xl border border-gray-100 shadow-2xs"
                  >
                    {/* Sesi Filter Khusus Petugas */}
                    <div className="w-72">
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">
                        Filter Sesi Absen
                      </label>
                      <div className="relative">
                        <select
                          value={filterSesi}
                          onChange={(e) => setFilterSesi(e.target.value)}
                          className="w-full appearance-none border border-gray-300 rounded-lg pl-3.5 pr-8 py-2.5 text-[13px] text-gray-900 bg-white focus:border-gray-500 focus:outline-none transition-all cursor-pointer font-medium"
                        >
                          <option value="">Semua Sesi</option>
                          {(activeTab === "tour_leader" ? tourLeaderSesiList : muthawifSesiList).map(
                            (s) => (
                              <option key={s.id} value={s.judul}>
                                {s.judul}{" "}
                                {s.target_jam_mulai && s.target_jam_selesai
                                  ? `(${s.target_jam_mulai.slice(0, 5)} - ${s.target_jam_selesai.slice(0, 5)})`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>
                        <FiChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="w-48">
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">
                        Tanggal Absen
                      </label>
                      <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 bg-white focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FiRefreshCw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </form>

                  {/* List Daftar Absen yang Perlu Dipenuhi Petugas (Mirip List Grup Jamaah) */}
                  {(activeTab === "tour_leader" ? loadingTl : loadingMuthawif) ? (
                    <Spinner />
                  ) : (
                    <div className="space-y-4">
                      {(activeTab === "tour_leader" ? filteredTlGrupList : filteredMuthawifGrupList)
                        .length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm font-semibold shadow-xs">
                          Belum ada daftar absensi kegiatan yang diterbitkan untuk{" "}
                          {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}. Silakan klik{" "}
                          &quot;Catat Absen{" "}
                          {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}&quot; untuk
                          memulai.
                        </div>
                      ) : (
                        (activeTab === "tour_leader" ? filteredTlGrupList : filteredMuthawifGrupList).map(
                          (item, index) => {
                            const hadirCount = item.members.filter(isMemberHadir).length;
                            const isAllHadir = hadirCount === item.members.length && item.members.length > 0;

                            return (
                              <div
                                key={item.key}
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <h4 className="font-bold text-gray-900 text-lg">
                                      {index + 1}. {item.sesi || "–"}
                                    </h4>
                                    {item.bagian_sesi && (
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                        Bagian: {item.bagian_sesi}
                                      </span>
                                    )}
                                    {item.tanggal && (
                                      <span className="text-sm text-gray-500 font-semibold">
                                        ({formatTanggal(item.tanggal)})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {item.target_jam_mulai && item.target_jam_selesai && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                        <FiClock className="w-3 h-3 text-amber-600" />
                                        Target: {item.target_jam_mulai.slice(0, 5)} -{" "}
                                        {item.target_jam_selesai.slice(0, 5)}
                                      </span>
                                    )}
                                    {item.kloters && item.kloters.length > 0 && (
                                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        Kloter: {item.kloters.join(", ")}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[13px] text-gray-400 font-medium pt-0.5">
                                    Dibuat: {formatTanggalPanjang(item.created_at || item.tanggal)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 self-end md:self-center flex-wrap">
                                  <span className="inline-flex items-center justify-center min-w-[110px] h-10 px-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold shadow-2xs">
                                    {item.members.length}{" "}
                                    {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                                  </span>
                                  <span
                                    className={`inline-flex items-center justify-center h-10 px-3.5 rounded-lg text-xs font-bold border shadow-2xs ${
                                      isAllHadir
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                        : "bg-amber-50 text-amber-700 border-amber-300"
                                    }`}
                                  >
                                    {hadirCount}/{item.members.length} Hadir
                                  </span>
                                  <button
                                    onClick={() => handleOpenPetugasDetail(item)}
                                    className="inline-flex items-center justify-center min-w-[90px] h-10 px-4 bg-[#121c2d] hover:bg-[#1f2d47] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                                  >
                                    Detail
                                  </button>
                                  <button
                                    onClick={() =>
                                      openDeleteConfirmation(
                                        item.key,
                                        "petugas_grup",
                                        `${item.sesi}${item.bagian_sesi ? ` (${item.bagian_sesi})` : ""}`,
                                        item
                                      )
                                    }
                                    className="inline-flex items-center justify-center min-w-[80px] h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW B: CATAT ABSEN PETUGAS (FORM PEMILIHAN PETUGAS YANG WAJIB ABSEN) */}
              {petugasView === "catat_absen" && (
                <div className="space-y-6">
                  {/* Header Form */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-blue-100 text-blue-900">
                          Formulir Absensi
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          Catat Absen {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih kloter, sesi kegiatan, dan tentukan apakah seluruh petugas atau hanya
                        petugas tertentu yang wajib mengisi absensi ini.
                      </p>
                    </div>
                    <button
                      onClick={() => setPetugasView("list")}
                      className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <FiArrowLeft className="w-3.5 h-3.5" /> Kembali
                    </button>
                  </div>

                  <form onSubmit={handleSavePetugasGrupAbsen} className="space-y-6">
                    {/* Step 1: Konteks Sesi Kegiatan */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                      <div className="bg-blue-50/70 px-6 py-3.5 border-b border-blue-100 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-blue-900">
                          1. Pilih Sesi Kegiatan (Data Database)
                        </h4>
                        <span className="text-xs text-blue-700 font-semibold">
                          Khusus {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                        </span>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Sesi Kegiatan */}
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Sesi Kegiatan Petugas <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={petugasGrupForm.sesi}
                              onChange={(e) => handleSesiChangeInCatatAbsen(e.target.value)}
                              className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                              required
                            >
                              <option value="">-- Pilih Sesi Kegiatan --</option>
                              {(activeTab === "tour_leader"
                                ? tourLeaderSesiList
                                : muthawifSesiList
                              ).map((s) => (
                                <option key={s.id} value={s.judul}>
                                  {s.judul}{" "}
                                  {s.target_jam_mulai && s.target_jam_selesai
                                    ? `(${s.target_jam_mulai.slice(0, 5)} - ${s.target_jam_selesai.slice(0, 5)})`
                                    : ""}
                                </option>
                              ))}
                            </select>
                            <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Bagian Sesi */}
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Bagian / Isi Sesi (Opsional)
                          </label>
                          {(() => {
                            const curSesi = (
                              activeTab === "tour_leader" ? tourLeaderSesiList : muthawifSesiList
                            ).find((s) => s.judul === petugasGrupForm.sesi);
                            const bagianOptions = curSesi?.bagianList || [];

                            return (
                              <div className="relative">
                                <select
                                  value={petugasGrupForm.bagianSesi}
                                  onChange={(e) =>
                                    setPetugasGrupForm({
                                      ...petugasGrupForm,
                                      bagianSesi: e.target.value,
                                    })
                                  }
                                  className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                                >
                                  <option value="">-- Sesi Utama --</option>
                                  {bagianOptions.map((bg, idx) => (
                                    <option key={idx} value={bg}>
                                      {bg}
                                    </option>
                                  ))}
                                </select>
                                <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            );
                          })()}
                        </div>

                        {/* Tanggal Absen */}
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Tanggal Kegiatan / Absensi <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={petugasGrupForm.tanggalAbsen}
                            onChange={(e) =>
                              setPetugasGrupForm({
                                ...petugasGrupForm,
                                tanggalAbsen: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all"
                            required
                          />
                        </div>

                        {/* Catatan Sesi / Instruksi Khusus (Digabung ke Nomor 1) */}
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Catatan Sesi / Instruksi Khusus (Opsional)
                          </label>
                          <input
                            type="text"
                            value={petugasGrupForm.note}
                            onChange={(e) =>
                              setPetugasGrupForm({
                                ...petugasGrupForm,
                                note: e.target.value,
                              })
                            }
                            placeholder="Contoh: Kumpul tepat waktu di Gate 1..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all"
                          />
                        </div>

                        {/* Target Jam Info (Otomatis dari Sesi Data Tanpa Input Manual) */}
                        {(() => {
                          const curSesi = (
                            activeTab === "tour_leader" ? tourLeaderSesiList : muthawifSesiList
                          ).find((s) => s.judul === petugasGrupForm.sesi);

                          if (curSesi?.target_jam_mulai && curSesi?.target_jam_selesai) {
                            return (
                              <div className="md:col-span-2 flex items-center gap-2.5 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs font-bold text-amber-900">
                                <FiClock className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>
                                  Target Waktu Sesi:{" "}
                                  <span className="font-mono font-extrabold text-amber-950">
                                    {curSesi.target_jam_mulai.slice(0, 5)} -{" "}
                                    {curSesi.target_jam_selesai.slice(0, 5)} WIB
                                  </span>{" "}
                                  (Otomatis sesuai master data sesi)
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Step 2: Pilih Tour Leader / Muthawif yang Wajib Absen */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                      <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            2. Tentukan{" "}
                            {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"} yang
                            Wajib Absen
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Pilih petugas yang ditugaskan untuk sesi ini. Kloter akan terisi otomatis sesuai profil petugas.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectAllStaff(true)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          >
                            Pilih Semua
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectAllStaff(false)}
                            className="text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                          >
                            Batal Semua
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        {/* List Staff Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {(activeTab === "tour_leader"
                            ? tourLeaderProfiles
                            : muthawifProfiles
                          ).length === 0 ? (
                            <div className="col-span-2 py-8 text-center text-gray-400 text-sm font-semibold">
                              Tidak ada data{" "}
                              {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"} di sistem.
                            </div>
                          ) : (
                            (activeTab === "tour_leader"
                              ? tourLeaderProfiles
                              : muthawifProfiles
                            ).map((staff) => {
                              const isSelected = petugasGrupForm.selectedUserIds.includes(staff.id);
                              const staffKloter =
                                staff.kloter?.name ||
                                (kloterOptions.find((k) => k.id === staff.kloter_id)?.name) ||
                                "Bebas Kloter";

                              return (
                                <div
                                  key={staff.id}
                                  onClick={() => handleToggleStaffSelection(staff.id)}
                                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                    isSelected
                                      ? "bg-blue-50/70 border-blue-400 shadow-2xs"
                                      : "bg-white border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}} // handled by parent onClick
                                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                    <div className="w-10 h-10 rounded-full bg-[#121c2d] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                      {(staff.username || "P")[0]}
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-bold text-gray-900 leading-snug">
                                        {staff.username || staff.email}
                                      </h5>
                                      <p className="text-xs text-gray-500">
                                        {staff.phone || staff.email || "No Kontak -"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                      {staffKloter}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Selected Count Indicator */}
                        <div className="pt-2 flex justify-between items-center text-xs font-bold text-gray-600">
                          <span>
                            Total Dipilih:{" "}
                            <strong className="text-blue-600 text-sm">
                              {petugasGrupForm.selectedUserIds.length}
                            </strong>{" "}
                            {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                          </span>
                          {petugasGrupForm.selectedUserIds.length === 0 && (
                            <span className="text-red-500 font-semibold">
                              * Wajib memilih minimal 1 petugas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>



                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setPetugasView("list")}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={savingPetugas || petugasGrupForm.selectedUserIds.length === 0}
                        className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-7 py-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {savingPetugas ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Menerbitkan...
                          </>
                        ) : (
                          `Simpan & Terbitkan Absensi (${petugasGrupForm.selectedUserIds.length} Petugas)`
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* VIEW C: DETAIL ABSEN PETUGAS (TABEL SELURUH PETUGAS YANG TERPILIH) */}
              {petugasView === "detail" && (
                <div className="space-y-6">
                  {/* Header Detail Banner */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-400 text-slate-950">
                          Detail Absen {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedPetugasGrup?.sesi}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-3 flex-wrap font-medium">
                        {selectedPetugasGrup?.bagian_sesi && (
                          <span className="text-blue-600 font-bold">
                            Bagian: {selectedPetugasGrup.bagian_sesi}
                          </span>
                        )}
                        {selectedPetugasGrup?.target_jam_mulai && (
                          <span className="text-amber-800 font-mono font-bold">
                            • Target: {selectedPetugasGrup.target_jam_mulai.slice(0, 5)} -{" "}
                            {selectedPetugasGrup.target_jam_selesai?.slice(0, 5)}
                          </span>
                        )}
                        {selectedPetugasGrup?.tanggal && (
                          <span className="text-gray-500">
                            • Tanggal: {formatTanggal(selectedPetugasGrup.tanggal)}
                          </span>
                        )}
                        {selectedPetugasGrup?.kloters && selectedPetugasGrup.kloters.length > 0 && (
                          <span className="text-slate-700 font-semibold">
                            • Kloter: {selectedPetugasGrup.kloters.join(", ")}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPetugasView("list")}
                        className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5" /> Kembali
                      </button>
                      <button
                        onClick={handleOpenAddMemberToGrup}
                        className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <FiPlus className="w-4 h-4" /> Edit Sesi Ini
                      </button>
                    </div>
                  </div>

                  {/* Tabel Daftar Petugas Terpilih — Menampilkan 8 Kolom Utama + Status */}
                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wide">
                          <tr>
                            <th className="py-4 px-4 w-14 text-center">NO</th>
                            <th className="py-4 px-6 text-center">TANGGAL & WAKTU</th>
                            <th className="py-4 px-6">USER ID / NAMA PETUGAS</th>
                            <th className="py-4 px-6 text-center">KLOTER</th>
                            <th className="py-4 px-6 text-center">STATUS HADIR</th>
                            <th className="py-4 px-6 text-center">STATUS WAKTU</th>
                            <th className="py-4 px-6 text-center">FOTO</th>
                            <th className="py-4 px-6 text-center">KOORDINAT</th>
                            <th className="py-4 px-6 text-center">CATATAN</th>
                            <th className="py-4 px-6 text-center">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {currentGrupMembers.length === 0 ? (
                            <tr>
                              <td
                                colSpan="10"
                                className="py-12 text-center text-gray-400 text-sm font-semibold"
                              >
                                Tidak ada petugas yang terdaftar pada sesi absensi ini.
                              </td>
                            </tr>
                          ) : (
                            currentGrupMembers.map((item, index) => {
                              const statusInfo = getMemberStatusInfo(item);
                              const itemSesi = getSesiInfoForPetugas(item);
                              const targetMulaiSesi =
                                item.target_jam_mulai || itemSesi?.target_jam_mulai;
                              const targetSelesaiSesi =
                                item.target_jam_selesai || itemSesi?.target_jam_selesai;
                              const timing = evaluateAttendanceTiming(
                                item,
                                targetMulaiSesi,
                                targetSelesaiSesi
                              );

                              return (
                                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                  {/* NO */}
                                  <td className="py-4 px-4 text-center font-bold text-gray-400 text-xs">
                                    {index + 1}
                                  </td>

                                  {/* TANGGAL & WAKTU */}
                                  <td className="py-4 px-6 text-center whitespace-nowrap">
                                    <div className="flex flex-col items-center">
                                      <span className="font-bold text-gray-900 text-xs">
                                        {statusInfo.status === "belum_absen" && !item.photo_url
                                          ? "-"
                                          : formatJam(item.created_at)}
                                      </span>
                                      <span className="text-[11px] font-semibold text-gray-500">
                                        {formatTanggal(item.attendance_date || item.created_at)}
                                      </span>
                                    </div>
                                  </td>

                                  {/* USER ID / NAMA PETUGAS */}
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                        {(item.profiles?.username || "P")[0]}
                                      </div>
                                      <div>
                                        <div className="font-bold text-gray-900 text-sm">
                                          {item.profiles?.username || item.user_id || "-"}
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-medium">
                                          {item.profiles?.phone || item.profiles?.email || "-"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* KLOTER */}
                                  <td className="py-4 px-6 text-center whitespace-nowrap">
                                    <span className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/60 shadow-2xs">
                                      {item.kloter || item.profiles?.kloter?.name || "-"}
                                    </span>
                                  </td>

                                  {/* STATUS HADIR */}
                                  <td className="py-4 px-6 text-center whitespace-nowrap">
                                    <span
                                      className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border shadow-2xs ${statusInfo.color}`}
                                    >
                                      {statusInfo.label}
                                    </span>
                                  </td>

                                  {/* STATUS WAKTU */}
                                  <td className="py-4 px-6 text-center whitespace-nowrap">
                                    {statusInfo.label === "Hadir" && timing ? (
                                      <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${timing.badgeColor}`}
                                        title={timing.description}
                                      >
                                        <FiClock className="w-2.5 h-2.5 mr-1" />
                                        {timing.label}
                                      </span>
                                    ) : targetMulaiSesi && targetSelesaiSesi ? (
                                      <span className="text-[11px] font-mono text-gray-500">
                                        {targetMulaiSesi.slice(0, 5)} - {targetSelesaiSesi.slice(0, 5)}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-400 italic">Bebas</span>
                                    )}
                                  </td>

                                  {/* FOTO */}
                                  <td className="py-4 px-6 text-center whitespace-nowrap">
                                    {item.photo_url ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPreviewPhotoUrl(item.photo_url);
                                          setShowPhotoModal(true);
                                        }}
                                        className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-2xs mx-auto flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                                      >
                                        <img
                                          src={item.photo_url}
                                          alt="Foto"
                                          className="w-full h-full object-cover"
                                        />
                                      </button>
                                    ) : (
                                      <span className="text-gray-300 text-xs">–</span>
                                    )}
                                  </td>

                                  {/* KOORDINAT */}
                                  <td className="py-4 px-6 text-center whitespace-nowrap">
                                    {item.latitude && item.longitude ? (
                                      <a
                                        href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline font-mono"
                                      >
                                        <FiMapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span>
                                          {Number(item.latitude).toFixed(3)}, {Number(item.longitude).toFixed(3)}
                                        </span>
                                      </a>
                                    ) : (
                                      <span className="text-gray-400 text-xs">–</span>
                                    )}
                                  </td>

                                  {/* CATATAN */}
                                  <td className="py-4 px-6 text-xs text-gray-600 max-w-[180px]">
                                    <div>{item.note ? item.note.replace(/\[.*?\]/g, "").trim() || item.note : "-"}</div>
                                  </td>

                                  {/* AKSI */}
                                  <td className="py-4 px-6 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handleOpenUpdateMemberModal(item)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
                                      >
                                        <FiEdit3 className="w-3.5 h-3.5 text-blue-600" /> Update
                                      </button>
                                      <button
                                        onClick={() =>
                                          openDeleteConfirmation(
                                            item.id,
                                            "individual_petugas",
                                            item.profiles?.username || item.user_id || "Petugas",
                                            item
                                          )
                                        }
                                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/80 px-3 py-1.5 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-100 transition-colors cursor-pointer"
                                      >
                                        <FiTrash2 className="w-3.5 h-3.5 text-red-500" /> Hapus
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

              {/* VIEW B: KELOLA SESI ABSEN PETUGAS (INLINE VIEW — BUKAN POPUP, SAMA SEPERTI KELOLA JAMAAH) */}
              {petugasView === "sesi_absen" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Kelola Sesi Absen Petugas
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Daftar sesi serta bagian sesi dan target waktu absensinya 
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPetugasView("list")}
                        className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5" /> Kembali
                      </button>
                      <button
                        onClick={() => handleOpenAddSesi("petugas")}
                        className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <FiPlus className="w-4 h-4" /> Tambah Sesi Petugas
                      </button>
                    </div>
                  </div>

                  {/* Tabel Inline Sesi Petugas — Tanpa Filter Tab & Tanpa Kolom Kategori */}
                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      {loadingSesi ? (
                        <Spinner />
                      ) : (
                        <table className="w-full text-left border-collapse text-sm">
                          <thead className="bg-[#121c2d] text-white text-xs font-bold tracking-wider uppercase">
                            <tr>
                              <th className="py-4 px-6 w-16 text-center">No</th>
                              <th className="py-4 px-8">Judul Sesi Petugas</th>
                              <th className="py-4 px-6 text-center">Target Waktu</th>
                              <th className="py-4 px-6 text-center">Jumlah Bagian</th>
                              <th className="py-4 px-8 text-center w-52">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {allPetugasSesiList.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="py-10 text-center text-gray-400 text-sm font-semibold"
                                >
                                  Tidak ada data sesi petugas.
                                </td>
                              </tr>
                            ) : (
                              allPetugasSesiList.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-4 px-6 text-center font-bold text-gray-400 text-xs">
                                    {index + 1}
                                  </td>
                                  <td className="py-4 px-8">
                                    <div className="font-bold text-gray-900 text-sm">{item.judul}</div>
                                    {item.keterangan && (
                                      <div className="text-xs text-gray-400 mt-0.5">
                                        {item.keterangan}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-center whitespace-nowrap">
                                    {item.target_jam_mulai && item.target_jam_selesai ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-mono text-xs font-bold">
                                        <FiClock className="w-3 h-3 text-amber-600" />
                                        {item.target_jam_mulai.slice(0, 5)} -{" "}
                                        {item.target_jam_selesai.slice(0, 5)}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-400 italic">Bebas</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-200">
                                      {item.jumlahIsi || item.bagianList?.length || 1} Bagian
                                    </span>
                                  </td>
                                  <td className="py-4 px-8 text-center">
                                    <div className="inline-flex items-center justify-center gap-3">
                                      <button
                                        onClick={() => handleOpenEditSesi(item)}
                                        className="bg-white hover:bg-gray-50 text-slate-800 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
                                      >
                                        <FiEdit3 className="w-4 h-4 text-slate-600" /> Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          openDeleteConfirmation(item.id, "sesi", item.judul)
                                        }
                                        className="bg-red-50/60 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
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
            </div>
          )}

          {/* ── Tab: Jamaah ─────────────────────────────────────────────── */}
          {activeTab === "jamaah" && (
            <div className="space-y-6">
              {/* VIEW 1: LIST GRUP JAMAAH */}
              {jamaahView === "list" && (
                <div className="space-y-6">
                  <div className="bg-[#121c2d] text-white p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold">Data Absen Jamaah</h3>
                      <p className="text-sm text-gray-300 mt-1">
                        Kelola sesi absen jamaah dan pantau riwayat absen per kloter secara terstruktur.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setJamaahView("sesi_absen")}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
                      >
                        <FiList className="w-4 h-4" /> Kelola Sesi Jamaah
                      </button>
                      <button
                        onClick={() => setJamaahView("tambah_absen")}
                        className="bg-white text-[#121c2d] hover:bg-gray-100 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
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
                          Belum ada data grup absensi jamaah. Silakan klik "Tambah Absen" untuk memulai.
                        </div>
                      ) : (
                        jamaahGrupList.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="font-bold text-gray-900 text-lg">
                                  {index + 1}. {item.kloter || "–"}
                                </h4>
                                {item.kloter_date && (
                                  <span className="text-sm text-gray-500 font-semibold">
                                    ({item.kloter_date})
                                  </span>
                                )}
                              </div>
                              <p className="text-[14px] text-gray-700 font-medium">
                                Sesi: <span className="font-bold text-gray-900">{item.sesi || "–"}</span>
                              </p>
                              <p className="text-[14px] text-gray-700 font-medium">
                                Tour Leader:{" "}
                                <span className="font-bold text-gray-900">
                                  {item.tour_leader || "–"}
                                </span>
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
                                className="inline-flex items-center justify-center min-w-[100px] h-10 px-4 bg-[#121c2d] hover:bg-[#1f2d47] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() =>
                                  openDeleteConfirmation(
                                    item.id,
                                    "jamaah",
                                    item.kloter || String(item.id),
                                    item
                                  )
                                }
                                className="inline-flex items-center justify-center min-w-[100px] h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
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

              {/* VIEW 2: TAMBAH ABSEN JAMAAH — NO DUMMY DATA, KHUSUS SESI JAMAAH */}
              {jamaahView === "tambah_absen" && (
                <div className="space-y-6">
                  {/* Step 1: Pilih Konteks Sesi & Kloter */}
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="bg-blue-50/70 px-6 py-3.5 border-b border-blue-100 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-blue-900">
                        1. Pilih Konteks Sesi & Kloter Jamaah (Data Real Database)
                      </h4>
                      <span className="text-xs text-blue-700 font-semibold">
                        {kloterOptions.length} Kloter | {jamaahSesiList.length} Sesi Jamaah Tersedia
                      </span>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Kloter - NO DUMMY DATA */}
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Kloter <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedKloter}
                            onChange={(e) => setSelectedKloter(e.target.value)}
                            className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Kloter --</option>
                            {kloterOptions.length === 0 ? (
                              <option disabled value="">
                                Tidak ada data kloter di database
                              </option>
                            ) : (
                              kloterOptions.map((k) => {
                                const label = k.description
                                  ? `${k.name} - ${k.description}`
                                  : k.start_date && k.end_date
                                  ? `${k.name} (${formatTanggal(k.start_date)} - ${formatTanggal(
                                      k.end_date
                                    )})`
                                  : k.name;
                                return (
                                  <option key={k.id} value={k.name}>
                                    {label}
                                  </option>
                                );
                              })
                            )}
                          </select>
                          <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {selectedKloter && (
                          <p className="text-xs text-blue-600 font-semibold mt-1.5">
                            Kloter terpilih: {selectedKloter}
                          </p>
                        )}
                      </div>

                      {/* Sesi Absen - HANYA MEMUAT SESI JAMAAH (TANPA KATEGORI PETUGAS) */}
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Sesi Absen Jamaah <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedSesiAbsen}
                            onChange={(e) => {
                              const newSesi = e.target.value;
                              setSelectedSesiAbsen(newSesi);
                              const matched = jamaahSesiList.find((s) => s.judul === newSesi);
                              if (matched && matched.bagianList && matched.bagianList.length > 0) {
                                setSelectedBagianSesi(matched.bagianList[0]);
                              } else {
                                setSelectedBagianSesi("");
                              }
                            }}
                            className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Sesi Jamaah --</option>
                            {jamaahSesiList.map((sesi) => (
                              <option key={sesi.id} value={sesi.judul}>
                                {sesi.judul}
                              </option>
                            ))}
                          </select>
                          <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {selectedSesiAbsen && (
                          <p className="text-xs text-gray-500 font-medium mt-1.5">
                            Sesi Jamaah: {selectedSesiAbsen}
                          </p>
                        )}
                      </div>

                      {/* Bagian Sesi Absen - Mengikuti Bagian/Isi Sesi Jamaah Terpilih */}
                      {(() => {
                        const curSesi = jamaahSesiList.find((s) => s.judul === selectedSesiAbsen);
                        const availableBagian = curSesi?.bagianList || [];

                        return (
                          <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-bold text-gray-800">
                                Bagian Sesi Absen <span className="text-red-500">*</span>
                              </label>
                              {curSesi && (
                                <span className="text-xs text-blue-600 font-semibold">
                                  {availableBagian.length} bagian isi tersedia untuk sesi "
                                  {curSesi.judul}"
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <select
                                value={selectedBagianSesi}
                                onChange={(e) => setSelectedBagianSesi(e.target.value)}
                                disabled={!selectedSesiAbsen}
                                className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] transition-all cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                <option value="">
                                  {!selectedSesiAbsen
                                    ? "-- Pilih Sesi Terlebih Dahulu --"
                                    : availableBagian.length === 0
                                    ? "-- Bagian Sesi Utama --"
                                    : "-- Pilih Bagian Sesi --"}
                                </option>
                                {availableBagian.map((bg, idx) => (
                                  <option key={idx} value={bg}>
                                    {bg}
                                  </option>
                                ))}
                              </select>
                              <FiChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Step 2: Upload File Excel per Tour Leader */}
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="bg-blue-50/70 px-6 py-3.5 border-b border-blue-100">
                      <h4 className="text-sm font-bold text-blue-900">
                        2. Upload File Excel per Tour Leader
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="border border-blue-500 rounded-2xl p-5 bg-white space-y-4 shadow-2xs">
                        <div>
                          <h5 className="text-sm font-bold text-gray-900">
                            Tour Leader:{" "}
                            <span
                              className={
                                assignedTourLeaderName
                                  ? "text-[#121c2d] font-bold"
                                  : "text-gray-400 font-normal italic"
                              }
                            >
                              {assignedTourLeaderName ||
                                (selectedKloter
                                  ? "Tidak ada Tour Leader yang ditugaskan pada kloter ini"
                                  : "- (Pilih kloter terlebih dahulu)")}
                            </span>
                          </h5>
                          <p className="text-xs text-gray-500 mt-1">
                            Format Excel: nama_jamaah, no_paspor, no_hp, jenis_kelamin, tanggal_lahir,
                            kode_kloter, nomor_bus, keterangan, status
                          </p>
                        </div>

                        {/* File Input */}
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
                              className="ml-auto text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 cursor-pointer"
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
                                      <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">
                                        {cleanString(row.jamaah_name) || "-"}
                                      </td>
                                      <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">
                                        {cleanString(row.passport_number) || "-"}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                                        {cleanString(row.phone_number) || "-"}
                                      </td>
                                      <td className="px-3 py-2 text-center text-gray-700">
                                        {normalizeGender(row.gender) || "-"}
                                      </td>
                                      <td className="px-3 py-2 text-center text-gray-700">
                                        {normalizeDate(row.birth_date) || "-"}
                                      </td>
                                      <td className="px-3 py-2 text-center text-gray-700">
                                        {cleanString(row.bus) || "-"}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                            normalizeStatus(row.attendance_status) === "hadir"
                                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                              : "bg-rose-50 text-rose-700 border border-rose-300"
                                          }`}
                                        >
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

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setJamaahView("list")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
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

              {/* VIEW 3: KELOLA SESI ABSEN JAMAAH (Pasti untuk semua jamaah, tanpa kategori) */}
              {jamaahView === "sesi_absen" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Kelola Sesi Absen Jamaah</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Daftar master sesi absen untuk seluruh jamaah umroh pada setiap kloter perjalanan.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setJamaahView("list")}
                        className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5" /> Kembali
                      </button>
                      <button
                        onClick={() => handleOpenAddSesi("jamaah")}
                        className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <FiPlus className="w-4 h-4" /> Tambah Sesi Jamaah
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
                              <th className="py-4 px-8">Judul Sesi Jamaah</th>
                              <th className="py-4 px-6 text-center">Jumlah Bagian</th>
                              <th className="py-4 px-8 text-center w-52">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {jamaahSesiList.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="py-10 text-center text-gray-400 text-sm font-semibold"
                                >
                                  Belum ada sesi absen jamaah.
                                </td>
                              </tr>
                            ) : (
                              jamaahSesiList.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-4 px-6 text-center font-bold text-gray-400 text-xs">
                                    {index + 1}
                                  </td>
                                  <td className="py-4 px-8">
                                    <div className="font-bold text-gray-900 text-sm">{item.judul}</div>
                                    {item.keterangan && (
                                      <div className="text-xs text-gray-400 mt-0.5">
                                        {item.keterangan}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-200">
                                      {item.jumlahIsi || item.bagianList?.length || 1} Bagian
                                    </span>
                                  </td>
                                  <td className="py-4 px-8 text-center">
                                    <div className="inline-flex items-center justify-center gap-3">
                                      <button
                                        onClick={() => handleOpenEditSesi(item)}
                                        className="bg-white hover:bg-gray-50 text-slate-800 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
                                      >
                                        <FiEdit3 className="w-4 h-4 text-slate-600" /> Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          openDeleteConfirmation(item.id, "sesi", item.judul)
                                        }
                                        className="bg-red-50/60 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
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
                        Sesi: <span className="font-bold text-gray-800">{selectedJamaah?.sesi}</span> |
                        Tour Leader:{" "}
                        <span className="font-bold text-gray-800">
                          {selectedJamaah?.tour_leader || "-"}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setJamaahView("list")}
                      className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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
                                <td
                                  colSpan="11"
                                  className="py-12 text-center text-gray-400 text-sm font-semibold"
                                >
                                  Tidak ada data jamaah pada sesi ini.
                                </td>
                              </tr>
                            ) : (
                              jamaahDetailList.map((item, idx) => {
                                const st = (item.attendance_status || "").toLowerCase();
                                return (
                                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="py-5 px-3 text-center font-bold text-gray-500 text-sm">
                                      {idx + 1}
                                    </td>
                                    <td className="py-5 px-4 font-bold text-gray-900 text-sm leading-snug">
                                      {item.jamaah_name || "-"}
                                    </td>
                                    <td className="py-5 px-4 text-sm text-gray-800 font-mono whitespace-nowrap">
                                      {item.passport_number || "-"}
                                    </td>
                                    <td className="py-5 px-4 text-sm text-gray-800 whitespace-nowrap">
                                      {item.phone_number || "-"}
                                    </td>
                                    <td className="py-5 px-3 text-center font-bold text-gray-800 text-sm">
                                      {item.gender || "-"}
                                    </td>
                                    <td className="py-5 px-4 text-center text-sm text-gray-800 whitespace-nowrap">
                                      {item.birth_date || "-"}
                                    </td>
                                    <td className="py-5 px-3 text-center text-sm text-gray-800">
                                      {item.kloter || "-"}
                                    </td>
                                    <td className="py-5 px-3 text-center text-sm text-gray-800">
                                      {item.bus || "-"}
                                    </td>
                                    <td className="py-5 px-4 text-sm text-gray-700 font-semibold leading-snug">
                                      {item.description || "-"}
                                    </td>
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
                                    <td className="py-5 px-4 text-center text-sm text-gray-500 font-medium">
                                      {item.note || "-"}
                                    </td>
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
              <span className="font-bold text-gray-900">{itemToDelete?.name}</span>? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tambah/Edit Sesi (Dipisahkan: Jamaah vs Petugas) ───────── */}
      {showAddSesiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#121c2d]">
                  {editingSesi
                    ? sesiModalContext === "jamaah"
                      ? "Edit Sesi Jamaah"
                      : "Edit Sesi Petugas"
                    : sesiModalContext === "jamaah"
                    ? "Tambah Sesi Jamaah"
                    : "Tambah Sesi Petugas"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {sesiModalContext === "jamaah"
                    ? "Sesi absen untuk seluruh jamaah perjalanan umroh."
                    : "Sesi absen dengan target waktu untuk Tour Leader & Muthawif."}
                </p>
              </div>
              <button
                onClick={() => setShowAddSesiModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveSesi} className="space-y-5">
              {/* Judul Sesi */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Judul Sesi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={judulSesi}
                  onChange={(e) => setJudulSesi(e.target.value)}
                  placeholder={
                    sesiModalContext === "jamaah"
                      ? "Contoh: Keberangkatan Bandara, Hotel Madinah, dll."
                      : "Contoh: Briefing Bandara, Distribusi Kamar, Bimbingan Miqat..."
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#121c2d] placeholder:text-gray-400 transition-all font-medium"
                  required
                />
              </div>



              {/* Target Jam Absensi (HANYA UNTUK PETUGAS) */}
              {sesiModalContext === "petugas" && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Target Rentang Waktu Absensi Petugas
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Target Jam Mulai
                      </label>
                      <input
                        type="time"
                        value={targetMulai}
                        onChange={(e) => setTargetMulai(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-[#121c2d]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Target Jam Selesai
                      </label>
                      <input
                        type="time"
                        value={targetSelesai}
                        onChange={(e) => setTargetSelesai(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-[#121c2d]"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Keterangan / Catatan Sesi
                </label>
                <input
                  type="text"
                  value={keteranganSesi}
                  onChange={(e) => setKeteranganSesi(e.target.value)}
                  placeholder="Keterangan singkat kegiatan sesi..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#121c2d] placeholder:text-gray-400"
                />
              </div>

              {/* Bagian / Isi Sesi */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Bagian / Isi Sesi
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIsiField}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Tambah Bagian
                  </button>
                </div>
                <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
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
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#121c2d] transition-all font-medium"
                        placeholder={`Nama bagian ${idx + 1} (cth: Bus 1, Lobby Hotel, Gate 3)`}
                        required
                      />
                      {isiSesiList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIsiField(idx)}
                          className="text-red-500 hover:text-red-700 p-2 cursor-pointer"
                        >
                          <FiTrash2 className="w-4 h-4" />
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
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingSesi}
                  className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {savingSesi ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Sesi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Update Kehadiran Petugas di Tabel Detail ───────────────── */}
      {showUpdateMemberModal && editingPetugasMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#121c2d]">
                  Update Kehadiran {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Petugas:{" "}
                  <strong className="text-gray-900 font-bold">
                    {editingPetugasMember.profiles?.username || editingPetugasMember.user_id}
                  </strong>{" "}
                  • Sesi: {editingPetugasMember.sesi}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUpdateMemberModal(false);
                  setEditingPetugasMember(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberAttendance} className="space-y-4">
              {/* Status Kehadiran Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Status Kehadiran <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: "hadir", label: "Hadir", active: "bg-emerald-600 text-white border-emerald-600" },
                    { id: "belum_absen", label: "Belum Absen", active: "bg-slate-800 text-white border-slate-800" },
                    { id: "izin", label: "Izin", active: "bg-amber-500 text-white border-amber-500" },
                    { id: "sakit", label: "Sakit", active: "bg-blue-600 text-white border-blue-600" },
                    { id: "alpa", label: "Alpa", active: "bg-rose-600 text-white border-rose-600" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setMemberStatusForm({ ...memberStatusForm, status: st.id })}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                        memberStatusForm.status === st.id
                          ? st.active
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Foto URL */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Link / URL Foto Bukti Kehadiran
                </label>
                <input
                  type="text"
                  value={memberStatusForm.photoUrl}
                  onChange={(e) =>
                    setMemberStatusForm({ ...memberStatusForm, photoUrl: e.target.value })
                  }
                  placeholder="https://... atau paste URL gambar bukti absen"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#121c2d]"
                />
              </div>

              {/* Koordinat GPS */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    Koordinat GPS (Latitude & Longitude)
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FiMapPin className="w-3 h-3" /> Ambil Lokasi Saat Ini
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={memberStatusForm.latitude}
                    onChange={(e) =>
                      setMemberStatusForm({ ...memberStatusForm, latitude: e.target.value })
                    }
                    placeholder="Latitude (-6.12345)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 bg-white focus:outline-none focus:border-[#121c2d]"
                  />
                  <input
                    type="text"
                    value={memberStatusForm.longitude}
                    onChange={(e) =>
                      setMemberStatusForm({ ...memberStatusForm, longitude: e.target.value })
                    }
                    placeholder="Longitude (106.78901)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 bg-white focus:outline-none focus:border-[#121c2d]"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Catatan / Keterangan Kehadiran
                </label>
                <input
                  type="text"
                  value={memberStatusForm.note}
                  onChange={(e) =>
                    setMemberStatusForm({ ...memberStatusForm, note: e.target.value })
                  }
                  placeholder="Catatan kendala atau info kehadiran..."
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#121c2d]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateMemberModal(false);
                    setEditingPetugasMember(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPetugas}
                  className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {savingPetugas ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Tambah Petugas ke Sesi Berjalan ──────────────────────────── */}
      {showAddMemberToGrupModal && selectedPetugasGrup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Tambah {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"} ke Sesi Ini
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sesi: {selectedPetugasGrup.sesi}
                  {selectedPetugasGrup.bagian_sesi ? ` (${selectedPetugasGrup.bagian_sesi})` : ""}
                </p>
              </div>
              <button
                onClick={() => setShowAddMemberToGrupModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const existingIds = currentGrupMembers.map((m) => m.user_id);
              const available = (
                activeTab === "tour_leader" ? tourLeaderProfiles : muthawifProfiles
              ).filter((p) => !existingIds.includes(p.id));

              return (
                <form onSubmit={handleSaveNewMemberToGrup} className="space-y-4">
                  {available.length === 0 ? (
                    <div className="py-6 text-center text-gray-500 text-xs font-semibold bg-gray-50 rounded-xl border border-gray-200">
                      Seluruh {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"} yang
                      terdaftar sudah dimasukkan ke sesi absensi ini.
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">
                        Pilih {activeTab === "tour_leader" ? "Tour Leader" : "Muthawif"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={newMemberStaffId}
                          onChange={(e) => setNewMemberStaffId(e.target.value)}
                          className="w-full appearance-none border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#121c2d] cursor-pointer"
                          required
                        >
                          <option value="">-- Pilih Petugas --</option>
                          {available.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.username || p.email}{" "}
                              {p.kloter?.name ? `(${p.kloter.name})` : ""}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberToGrupModal(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    {available.length > 0 && (
                      <button
                        type="submit"
                        disabled={savingPetugas || !newMemberStaffId}
                        className="bg-[#121c2d] hover:bg-[#1f2d47] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {savingPetugas ? "Menambahkan..." : "Tambahkan"}
                      </button>
                    )}
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Modal Preview Foto Absen ──────────────────────────────────────── */}
      {showPhotoModal && previewPhotoUrl && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900">Bukti Foto Absensi</h4>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={previewPhotoUrl}
                alt="Foto Absen"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
