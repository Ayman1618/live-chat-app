"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useEffect, useRef, useState } from "react"
import MessageItem from "./MessageItem"
import TypingIndicator from "./TypingIndicator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface MessageListProps {
  conversationId: Id<"conversations">
  currentUserId: string
}

export default function MessageList({
  conversationId,
  currentUserId,
}: MessageListProps) {
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
  })
  
  // Batch fetch all unique sender IDs to avoid N+1 queries
  const senderIds = messages
    ? Array.from(new Set(messages.map((msg) => msg.senderId)))
    : []
  
  // Batch fetch users (only if we have sender IDs)
  const users = useQuery(
    api.users.getUsersByIds,
    senderIds.length > 0
      ? {
          clerkIds: senderIds,
        }
      : "skip"
  )
  
  // Create a map for quick lookup
  const usersMap = new Map(
    users?.map((user) => [user.clerkId, user]) ?? []
  )
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)

  // Auto-scroll to bottom when new messages arrive (if user hasn't scrolled up)
  useEffect(() => {
    if (messages === undefined || messages.length === 0) return

    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    if (!viewport) return

    const handleScroll = () => {
      const isAtBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100
      setIsUserScrolledUp(!isAtBottom)
      setShowNewMessagesButton(!isAtBottom)
    }

    viewport.addEventListener("scroll", handleScroll)

    // Check initial scroll position
    const isAtBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100

    // Auto-scroll if user hasn't scrolled up or if it's the first load
    if (!isUserScrolledUp || isAtBottom) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }

    return () => {
      viewport.removeEventListener("scroll", handleScroll)
    }
  }, [messages, isUserScrolledUp])

  // Initial scroll to bottom on mount
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      }, 100)
    }
  }, [conversationId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setIsUserScrolledUp(false)
    setShowNewMessagesButton(false)
  }

  if (messages === undefined) {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full max-w-[70%]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <p className="text-lg font-semibold mb-2">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageItem
                  key={message._id}
                  message={message}
                  currentUserId={currentUserId}
                  sender={usersMap.get(message.senderId)}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
          <TypingIndicator
            conversationId={conversationId}
            currentUserId={currentUserId}
          />
        </div>
      </ScrollArea>
      {showNewMessagesButton && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="shadow-lg"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            New messages
          </Button>
        </div>
      )}
    </div>
  )
}
