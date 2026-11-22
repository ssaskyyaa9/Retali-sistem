"use client";
import React, { useRef, useState } from "react";
import { FiUploadCloud, FiTrash2, FiRefreshCw, FiImage } from "react-icons/fi";

export default function CoverImageUpload({
  coverUrl,
  onCoverChange,
  onCoverRemove,
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar (JPG, PNG, WEBP, GIF) yang diperbolehkan.");
      return;
    }

    const preview = URL.createObjectURL(file);
    if (onCoverChange) {
      onCoverChange(file, preview);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      {coverUrl ? (
        /* Preview utuh seluruh gambar saat sudah diupload */
        <div className="relative group rounded-2xl border border-gray-200 bg-slate-50/70 p-4 transition-all duration-200 hover:border-gray-300 shadow-xs">
          <div className="w-full flex items-center justify-center min-h-[220px] max-h-[380px] overflow-hidden rounded-xl bg-slate-900/5">
            <img
              src={coverUrl}
              alt="Preview Cover"
              className="w-auto h-auto max-h-[360px] max-w-full object-contain rounded-lg transition-transform duration-200"
            />
          </div>

          {/* Action Toolbar */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <FiImage className="w-3.5 h-3.5 text-emerald-600" />
              Foto Cover Terpasang 
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <FiRefreshCw className="w-3 h-3 text-gray-500" />
                Ganti Gambar
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  if (onCoverRemove) onCoverRemove();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <FiTrash2 className="w-3 h-3" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Field input upload jika belum ada gambar */
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#263754] bg-blue-50/50 scale-[0.99]"
              : "border-gray-300 bg-gray-50/50 hover:bg-gray-100/60 hover:border-gray-400"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-2xs mb-3 group-hover:scale-105 transition-transform">
            <FiUploadCloud className="w-6 h-6 text-[#263754]" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            Klik atau seret gambar cover ke sini
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Mendukung file PNG, JPG, JPEG, WEBP, atau GIF (Maks. 5MB)
          </p>
          <button
            type="button"
            disabled={disabled}
            className="mt-3.5 px-4 py-1.5 text-xs font-semibold text-[#263754] bg-white border border-gray-200 rounded-lg shadow-2xs hover:bg-gray-50 pointer-events-none"
          >
            Pilih Foto dari Perangkat
          </button>
        </div>
      )}
    </div>
  );
}
