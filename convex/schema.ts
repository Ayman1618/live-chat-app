import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    email: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    members: v.array(v.string()), // array of clerkIds
    createdAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index("by_member", ["members"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(), // clerkId
    content: v.string(),
    createdAt: v.number(),
    deleted: v.boolean(),
  })
    .index("by_conversation", ["conversationId", "createdAt"])
    .index("by_sender", ["senderId"]),

  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.string(), // clerkId
    reaction: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_user_message", ["messageId", "userId"]),

  typingStatus: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // clerkId
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),

  readReceipts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // clerkId
    lastReadAt: v.number(),
  })
    .index("by_conversation_user", ["conversationId", "userId"])
    .index("by_conversation", ["conversationId"]),
})
