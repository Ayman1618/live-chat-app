import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Mark conversation as read
 */
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(), // clerkId
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first()

    const now = Date.now()

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastReadAt: now,
      })
    } else {
      await ctx.db.insert("readReceipts", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastReadAt: now,
      })
    }
  },
})

/**
 * Get unread count for a conversation
 */
export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(), // clerkId
  },
  handler: async (ctx, args) => {
    // Get last read timestamp
    const receipt = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first()

    const lastReadAt = receipt?.lastReadAt ?? 0

    // Count messages after lastReadAt
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect()

    const unreadMessages = messages.filter(
      (msg) => msg.createdAt > lastReadAt && msg.senderId !== args.userId
    )

    return unreadMessages.length
  },
})

/**
 * Get unread counts for all conversations
 * OPTIMIZED: Batch fetches to avoid N+1 queries
 */
export const getAllUnreadCounts = query({
  args: {
    userId: v.string(), // clerkId
  },
  handler: async (ctx, args) => {
    // Get all user conversations
    const conversations = await ctx.db.query("conversations").collect()
    const userConversations = conversations.filter((conv) =>
      conv.members.includes(args.userId)
    )

    if (userConversations.length === 0) {
      return {}
    }

    const conversationIds = userConversations.map((conv) => conv._id)
    const counts: Record<string, number> = {}

    // Batch fetch all read receipts for user's conversations
    const allReceipts = await ctx.db.query("readReceipts").collect()
    const userReceipts = allReceipts.filter(
      (receipt) =>
        receipt.userId === args.userId &&
        conversationIds.includes(receipt.conversationId)
    )

    // Create a map of conversationId -> lastReadAt
    const lastReadMap = new Map<string, number>()
    userReceipts.forEach((receipt) => {
      const existing = lastReadMap.get(receipt.conversationId)
      if (!existing || receipt.lastReadAt > existing) {
        lastReadMap.set(receipt.conversationId, receipt.lastReadAt)
      }
    })

    // Batch fetch all messages for user's conversations
    const allMessages = await ctx.db.query("messages").collect()
    const conversationMessages = allMessages.filter((msg) =>
      conversationIds.includes(msg.conversationId)
    )

    // Group messages by conversationId
    const messagesByConversation = new Map<string, typeof allMessages>()
    conversationMessages.forEach((msg) => {
      const convId = msg.conversationId
      if (!messagesByConversation.has(convId)) {
        messagesByConversation.set(convId, [])
      }
      messagesByConversation.get(convId)!.push(msg)
    })

    // Calculate unread counts
    userConversations.forEach((conv) => {
      const lastReadAt = lastReadMap.get(conv._id) ?? 0
      const messages = messagesByConversation.get(conv._id) ?? []
      const unreadCount = messages.filter(
        (msg) => msg.createdAt > lastReadAt && msg.senderId !== args.userId
      ).length
      counts[conv._id] = unreadCount
    })

    return counts
  },
})
