-- =============================================================================
-- MIGRATION: Master Sesi & Bagian Sesi Absensi (Terpisah: Jamaah & Petugas)
-- Retali Sistem - Umrah & Hajj Management
-- =============================================================================

-- 1. Buat Tabel Master Sesi Absensi
-- Kategori dipisahkan:
--   'jamaah'        -> Sesi untuk Jamaah (semua jamaah, tanpa subkategori)
--   'semua_petugas' -> Sesi untuk Semua Petugas (Tour Leader & Muthawif)
--   'tour_leader'   -> Sesi khusus Tour Leader
--   'muthawif'      -> Sesi khusus Muthawif
CREATE TABLE IF NOT EXISTS public.sesi_absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    kategori VARCHAR(50) NOT NULL DEFAULT 'jamaah', 
    target_jam_mulai TIME NULL,                 -- Target waktu awal absensi (khusus petugas)
    target_jam_selesai TIME NULL,               -- Batas akhir waktu absensi (khusus petugas)
    keterangan TEXT NULL,
    urutan INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Buat Tabel Bagian/Isi Sesi Absensi
CREATE TABLE IF NOT EXISTS public.bagian_sesi_absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesi_id UUID NOT NULL REFERENCES public.sesi_absensi(id) ON DELETE CASCADE,
    nama_bagian VARCHAR(255) NOT NULL,
    target_jam_mulai TIME NULL,
    target_jam_selesai TIME NULL,
    urutan INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tambahkan Kolom Sesi & Target Waktu pada Absensi Petugas (attendance_guide)
ALTER TABLE public.attendance_guide 
  ADD COLUMN IF NOT EXISTS sesi VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS bagian_sesi VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS sesi_id UUID REFERENCES public.sesi_absensi(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS target_jam_mulai TIME NULL,
  ADD COLUMN IF NOT EXISTS target_jam_selesai TIME NULL,
  ADD COLUMN IF NOT EXISTS status_waktu VARCHAR(50) NULL, -- 'tepat_waktu', 'terlambat', 'di_luar_jadwal'
  ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(50) DEFAULT 'belum_absen';

-- 4. Tambahkan Kolom Referensi Sesi pada Grup Absensi Jamaah (attendance_grup)
ALTER TABLE public.attendance_grup 
  ADD COLUMN IF NOT EXISTS sesi_id UUID REFERENCES public.sesi_absensi(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS bagian_sesi VARCHAR(255) NULL;

-- 5. Aktifkan Row Level Security (RLS) & Buat Policy Akses Terbuka
ALTER TABLE public.sesi_absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bagian_sesi_absensi ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sesi_absensi' AND policyname = 'Allow all access to sesi_absensi'
  ) THEN
    CREATE POLICY "Allow all access to sesi_absensi" ON public.sesi_absensi FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bagian_sesi_absensi' AND policyname = 'Allow all access to bagian_sesi_absensi'
  ) THEN
    CREATE POLICY "Allow all access to bagian_sesi_absensi" ON public.bagian_sesi_absensi FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Normalisasi kategori lama (jika sebelumnya ada data 'semua' atau 'umum')
UPDATE public.sesi_absensi
SET kategori = 'semua_petugas'
WHERE kategori IN ('semua', 'umum', 'petugas') OR kategori IS NULL;

-- 6. Insert Data Master Sesi Awal (Terpisah Antara Jamaah & Petugas)

