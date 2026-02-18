import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                try {
                    // Sync with backend
                    const response = await fetch('http://localhost:5000/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            avatar: user.image,
                            googleId: account?.providerAccountId
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        token.backendToken = data.token;
                        token.id = data._id;
                        token.role = data.role;
                    }
                } catch (error) {
                    console.error("Backend sync error:", error);
                }

                token.email = user.email
                token.name = user.name
                token.picture = user.image
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string
                session.user.image = token.picture as string
                session.backendToken = token.backendToken as string;
                session.user.role = token.role as string;
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
})
