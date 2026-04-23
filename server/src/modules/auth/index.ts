import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { generateState, generateCodeVerifier } from "arctic";
import { googleAuth } from "../../services/oauth";
import { AuthService } from "./service";

export const AuthModule = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-key",
    }),
  )
  .get(
    "/google",
    async ({
      cookie: { google_oauth_state, google_code_verifier },
      redirect,
    }) => {
      const state = generateState();
      const codeVerifier = generateCodeVerifier();

      const url = await googleAuth.createAuthorizationURL(state, codeVerifier, [
        "profile",
        "email",
      ]);

      google_oauth_state.set({
        value: state,
        httpOnly: true,
        maxAge: 60 * 10,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      google_code_verifier.set({
        value: codeVerifier,
        httpOnly: true,
        maxAge: 60 * 10,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      return redirect(url.toString());
    },
    {
      cookie: t.Object({
        google_oauth_state: t.Optional(t.String()),
        google_code_verifier: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/google/callback",
    async ({
      query: { code, state },
      cookie: { google_oauth_state, google_code_verifier },
      jwt,
      set,
      redirect,
    }) => {
      const storedState = google_oauth_state.value;
      const storedCodeVerifier = google_code_verifier.value;

      if (
        !code ||
        !state ||
        !storedState ||
        state !== storedState ||
        !storedCodeVerifier
      ) {
        set.status = 400;
        return { error: "ข้อมูลยืนยันตัวตนไม่ถูกต้อง หรือ Session หมดอายุ" };
      }

      try {
        const user = await AuthService.loginWithGoogle(
          code,
          storedCodeVerifier,
        );

        if (!user) {
          set.status = 500;
          return { error: "ไม่สามารถสร้างหรือดึงข้อมูลบัญชีผู้ใช้ได้" };
        }

        google_oauth_state.remove();
        google_code_verifier.remove();

        const token = await jwt.sign({ userId: user.id });

        return redirect(`http://localhost:3000/`);
      } catch (error: any) {
        console.error("Google Login Error:", error);
        set.status = 500;
        return { error: "Google Login ล้มเหลว", details: error.message };
      }
    },
    {
      cookie: t.Object({
        google_oauth_state: t.Optional(t.String()),
        google_code_verifier: t.Optional(t.String()),
      }),
    },
  )

  .get("/activate", async ({ query, set }) => {
    try {
      // ดึง token จาก URL ?token=abc-123
      const token = query.token as string;

      await AuthService.activateUser(token);

      set.status = 200;

      // set.redirect = 'http://localhost:3000/login?activated=success';
      // return;

      return {
        success: true,
        message: "บัญชีของคุณได้รับการยืนยันแล้ว สามารถเข้าสู่ระบบได้ทันที",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        message: error.message,
      };
    }
  })
  .post("/register", async ({ body, set }) => {
    try {
      const user = await AuthService.registerUser(body);
      set.status = 201;
    } catch (error: any) {
      set.status = 500;
      console.log(error);
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
      console.log(`Login Success Bearer ${token}`);
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
