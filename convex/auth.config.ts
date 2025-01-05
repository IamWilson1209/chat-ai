const authConfig = {
  providers: [
    {
      /* 
        Docs: https://clerk.com/docs/integrations/databases/convex#configure-convex-with-the-clerk-issuer-domain
        Tell convex we're auth with clerk
        */
      domain: "https://discrete-grub-54.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
};

export default authConfig;