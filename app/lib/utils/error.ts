/**
 * Safely extracts a user-friendly error message from an unknown error object.
 */
export function getErrorMessage(error: unknown): string {
  const fallbackMessage = 'Something went wrong. Please try again.'

  if (!error) return fallbackMessage
  if (typeof error === 'string') return error

  if (typeof error === 'object') {
    // Looks for backend error structures (e.g., error.response.data.message)
    if ('response' in error) {
      const responseObj = (error as { response: unknown }).response
      if (
        responseObj &&
        typeof responseObj === 'object' &&
        'data' in responseObj
      ) {
        const dataObj = (responseObj as { data: unknown }).data
        if (dataObj && typeof dataObj === 'object' && 'message' in dataObj) {
          const apiMessage = (dataObj as { message: unknown }).message
          if (typeof apiMessage === 'string') return apiMessage
        }
      }
    }

    // Fallback to standard JavaScript Error objects (e.g., error.message)
    if ('message' in error) {
      const messageValue = (error as { message: unknown }).message
      if (typeof messageValue === 'string') return messageValue
    }
  }

  return fallbackMessage
}




/**
 * Safely extracts the exact message string sent by your backend `res.status().json()`.
 * Handled with 100% type safety and zero 'any'.
 */
export function getSuccessMessage(
  response: unknown,
  fallback = 'Changes saved successfully.',
): string {
  if (!response || typeof response !== 'object') {
    return fallback
  }

  // Axios packages the backend JSON payload inside a "data" object property.
  // This safely unwraps response.data.message
  if ('data' in response) {
    const dataObj = (response as { data: unknown }).data
    if (dataObj && typeof dataObj === 'object' && 'message' in dataObj) {
      const backendMessage = (dataObj as { message: unknown }).message
      if (typeof backendMessage === 'string') {
        return backendMessage
      }
    }
  }

  // Fallback check if your fetcher client extracts the JSON payload early (response.message)
  if ('message' in response) {
    const directMessage = (response as { message: unknown }).message
    if (typeof directMessage === 'string') {
      return directMessage
    }
  }

  return fallback
}
