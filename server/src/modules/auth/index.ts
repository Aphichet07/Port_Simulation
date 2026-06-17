import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { generateState, generateCodeVerifier } from "arctic";
import { googleAuth } from "../../services/oauth";
import { AuthService } from "./service";

export const AuthModule = new Elysia({ prefix: "/auth" })
  .use(swagger())
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
      console.log("URL : ",url)
      const cookieOptions = {
        httpOnly: true,
        maxAge: 60 * 10,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      };

      google_oauth_state.set({ value: state, ...cookieOptions });
      google_code_verifier.set({ value: codeVerifier, ...cookieOptions });

      return redirect(url.toString());
    },
    {
      cookie: t.Object({
        google_oauth_state: t.Optional(t.String()),
        google_code_verifier: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Auth"],
        summary: "เริ่มต้น Google OAuth",
      },
    },
  )
  .get(
    "/google/callback",
    async ({
      query,
      cookie: { google_oauth_state, google_code_verifier },
      jwt,
      set,
      redirect,
    }) => {
      const { code, state } = query;
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
        return { error: "Invalid session or state" };
      }

      try {
        const user = await AuthService.loginWithGoogle(
          code,
          storedCodeVerifier,
        );
        if (!user) {
          set.status = 500;
          return { error: "Failed to fetch user info" };
        }

        google_oauth_state.remove();
        google_code_verifier.remove();

        const token = await jwt.sign({ userId: user.id });
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        return redirect(`${frontendUrl}/overview?token=${token}`);
      } catch (error) {
        const err = error as Error;
        set.status = 500;
        return { error: "Login failed", details: err.message };
      }
    },
    {
      query: t.Object({
        code: t.String(),
        state: t.String(),
      }),
      cookie: t.Object({
        google_oauth_state: t.Optional(t.String()),
        google_code_verifier: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Google OAuth Callback",
      },
    },
  )
  .get(
    "/activate",
    async ({ query, set }) => {
      try {
        await AuthService.activateUser(query.token);
        return { success: true, message: "Account activated" };
      } catch (error) {
        const err = error as Error;
        set.status = 400;
        return { success: false, message: err.message };
      }
    },
    {
      query: t.Object({
        token: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "ยืนยันตัวตน",
      },
    },
  )
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        await AuthService.registerUser(body);
        set.status = 201;
        return { success: true };
      } catch (error) {
        const err = error as Error;
        set.status = 500;
        return { message: err.message };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        name: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "สมัครสมาชิก",
      },
    },
  )
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        const user = await AuthService.verifyLogin(body);
        if (!user) {
          set.status = 401;
          return { message: "Unauthorized" };
        }

        const token = await jwt.sign({ userId: user.id });
        return {
          token,
          user: { id: user.id, name: user.name },
        };
      } catch (error) {
        const err = error as Error;
        set.status = 500;
        return { message: err.message };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "เข้าสู่ระบบ",
      },
    },
  )
  .get(
    "/me",
    async ({ headers: { authorization }, jwt, set }) => {
      if (!authorization?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const token = authorization.slice(7);
      const payload = await jwt.verify(token);
      if (!payload || !payload.userId) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const user = await AuthService.getUserById(payload.userId as number);
      if (!user) {
        set.status = 404;
        return { error: "User not found" };
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        balance: user.balance,
        risk: user.risk,
        currency: user.currency,
      };
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน",
      },
    }
  )
  .put(
    "/me",
    async ({ headers: { authorization }, jwt, body, set }) => {
      if (!authorization?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const token = authorization.slice(7);
      const payload = await jwt.verify(token);
      if (!payload || !payload.userId) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const updatedUser = await AuthService.updateUserProfile(payload.userId as number, body);
      if (!updatedUser) {
        set.status = 404;
        return { error: "User not found" };
      }
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        balance: updatedUser.balance,
        risk: updatedUser.risk,
        currency: updatedUser.currency,
      };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        balance: t.Optional(t.Union([t.Number(), t.String()])),
        risk: t.Optional(t.String()),
        currency: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Auth"],
        summary: "อัปเดตข้อมูลการตั้งค่าโปรไฟล์ผู้ใช้",
      },
    }
  );
