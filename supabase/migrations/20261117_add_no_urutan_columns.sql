-- ==============================================================================
-- Migration: Tambah kolom no_urutan pada tabel attendance_user, koper, dan passport_scans
-- Tanggal: 17 November 2026
-- ==============================================================================

-- 1. Tambah kolom no_urutan pada tabel attendance_user (Absensi Jamaah)
ALTER TABLE public.attendance_user 
ADD COLUMN IF NOT EXISTS no_urutan integer;

-- 2. Tambah kolom no_urutan pada tabel koper (Riwayat Scan Koper)
ALTER TABLE public.koper 
ADD COLUMN IF NOT EXISTS no_urutan integer;

-- 3. Tambah kolom no_urutan pada tabel passport_scans (Riwayat Scan Paspor)
ALTER TABLE public.passport_scans 
ADD COLUMN IF NOT EXISTS no_urutan integer;

-- 4. Tambah index opsional untuk optimasi performa sorting urutan
CREATE INDEX IF NOT EXISTS idx_attendance_user_no_urutan ON public.attendance_user (no_urutan);
CREATE INDEX IF NOT EXISTS idx_koper_no_urutan ON public.koper (no_urutan);
CREATE INDEX IF NOT EXISTS idx_passport_scans_no_urutan ON public.passport_scans (no_urutan);
