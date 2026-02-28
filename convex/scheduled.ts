import { internalMutation } from "./_generated/server"

/**
 * Clean up expired typing statuses (older than 5 seconds)
 * This runs periodically to prevent database bloat
 */
export const cleanupExpiredTypingStatuses = internalMutation({
  handler: async (ctx) => {
    const now = Date.now()
    const fiveSecondsAgo = now - 5000

    // Get all typing statuses
    const allTypingStatuses = await ctx.db.query("typingStatus").collect()

    // Find expired ones
    const expired = allTypingStatuses.filter(
      (status) => status.updatedAt < fiveSecondsAgo
    )

    // Delete expired entries
    await Promise.all(expired.map((status) => ctx.db.delete(status._id)))

    return { deleted: expired.length }
  },
})
