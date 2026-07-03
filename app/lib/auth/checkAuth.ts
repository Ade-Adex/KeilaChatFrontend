// // /app/lib/auth/checkAuth.ts

// const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!

// export async function checkAuth() {
//   try {
//     const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
//       method: 'POST',
//       credentials: 'include',
//     })

//     if (!response.ok) {
//       return false
//     }

//     return true
//   } catch {
//     return false
//   }
// }








// /app/lib/auth/checkAuth.ts

import type { AccountData, OperatorData } from '@/app/types/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!

interface CheckAuthResult {
  authenticated: boolean
  account: AccountData | null
  operator: OperatorData | null
}

export async function checkAuth(): Promise<CheckAuthResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      return { authenticated: false, account: null, operator: null }
    }

    const resBody = await response.json()

    if (resBody?.success && resBody?.data?.operator) {
      return {
        authenticated: true,
        account: resBody.data.account,
        operator: resBody.data.operator,
      }
    }

    return { authenticated: false, account: null, operator: null }
  } catch {
    return { authenticated: false, account: null, operator: null }
  }
}