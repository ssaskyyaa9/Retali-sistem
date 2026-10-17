import ClientLayout from "./client-layout";
import "./globals.css";

export const metadata = {
  title: "Retali Sistem",
  description: "Sistem Internal Manajemen Umrah dan Tour Leader",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning={true}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
