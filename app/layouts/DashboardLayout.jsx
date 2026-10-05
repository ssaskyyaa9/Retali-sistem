// app/layouts/DashboardLayout.jsx
import React from "react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar Component */}
      <aside className="w-64 bg-[#263754] flex flex-col justify-between text-white shadow-xl z-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold">R</span>
            </div>
            <span className="font-bold text-sm tracking-wide">
              RETALI SISTEM
            </span>
          </div>

          <nav className="flex flex-col gap-1 px-3">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 bg-[#1e2b43] rounded-md border-l-4 border-yellow-500 text-white font-medium"
            >
              {/* Icon SVG */} Dashboard
            </a>
            {/* Other Nav Items */}
          </nav>
        </div>

        <div className="p-6">{/* Profile & Logout Button */}</div>
      </aside>

      {/* Main Dynamic Content Area */}
      <main className="flex-1 bg-white overflow-y-auto">
        {children} {/* The screen component will be injected here */}
      </main>
    </div>
  );
}
