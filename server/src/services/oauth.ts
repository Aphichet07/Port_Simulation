import { Google } from "arctic";

export const googleAuth = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:7000/auth/google/callback"
);