"use client";

import React from "react";
import { useParams } from "next/navigation";
import EditItineraryContent from "../EditItineraryContent";

export default function EditItineraryByIdPage() {
  const params = useParams();
  const id = params?.id;

  return <EditItineraryContent id={id} />;
}
