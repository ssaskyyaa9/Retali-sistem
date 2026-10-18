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
      full_name: formData.namaLengkap,
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
