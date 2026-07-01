/**
 * Safely extracts a user-friendly error message from an unknown error object.
 * This explicitly avoids using 'any' by using nested type-guards and assertions.
 */
export function getErrorMessage(error: unknown): string {
  const fallbackMessage = 'Something went wrong. Please try again.'

  if (!error) {
    return fallbackMessage
  }

  // 1. Handle explicit string errors
  if (typeof error === 'string') {
    return error
  }

  // 2. Handle object structures (Axios, Fetch responses, or standard Errors)
  if (typeof error === 'object') {
    // Check for nested API response structures: error.response.data.message
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
          if (typeof apiMessage === 'string') {
            return apiMessage
          }
        }
      }
    }

    // Check for standard JavaScript Error objects: error.message
    if ('message' in error) {
      const messageValue = (error as { message: unknown }).message
      if (typeof messageValue === 'string') {
        return messageValue
      }
    }
  }

  return fallbackMessage
}
