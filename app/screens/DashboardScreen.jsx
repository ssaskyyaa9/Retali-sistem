// app/screens/DashboardScreen.jsx
import React from "react";

export default function DashboardScreen() {
  return (
    <div className="p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Admin
        </h1>
        <p className="text-gray-500 text-sm">Atur semua data dengan mudah</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <DashboardCard title="Total Scan" value="1" />
        <DashboardCard title="Total Pengguna" value="1" />
        <DashboardCard title="Total Notifikasi" value="2" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="bg-[#263754] rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-md text-white h-40">
      {/* Dynamic Icon SVG would go here based on props */}
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
