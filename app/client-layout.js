"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { SidebarProvider } from "@/app/context/SidebarContext";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Daftar rute yang TIDAK menggunakan Sidebar
  const authRoutes = ["/login", "/forgot-password", "/otp", "/reset-password"];
  const isAuthRoute = authRoutes.includes(pathname);

  return isAuthRoute ? (
    /* Layout Khusus Auth (Tanpa Sidebar) */
    <main className="min-h-screen w-full">{children}</main>
  ) : (
    /* Layout Utama Dashboard (Dengan Sidebar) */
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 bg-white overflow-y-auto min-w-0 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
