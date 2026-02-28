"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatMessageDate } from "@/lib/formatDate"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import MessageReactions from "./MessageReactions"

interface MessageItemProps {
  message: {
    _id: Id<"messages">
    senderId: string
    content: string
    createdAt: number
    deleted: boolean
  }
  currentUserId: string
  sender?: {
    _id: string
    clerkId: string
    name: string
    image?: string
  } | null
}

export default function MessageItem({
  message,
  currentUserId,
  sender,
}: MessageItemProps) {
  const deleteMessage = useMutation(api.messages.deleteMessage)

  const isOwnMessage = message.senderId === currentUserId
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await deleteMessage({
        messageId: message._id,
        userId: currentUserId,
      })
    } catch (error) {
      console.error("Error deleting message:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (message.deleted) {
    return (
      <div
        className={`flex gap-3 ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div className="max-w-[70%]">
          <p className="text-sm italic text-muted-foreground">
            This message was deleted
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex gap-3 group ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={sender?.image} alt={sender?.name || ""} />
          <AvatarFallback>{sender?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {!isOwnMessage && (
          <p className="text-xs text-muted-foreground mb-1 px-1">
            {sender?.name || "Unknown"}
          </p>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatMessageDate(message.createdAt)}
          </span>
          {isOwnMessage && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <MessageReactions
          messageId={message._id}
          currentUserId={currentUserId}
        />
      </div>
      {isOwnMessage && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={sender?.image} alt={sender?.name || ""} />
          <AvatarFallback>{sender?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
