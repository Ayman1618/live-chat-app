"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useEffect, useState } from "react"

interface TypingIndicatorProps {
  conversationId: Id<"conversations">
  currentUserId: string
}

export default function TypingIndicator({
  conversationId,
  currentUserId,
}: TypingIndicatorProps) {
  const typingUsers = useQuery(api.typing.getTypingUsers, {
    conversationId,
    currentUserId,
  })

  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (typingUsers && typingUsers.length > 0) {
      setShowIndicator(true)
    } else {
      setShowIndicator(false)
    }
  }, [typingUsers])

  if (!showIndicator || !typingUsers || typingUsers.length === 0) {
    return null
  }

  const names = typingUsers.map((user) => user.name).join(", ")
  const text =
    typingUsers.length === 1
      ? `${names} is typing...`
      : `${names} are typing...`

  return (
    <div className="flex gap-3 justify-start">
      <div className="bg-muted rounded-lg px-4 py-2">
        <p className="text-sm text-muted-foreground italic">{text}</p>
      </div>
    </div>
  )
}
