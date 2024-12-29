import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/* 
  This file is reference from:
  https://docs.convex.dev/functions/http-actions
  HTTP actions can manipulate the request and response directly, 
  and interact with data in Convex indirectly by running 
  queries, mutations, and actions.
*/

const http = httpRouter();

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
    const payloadString = await req.text();
    const headerPayload = req.headers;

    try {
      /* 
        Actions can call third party services to do things
        They can interact with the database indirectly 
        by calling queries and mutations.
      */
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-signature": headerPayload.get("svix-signature")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
        },
      });

      switch (result.type) {
        case "user.created":
          await ctx.runMutation(internal.users.createUser, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.id}`,
            email: result.data.email_addresses[0]?.email_address,
            name: `${result.data.first_name ?? "Guest"} ${result.data.last_name ?? ""}`,
            image: result.data.image_url,
          });
          break;
        case "user.updated":
          await ctx.runMutation(internal.users.updateUser, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.id}`,
            image: result.data.image_url,
          });
          break;
        case "session.created":
          await ctx.runMutation(internal.users.setUserOnline, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
          });
          break;
        case "session.ended":
          await ctx.runMutation(internal.users.setUserOffline, {
            tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
          });
          break;
      }

      return new Response(null, {
        status: 200,
      });
    } catch (error) {
      console.log("Webhook Error🔥🔥", error);
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