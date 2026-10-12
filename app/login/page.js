
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// export default function LoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function handleLogin(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_URL}/api/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.detail || data.message || "Login gagal."
//         );
//       }

//       if (!data.access_token) {
//         throw new Error("Token login tidak ditemukan dari backend.");
//       }

//       // Dashboard statistik saat ini hanya untuk admin.
//       if (data.user?.role !== "admin") {
//         throw new Error(
//           "Akun ini bukan admin, jadi tidak bisa membuka dashboard admin."
//         );
//       }

//       localStorage.setItem("access_token", data.access_token);

//       if (data.refresh_token) {
//         localStorage.setItem("refresh_token", data.refresh_token);
//       }

//       localStorage.setItem("user", JSON.stringify(data.user));

//       router.push("/");
//     } catch (err) {
//       setError(err.message || "Tidak dapat terhubung ke backend.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
//       <form
//         onSubmit={handleLogin}
//         className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
//       >
//         <h1 className="mb-2 text-3xl font-bold text-gray-900">
//           Login Admin
//         </h1>

//         <p className="mb-8 text-sm text-gray-500">
//           Masuk ke dashboard Retali Sistem.
//         </p>

//         {error && (
//           <div
//             role="alert"
//             className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
//           >
//             {error}
//           </div>
//         )}

//         <label
//           htmlFor="email"
//           className="mb-2 block text-sm font-medium text-gray-700"
//         >
//           Email
//         </label>

//         <input
//           id="email"
//           type="email"
//           autoComplete="username"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="admin@example.com"
//           required
//           className="mb-5 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
//         />

//         <label
//           htmlFor="password"
//           className="mb-2 block text-sm font-medium text-gray-700"
//         >
//           Password
//         </label>

//         <input
//           id="password"
//           type="password"
//           autoComplete="current-password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Masukkan password"
//           required
//           className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full rounded-lg bg-[#263754] px-4 py-3 font-semibold text-white transition hover:bg-[#1d2b42] disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           {loading ? "Sedang login..." : "Login"}
//         </button>
//       </form>
//     </main>
//   );
// }
