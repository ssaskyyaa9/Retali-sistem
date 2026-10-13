const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://be-projectretalitwo.vercel.app';

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Email atau password salah.');
  }

  return data;
}