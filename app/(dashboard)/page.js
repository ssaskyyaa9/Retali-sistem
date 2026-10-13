'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardScreen from "@/app/screens/DashboardScreen";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Cek sesi login saat aplikasi dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        // Jika belum login, arahkan ke halaman login
        router.push('/login');
      }
    });
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Memuat...</div>;
  }

  // Jika sudah login, tampilkan Dashboard
  return session ? <DashboardScreen /> : null;
}