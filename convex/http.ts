import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/* 
  Docs:
  https://docs.convex.dev/functions/http-actions
  HTTP actions can manipulate the request and response directly, 
  and interact with data in Convex indirectly by running 
  queries, mutations, and actions.
*/

const http = httpRouter();

/*
  Sync Clerk with Webhooks
*/
http.route({
  path: "/clerk",
  method: "POST",
  /*
    Handler: function
      1st argument: An ActionCtx object, 
      which provides auth, storage, and scheduler, 
      as well as runQuery, runMutation, runAction.
      2nd argument: Contains the Request data
  */
  handler: httpAction(async (ctx, req) => {
    const payloadString = await req.text(); // Get body
    const headerPayload = req.headers; // Get headers

    try {
      /* 
        Actions can call "3rd party services" to do things.
        They can interact with the database indirectly 
        by calling queries and mutations.
        Here use "Clerk"

        Internal functions can be called from actions and scheduled 
        from actions and mutation using the internal object.
      */
      const changes = await ctx.runAction(internal.clerk.fulfillWebhookEvent, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-signature": headerPayload.get("svix-signature")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
        },
      });

      /* 
        Docs: https://clerk.com/docs/webhooks/sync-data
      */
      switch (changes.type) {
        case "user.created":
          await ctx.runMutation(internal.functions.users.createUser, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${changes.data.id}`,
            email: changes.data.email_addresses[0]?.email_address,
            name: `${changes.data.first_name ?? "Guest"} ${changes.data.last_name ?? ""}`,
            image: changes.data.image_url,
          });
          break;
        case "user.updated":
          await ctx.runMutation(internal.functions.users.updateUser, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${changes.data.id}`,
            image: changes.data.image_url,
          });
          break;
        case "session.created":
          await ctx.runMutation(internal.functions.users.setUserOnline, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${changes.data.user_id}`,
          });
          break;
        case "session.ended":
          await ctx.runMutation(internal.functions.users.setUserOffline, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${changes.data.user_id}`,
          });
          break;
      }

      return new Response(null, {
        status: 200,
      });
    } catch (error) {
      console.log("Webhook Error", error);
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

/* 
  To expose the HTTP Action, export an instance of HttpRouter 
  from the convex/http.ts file. 
*/
export default http;