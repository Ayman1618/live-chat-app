import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Get or create a user from Clerk user data
 */
export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (existing) {
      // Update user info if it changed
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        image: args.image,
        isOnline: true,
        lastSeen: Date.now(),
      })
      return existing._id
    }

    // Create new user
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      image: args.image,
      isOnline: true,
      lastSeen: Date.now(),
    })
  },
})

/**
 * Set user online status
 */
export const setOnlineStatus = mutation({
  args: {
    clerkId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      })
    }
  },
})

/**
 * Get all users except the current user
 */
export const getAllUsers = query({
  args: {
    currentUserId: v.string(), // clerkId
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect()
    return users.filter((user) => user.clerkId !== args.currentUserId)
  },
})

/**
 * Get user by clerkId
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first()
  },
})

/**
 * Search users by name
 */
export const searchUsers = query({
  args: {
    currentUserId: v.string(),
    searchQuery: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect()
    const filtered = users.filter(
      (user) =>
        user.clerkId !== args.currentUserId &&
        user.name.toLowerCase().includes(args.searchQuery.toLowerCase())
    )
    return filtered
  },
})

/**
 * Get multiple users by their clerkIds (batch fetch)
 * Used to avoid N+1 queries when fetching message senders
 */
export const getUsersByIds = query({
  args: {
    clerkIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.clerkIds.length === 0) {
      return []
    }

    // Fetch all users and filter in memory
    // Note: Convex doesn't support IN queries, so we fetch all and filter
    // This is still better than N+1 queries
    const allUsers = await ctx.db.query("users").collect()
    return allUsers.filter((user) => args.clerkIds.includes(user.clerkId))
  },
})
