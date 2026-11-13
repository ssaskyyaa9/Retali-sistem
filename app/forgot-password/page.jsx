"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthLayout from "@/app/components/AuthLayout";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://be-projectretalitwo.vercel.app"
).replace(/\/+$/, "");

async function postAuth(endpoint, payload) {
  const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Respons backend mungkin bukan JSON.
  }

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || `Permintaan gagal (${response.status}).`
    );
  }

  return data;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  // Tahap 1: Kirim OTP melalui backend FastAPI.
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await postAuth("forgot-password", {
        email: email.trim(),
      });

      setMessage(
        "Jika email terdaftar, kode pemulihan akan dikirim. Periksa inbox atau folder spam."
      );
      setStep(2);
    } catch (err) {
      setError(err.message || "Gagal mengirim kode OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Tahap 2: Verifikasi OTP melalui backend FastAPI.
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const data = await postAuth("verify-reset-otp", {
        email: email.trim(),
        otp: otp.trim(),
      });

      // Backend perlu memberikan token reset setelah OTP valid.
      const token =
        data.reset_token || data.resetToken || data.token;

      if (!token) {
        throw new Error(
          "OTP diverifikasi, tetapi token reset tidak diterima dari backend."
        );
      }

      setResetToken(token);
      setMessage("OTP berhasil diverifikasi. Silakan buat password baru.");
      setStep(3);
    } catch (err) {
      setError(err.message || "OTP tidak valid atau sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  // Tahap 3: Simpan password baru melalui backend FastAPI.
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (!resetToken) {
      setError("Token reset tidak tersedia. Silakan verifikasi OTP kembali.");
      return;
    }

    setLoading(true);

    try {
      await postAuth("reset-password", {
        email: email.trim(),
        reset_token: resetToken,
        new_password: password,
      });

      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setResetToken("");

      setMessage(
        "Password berhasil diperbarui. Silakan login menggunakan password baru."
      );
      setStep(4);
    } catch (err) {
      setError(err.message || "Gagal memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900";

  const buttonClass =
    "w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50";

  return (
    <AuthLayout>
      <div className="w-full bg-white rounded-3xl shadow-2xl shadow-black/40 border border-slate-100 p-8 sm:p-9 space-y-6">
        {/* Retali Logo & Branding Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-[#0d1523] border border-[#1e2b43] p-2 flex items-center justify-center shadow-md mb-3 transition-transform hover:scale-105 duration-200">
            <Image
              src="/logoretali-kuning.png"
              alt="Retali Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="font-extrabold text-lg tracking-tight text-slate-900 uppercase">
            RETALI <span className="text-yellow-500">SISTEM</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Sistem Manajemen Umrah & Tour Leader
          </p>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {step === 1 && "Lupa Password"}
            {step === 2 && "Verifikasi OTP"}
            {step === 3 && "Password Baru"}
            {step === 4 && "Reset Berhasil"}
          </h1>

          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {step === 1 &&
              "Masukkan email akun Anda untuk menerima kode pemulihan password."}
            {step === 2 && "Masukkan kode OTP yang dikirim ke email Anda."}
            {step === 3 && "Buat password baru yang aman untuk akun Anda."}
            {step === 4 &&
              "Password akun Anda telah berhasil diperbarui."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="nama@email.com"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonClass}
            >
              {loading ? "Mengirim..." : "Kirim Kode OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Kode OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={10}
                autoComplete="one-time-code"
                placeholder="Masukkan kode dari email"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonClass}
            >
              {loading ? "Memverifikasi..." : "Verifikasi OTP"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleSendOtp}
              className="w-full text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Kirim ulang kode"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password Baru
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Ulangi password baru"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonClass}
            >
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>
        )}

        {step === 4 && (
          <Link href="/login" className={`${buttonClass} block text-center`}>
            Kembali ke Login
          </Link>
        )}

        {step !== 4 && (
          <Link
            href="/login"
            className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Kembali ke Login
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}