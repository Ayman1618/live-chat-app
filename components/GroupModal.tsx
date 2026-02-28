"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check } from "lucide-react"

interface GroupModalProps {
  currentUserId: string
  onClose: () => void
}

export default function GroupModal({ currentUserId, onClose }: GroupModalProps) {
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const allUsers = useQuery(api.users.getAllUsers, {
    currentUserId,
  })
  const createGroupConversation = useMutation(
    api.conversations.createGroupConversation
  )
  const [isCreating, setIsCreating] = useState(false)

  const toggleUser = (clerkId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(clerkId)) {
      newSelected.delete(clerkId)
    } else {
      newSelected.add(clerkId)
    }
    setSelectedUsers(newSelected)
  }

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.size === 0 || isCreating) return

    setIsCreating(true)
    try {
      const conversationId = await createGroupConversation({
        name: groupName.trim(),
        memberIds: Array.from(selectedUsers),
        creatorId: currentUserId,
      })
      onClose()
      // Navigate to the new conversation
      window.location.href = `/chat/${conversationId}`
    } catch (error) {
      console.error("Error creating group:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Group Name
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Members ({selectedUsers.size} selected)
            </label>
            <ScrollArea className="h-64 border rounded-md p-2">
              {allUsers === undefined ? (
                <div className="text-center text-muted-foreground py-4">
                  Loading users...
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No users available
                </div>
              ) : (
                <div className="space-y-2">
                  {allUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => toggleUser(user.clerkId)}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedUsers.has(user.clerkId)
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      {selectedUsers.has(user.clerkId) && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !groupName.trim() ||
              selectedUsers.size === 0 ||
              isCreating
            }
          >
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
