import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Toggle a reaction on a message
 */
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(), // clerkId
    reaction: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if reaction already exists
    const existing = await ctx.db
      .query("messageReactions")
      .withIndex("by_user_message", (q) =>
        q.eq("messageId", args.messageId).eq("userId", args.userId)
      )
      .first()

    if (existing && existing.reaction === args.reaction) {
      // Remove reaction if same reaction clicked
      await ctx.db.delete(existing._id)
    } else if (existing) {
      // Update reaction if different reaction clicked
      await ctx.db.patch(existing._id, {
        reaction: args.reaction,
      })
    } else {
      // Add new reaction
      await ctx.db.insert("messageReactions", {
        messageId: args.messageId,
        userId: args.userId,
        reaction: args.reaction,
      })
    }
  },
})

/**
 * Get all reactions for a message
 */
export const getMessageReactions = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("messageReactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect()

    // Group reactions by emoji and count
    const grouped: Record<string, { count: number; userIds: string[] }> = {}
    reactions.forEach((reaction) => {
      if (!grouped[reaction.reaction]) {
        grouped[reaction.reaction] = { count: 0, userIds: [] }
      }
      grouped[reaction.reaction].count++
      grouped[reaction.reaction].userIds.push(reaction.userId)
    })

    return grouped
  },
})
