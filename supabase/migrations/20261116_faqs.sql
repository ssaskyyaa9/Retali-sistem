-- =============================================================================
-- MIGRATION: Tabel FAQ (Frequently Asked Questions)
-- Retali Sistem - Umrah & Hajj Management
-- =============================================================================

-- 1. Buat Tabel public.faqs
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL DEFAULT 'Umum',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 1,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Akses (RLS Policies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'faqs' AND policyname = 'Allow all access to faqs'
  ) THEN
    CREATE POLICY "Allow all access to faqs" ON public.faqs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Masukkan Data FAQ Bawaan (Default Seed Data)
INSERT INTO public.faqs (category, question, answer, sort_order)
VALUES
  (
    'Tour Leader',
    'Bagaimana cara mencatat absensi jamaah saat kegiatan berlangsung?',
    'Tour Leader dapat membuka menu ''Tugas Ceklis'' atau ''Riwayat Absensi'' di sidebar, lalu pilih sesi kegiatan yang aktif (misal: Ziarah Makkah/Madinah atau Keberangkatan). Klik ''Catat Absensi'' atau gunakan fitur ''Riwayat Scan'' untuk memindai barcode paspor/koper jamaah secara cepat.',
    1
  ),
  (
    'Tour Leader',
    'Apa yang harus dilakukan jika ada jamaah yang terpisah dari rombongan?',
    '1. Tetap tenang dan koordinasikan dengan Muthawif serta Tour Leader pendamping.
2. Buka menu ''Kloter'' atau ''Petugas'' untuk melihat kontak darurat dan hotel jamaah.
3. Hubungi nomor kontak jamaah atau periksa titik kumpul (meeting point) yang telah disepakati.
4. Laporkan segera ke tim operasional pusat melalui grup koordinasi.',
    2
  ),
  (
    'Muthawif',
    'Bagaimana panduan Muthawif dalam memberikan bimbingan ibadah saat tawaf & sai?',
    'Muthawif bertugas memimpin doa dan memastikan seluruh jamaah kloter tetap berada dalam barisan dan tidak terpisah. Sebelum memulai, pastikan semua jamaah dalam keadaan suci (berwudhu), kenakan tanda pengenal/syal kloter, dan jelaskan rute serta putaran tawaf maupun sai secara jelas.',
    3
  ),
  (
    'Jamaah & Kloter',
    'Bagaimana cara menambahkan atau mengedit data Kloter baru?',
    'Admin dapat masuk ke menu ''Kloter'' di sidebar, lalu klik tombol ''+ Tambah Kloter'' di pojok kanan atas. Isi nama kloter, tanggal mulai, dan tanggal berakhir, lalu klik ''Simpan''. Untuk mengedit, klik ikon pensil pada baris kloter yang ingin diubah.',
    4
  ),
  (
    'Teknis',
    'Bagaimana cara memindai (scan) koper dan paspor jamaah?',
    'Gunakan menu ''Riwayat Scan'' pada sidebar. Arahkan kamera perangkat ke barcode koper atau barcode paspor jamaah. Sistem akan otomatis memvalidasi data jamaah dan kloter terkait serta mencatat riwayat pemindaian ke dalam database.',
    5
  ),
  (
    'Umum',
    'Apa yang harus dilakukan jika aplikasi lambat atau tidak ada koneksi internet?',
    'Pastikan koneksi internet (Wi-Fi hotel atau SIM card lokal Arab Saudi seperti STC/Mobily/Zain) aktif. Jika sinyal lemah, data formulir lokal tetap aman dan Anda dapat melakukan refresh halaman setelah koneksi internet kembali stabil.',
    6
  )
ON CONFLICT DO NOTHING;
