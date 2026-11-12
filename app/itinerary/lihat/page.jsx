"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LihatItineraryContent from "./LihatItineraryContent";

function LihatItineraryPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return <LihatItineraryContent id={id} />;
}

export default function LihatItineraryPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1b3167] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Memuat data itinerary...</p>
        </div>
      </div>
    }>
      <LihatItineraryPageInner />
    </Suspense>
  );
}
