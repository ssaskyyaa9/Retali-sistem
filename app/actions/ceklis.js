"use server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function createCeklisAction(
  taskData,
  questionsData,
  recipientIds,
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  try {
    const { data: taskResult, error: taskError } = await supabaseAdmin
      .from("checklist_tasks")
      .insert([
        {
          title: taskData.title,
          opens_at: taskData.opensAt || null,
          closes_at: taskData.closesAt || null,
          status: "published",
        },
      ])
      .select("id")
      .single();

    if (taskError)
      throw new Error("Gagal menyimpan tugas: " + taskError.message);
    const taskId = taskResult.id;

    if (questionsData && questionsData.length > 0) {
      const questionsToInsert = questionsData.map((q, index) => ({
        task_id: taskId,
        question_text: q.text,
        sort_order: index + 1,
      }));

      const { error: questionError } = await supabaseAdmin
        .from("checklist_questions")
        .insert(questionsToInsert);

      if (questionError)
        throw new Error("Gagal menyimpan soal: " + questionError.message);
    }

    if (recipientIds && recipientIds.length > 0) {
      const assignmentsToInsert = recipientIds.map((recipientId) => ({
        task_id: taskId,
        recipient_id: recipientId,
      }));

      const { error: assignError } = await supabaseAdmin
        .from("checklist_assignments")
        .insert(assignmentsToInsert);

      if (assignError)
        throw new Error("Gagal mendistribusikan tugas: " + assignError.message);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export const updateCeklisAction = async (
  taskId,
  taskForm,
  questions,
  recipients,
) => {
  try {
    // 1. Update tabel utama (checklist_tasks)
    const { error: taskError } = await supabase
      .from("checklist_tasks")
      .update({
        title: taskForm.title,
        opens_at: taskForm.opensAt,
        closes_at: taskForm.closesAt,
      })
      .eq("id", taskId);

    if (taskError) throw new Error("Gagal update tugas: " + taskError.message);

    // 2. Update Soal (Hapus yang lama, masukkan yang baru)
    await supabase.from("checklist_questions").delete().eq("task_id", taskId);

    const questionsData = questions.map((q, idx) => ({
      task_id: taskId,
      question_text: q.text, // <-- PERBAIKAN: Gunakan q.text, karena dari frontend dikirim sebagai 'text'
      sort_order: idx + 1, // (Tambahkan ini agar urutannya sama seperti fungsi create)
    }));

    const { error: qError } = await supabase
      .from("checklist_questions")
      .insert(questionsData);

    if (qError) throw new Error("Gagal update soal: " + qError.message);

    await supabase.from("checklist_questions").insert(questionsData);
    // A. Hapus semua penerima lama untuk tugas ini
    await supabase.from("checklist_assignments").delete().eq("task_id", taskId);

    // B. Masukkan penerima yang baru dicentang
    const assignmentsData = recipients.map((recipientId) => ({
      task_id: taskId,
      recipient_id: recipientId,
      status: "pending", // Reset status ke pending jika tugas diubah
    }));

    const { error: assignError } = await supabase
      .from("checklist_assignments")
      .insert(assignmentsData);

    if (assignError)
      throw new Error("Gagal update penerima: " + assignError.message);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
