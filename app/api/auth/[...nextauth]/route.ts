import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Gmail read + modify permission maangna
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.modify",
          ].join(" "),
          // Har baar fresh token milega — important!
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  callbacks: {
    // JWT mein access_token save karo taki Gmail API call ho sake
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    // Session mein bhi access_token available karo
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/",       // Login page
    error: "/",        // Error bhi homepage pe
  },
});

export { handler as GET, handler as POST };
