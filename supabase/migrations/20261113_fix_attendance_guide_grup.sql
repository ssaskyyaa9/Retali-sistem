-- =============================================================================
-- MIGRATION: Fix attendance_guide_grup & attendance_guide relations
-- Retali Sistem - Umrah & Hajj Management
-- =============================================================================

-- 1. Hapus constraint check sesi lama agar attendance_guide_grup dapat menyimpan judul sesi kegiatan master (misal: "Keberangkatan Bandara")
ALTER TABLE public.attendance_guide_grup 
  DROP CONSTRAINT IF EXISTS attendance_guide_grup_sesi_check;

-- 2. Tambah kolom relasi & detail sesi ke attendance_guide_grup
ALTER TABLE public.attendance_guide_grup
  ADD COLUMN IF NOT EXISTS sesi_id UUID REFERENCES public.sesi_absensi(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS bagian_sesi VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS target_jam_mulai TIME NULL,
  ADD COLUMN IF NOT EXISTS target_jam_selesai TIME NULL,
  ADD COLUMN IF NOT EXISTS role_kategori VARCHAR(50) DEFAULT 'tour_leader',
  ADD COLUMN IF NOT EXISTS note TEXT NULL;

-- 3. Tambah relasi grup_id di attendance_guide agar tiap absensi petugas terhubung langsung ke parent grupnya
ALTER TABLE public.attendance_guide
  ADD COLUMN IF NOT EXISTS grup_id UUID REFERENCES public.attendance_guide_grup(id) ON DELETE CASCADE;

-- 4. Enable Row Level Security (RLS) & Berikan Policy Akses Penuh
ALTER TABLE public.attendance_guide_grup ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_guide_grup' AND policyname = 'Allow all access to attendance_guide_grup'
  ) THEN
    CREATE POLICY "Allow all access to attendance_guide_grup" ON public.attendance_guide_grup FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Backfill Data: Hubungkan absensi petugas yang sudah pernah dibuat ke attendance_guide_grup
DO $$
DECLARE
  rec RECORD;
  new_grup_id UUID;
BEGIN
  FOR rec IN 
    SELECT DISTINCT ON (sesi, bagian_sesi, attendance_date, kloter) 
      sesi, bagian_sesi, attendance_date, kloter, sesi_id, target_jam_mulai, target_jam_selesai
    FROM public.attendance_guide
    WHERE sesi IS NOT NULL
  LOOP
    -- Insert grup ke attendance_guide_grup jika belum ada
    INSERT INTO public.attendance_guide_grup (
      kloter, 
      attendance_date, 
      sesi, 
      bagian_sesi, 
      sesi_id, 
      target_jam_mulai, 
      target_jam_selesai, 
      role_kategori,
      total_petugas
    )
    VALUES (
      COALESCE(rec.kloter, 'Umum'),
      COALESCE(rec.attendance_date, CURRENT_DATE),
      rec.sesi,
      rec.bagian_sesi,
      rec.sesi_id,
      rec.target_jam_mulai,
      rec.target_jam_selesai,
      'tour_leader',
      (SELECT COUNT(*) FROM public.attendance_guide ag WHERE ag.sesi = rec.sesi AND ag.attendance_date = rec.attendance_date)
    )
    RETURNING id INTO new_grup_id;

    -- Update relasi grup_id di attendance_guide
    UPDATE public.attendance_guide
    SET grup_id = new_grup_id
    WHERE sesi = rec.sesi 
      AND (bagian_sesi = rec.bagian_sesi OR (bagian_sesi IS NULL AND rec.bagian_sesi IS NULL))
      AND attendance_date = rec.attendance_date;
  END LOOP;
END $$;
