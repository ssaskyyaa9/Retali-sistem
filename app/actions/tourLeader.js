"use server";
import { createClient } from "@supabase/supabase-js";

export async function createTourLeaderAction(formData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // 1. Create user di auth.users
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
    });

  if (authError) return { success: false, error: authError.message };
  const userId = authData.user.id;

  // 2. Insert ke profiles beserta kloter_id
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert([
    {
      id: userId,
      username: formData.namaLengkap,
      email: formData.email,
      phone: formData.noTelepon,
      role: "tour_leader",
      kloter_id: formData.kloterId || null,
    },
  ]);

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { success: false, error: profileError.message };
  }

  return { success: true };
}

export async function updateTourLeaderAction(userId, formData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Update tabel profiles beserta kloter_id
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      username: formData.namaLengkap,
      email: formData.email,
      phone: formData.noTelepon,
      kloter_id: formData.kloterId || null, // <-- TAMBAHKAN INI
    })
    .eq("id", userId);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  return { success: true };
}

export async function deleteTourLeaderAction(userId) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // 1. Hapus relasi notifikasi penerima
    await supabaseAdmin
      .from("notification_recipients")
      .delete()
      .eq("user_id", userId);

    // 2. Hapus checklist assignments dan answers terkait
    const { data: assignments } = await supabaseAdmin
      .from("checklist_assignments")
      .select("id")
      .eq("recipient_id", userId);

    if (assignments && assignments.length > 0) {
      const assignmentIds = assignments.map((a) => a.id);
      await supabaseAdmin
        .from("checklist_answers")
        .delete()
        .in("assignment_id", assignmentIds);

      await supabaseAdmin
        .from("checklist_assignments")
        .delete()
        .eq("recipient_id", userId);
    }

    // 3. Hapus relasi itinerary recipient
    await supabaseAdmin
      .from("itinerary_recipient_users")
      .delete()
      .eq("profile_id", userId);

    // 4. Hapus relasi user_kloter
    await supabaseAdmin
      .from("user_kloter")
      .delete()
      .eq("user_id", userId);

    // 5. Hapus attendance_guide
    await supabaseAdmin
      .from("attendance_guide")
      .delete()
      .eq("user_id", userId);

    // 6. Hapus scans
    await supabaseAdmin
      .from("scans")
      .delete()
      .eq("user_id", userId);

    // 7. Hapus tasks
    await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("assigned_to", userId);

    // 8. Bersihkan referensi created_by / user_id di tabel terkait
    await supabaseAdmin
      .from("notifications")
      .update({ user_id: null })
      .eq("user_id", userId);
    await supabaseAdmin
      .from("checklist_tasks")
      .update({ created_by: null })
      .eq("created_by", userId);
    await supabaseAdmin
      .from("itineraries")
      .update({ created_by: null })
      .eq("created_by", userId);
    await supabaseAdmin
      .from("preparation_assignments")
      .update({ created_by: null })
      .eq("created_by", userId);
    await supabaseAdmin
      .from("preparation_materials")
      .update({ created_by: null })
      .eq("created_by", userId);

    // 9. Hapus dari tabel public.profiles di Supabase
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Gagal menghapus profile Supabase:", profileError.message);
      return { success: false, error: profileError.message };
    }

    // 10. Hapus dari auth.users di Supabase
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Gagal menghapus user di Supabase Auth:", authError.message);
      return { success: false, error: authError.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error deleteTourLeaderAction:", err);
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat menghapus tour leader.",
    };
  }
}
