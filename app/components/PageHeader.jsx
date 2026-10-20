import React from "react";

export default function PageHeader({
  icon,
  title,
  description,
  buttonText,
  buttonIcon,
  buttonOnClick,
  buttonBgColor = "bg-[#1b3167] hover:bg-[#253247]",
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* KIRI: Icon, Judul, Deskripsi */}
      <div className="animate-fade-in-left flex items-center gap-4">
        {icon && (
          <div className="bg-[#1b3167] w-[56px] h-[56px] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex flex-col justify-center">
          <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[15px] text-[#8c9bb0] mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* KANAN: Tombol (Opsional) */}
      {buttonText && (
        <button
          onClick={buttonOnClick}
          className={`animate-fade-in-right ${buttonBgColor} shrink-0 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors`}
          style={{ animationDelay: "400ms" }}
        >
          {buttonIcon}
          {buttonText}
        </button>
      )}
    </div>
  );
}