-- A. SESI KHUSUS JAMAAH (kategori: 'jamaah' - tidak ada subkategori, untuk seluruh jamaah)
INSERT INTO public.sesi_absensi (id, judul, kategori, target_jam_mulai, target_jam_selesai, keterangan, urutan)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Keberangkatan Bandara (Departure)', 'jamaah', NULL, NULL, 'Kumpul dan verifikasi kehadiran jamaah di bandara keberangkatan', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Pesawat & Transit Penerbangan', 'jamaah', NULL, NULL, 'Pengecekan manifes saat boarding dan transit penerbangan', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Kedatangan Bandara Jeddah/Madinah', 'jamaah', NULL, NULL, 'Pengecekan jamaah selesai imigrasi dan menaiki bus transfer', 3),
  ('a1000000-0000-0000-0000-000000000004', 'Check-in Hotel Madinah', 'jamaah', NULL, NULL, 'Pembagian kunci kamar dan penataan jamaah di hotel Madinah', 4),
  ('a1000000-0000-0000-0000-000000000005', 'Ziarah & City Tour Kota Madinah', 'jamaah', NULL, NULL, 'Pengecekan jamaah sebelum keberangkatan bus ziarah', 5),
  ('a1000000-0000-0000-0000-000000000006', 'Perjalanan Madinah ke Makkah (Miqat Bir Ali)', 'jamaah', NULL, NULL, 'Pengecekan ihram dan niat miqat di Bir Ali menuju Makkah', 6),
  ('a1000000-0000-0000-0000-000000000007', 'Pelaksanaan Tawaf & Sai (Ibadah Umrah)', 'jamaah', NULL, NULL, 'Pengecekan regu sebelum masuk Masjidil Haram untuk umrah', 7),
  ('a1000000-0000-0000-0000-000000000008', 'Kepulangan ke Tanah Air (Return Flight)', 'jamaah', NULL, NULL, 'Pengecekan koper dan kelengkapan jamaah saat pulang', 8)
ON CONFLICT (id) DO UPDATE SET
  judul = EXCLUDED.judul,
  kategori = EXCLUDED.kategori,
  target_jam_mulai = EXCLUDED.target_jam_mulai,
  target_jam_selesai = EXCLUDED.target_jam_selesai,
  keterangan = EXCLUDED.keterangan,
  urutan = EXCLUDED.urutan;

-- Bagian/Isi Sesi Jamaah
INSERT INTO public.bagian_sesi_absensi (sesi_id, nama_bagian, urutan)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Terminal 3 Gate 1 (Kumpul Jamaah)', 1),
  ('a1000000-0000-0000-0000-000000000001', 'Boarding Gate & Masuk Pesawat', 2),
  ('a1000000-0000-0000-0000-000000000002', 'Pesawat Udara (Flight)', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Transit Airport', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Bus 1 (Transfer Hotel)', 1),
  ('a1000000-0000-0000-0000-000000000003', 'Bus 2 (Transfer Hotel)', 2),
  ('a1000000-0000-0000-0000-000000000004', 'Lobby & Pembagian Kunci Kamar', 1),
  ('a1000000-0000-0000-0000-000000000004', 'Masuk Kamar & Istirahat', 2),
  ('a1000000-0000-0000-0000-000000000005', 'Masjid Quba & Jabal Uhud', 1),
  ('a1000000-0000-0000-0000-000000000005', 'Kebun Kurma & Masjid Qiblatain', 2),
  ('a1000000-0000-0000-0000-000000000006', 'Miqat Masjid Bir Ali (Niat Ihram)', 1),
  ('a1000000-0000-0000-0000-000000000006', 'Bus Perjalanan Menuju Makkah', 2),
  ('a1000000-0000-0000-0000-000000000007', 'Tawaf Qudum & Pelataran Ka''bah', 1),
  ('a1000000-0000-0000-0000-000000000007', 'Sai Shafa-Marwah & Tahallul', 2),
  ('a1000000-0000-0000-0000-000000000008', 'Check-out Hotel & Muat Bagasi', 1),
  ('a1000000-0000-0000-0000-000000000008', 'Boarding Bandara Kepulangan', 2)
ON CONFLICT DO NOTHING;

