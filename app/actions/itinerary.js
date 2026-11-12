"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

export async function deleteItineraryAction(itineraryId) {
  try {
    if (!itineraryId) {
      return { success: false, error: "ID itinerary tidak valid" };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("itineraries")
      .delete()
      .eq("id", itineraryId);

    if (error) {
      console.error("Gagal menghapus itinerary via admin:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/itinerary");
    return { success: true };
  } catch (err) {
    console.error("Server action delete itinerary error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateItineraryStatusAction(itineraryId, status) {
  try {
    if (!itineraryId) {
      return { success: false, error: "ID itinerary tidak valid" };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const validStatus = status === "Terkirim" ? "published" : status;

    const { error } = await supabaseAdmin
      .from("itineraries")
      .update({
        status: validStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itineraryId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/itinerary");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createItineraryPackageAction(payload) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const {
      title,
      start_date,
      end_date,
      status = "published",
      recipient_type = "all", // "all", "tour_leader_only", "selected"
      selected_tl_ids = [],
      selected_muthawif_ids = [],
      days = []
    } = payload;

    if (!title || !title.trim()) {
      return { success: false, error: "Nama paket itinerary wajib diisi" };
    }

    const validStatus = status === "Terkirim" ? "published" : status;
    const finalStartDate = start_date || new Date().toISOString().split("T")[0];
    const finalEndDate = end_date || finalStartDate;

    // 1. Insert ke itineraries
    const { data: newItin, error: itinErr } = await supabaseAdmin
      .from("itineraries")
      .insert([
        {
          title: title.trim(),
          start_date: finalStartDate,
          end_date: finalEndDate,
          status: validStatus,
        }
      ])
      .select()
      .single();

    if (itinErr) {
      console.error("Gagal insert itinerary:", itinErr.message);
      return { success: false, error: itinErr.message };
    }

    const itineraryId = newItin.id;

    // 2. Insert Recipient Rules & Users
    if (recipient_type === "all") {
      const { data: ruleTL } = await supabaseAdmin
        .from("itinerary_recipient_rules")
        .insert([{ itinerary_id: itineraryId, recipient_role: "tour_leader", recipient_mode: "all" }])
        .select()
        .single();

      const { data: ruleMuth } = await supabaseAdmin
        .from("itinerary_recipient_rules")
        .insert([{ itinerary_id: itineraryId, recipient_role: "muthawif", recipient_mode: "all" }])
        .select()
        .single();
    } else if (recipient_type === "tour_leader_only") {
      await supabaseAdmin
        .from("itinerary_recipient_rules")
        .insert([{ itinerary_id: itineraryId, recipient_role: "tour_leader", recipient_mode: "all" }]);
    } else if (recipient_type === "selected") {
      // Rule TL selected
      const { data: ruleTL } = await supabaseAdmin
        .from("itinerary_recipient_rules")
        .insert([{ itinerary_id: itineraryId, recipient_role: "tour_leader", recipient_mode: "selected" }])
        .select()
        .single();

      if (ruleTL && selected_tl_ids.length > 0) {
        await supabaseAdmin.from("itinerary_recipient_users").insert(
          selected_tl_ids.map(uid => ({ rule_id: ruleTL.id, profile_id: uid }))
        );
      }

      // Rule Muthawif selected
      const { data: ruleMuth } = await supabaseAdmin
        .from("itinerary_recipient_rules")
        .insert([{ itinerary_id: itineraryId, recipient_role: "muthawif", recipient_mode: "selected" }])
        .select()
        .single();

      if (ruleMuth && selected_muthawif_ids.length > 0) {
        await supabaseAdmin.from("itinerary_recipient_users").insert(
          selected_muthawif_ids.map(uid => ({ rule_id: ruleMuth.id, profile_id: uid }))
        );
      }
    }

    // 3. Insert Days & Activities jika ada
    if (days && days.length > 0) {
      for (const day of days) {
        const { data: newDay } = await supabaseAdmin
          .from("itinerary_days")
          .insert([
            {
              itinerary_id: itineraryId,
              day_number: day.day_number || 1,
              activity_date: day.date || finalStartDate,
              title: day.title || `Hari ${day.day_number || 1}`,
            }
          ])
          .select()
          .single();

        if (newDay && day.activities && day.activities.length > 0) {
          await supabaseAdmin.from("itinerary_activities").insert(
            day.activities.map((act, idx) => ({
              itinerary_day_id: newDay.id,
              activity_time: act.time || "08:00",
              title: act.title || "Kegiatan",
              description: act.description || "",
              location: act.location || "",
              sort_order: idx + 1,
            }))
          );
        }
      }
    } else {
      // Default setidaknya Hari 1
      await supabaseAdmin.from("itinerary_days").insert([
        {
          itinerary_id: itineraryId,
          day_number: 1,
          activity_date: finalStartDate,
          title: "Hari 1",
        }
      ]);
    }

    revalidatePath("/itinerary");
    return { success: true, id: itineraryId };
  } catch (err) {
    console.error("Gagal buat paket itinerary:", err.message);
    return { success: false, error: err.message };
  }
}
