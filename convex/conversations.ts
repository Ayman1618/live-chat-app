import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Get or create a one-on-one conversation between two users
 */
export const getOrCreateOneOnOneConversation = mutation({
  args: {
    currentUserId: v.string(), // clerkId
    otherUserId: v.string(), // clerkId
  },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const conversations = await ctx.db.query("conversations").collect()
    const existing = conversations.find(
      (conv) =>
        !conv.isGroup &&
        conv.members.length === 2 &&
        conv.members.includes(args.currentUserId) &&
        conv.members.includes(args.otherUserId)
    )

    if (existing) {
      return existing._id
    }

    // Create new conversation
    const now = Date.now()
    return await ctx.db.insert("conversations", {
      isGroup: false,
      members: [args.currentUserId, args.otherUserId],
      createdAt: now,
      lastMessageAt: now,
    })
  },
})

/**
 * Create a group conversation
 */
export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.string()), // array of clerkIds
    creatorId: v.string(), // clerkId
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
      members: [...args.memberIds, args.creatorId],
      createdAt: now,
      lastMessageAt: now,
    })
  },
})

/**
 * Get all conversations for a user, sorted by lastMessageAt
 */
export const getConversations = query({
  args: {
    userId: v.string(), // clerkId
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db.query("conversations").collect()
    const userConversations = conversations.filter((conv) =>
      conv.members.includes(args.userId)
    )

    // Sort by lastMessageAt descending
    return userConversations.sort(
      (a, b) => b.lastMessageAt - a.lastMessageAt
    )
  },
})

/**
 * Get a single conversation by ID
 */
export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId)
  },
})

/**
 * Update conversation's lastMessageAt
 */
export const updateLastMessageAt = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    })
  },
})
