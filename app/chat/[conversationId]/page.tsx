"use client"

import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import ChatHeader from "@/components/ChatHeader"
import MessageList from "@/components/MessageList"
import MessageInput from "@/components/MessageInput"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const conversationId = params.conversationId as string
  const markAsRead = useMutation(api.readReceipts.markAsRead)

  // Try to get conversation - Convex IDs are typically short alphanumeric strings
  // Clerk IDs are longer and often start with "user_"
  const looksLikeClerkId = conversationId.startsWith("user_") || conversationId.length > 20

  // Get conversation (skip if it looks like a Clerk ID)
  const conversation = useQuery(
    api.conversations.getConversation,
    !looksLikeClerkId
      ? {
          conversationId: conversationId as Id<"conversations">,
        }
      : "skip"
  )

  // If it's a clerkId, we need to get or create the conversation
  const getOrCreateOneOnOneConversation = useMutation(
    api.conversations.getOrCreateOneOnOneConversation
  )

  useEffect(() => {
    if (!isLoaded || !user) return

    if (looksLikeClerkId) {
      // Create or get one-on-one conversation
      getOrCreateOneOnOneConversation({
        currentUserId: user.id,
        otherUserId: conversationId,
      })
        .then((convId) => {
          router.replace(`/chat/${convId}`)
        })
        .catch((error) => {
          console.error("Error creating conversation:", error)
        })
      return
    }

    // Mark as read when conversation is opened
    if (conversation) {
      markAsRead({
        conversationId: conversationId as Id<"conversations">,
        userId: user.id,
      })
    }
  }, [
    conversationId,
    looksLikeClerkId,
    user,
    isLoaded,
    conversation,
    markAsRead,
    getOrCreateOneOnOneConversation,
    router,
  ])

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (looksLikeClerkId) {
    return (
      <div className="flex h-screen">
        <div className="hidden md:block">
          <Sidebar currentUserId={user.id} />
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center text-muted-foreground">
            Loading conversation...
          </div>
        </div>
      </div>
    )
  }

  if (conversation === undefined) {
    return (
      <div className="flex h-screen">
        <Sidebar currentUserId={user.id} />
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center text-muted-foreground">
            Loading conversation...
          </div>
        </div>
      </div>
    )
  }

  if (conversation === null) {
    return (
      <div className="flex h-screen">
        <Sidebar currentUserId={user.id} />
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center text-muted-foreground">
            Conversation not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar currentUserId={user.id} />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatHeader
          conversation={conversation}
          currentUserId={user.id}
        />
        <MessageList
          conversationId={conversationId as Id<"conversations">}
          currentUserId={user.id}
        />
        <MessageInput
          conversationId={conversationId as Id<"conversations">}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
