This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Tech stack

Framework/Library: Nextjs 15
Authentication: Clerk + Convex
Realtime Database: Convex
Programming Language: TypeScript

## Functionality

1. Realtime chat
2. Group chat

### Knowledge

1. Setup Convex<br>
   (1) Use {defineSchema, defineTable} to create the database.<br>
   (2) Setup HTTP action(Docs: https://docs.convex.dev/functions/http-actions): Setup functions to take in Request and return Response following the Fetch API.
2. Setup Clerk
   (1) Set up JWT templates and define the authorized third-party API.
   (2) Add a Webhook endpoint for the project.
3. Setup Webhook
   (1) Docs: https://clerk.com/docs/webhooks/sync-data
   (2) Setup environment variables: CLERK_APP_DOMAIN, CLERK_WEBHOOK_SECRET
