// app/(dashboard)/dashboard-layout.js
"use client";
import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar: flex-col and h-full ensures it spans the screen height */}
      <Sidebar />

      {/* Main Dynamic Content Area */}
      <main className="flex-1 bg-white overflow-y-auto">{children}</main>
    </div>
  );
}
