"use client";

import React, { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    id: "",
    full_name: "",
    username: "",
    email: "",
    role: "Administrator",
    phone: "",
    last_sign_in_at: "",
    created_at: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const optionsDate = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = date.toLocaleDateString("id-ID", optionsDate);
    const formattedTime = date
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(".", ":")
      .replace(":", ".");
    
    return `${formattedDate}, ${formattedTime}`;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Gagal mengambil sesi pengguna.");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetch profile:", profileError);
      }

      // Mengambil Display name dari auth.users user_metadata
      const displayName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User";

      setProfile({
        id: user.id,
        full_name: profileData?.full_name || displayName,
        username: displayName,
        email: profileData?.email || user.email || "-",
        role: profileData?.role || "Administrator",
        phone: profileData?.phone || "-",
        last_sign_in_at: formatDate(user.last_sign_in_at),
        created_at: formatDate(user.created_at),
        is_active: profileData?.is_active ?? true,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Update Display name di auth.users (user_metadata)
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          display_name: profile.username,
        },
      });

      if (authUpdateError) throw authUpdateError;

      // 2. Update nomor telepon di tabel 'profiles'
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          phone: profile.phone,
        })
        .eq("id", profile.id);

      if (profileUpdateError) throw profileUpdateError;

      setMessage({ 
        type: "success", 
        text: "Perubahan profil berhasil disimpan!" 
      });
      setIsEditing(false);
      
      await fetchUserData();
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.message || "Gagal menyimpan perubahan." 
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-slate-50/70 h-screen overflow-hidden flex flex-col font-sans">
        <Topbar title="Profil Saya" breadcrumbs={["Dashboard", "Profil Saya"]} />
        <main className="px-6 py-4 flex-1 max-w-5xl w-full mx-auto flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 animate-pulse space-y-4">
            <div className="h-10 bg-slate-200 rounded-xl w-full" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-48" />
                <div className="h-3 bg-slate-200 rounded w-32" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/70 h-screen overflow-hidden flex flex-col font-sans">
      <Topbar title="Profil Saya" breadcrumbs={["Dashboard", "Profil Saya"]} />
      
      <main className="px-6 py-4 lg:px-10 space-y-4 flex-1 max-w-5xl w-full mx-auto flex flex-col justify-center overflow-hidden">
        {message.text && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs font-semibold shadow-sm border shrink-0 ${
              message.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden shrink-0">
          <div className="h-10 bg-[#121c2d] px-6 py-2" />

          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-300 text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="space-y-0.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {profile.username}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                    {profile.role}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2 ${
                isEditing
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  : "bg-[#121c2d] text-white hover:bg-[#1e2b43]"
              }`}
            >
              {isEditing ? "Batal Edit" : "Edit Profil"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 shrink-0">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Informasi Detail Akun
              </h3>
              <p className="text-[11px] text-slate-500">
                Kelola identitas personal dan nomor kontak Anda.
              </p>
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Username
                </p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {profile.username}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Utama
                </p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                  {profile.email}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nomor Telepon / WhatsApp
                </p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {profile.phone}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Terakhir Login
                </p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {profile.last_sign_in_at}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tanggal Bergabung
                </p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {profile.created_at}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status Akun
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      profile.is_active ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  ></span>
                  <span
                    className={`font-semibold text-xs sm:text-sm ${
                      profile.is_active ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {profile.is_active ? "Aktif" : "Suspended"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Username (Display Name)
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({ ...profile, username: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={profile.phone === "-" ? "" : profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Akun{" "}
                    <span className="text-slate-400 font-normal">
                      (Tidak dapat diubah)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-400 bg-slate-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#121c2d] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1e2b43] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
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