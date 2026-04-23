import { db } from "../../db";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { sendActivationEmail } from "../../services/email";
import { googleAuth } from "../../services/oauth"

export const AuthService = {
  async registerUser(data: any) {
    // เช็คว่ามี Email นี้ในระบบหรือยัง
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error("Email นี้ถูกใช้งานแล้ว");
    }

    // Hash รหัสผ่าน
    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    //  Token
    const token = crypto.randomUUID();

    // บันทึกลง Database
    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        activationToken: token,
        isActivated: false,
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    try {
      await sendActivationEmail(data.email, token);
    } catch (error) {
      console.error("ส่งอีเมลล้มเหลว:", error);
    }

    return newUser;
  },

  async activateUser(token: string) {
    if (!token) {
      throw new Error("ไม่พบ Token สำหรับยืนยันตัวตน");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.activationToken, token))
      .limit(1);

    if (!user) {
      throw new Error("ลิงก์ยืนยันไม่ถูกต้อง หรือหมดอายุแล้ว");
    }

    await db
      .update(users)
      .set({
        isActivated: true,
        activationToken: null,
      })
      .where(eq(users.id, user.id));

    return user;
  },

  // ฟังก์ชันตรวจสอบการเข้าสู่ระบบ
  async verifyLogin(data: any) {
    // หา User จาก Email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    const isMatch = await Bun.password.verify(data.password, user.password!);

    if (!isMatch) {
      throw new Error("รหัสผ่านไม่ถูกต้อง");
    }

    return user;
  },
  
  async loginWithGoogle(code: string, storedCodeVerifier: string) {
    const tokens = await googleAuth.validateAuthorizationCode(code, storedCodeVerifier);
    
    const googleUserResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` }
    });
    const googleUser = (await googleUserResponse.json()) as any;

    let [existingUser] = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);

    if (!existingUser) {
      const [newUser] = await db.insert(users).values({
        googleId: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email,
        avatarUrl: googleUser.picture, 
        isActivated: true, 
      }).returning();
      existingUser = newUser;

    } else if (!existingUser.googleId) {
      await db.update(users)
        .set({ googleId: googleUser.sub, isActivated: true })
        .where(eq(users.id, existingUser.id));
    }

    return existingUser;
  }
};

