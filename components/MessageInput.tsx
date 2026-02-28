"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface MessageInputProps {
  conversationId: Id<"conversations">
  currentUserId: string
}

export default function MessageInput({
  conversationId,
  currentUserId,
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sendMessage = useMutation(api.messages.sendMessage)
  const setTypingStatus = useMutation(api.typing.setTypingStatus)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle typing indicator
  useEffect(() => {
    if (message.trim().length > 0) {
      setTypingStatus({
        conversationId,
        userId: currentUserId,
        isTyping: true,
      })

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus({
          conversationId,
          userId: currentUserId,
          isTyping: false,
        })
      }, 2000)
    } else {
      setTypingStatus({
        conversationId,
        userId: currentUserId,
        isTyping: false,
      })
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message, conversationId, currentUserId, setTypingStatus])

  const handleSend = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isSending) return

    setIsSending(true)
    setError(null)
    try {
      // Stop typing immediately when sending
      setTypingStatus({
        conversationId,
        userId: currentUserId,
        isTyping: false,
      })

      await sendMessage({
        conversationId,
        senderId: currentUserId,
        content: trimmedMessage,
      })
      setMessage("")
      setError(null)
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")
      // Keep message in input so user can retry
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t bg-background p-4">
      {error && (
        <div className="mb-2 p-2 bg-destructive/10 text-destructive text-sm rounded-md flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            setError(null) // Clear error when user types
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isSending || !message.trim()}>
          {isSending ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
