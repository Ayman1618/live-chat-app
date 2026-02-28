"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import Sidebar from "@/components/Sidebar"
import { useState } from "react"

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const getOrCreateUser = useMutation(api.users.getOrCreateUser)
  const setOnlineStatus = useMutation(api.users.setOnlineStatus)
  const [isSyncing, setIsSyncing] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push("/sign-in")
      return
    }

    // Sync user to Convex on first login
    const syncUser = async () => {
      if (isSyncing) return
      setIsSyncing(true)
      try {
        await getOrCreateUser({
          clerkId: user.id,
          name: user.fullName || user.firstName || "User",
          email: user.primaryEmailAddress?.emailAddress || "",
          image: user.imageUrl,
        })
        await setOnlineStatus({
          clerkId: user.id,
          isOnline: true,
        })
      } catch (error) {
        console.error("Error syncing user:", error)
      } finally {
        setIsSyncing(false)
      }
    }

    syncUser()

    // Set online status on mount
    if (isMountedRef.current) {
      setOnlineStatus({
        clerkId: user.id,
        isOnline: true,
      })
    }

    // Set offline status on unmount
    return () => {
      isMountedRef.current = false
      if (user) {
        setOnlineStatus({
          clerkId: user.id,
          isOnline: false,
        })
      }
    }
  }, [user, isLoaded, router, getOrCreateUser, setOnlineStatus, isSyncing])

  useEffect(() => {
    // Handle visibility change to update online status
    const handleVisibilityChange = () => {
      if (user) {
        setOnlineStatus({
          clerkId: user.id,
          isOnline: !document.hidden,
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [user, setOnlineStatus])

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <div className="w-full md:w-80">
        <Sidebar currentUserId={user.id} />
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Live Chat</h2>
          <p>Select a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    </div>
  )
}
