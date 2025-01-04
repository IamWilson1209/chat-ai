import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/*
  Docs: https://docs.convex.dev/database/schemas
  A schema is a description of
  1. the tables in your Convex project
  2. the type of documents within your tables

  Schemas are pushed automatically in "npx convex dev"
*/
export default defineSchema({
  messages: defineTable({
    conversation: v.id("conversations"),
    sender: v.string(),
    content: v.string(),
    /* 
      Fields that are a constant can be expressed with v.literal:
      message can be text || image || video!! 
    */
    messageType: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
  }).index("by_conversation", ["conversation"]),

  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.string(),
    tokenIdentifier: v.string(),
    isOnline: v.boolean(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()), /* String */
    admin: v.optional(v.id("users")),
  }),
});