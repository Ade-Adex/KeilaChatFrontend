// /app/lib/chatDate.ts

export function getMessageDate(dateString: string) {
  const date = new Date(dateString)

  const today = new Date()

  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}