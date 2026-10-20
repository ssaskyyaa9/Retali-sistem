import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  // Inisialisasi response awal
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Membuat Supabase client khusus untuk Middleware (Server-side)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 1. Cek sesi user saat ini (apakah token valid?)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Tentukan rute mana saja yang HARUS login (Private Routes)
  // Tambahkan rute lain jika ada, misal: '/itinerary', '/pengaturan'
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // LOGIKA PROTEKSI:
  if (isProtectedRoute) {
    // A. Jika TIDAK ADA USER (Belum login), tendang ke halaman /login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // B. Jika ADA USER, kita pastikan dia bukan Tour Leader / Muthawif
    // (Lapisan pertahanan kedua agar mereka tidak bisa bypass)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile &&
      (profile.role === "tour_leader" || profile.role === "muthawif")
    ) {
      // Sign out paksa dari sesi server
      await supabase.auth.signOut();

      // Arahkan kembali ke halaman login
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      // Anda bisa menambahkan query parameter untuk menampilkan error di halaman login
      url.searchParams.set(
        "error",
        "Akses Ditolak. Silakan gunakan Aplikasi Mobile.",
      );
      return NextResponse.redirect(url);
    }
  }

  // C. Jika user SUDAH LOGIN (sebagai Admin) tapi mencoba mengakses halaman '/login',
  // langsung arahkan saja ke /dashboard agar tidak usah login dua kali.
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Kembalikan response normal jika semua aman
  return supabaseResponse;
}

// Konfigurasi Matcher: Memberi tahu Next.js rute mana saja yang harus melewati Middleware ini
export const config = {
  matcher: [
    /*
     * Middleware akan berjalan di SEMUA rute (termasuk /dashboard, /login, dll) KECUALI:
     * - _next/static (file statis bawaan Next.js)
     * - _next/image (optimasi gambar bawaan Next.js)
     * - favicon.ico (ikon browser)
     * - File statis publik (seperti .svg, .png, .jpg, dll)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
