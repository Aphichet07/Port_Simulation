import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { generateState, generateCodeVerifier } from 'arctic';
import { googleAuth } from "../../services/oauth";
import { AuthService } from "./service";

export const AuthModule = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-key",
    }),
  )
  .get('/google', async ({ cookie, set }) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = googleAuth.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);

    cookie.google_oauth_state!.set({ value: state, httpOnly: true, maxAge: 60 * 10, path: "/" });
    cookie.google_code_verifier!.set({ value: codeVerifier, httpOnly: true, maxAge: 60 * 10, path: "/" });

    set.redirect = url.toString();
  })
  .get('/google/callback', async ({ query, cookie, jwt, set }) => {
    const code = query.code as string;
    const state = query.state as string;
    
    const storedState = cookie.google_oauth_state?.value as string | undefined;
    const storedCodeVerifier = cookie.google_code_verifier?.value as string | undefined;

    // เช็คความถูกต้องของข้อมูลเบื้องต้น
    if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
      set.status = 400;
      return { error: "ข้อมูลยืนยันตัวตนไม่ถูกต้อง" };
    }

    try {
      const user = await AuthService.loginWithGoogle(code, storedCodeVerifier);

      if (!user) {
        set.status = 500;
        return { error: "ไม่สามารถสร้างหรือดึงข้อมูลบัญชีผู้ใช้ได้" };
      }

      const token = await jwt.sign({ userId: user.id });

      set.redirect = `http://localhost:3000/home?token=${token}`;
      
    } catch (error: any) {
      set.status = 500;
      return { error: "Google Login ล้มเหลว", details: error.message };
    }
  })
  
  .get('/activate', async ({ query, set }) => {
    try {
      // ดึง token จาก URL ?token=abc-123
      const token = query.token as string; 
      
      await AuthService.activateUser(token);
      
      set.status = 200;
      
      // set.redirect = 'http://localhost:3000/login?activated=success';
      // return;

      return { 
        success: true,
        message: 'บัญชีของคุณได้รับการยืนยันแล้ว สามารถเข้าสู่ระบบได้ทันที' 
      };
    } catch (error: any) {
      set.status = 400;
      return { 
        success: false,
        message: error.message 
      };
    }
  })
  .post("/register", async ({ body, set }) => {
    try {
      const user = await AuthService.registerUser(body);
      set.status = 201;
    } catch (error: any) {
      set.status = 500;
      console.log(error)
      return { message: error };
    }
  })
  .post("/login", async ({ body, jwt, set }) => {
    try {
      const user = await AuthService.verifyLogin(body);
    
      if (!user) {
        set.status = 401; 
        return { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
      }

      const token = await jwt.sign({ userId: user.id });
      set.status = 200;
      
      return {
        message: "Login Success",
        token,
        user: { id: user.id, name: user.name },
      };
    } catch (error: any) {
      set.status = 500;
      return { message: error.message || "Internal Server Error" }; 
    }
});
