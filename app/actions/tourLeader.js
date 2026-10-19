"use server";
import { createClient } from "@supabase/supabase-js";

export async function createTourLeaderAction(formData) {
  // Initialize Supabase with the Service Role Key to bypass client restrictions
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // NEVER expose this to the client
  );

  // 1. Create the user directly in auth.users
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true, // Auto-confirm the email
    });

  if (authError) return { success: false, error: authError.message };

  const userId = authData.user.id;

  // 2. Insert into the public.profiles table
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert([
    {
      id: userId,
      username: formData.namaLengkap,
      email: formData.email,
      phone: formData.noTelepon,
      role: "tour_leader",
    },
  ]);

  if (profileError) {
    // Optional cleanup: if profile fails, you might want to delete the auth user
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { success: false, error: profileError.message };
  }

  // 3. Link to kloter if selected
  if (formData.kloterId) {
    await supabaseAdmin
      .from("user_kloter")
      .insert([{ user_id: userId, kloter_id: formData.kloterId }]);
  }

  return { success: true };
}

export async function updateTourLeaderAction(userId, formData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Update tabel profiles
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      username: formData.namaLengkap,
      email: formData.email,
      phone: formData.noTelepon,
    })
    .eq("id", userId);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // Update relasi kloter (opsional, sesuaikan dengan skema Anda)
  if (formData.kloterId) {
    // Hapus relasi lama lalu insert yang baru (cara paling aman untuk relasi 1-to-1)
    await supabaseAdmin.from("user_kloter").delete().eq("user_id", userId);
    await supabaseAdmin
      .from("user_kloter")
      .insert([{ user_id: userId, kloter_id: formData.kloterId }]);
  }

  return { success: true };
}

export async function deleteTourLeaderAction(userId) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Menghapus dari auth.users otomatis akan menghapus data di tabel profiles
  // (jika foreign key diset ON DELETE CASCADE).
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
