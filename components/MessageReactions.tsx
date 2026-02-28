"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

interface MessageReactionsProps {
  messageId: Id<"messages">
  currentUserId: string
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"]

export default function MessageReactions({
  messageId,
  currentUserId,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const reactions = useQuery(api.reactions.getMessageReactions, {
    messageId,
  })
  const toggleReaction = useMutation(api.reactions.toggleReaction)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showPicker])

  const handleReactionClick = async (reaction: string) => {
    await toggleReaction({
      messageId,
      userId: currentUserId,
      reaction,
    })
    setShowPicker(false)
  }

  if (!reactions) {
    return null
  }

  const reactionEntries = Object.entries(reactions)
  const hasReactions = reactionEntries.length > 0

  return (
    <div className="mt-1 flex items-center gap-1 relative">
      {hasReactions && (
        <div className="flex items-center gap-1 flex-wrap">
          {reactionEntries.map(([emoji, data]) => (
            <Button
              key={emoji}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleReactionClick(emoji)}
            >
              {emoji} {data.count}
            </Button>
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setShowPicker(!showPicker)}
      >
        <span className="text-xs">😀</span>
      </Button>
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 mb-1 bg-background border rounded-lg p-1 shadow-lg flex gap-1 z-10"
        >
          {REACTIONS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleReactionClick(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
