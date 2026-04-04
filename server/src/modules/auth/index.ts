import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./service";

export const AuthModule = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-key",
    }),
  )
  .post("/register", async ({ body, set }) => {
    try {
      const user = await AuthService.registerUser(body);
      set.status = 201;
    } catch (error: any) {
      set.status = 500;
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
