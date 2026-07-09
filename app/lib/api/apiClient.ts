// /app/lib/api/apiClient.ts

// const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!

// let refreshPromise: Promise<boolean> | null = null

// /**
//  * Refresh the access token using the refresh_token httpOnly cookie.
//  */
// async function refreshAccessToken(): Promise<boolean> {
//   if (!refreshPromise) {
//     refreshPromise = (async () => {
//       try {
//         const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
//           method: 'POST',
//           credentials: 'include',
//         })

//         return res.ok
//       } catch {
//         return false
//       } finally {
//         refreshPromise = null
//       }
//     })()
//   }

//   return refreshPromise
// }

// /**
//  * Generic request helper.
//  */
// export async function apiClient<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const isFormData = options.body instanceof FormData

//   const makeRequest = () =>
//     fetch(`${BACKEND_URL}${endpoint}`, {
//       credentials: 'include',
//       headers: {
//         ...(options.headers ?? {}),
//         ...(isFormData
//           ? {}
//           : {
//               'Content-Type': 'application/json',
//             }),
//       },
//       ...options,
//     })

//   let response = await makeRequest()

//   /**
//    * Access token expired?
//    * Try refreshing once.
//    */
//   if (response.status === 401) {
//     const refreshed = await refreshAccessToken()

//     if (!refreshed) {
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('keila_auth')
//         window.location.href = '/signin'
//       }

//       throw new Error('Session expired')
//     }

//     response = await makeRequest()
//   }

//   const data = await response.json()

//   if (!response.ok) {
//     throw new Error(data.message || 'Request failed')
//   }

//   return data
// }

// /* -------------------------------------------------------------------------- */
// /*                               Helper Methods                               */
// /* -------------------------------------------------------------------------- */

// export function apiGet<T>(endpoint: string) {
//   return apiClient<T>(endpoint, {
//     method: 'GET',
//   })
// }

// export function apiPost<T>(endpoint: string, body?: unknown) {
//   return apiClient<T>(endpoint, {
//     method: 'POST',
//     body: body ? JSON.stringify(body) : undefined,
//   })
// }

// export function apiUpload<T>(endpoint: string, body: FormData) {
//   return apiClient<T>(endpoint, {
//     method: 'POST',
//     body,
//   })
// }

// export function apiPut<T>(endpoint: string, body?: unknown) {
//   return apiClient<T>(endpoint, {
//     method: 'PUT',
//     body: body ? JSON.stringify(body) : undefined,
//   })
// }

// export function apiPatch<T>(endpoint: string, body?: unknown) {
//   return apiClient<T>(endpoint, {
//     method: 'PATCH',
//     body: body ? JSON.stringify(body) : undefined,
//   })
// }

// export function apiDelete<T>(endpoint: string) {
//   return apiClient<T>(endpoint, {
//     method: 'DELETE',
//   })
// }

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!

let refreshPromise: Promise<boolean> | null = null

/**
 * Refresh the access token using the refresh_token httpOnly cookie.
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        return res.ok
      } catch {
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

/**
 * Generic request helper.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData

  const makeRequest = () =>
    fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        ...(options.headers ?? {}),
        ...(isFormData
          ? {}
          : {
              'Content-Type': 'application/json',
            }),
      },
      ...options,
    })

  let response = await makeRequest()

  /**
   * Access token expired?
   * Try refreshing once.
   */
  if (response.status === 401) {
    const refreshed = await refreshAccessToken()

    if (!refreshed) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('keila_auth')
        window.location.href = '/signin'
      }

      throw new Error('Session expired')
    }

    response = await makeRequest()
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

/* -------------------------------------------------------------------------- */
/* Helper Methods                               */
/* -------------------------------------------------------------------------- */

// 🎯 FIXED: All helper functions now forward custom headers and options safely
export function apiGet<T>(
  endpoint: string,
  options?: Omit<RequestInit, 'method'>,
) {
  return apiClient<T>(endpoint, {
    method: 'GET',
    ...options,
  })
}

export function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestInit, 'method' | 'body'>,
) {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  })
}

export function apiUpload<T>(
  endpoint: string,
  body: FormData,
  options?: Omit<RequestInit, 'method' | 'body'>,
) {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body,
    ...options,
  })
}

export function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestInit, 'method' | 'body'>,
) {
  return apiClient<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  })
}

export function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestInit, 'method' | 'body'>,
) {
  return apiClient<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  })
}

export function apiDelete<T>(
  endpoint: string,
  options?: Omit<RequestInit, 'method'>,
) {
  return apiClient<T>(endpoint, {
    method: 'DELETE',
    ...options,
  })
}