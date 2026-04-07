import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema/users";
import { creditTransactions } from "../../db/schema/credits";

const INITIAL_BALANCE = 100000;

export const CreditsService = {
  async getBalance(userId: number) {
    const [user] = await db
      .select({
        balance: users.balance,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) throw new Error("ไม่พบผู้ใช้งาน");

    return {
      userId,
      balance: parseFloat(user.balance || "0"),
    };
  },

  async resetCredits(userId: number) {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select({
          balance: users.balance,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) throw new Error("ไม่พบผู้ใช้งาน");

      const oldBalance = parseFloat(user.balance || "0");

      await tx
        .update(users)
        .set({ balance: INITIAL_BALANCE.toString() })
        .where(eq(users.id, userId));

      await tx.insert(creditTransactions).values({
        userId,
        amount: (INITIAL_BALANCE - oldBalance).toString(),
        type: "RESET",
        reason: "รีเซ็ต Credits กลับค่าเริ่มต้น",
        balanceBefore: oldBalance.toString(),
        balanceAfter: INITIAL_BALANCE.toString(),
      });

      return {
        success: true,
        message: `รีเซ็ต Credits สำเร็จ (${oldBalance} → ${INITIAL_BALANCE})`,
        balance: INITIAL_BALANCE,
      };
    });
  },

  async addCredits(userId: number, amount: number, reason: string = "Manual add") {
    if (amount <= 0) throw new Error("จำนวน credits ต้องมากกว่า 0");

    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select({
          balance: users.balance,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) throw new Error("ไม่พบผู้ใช้งาน");

      const oldBalance = parseFloat(user.balance || "0");
      const newBalance = oldBalance + amount;

      await tx
        .update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, userId));

      await tx.insert(creditTransactions).values({
        userId,
        amount: amount.toString(),
        type: "ADD",
        reason,
        balanceBefore: oldBalance.toString(),
        balanceAfter: newBalance.toString(),
      });

      return {
        success: true,
        message: "เพิ่ม credits สำเร็จ",
        balance: newBalance,
      };
    });
  },

  async deductCredits(userId: number, amount: number, reason: string = "Trade") {
    if (amount <= 0) throw new Error("จำนวน credits ต้องมากกว่า 0");

    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select({
          balance: users.balance,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) throw new Error("ไม่พบผู้ใช้งาน");

      const oldBalance = parseFloat(user.balance || "0");
      if (oldBalance < amount) {
        throw new Error(
          `Credits ไม่เพียงพอ (ต้องการ ${amount} แต่มี ${oldBalance})`,
        );
      }

      const newBalance = oldBalance - amount;

      await tx
        .update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, userId));

      await tx.insert(creditTransactions).values({
        userId,
        amount: amount.toString(),
        type: "BUY",
        reason,
        balanceBefore: oldBalance.toString(),
        balanceAfter: newBalance.toString(),
      });

      return {
        success: true,
        message: "หัก credits สำเร็จ",
        balance: newBalance,
      };
    });
  },

  async getTransactionHistory(userId: number, limit: number = 50) {
    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy((t) => [t.createdAt])
      .limit(limit);

    return transactions.map((t) => ({
      id: t.id,
      amount: parseFloat(t.amount),
      type: t.type,
      reason: t.reason,
      balanceBefore: parseFloat(t.balanceBefore),
      balanceAfter: parseFloat(t.balanceAfter),
      createdAt: t.createdAt,
    }));
  },
};
