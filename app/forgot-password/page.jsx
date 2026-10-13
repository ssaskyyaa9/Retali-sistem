'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  // Tahap 1: Kirim OTP ke email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      );

      if (error) throw error;

      setMessage(
        'Jika email terdaftar, kode pemulihan akan dikirim. Periksa inbox atau folder spam.'
      );
      setStep(2);
    } catch (err) {
      setError(err.message || 'Gagal mengirim kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Tahap 2: Verifikasi OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'recovery',
      });

      if (error) throw error;

      setMessage('OTP berhasil diverifikasi. Silakan buat password baru.');
      setStep(3);
    } catch (err) {
      setError(
        err.message || 'OTP tidak valid atau sudah kedaluwarsa.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Tahap 3: Simpan password baru
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      await supabase.auth.signOut();

      setMessage(
        'Password berhasil diperbarui. Silakan login menggunakan password baru.'
      );
      setStep(4);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui password.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900';

  const buttonClass =
    'w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verifikasi OTP'}
            {step === 3 && 'Password Baru'}
            {step === 4 && 'Reset Berhasil'}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {step === 1 && 'Masukkan email akun untuk menerima kode pemulihan.'}
            {step === 2 && 'Masukkan kode yang dikirim ke email lu.'}
            {step === 3 && 'Buat password baru untuk akun lu.'}
            {step === 4 && 'Password akun lu sudah berhasil diperbarui.'}
          </p>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
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

            <button disabled={loading} className={buttonClass}>
              {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
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

            <button disabled={loading} className={buttonClass}>
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleSendOtp}
              className="w-full text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Kirim ulang kode
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

            <button disabled={loading} className={buttonClass}>
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
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
            className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Kembali ke Login
          </Link>
        )}
      </div>
    </div>
  );
}