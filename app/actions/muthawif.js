"use server";
import { createClient } from "@supabase/supabase-js";

// --- CREATE ---
export async function createMuthawifAction(formData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
    });

  if (authError) return { success: false, error: authError.message };
  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert([
    {
      id: userId,
      username: formData.namaLengkap,
      email: formData.email,
      phone: formData.noTelepon,
      role: "muthawif", // Role disesuaikan
    },
  ]);

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { success: false, error: profileError.message };
  }

  if (formData.kloterId) {
    await supabaseAdmin
      .from("user_kloter")
      .insert([{ user_id: userId, kloter_id: formData.kloterId }]);
  }

  return { success: true };
}

// --- UPDATE ---
export async function updateMuthawifAction(userId, formData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      username: formData.namaLengkap,
      email: formData.email,
      phone: formData.noTelepon,
    })
    .eq("id", userId);

  if (profileError) return { success: false, error: profileError.message };

  if (formData.kloterId) {
    await supabaseAdmin.from("user_kloter").delete().eq("user_id", userId);
    await supabaseAdmin
      .from("user_kloter")
      .insert([{ user_id: userId, kloter_id: formData.kloterId }]);
  }

  return { success: true };
}

// --- DELETE ---
export async function deleteMuthawifAction(userId) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return { success: false, error: error.message };

  return { success: true };
}
