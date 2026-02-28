"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, LogOut } from "lucide-react"
import ConversationItem from "./ConversationItem"
import GroupModal from "./GroupModal"
import { SignOutButton } from "@clerk/nextjs"
import { useDebounce } from "@/lib/useDebounce"
import { Skeleton } from "@/components/ui/skeleton"

interface SidebarProps {
  currentUserId: string
}

export default function Sidebar({ currentUserId }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  
  // Debounce search query to avoid excessive queries
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const conversations = useQuery(api.conversations.getConversations, {
    userId: currentUserId,
  })

  const allUsers = useQuery(
    api.users.searchUsers,
    debouncedSearchQuery
      ? {
          currentUserId,
          searchQuery: debouncedSearchQuery,
        }
      : "skip"
  )
  
  // Update showUserList based on debounced query
  useEffect(() => {
    setShowUserList(debouncedSearchQuery.length > 0)
  }, [debouncedSearchQuery])

  const unreadCounts = useQuery(api.readReceipts.getAllUnreadCounts, {
    userId: currentUserId,
  })

  const handleUserClick = async (otherUserId: string) => {
    const { getOrCreateOneOnOneConversation } = await import(
      "@/convex/conversations"
    )
    // This will be handled by the conversation page
    router.push(`/chat/${otherUserId}`)
    setShowUserList(false)
    setSearchQuery("")
  }

  return (
    <>
      <div className="w-full md:w-80 border-r bg-background flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
              <AvatarFallback>
                {user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.fullName || user?.firstName || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <SignOutButton>
            <Button variant="ghost" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
          </SignOutButton>
        </div>

        {/* Search and New Chat */}
        <div className="p-4 border-b space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
              }}
              className="pl-9"
            />
          </div>
          <Button
            onClick={() => setShowGroupModal(true)}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>

        {/* User List (when searching) */}
        {showUserList && searchQuery && (
          <div className="border-b">
            <div className="p-2 text-xs font-semibold text-muted-foreground px-4">
              Users
            </div>
            <ScrollArea className="h-64">
              {allUsers && allUsers.length > 0 ? (
                allUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user.clerkId)}
                    className="px-4 py-3 hover:bg-accent cursor-pointer flex items-center gap-3"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                          user.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations === undefined ? (
              <div className="px-4 py-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No conversations yet. Search for users to start chatting!
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation._id}
                  conversation={conversation}
                  currentUserId={currentUserId}
                  isActive={pathname === `/chat/${conversation._id}`}
                  unreadCount={unreadCounts?.[conversation._id] || 0}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {showGroupModal && (
        <GroupModal
          currentUserId={currentUserId}
          onClose={() => setShowGroupModal(false)}
        />
      )}
    </>
  )
}
