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
  /* 
    Convex 不支援傳統的 SQL JOIN 操作
    所以要建立資料表關聯只能用兩種方法，以conversation, message為例：

    O 1. 獨立表格：
    使用索引 by_conversation，查詢特定對話的訊息很快𝑂(log𝑁) 
    新增訊息只需插入一條記錄到 messages 表格
    可存大量訊息，因為訊息是分散儲存的，不受單一記錄大小限制
    可以支援一次存e.g. 50 條訊息的功能

    X 2. Array儲存(純NoSQL可能的存法)：
    查詢對話時直接return所有訊息，不需額外查詢，初始速度可能更快
    每次都要一次性抓取所有訊息
    如果需要過濾或排序訊息（例如按時間），需要在記憶體中處理陣列，效能下降
    新增訊息需要更新整個 conversations 記錄（讀取 -> 修改陣列 -> 寫回），隨著陣列變大，寫入時間增加
  */

  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.string(),
    tokenIdentifier: v.string(),
    isOnline: v.boolean(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]), // 使用索引 by_conversation，查詢特定對話的訊息很快𝑂(log𝑁)

  conversations: defineTable({
    participants: v.array(v.id("users")), // 指向 user
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()), // String 
    admin: v.optional(v.id("users")), // 指向 user
  }),
});