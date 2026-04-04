import { db } from "../../db";
import {users} from "../../db/schema/users"
import { eq } from "drizzle-orm";

export const AuthService = {
    async registerUser(data: any) {
    // เช็คว่ามี Email นี้ในระบบหรือยัง
    const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('Email นี้ถูกใช้งานแล้ว');
    }

    // Hash รหัสผ่าน
    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // บันทึกลง Database 
    const [newUser] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      balance: '100000.00' 
    }).returning({ id: users.id, name: users.name, email: users.email });

    return newUser;
  },

  // ฟังก์ชันตรวจสอบการเข้าสู่ระบบ
  async verifyLogin(data: any) {
    // หา User จาก Email
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    
    if (!user) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const isMatch = await Bun.password.verify(data.password, user.password);
    
    if (!isMatch) {
      throw new Error('รหัสผ่านไม่ถูกต้อง');
    }

    return user;
  }
}
