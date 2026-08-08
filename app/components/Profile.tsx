// app/components/Profile.tsx
"use client";
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session, status } = useSession();
  
  if (status === "authenticated") {
    // ✅ Use 'as any' to tell TypeScript to ignore type checking
    const idToken = (session as any).idToken;

    return (
      <div>
        <p>Welcome {session.user?.email}</p>
        <p>Token: {idToken?.substring(0, 20)}...</p>
      </div>
    );
  }
  
  return <p>Not signed in</p>;
}