import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { api } from "../_generated/api";
// import { removeHttps } from "../../src/libs/remove-https";

export const sendTextMessage = mutation({
  args: {
    sender: v.string(),
    content: v.string(),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // const identityTokenIdentifier = removeHttps(identity.tokenIdentifier)

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversation))
      .first();

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(user._id)) {
      throw new Error("You are not part of this conversation");
    }

    await ctx.db.insert("messages", {
      sender: args.sender,
      content: args.content,
      conversation: args.conversation,
      messageType: "text",
    });

    /* 
      Check whether the content start with chatgpt, dall-e
      Schedule the chat action to run immediately,
      where action is third-party to openai
    */
    if (args.content.startsWith("@gpt")) {
      await ctx.scheduler.runAfter(0, api.openaiAction.chatgptResponse, {
        messageBody: args.content,
        conversation: args.conversation,
      });
    }

    if (args.content.startsWith("@dall-e")) {
      await ctx.scheduler.runAfter(0, api.openaiAction.dalleResponse, {
        messageBody: args.content,
        conversation: args.conversation,
      });
    }
  },
});

export const sendChatGPTMessage = mutation({
  args: {
    content: v.string(),
    conversation: v.id("conversations"),
    /* message only can be text, image */
    messageType: v.union(v.literal("text"), v.literal("image")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      content: args.content,
      sender: "ChatGPT",
      messageType: args.messageType,
      conversation: args.conversation,
    });
  },
});

// Optimized
export const getMessages = query({
  args: {
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversation", args.conversation))
      .collect();

    // 用來記錄有哪些使用者資訊已經被記錄過，不用再發api call
    const userProfileCache = new Map();

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        // Check if the message is sent from openai
        if (message.sender === "ChatGPT") {
          const image = message.messageType === "text" ? "/gpt.png" : "dall-e.png";
          return { ...message, sender: { name: "ChatGPT", image } };
        }
        let sender;
        // 如果這條消息有找到sender，不發 api call 給 convex
        if (userProfileCache.has(message.sender)) {
          sender = userProfileCache.get(message.sender);
        } else {
          // 如果快取裡面找不到，fetch sender profile from convex，獲取所有這個sender得資訊
          sender = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), message.sender))
            .first();
          // Cache the sender profile
          userProfileCache.set(message.sender, sender);
        }

        return { ...message, sender };
      })
    );

    return messagesWithSender;
  },
});

export const sendImage = mutation({
  args: { imgId: v.id("_storage"), sender: v.id("users"), conversation: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const content = (await ctx.storage.getUrl(args.imgId)) as string;

    await ctx.db.insert("messages", {
      content: content,
      sender: args.sender,
      messageType: "image",
      conversation: args.conversation,
    });
  },
});

export const sendVideo = mutation({
  args: { videoId: v.id("_storage"), sender: v.id("users"), conversation: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const content = (await ctx.storage.getUrl(args.videoId)) as string;

    await ctx.db.insert("messages", {
      content: content,
      sender: args.sender,
      messageType: "video",
      conversation: args.conversation,
    });
  },
});

/* 

unoptimized

export const getMessages = query({
  args:{
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const messages = await ctx.db
    .query("messages")
    .withIndex("by_conversation", q=> q.eq("conversation", args.conversation))
    .collect();

    // john => 200 , 1
    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("_id"), message.sender))
        .first();

        return {...message,sender}
      })
    )

    return messagesWithSender;
  }
});

*/