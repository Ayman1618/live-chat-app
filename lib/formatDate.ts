/**
 * Format message timestamp based on date
 * Today → show time only (2:34 PM)
 * Same year → Feb 15, 2:34 PM
 * Different year → Feb 15, 2024, 2:34 PM
 */
export function formatMessageDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )

  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  // Today
  if (messageDate.getTime() === today.getTime()) {
    return timeString
  }

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    const month = date.toLocaleDateString("en-US", { month: "short" })
    const day = date.getDate()
    return `${month} ${day}, ${timeString}`
  }

  // Different year
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}, ${timeString}`
}
