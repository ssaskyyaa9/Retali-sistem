"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EditItineraryContent from "./EditItineraryContent";

function EditItineraryPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return <EditItineraryContent id={id} />;
}

export default function EditItineraryPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Memuat form edit itinerary...</p>
        </div>
      </div>
    }>
      <EditItineraryPageInner />
    </Suspense>
  );
}
