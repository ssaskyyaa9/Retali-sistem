import { supabase } from "./supabase";

/**
 * Mengunggah file gambar cover ke Supabase Storage (bucket 'persiapan')
 * Jika gagal mengunggah ke bucket, akan otomatis fallback ke base64 Data URL
 */
export async function uploadCoverImage(file) {
  if (!file) return null;

  try {
    const fileExt = file.name.split(".").pop() || "png";
    const cleanFileName = `cover-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("persiapan")
      .upload(cleanFileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.warn("Upload ke storage gagal, fallback ke Base64:", error.message);
      return await fileToBase64(file);
    }

    const { data: urlData } = supabase.storage
      .from("persiapan")
      .getPublicUrl(cleanFileName);

    return urlData.publicUrl;
  } catch (err) {
    console.warn("Storage upload exception, fallback ke Base64:", err);
    return await fileToBase64(file);
  }
}

/**
 * Konversi File menjadi Data URL Base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
