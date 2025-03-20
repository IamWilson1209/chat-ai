"use node";

import { Webhook } from "svix";
import { WebhookEvent } from '@clerk/nextjs/server'
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/*
  Docs: https://clerk.com/docs/webhooks/sync-data
  functionality: Sync Clerk data to chatAI app
  Set up a Route Handler that uses svix to verify 
  the incoming Clerk webhook and process the payload.
*/
const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET as string;
if (!SIGNING_SECRET) {
  throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
}

/* 
  Docs: https://docs.convex.dev/functions/internal-functions
  By default, Convex functions are public and accessible to clients. 
  Public functions may be called by malicious users in ways 
  that cause surprising results. 
  Internal functions help us mitigate this risk.
  Now we write a internal function "fulfillWebhookEvent"
*/
export const fulfillWebhookEvent = internalAction({
  args: {
    headers: v.any(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    /*
      Clerk uses svix to deliver webhooks
      Create new Svix instance with secret
    */
    const wh = new Webhook(SIGNING_SECRET);
    let evt: WebhookEvent;
    try {
      /* Verify payload with headers */
      evt = wh.verify(args.payload, args.headers) as WebhookEvent

      const { id } = evt.data
      const eventType = evt.type

      return evt;
    } catch (err) {
      console.error('Error: Could not verify webhook:', err)
      return new Response('Error: Verification error', {
        status: 400,
      })
    }
  },
});
