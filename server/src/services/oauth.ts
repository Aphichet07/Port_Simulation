import { Google } from "arctic";

// ดึงค่าจาก .env และกำหนด URL ที่ Google จะเด้งกลับมาหาเรา
export const googleAuth = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  "http://localhost:8000/auth/google/callback"
);