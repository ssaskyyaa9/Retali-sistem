"use client";

import React from "react";
import { useParams } from "next/navigation";
import LihatItineraryContent from "../LihatItineraryContent";

export default function LihatItineraryByIdPage() {
  const params = useParams();
  const id = params?.id;

  return <LihatItineraryContent id={id} />;
}
