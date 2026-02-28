"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  conversation: {
    _id: Id<"conversations">
    isGroup: boolean
    name?: string
    members: string[]
  }
  currentUserId: string
}

export default function ChatHeader({
  conversation,
  currentUserId,
}: ChatHeaderProps) {
  const router = useRouter()
  const otherMembers = conversation.members.filter(
    (id) => id !== currentUserId
  )

  // For one-on-one, get the other user
  const otherUser = useQuery(
    api.users.getUserByClerkId,
    !conversation.isGroup && otherMembers.length > 0
      ? { clerkId: otherMembers[0] }
      : "skip"
  )

  const displayName = conversation.isGroup
    ? conversation.name || `Group (${conversation.members.length})`
    : otherUser?.name || "Unknown User"

  const displayImage = conversation.isGroup ? undefined : otherUser?.image

  const isOnline = !conversation.isGroup && otherUser?.isOnline

  return (
    <div className="border-b bg-background p-4 flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="relative">
        <Avatar className="h-10 w-10">
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
        <h2 className="font-semibold truncate">{displayName}</h2>
        {conversation.isGroup ? (
          <p className="text-sm text-muted-foreground">
            {conversation.members.length} members
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isOnline ? "Online" : "Offline"}
          </p>
        )}
      </div>
    </div>
  )
}
