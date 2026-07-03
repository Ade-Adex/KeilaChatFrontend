// /app/lib/auth/checkAuth.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!

export async function checkAuth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      return false
    }

    return true
  } catch {
    return false
  }
}
