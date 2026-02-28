"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Id } from "@/convex/_generated/dataModel"
import { formatMessageDate } from "@/lib/formatDate"

interface ConversationItemProps {
  conversation: {
    _id: Id<"conversations">
    isGroup: boolean
    name?: string
    members: string[]
    lastMessageAt: number
  }
  currentUserId: string
  isActive: boolean
  unreadCount: number
}

export default function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  unreadCount,
}: ConversationItemProps) {
  const router = useRouter()

  // Get last message
  const lastMessage = useQuery(api.messages.getLastMessage, {
    conversationId: conversation._id,
  })

  // Get other user(s) for display
  const otherMembers = conversation.members.filter(
    (id) => id !== currentUserId
  )

  // For one-on-one, get the other user's details
  const otherUser = useQuery(
    api.users.getUserByClerkId,
    !conversation.isGroup && otherMembers.length > 0
      ? { clerkId: otherMembers[0] }
      : "skip"
  )

  // For groups, get member count
  const memberCount = conversation.members.length

  const displayName = conversation.isGroup
    ? conversation.name || `Group (${memberCount})`
    : otherUser?.name || "Unknown User"

  const displayImage = conversation.isGroup
    ? undefined
    : otherUser?.image

  const isOnline = !conversation.isGroup && otherUser?.isOnline

  const handleClick = () => {
    router.push(`/chat/${conversation._id}`)
  }

  const previewText = lastMessage
    ? lastMessage.deleted
      ? "This message was deleted"
      : lastMessage.content
    : "No messages yet"

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 hover:bg-accent cursor-pointer transition-colors ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={displayImage} alt={displayName} />
            <AvatarFallback>
              {conversation.isGroup
                ? displayName.charAt(0).toUpperCase()
                : displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {!conversation.isGroup && (
            <div
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            {lastMessage && (
              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                {formatMessageDate(lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-sm truncate ${
                lastMessage?.deleted
                  ? "italic text-muted-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {previewText}
            </p>
            {unreadCount > 0 && (
              <Badge variant="default" className="shrink-0">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
