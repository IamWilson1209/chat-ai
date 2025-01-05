/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConvexError, v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { removeHttps } from '../../src/lib/remove-https';

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

    const identityTokenIdentifier = removeHttps(identity.tokenIdentifier)

    const authUser = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', identityTokenIdentifier)
      )
      .unique();

    console.log("authUser: ", authUser)

    if (!authUser) throw new Error('User not found');

    /* 
      fetch all conversations related to this user (including group) 
    */
    const conversations = await ctx.db.query('conversations').collect();

    /* 
      filter all conversations where current user is a participant and 
      return them with additional details (user details, last message)
    */
    const userConversations = conversations.filter((conversation) => {
      return conversation.participants.includes(authUser._id);
    });

    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conversation) => {
        let otherUserDetails = {};

        /* 
          If not a group chat, fetch the first one user's id
        */
        if (!conversation.isGroup) {
          const otherUserId = conversation.participants.find(
            (id) => id !== authUser._id
          );
          const otherUserProfile = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('_id'), otherUserId))
            .take(1);

          otherUserDetails = otherUserProfile[0];
        }

        const lastMessage = await ctx.db
          .query('messages')
          .filter((q) => q.eq(q.field('conversation'), conversation._id))
          .order('desc')
          .take(1);

        /* 
          return should be in this order, 
          otherwise conversion _id will overwrite user _id 
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

    await ctx.db.patch(args.conversationId, {
      participants: conversation.participants.filter(
        (id) => id !== args.userId
      ),
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
