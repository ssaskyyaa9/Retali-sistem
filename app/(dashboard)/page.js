'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardScreen from "@/app/screens/DashboardScreen";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Cek apakah ada token/user yang tersimpan di localStorage dari backend Python
    const token = localStorage.getItem('token') || localStorage.getItem('user'); 
    
    if (!token) {
      // Jika belum ada token, lempar ke halaman login
      router.push('/login');
    } else {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Memuat...</div>;
  }

  // Jika sudah ada token, tampilkan Dashboard
  return isLoggedIn ? <DashboardScreen /> : null;
}