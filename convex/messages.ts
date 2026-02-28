import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Send a message
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(), // clerkId
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      createdAt: now,
      deleted: false,
    })

    // Update conversation's lastMessageAt
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
    })

    return messageId
  },
})

/**
 * Get messages for a conversation
 */
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect()

    // Sort by createdAt ascending
    return messages.sort((a, b) => a.createdAt - b.createdAt)
  },
})

/**
 * Get the last message in a conversation
 */
export const getLastMessage = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect()

    if (messages.length === 0) {
      return null
    }

    // Sort by createdAt descending and get first
    return messages.sort((a, b) => b.createdAt - a.createdAt)[0]
  },
})

/**
 * Soft delete a message
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(), // clerkId - verify ownership
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId)
    if (!message) {
      throw new Error("Message not found")
    }

    if (message.senderId !== args.userId) {
      throw new Error("Unauthorized: You can only delete your own messages")
    }

    await ctx.db.patch(args.messageId, {
      deleted: true,
    })
  },
})
