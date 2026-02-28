import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Set typing status for a user in a conversation
 */
export const setTypingStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(), // clerkId
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.isTyping) {
      // Remove typing status
      const existing = await ctx.db
        .query("typingStatus")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .collect()

      const userTyping = existing.find((t) => t.userId === args.userId)
      if (userTyping) {
        await ctx.db.delete(userTyping._id)
      }
      return
    }

    // Set or update typing status
    const existing = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect()

    const userTyping = existing.find((t) => t.userId === args.userId)
    const now = Date.now()

    if (userTyping) {
      await ctx.db.patch(userTyping._id, {
        updatedAt: now,
      })
    } else {
      await ctx.db.insert("typingStatus", {
        conversationId: args.conversationId,
        userId: args.userId,
        updatedAt: now,
      })
    }
  },
})

/**
 * Get typing users for a conversation
 */
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(), // clerkId - exclude current user
  },
  handler: async (ctx, args) => {
    const typingStatuses = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect()

    const now = Date.now()
    const twoSecondsAgo = now - 2000

    // Filter out expired typing statuses (older than 2 seconds) and current user
    const activeTyping = typingStatuses.filter(
      (status) =>
        status.userId !== args.currentUserId &&
        status.updatedAt > twoSecondsAgo
    )

    // Get user details for typing users
    const userIds = activeTyping.map((status) => status.userId)
    const users = await Promise.all(
      userIds.map(async (clerkId) => {
        return await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
          .first()
      })
    )

    return users.filter((user): user is NonNullable<typeof user> => user !== null)
  },
})
