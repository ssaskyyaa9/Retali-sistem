import { redirect } from "next/navigation";

export default function RootPage() {
  // Langsung arahkan pengguna ke halaman login saat membuka web
  redirect("/login");
}