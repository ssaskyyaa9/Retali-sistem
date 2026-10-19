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
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
