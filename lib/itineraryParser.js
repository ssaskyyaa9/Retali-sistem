import * as XLSX from "xlsx";

/**
 * Normalisasi format tanggal dari berbagai jenis data (Date object, Excel serial number, string format berbeda)
 * Menghasilkan format standar YYYY-MM-DD yang diterima oleh HTML input date dan PostgreSQL DATE.
 */
export function normalizeDate(val) {
  if (!val && val !== 0) return "";

  // 1. Jika bertipe Date
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, "0");
    const d = String(val.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 2. Jika angka serial Excel (misal 46357)
  if (typeof val === "number") {
    if (val > 10000 && val < 100000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const targetDate = new Date(excelEpoch.getTime() + Math.floor(val) * 86400000);
      const y = targetDate.getUTCFullYear();
      const m = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
      const d = String(targetDate.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(val).trim();
  if (!str) return "";

  // 3. Format ISO YYYY-MM-DD atau YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return str.split("T")[0];

  // 4. Format DD/MM/YYYY atau D/M/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const parts = str.split("/");
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }

  // 5. Format DD-MM-YYYY atau D-M-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
    const parts = str.split("-");
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }

  // 6. Format string angka serial Excel
  const num = Number(str);
  if (!isNaN(num) && num > 10000 && num < 100000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const targetDate = new Date(excelEpoch.getTime() + Math.floor(num) * 86400000);
    const y = targetDate.getUTCFullYear();
    const m = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
    const d = String(targetDate.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 7. Fallback parsing string tanggal standar (cth: "Tue Dec 01 2026...")
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && str.length > 8) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "";
}

/**
 * Normalisasi format waktu ke standar HH:MM
 */
export function normalizeTime(val) {
  if (!val && val !== 0) return "08:00";

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "08:00";
    const hours = String(val.getHours()).padStart(2, "0");
    const mins = String(val.getMinutes()).padStart(2, "0");
    return `${hours}:${mins}`;
  }

  if (typeof val === "number") {
    // Pecahan hari di Excel (0 sampai 1)
    if (val >= 0 && val < 1) {
      const totalMinutes = Math.round(val * 24 * 60);
      const hours = Math.floor(totalMinutes / 60) % 24;
      const mins = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }
  }

  const str = String(val).trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const parts = str.split(":");
    return `${parts[0].padStart(2, "0")}:${parts[1]}`;
  }
  if (/^\d{1,2}\.\d{2}$/.test(str)) {
    const parts = str.split(".");
    return `${parts[0].padStart(2, "0")}:${parts[1]}`;
  }

  const num = Number(str);
  if (!isNaN(num) && num >= 0 && num < 1) {
    const totalMinutes = Math.round(num * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  return "08:00";
}

/**
 * Parsing buffer XLSX/CSV menjadi struktur data itinerary terstruktur
 */
export function parseItineraryBuffer(buffer, fileName = "") {
  try {
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rawJson || rawJson.length === 0) {
      return { success: false, error: "File CSV/Excel kosong atau tidak memiliki data baris." };
    }

    let detectedPackageName = "";
    let detectedStartDate = "";
    let detectedEndDate = "";
    const daysMap = new Map();

    rawJson.forEach((row) => {
      const norm = {};
      Object.keys(row).forEach((k) => {
        const cleanKey = k.trim().toLowerCase().replace(/[\s_-]+/g, "_");
        norm[cleanKey] = row[k];
      });

      // Metadata paket jika ada
      const pkgName = norm.nama_paket || norm.package_name || norm.paket || norm.judul_paket || norm.judul_itinerary || norm.nama_program;
      if (pkgName && !detectedPackageName) detectedPackageName = String(pkgName).trim();

      const sDate = normalizeDate(norm.tanggal_mulai || norm.start_date || norm.tgl_mulai);
      if (sDate && !detectedStartDate) detectedStartDate = sDate;

      const eDate = normalizeDate(norm.tanggal_selesai || norm.end_date || norm.tgl_selesai);
      if (eDate && !detectedEndDate) detectedEndDate = eDate;

      // Nomor Hari
      const rawDay = norm.hari || norm.day || norm.day_number || norm.hari_ke || norm.hari_ke_ || norm.no_hari || norm.no;
      const dayNum = parseInt(rawDay, 10) || 1;

      // Kota / Judul Hari
      const dayTitle = String(
        norm.kota || norm.city || norm.judul_hari || norm.day_title || norm.title || norm.tujuan || `Hari ${dayNum}`
      ).trim();

      // Tanggal Hari
      const dayDate = normalizeDate(norm.tanggal || norm.date || norm.activity_date || norm.tgl || norm.tanggal_kegiatan);

      // Aktivitas
      const time = normalizeTime(norm.jam || norm.waktu || norm.time || norm.activity_time || norm.pukul || norm.jam_kegiatan);
      const title = String(
        norm.judul_kegiatan || norm.kegiatan || norm.activity_title || norm.agenda || norm.aktivitas || norm.acara || norm.judul || norm.nama_kegiatan || ""
      ).trim();
      const location = String(norm.lokasi || norm.location || norm.tempat || norm.venue || dayTitle).trim();
      const description = String(norm.keterangan || norm.deskripsi || norm.description || norm.catatan || norm.notes || norm.detail || "").trim();

      if (!daysMap.has(dayNum)) {
        daysMap.set(dayNum, {
          day_number: dayNum,
          title: dayTitle,
          date: dayDate,
          activities: [],
        });
      }

      const dayObj = daysMap.get(dayNum);
      if ((!dayObj.title || dayObj.title.startsWith("Hari ")) && dayTitle && !dayTitle.startsWith("Hari ")) {
        dayObj.title = dayTitle;
      }
      if (!dayObj.date && dayDate) {
        dayObj.date = dayDate;
      }

      if (title) {
        dayObj.activities.push({
          time: time || "08:00",
          title,
          location: location || "",
          description: description || "",
        });
      }
    });

    const sortedDays = Array.from(daysMap.values())
      .sort((a, b) => a.day_number - b.day_number)
      .map((d, i) => ({
        ...d,
        day_number: i + 1,
        activities:
          d.activities.length > 0
            ? d.activities
            : [{ time: "08:00", title: "Kegiatan Hari Ini", location: d.title, description: "" }],
      }));

    if (sortedDays.length === 0) {
      return { success: false, error: "Tidak ditemukan data hari atau jadwal kegiatan yang valid dalam file." };
    }

    const cleanFileName = fileName.replace(/\.[^/.]+$/, "").replace(/[\s_-]+/g, " ");
    const finalPackageName = detectedPackageName || cleanFileName || "Paket Itinerary Umrah";

    const allDates = sortedDays.map((d) => d.date).filter(Boolean).sort();
    const finalStartDate = detectedStartDate || (allDates.length > 0 ? allDates[0] : new Date().toISOString().split("T")[0]);
    const finalEndDate = detectedEndDate || (allDates.length > 0 ? allDates[allDates.length - 1] : finalStartDate);

    // Lengkapi tanggal hari yang kosong secara otomatis berurutan dari finalStartDate
    sortedDays.forEach((d, idx) => {
      if (!d.date) {
        const base = new Date(finalStartDate);
        base.setDate(base.getDate() + idx);
        const y = base.getFullYear();
        const m = String(base.getMonth() + 1).padStart(2, "0");
        const day = String(base.getDate()).padStart(2, "0");
        d.date = `${y}-${m}-${day}`;
      }
    });

    const totalActivities = sortedDays.reduce((acc, curr) => acc + curr.activities.length, 0);

    return {
      success: true,
      packageName: finalPackageName,
      startDate: finalStartDate,
      endDate: finalEndDate,
      days: sortedDays,
      totalActivities,
    };
  } catch (err) {
    return { success: false, error: "Gagal memproses file: " + err.message };
  }
}

/**
 * Parsing file input langsung (browser File object)
 */
export async function parseItineraryFile(file) {
  return new Promise((resolve) => {
    try {
      if (!file) {
        resolve({ success: false, error: "Tidak ada file yang dipilih." });
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = new Uint8Array(evt.target.result);
          const result = parseItineraryBuffer(buffer, file.name);
          resolve(result);
        } catch (err) {
          resolve({ success: false, error: "Gagal memproses file: " + err.message });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, error: "Gagal membaca file dari penyimpanan perangkat." });
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      resolve({ success: false, error: "Gagal membaca file: " + err.message });
    }
  });
}
