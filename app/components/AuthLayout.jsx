import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 bg-[#0a0f1d] overflow-x-hidden selection:bg-yellow-500/30 selection:text-yellow-200">
      {/* Background Decorative Pattern & Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d] via-[#0d1523] to-[#070b14]" />

        {/* Ambient Radial Lights */}
        <div className="absolute -top-32 -right-32 w-96 h-96 sm:w-[520px] sm:h-[520px] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 sm:w-[520px] sm:h-[520px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />

        {/* Retali Geometric Islamic Star Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06] text-yellow-500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="retali-auth-pattern"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M40 0 L50 20 L70 10 L60 30 L80 40 L60 50 L70 70 L50 60 L40 80 L30 60 L10 70 L20 50 L0 40 L20 30 L10 10 L30 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle
                cx="40"
                cy="40"
                r="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <circle
                cx="0"
                cy="0"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <circle
                cx="80"
                cy="0"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <circle
                cx="0"
                cy="80"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <circle
                cx="80"
                cy="80"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#retali-auth-pattern)" />
        </svg>
      </div>

      {/* Spacer Top */}
      <div className="w-full h-2 sm:h-6" />

      {/* Main Content (Card) */}
      <div className="w-full max-w-md relative z-10 my-auto">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          © {new Date().getFullYear()} Retali Sistem • Manajemen Umrah & Tour Leader
        </p>
      </footer>
    </div>
  );
}
