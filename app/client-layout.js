"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Daftar rute yang TIDAK menggunakan Sidebar
  const authRoutes = ["/login", "/forgot-password", "/otp", "/reset-password"];
  const isAuthRoute = authRoutes.includes(pathname);

  return isAuthRoute ? (
    /* Layout Khusus Auth (Tanpa Sidebar) */
    <main className="min-h-screen w-full bg-slate-50">{children}</main>
  ) : (
    /* Layout Utama Dashboard (Dengan Sidebar) */
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-white overflow-y-auto">{children}</main>
    </div>
  );
}
