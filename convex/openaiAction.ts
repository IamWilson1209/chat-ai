import OpenAI from 'openai';
import { action } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('Add your OPENAI_API_KEY as an env variable');
}
const openai = new OpenAI({ apiKey });

export const chatgptResponse = action({
  args: {
    messageBody: v.string(),
    conversation: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    try {
      /*
        Call OpenAI API to generate an image 
        Limits: https://platform.openai.com/settings/organization/limits
      */
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are acting as a consultant to help clients solve qestions with 1-sentence answers',
          },
          {
            role: 'user',
            content: args.messageBody,
          },
        ],
      });

      /* Response from openai */
      const messageResponse = res.choices[0].message.content;

      if (!messageResponse) {
        throw new Error('Failed to retrieve message response from OpenAI.');
      }

      /* Send the response to the conversation */
      await ctx.runMutation(api.functions.messages.sendChatGPTMessage, {
        content:
          messageResponse,
        conversation: args.conversation,
        messageType: 'text',
      });
    } catch (error) {
      /* console.log Error */
      console.error('[ChatGPT Action] Error occurred:', {
        error,
        args,
      });

      /* Fallback: Send an error message */
      const fallbackMessage =
        "I'm sorry, I couldn't generate an image for your request.";

      /* Send a fallback text */
      await ctx.runMutation(api.functions.messages.sendChatGPTMessage, {
        content: fallbackMessage,
        conversation: args.conversation,
        messageType: 'text',
      });
    }
  },
});

export const dalleResponse = action({
  args: {
    conversation: v.id('conversations'),
    messageBody: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      /* 
        Call OpenAI API to generate an image 
        Limits: https://platform.openai.com/settings/organization/limits
      */
      const res = await openai.images.generate({
        model: 'dall-e-3',
        prompt: args.messageBody,
        n: 1,
        size: '1024x1024',
      });

      /* Response from openai */
      const imageUrl = res.data[0].url;

      if (!imageUrl) {
        throw new Error('Failed to retrieve image URL from OpenAI response.');
      }

      /* Send the response to the conversation */
      await ctx.runMutation(api.functions.messages.sendChatGPTMessage, {
        content: imageUrl,
        conversation: args.conversation,
        messageType: 'image',
      });
    } catch (error) {
      /* console.log Error */
      console.error('[DALLE Action] Error occurred:', {
        error,
        args,
      });

      /* Fallback: Send an placeholder image */
      const fallbackImage = '/fallback.webp';

      /* Send a fallback image */
      await ctx.runMutation(api.functions.messages.sendChatGPTMessage, {
        content: fallbackImage,
        conversation: args.conversation,
        messageType: 'image',
      });
    }
  },
});
