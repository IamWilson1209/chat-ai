/* eslint-disable @typescript-eslint/no-unused-vars */
import { v } from "convex/values";
import { internalMutation, query } from "../_generated/server";
import { removeHttps } from "../../src/libs/remove-https";

export const createUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      image: args.image,
      tokenIdentifier: args.tokenIdentifier,
      isOnline: true,
    });
  },
});

export const updateUser = internalMutation({
  args: {
    image: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    /* 
      Docs: https://docs.convex.dev/auth/database-auth
    */
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Called storeUser without authentication present");
    // }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      image: args.image,
    });
  },
});

export const setUserOnline = internalMutation({
  args: {
    tokenIdentifier: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { isOnline: true });
  },
});

export const setUserOffline = internalMutation({
  args: {
    tokenIdentifier: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { isOnline: false });
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const users = await ctx.db.query("users").collect();
    /*
      Filters out the user making the query 
      from the list of users by comparing their 
      tokenIdentifier with the current user's tokenIdentifier
    */
    return users.filter((user) => user.tokenIdentifier !== identity.tokenIdentifier);
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const identityTokenIdentifier = removeHttps(identity.tokenIdentifier)

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identityTokenIdentifier))
      .unique();

    console.log('user: ', user)

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

export const getGroupMembers = query({
  args: {
    conversationId: v.id("conversations")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .first();

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const users = await ctx.db.query("users").collect();
    const groupMembers = users.filter((user) => conversation.participants.includes(user._id));

    return groupMembers;
  },
});