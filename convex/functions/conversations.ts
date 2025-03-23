import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { removeHttps } from '../../src/libs/remove-https';

export const createConversation = mutation({
  args: {
    participants: v.array(v.id('users')),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.id('_storage')),
    admin: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const existingConversation = await ctx.db
      .query('conversations')
      .filter((q) =>
        /* 
          double check whether the participants name are already existed but reversed
          e.g. wilson & christine
          [wilson, christine]
          [christine, wilson] 
        */
        q.or(
          q.eq(q.field('participants'), args.participants),
          q.eq(q.field('participants'), args.participants.reverse())
        )
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    let groupImage;
    if (args.groupImage) {
      groupImage = (await ctx.storage.getUrl(args.groupImage)) as string;
    }

    const conversationId = await ctx.db.insert('conversations', {
      participants: args.participants,
      isGroup: args.isGroup,
      groupName: args.groupName,
      groupImage,
      admin: args.admin,
    });

    return conversationId;
  },
});

export const getUserConversations = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // const identityTokenIdentifier = removeHttps(identity.tokenIdentifier)

    const authUser = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!authUser) throw new Error('User not found');

    /* Fetch all conversations related to this user (including group) */
    const conversations = await ctx.db.query('conversations').collect();

    /* 
      Filter all conversations where current user is a participant and 
      return them with additional details (user details, last message)
    */
    const userConversations = conversations.filter((conversation) => {
      return conversation.participants.includes(authUser._id);
    });

    /* Nextjs: 並行查詢更快，找出所有conversations */
    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conversation) => {
        let otherUserDetails = {};

        /* If not a group chat, fetch the first one other user's id */
        if (!conversation.isGroup) {
          const otherUserId = conversation.participants.find(
            (id) => id !== authUser._id
          );
          /* 根據此 id 補上其他使用者資訊 */
          const otherUserProfile = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('_id'), otherUserId))
            .take(1);

          otherUserDetails = otherUserProfile[0];
        }

        /* 找出最後一則訊息 */
        const lastMessage = await ctx.db
          .query('messages')
          .filter((q) => q.eq(q.field('conversation'), conversation._id))
          .order('desc')
          .take(1);

        /* 
          return should be in this order: 
          {
            _id: "conversation456", // 反過來是userid會覆蓋上去，但是這個api不需要
            name: "John",
            image: "/john.png",
            participants: ["user123", "user789"],
            isGroup: false,
            lastMessage: { _id: "message789", content: "Hi!", conversation: "conversation456" }
          }
        */
        return {
          ...otherUserDetails,
          ...conversation,
          lastMessage: lastMessage[0] || null,
        };
      })
    );

    return conversationsWithDetails;
  },
});

export const deleteUserFromConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const conversation = await ctx.db
      .query('conversations')
      .filter((q) => q.eq(q.field('_id'), args.conversationId))
      .unique();

    if (!conversation) throw new Error('Conversation not found');

    /* patch更新user，保留其他id，移除此userId */
    await ctx.db.patch(args.conversationId, {
      participants: conversation.participants.filter(
        (id) => id !== args.userId
      ),
    });
  },
});

/* Convex 提供的方法，用來生成一個臨時上傳 URL */
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
