"use client";

import React, { useState } from "react";
import Topbar from "../components/Topbar";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    full_name: "Gunawan Kyo",
    username: "gunawankyo23",
    email: "gunawankyo23@gmail.com",
    role: "Administrator",
    phone: "081234567890",
    status: "Aktif",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSuccessMessage("Perubahan berhasil disimpan! (Mode Tampilan)");
    setIsEditing(false);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <div className="w-full bg-slate-50/70 h-screen overflow-hidden flex flex-col font-sans">
      <Topbar title="Profil Saya" breadcrumbs={["Dashboard", "Profil Saya"]} />
      <main className="p-6 lg:p-10 space-y-6 flex-1 max-w-5xl w-full mx-auto overflow-y-auto">
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl text-xs font-semibold shadow-sm">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden">
          <div className="h-12 bg-[#121c2d] px-6 py-3 flex justify-end items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-400/40 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
              {profile.status}
            </span>
          </div>

          <div className="px-8 pb-6 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-300 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight"> {profile.full_name} </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100"> {profile.role} </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium"> {profile.email} </span>
                </div>
              </div>
            </div>

            <button onClick={() => setIsEditing(!isEditing)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2 ${
                isEditing
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  : "bg-[#121c2d] text-white hover:bg-[#1e2b43]"
              }`}
            >
              {isEditing ? "Batal Edit" : "Edit Profil"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900"> Informasi Detail Akun </h3>
              <p className="text-xs text-slate-500 mt-0.5"> Kelola identitas personal dan nomor kontak Anda. </p>
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nama Lengkap</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {profile.full_name}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Username</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {profile.username}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Utama</p>
                <p className="font-semibold text-slate-800 text-sm truncate">
                  {profile.email}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nomor Telepon / WhatsApp</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {profile.phone}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hak Akses Role</p>
                <p className="font-semibold text-slate-800 text-sm capitalize">
                  {profile.role}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status Akun</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-800 text-sm">{profile.status}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5"> Nama Lengkap </label>
                  <input type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value }) }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5"> Username </label>
                  <input
                    type="text" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value }) }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Akun <span className="text-slate-400 font-normal">(Tidak dapat diubah)</span>
                  </label>
                  <input type="email" value={profile.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-400 bg-slate-100 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5"> Nomor Telepon / WhatsApp </label>
                  <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value }) }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button type="submit" className="px-6 py-2.5 bg-[#121c2d] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1e2b43] transition-all cursor-pointer flex items-center gap-2" >
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer" >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}