-- B. SESI PETUGAS (kategori: 'semua_petugas', 'tour_leader', 'muthawif' - HANYA untuk petugas dengan target waktu)
INSERT INTO public.sesi_absensi (id, judul, kategori, target_jam_mulai, target_jam_selesai, keterangan, urutan)
VALUES
  -- 1. Semua Petugas (Tour Leader & Muthawif)
  ('b1000000-0000-0000-0000-000000000001', 'Briefing & Absensi Kumpul Bandara', 'semua_petugas', '04:30', '06:30', 'Absensi kehadiran seluruh petugas saat briefing di bandara', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Pengawalan Bus Transfer Antar Kota', 'semua_petugas', '16:00', '19:30', 'Absensi pendampingan jamaah dalam bus transfer hotel', 2),
  ('b1000000-0000-0000-0000-000000000003', 'Distribusi Kamar & Pendampingan Hotel', 'semua_petugas', '18:00', '21:00', 'Absensi koordinasi kunci dan penataan jamaah di hotel', 3),
  ('b1000000-0000-0000-0000-000000000004', 'Pengawalan Rombongan Umrah di Masjidil Haram', 'semua_petugas', '20:00', '23:30', 'Absensi pengawalan langsung tawaf dan sai bersama jamaah', 4),

  -- 2. Khusus Tour Leader
  ('b1000000-0000-0000-0000-000000000005', 'Boarding Gate & Manifes Penumpang', 'tour_leader', '08:00', '10:00', 'Pengecekan tiket, paspor, dan boarding gate jamaah', 5),
  ('b1000000-0000-0000-0000-000000000006', 'Handling Kepulangan & Bagasi Bandara', 'tour_leader', '09:30', '12:30', 'Pengecekan bagasi dan paspor sebelum penerbangan pulang', 6),

  -- 3. Khusus Muthawif
  ('b1000000-0000-0000-0000-000000000007', 'Penyambutan & Handling Imigrasi Saudi', 'muthawif', '14:00', '16:30', 'Penyambutan dan pendampingan di bandara kedatangan Saudi', 7),
  ('b1000000-0000-0000-0000-000000000008', 'Bimbingan Miqat & Niat Ihram Bir Ali', 'muthawif', '13:30', '15:30', 'Bimbingan tata cara ihram dan niat umrah di Miqat', 8),
  ('b1000000-0000-0000-0000-000000000009', 'Bimbingan Ziarah & Kajian Harian Madinah', 'muthawif', '07:00', '09:30', 'Pemanduan tausiyah dan ziarah napak tilas Rasulullah', 9)
ON CONFLICT (id) DO UPDATE SET
  judul = EXCLUDED.judul,
  kategori = EXCLUDED.kategori,
  target_jam_mulai = EXCLUDED.target_jam_mulai,
  target_jam_selesai = EXCLUDED.target_jam_selesai,
  keterangan = EXCLUDED.keterangan,
  urutan = EXCLUDED.urutan;

-- Bagian/Isi Sesi Petugas
INSERT INTO public.bagian_sesi_absensi (sesi_id, nama_bagian, urutan)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Meeting Point Lounge', 1),
  ('b1000000-0000-0000-0000-000000000001', 'Penyerahan Dokumen & Paspor', 2),
  ('b1000000-0000-0000-0000-000000000002', 'Bus 1 Rombongan', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Bus 2 Rombongan', 2),
  ('b1000000-0000-0000-0000-000000000003', 'Lobby Hotel', 1),
  ('b1000000-0000-0000-0000-000000000003', 'Kamar Jamaah', 2),
  ('b1000000-0000-0000-0000-000000000004', 'Pelataran Ka''bah (Tawaf)', 1),
  ('b1000000-0000-0000-0000-000000000004', 'Mas''a (Sai & Tahallul)', 2),
  ('b1000000-0000-0000-0000-000000000005', 'Gate Boarding Terminal', 1),
  ('b1000000-0000-0000-0000-000000000006', 'Drop Zone & Bagasi Bandara', 1),
  ('b1000000-0000-0000-0000-000000000007', 'Area Imigrasi Kedatangan', 1),
  ('b1000000-0000-0000-0000-000000000008', 'Masjid Bir Ali', 1),
  ('b1000000-0000-0000-0000-000000000009', 'Masjid Quba & Uhud', 1)
ON CONFLICT DO NOTHING;
