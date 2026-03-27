import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const providers =
    googleClientId && googleClientSecret
        ? [
              GoogleProvider({
                  clientId: googleClientId,
                  clientSecret: googleClientSecret,
              }),
          ]
        : [];

const handler = NextAuth({
    providers,
    secret:
        process.env.NEXTAUTH_SECRET ||
        process.env.AUTH_SECRET ||
        "shoutlyai-fallback-secret",
});

export { handler as GET, handler as POST };