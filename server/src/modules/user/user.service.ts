import { db } from "../../db";
import { users, type NewUser } from "../../db/schema/users";
import { eq } from "drizzle-orm";

export const userService = {
    getAllUsers: async () => {
        const data = await db.select().from(users);
        return data;
    },
    getUserById: async (id: number) => {
        const data = await db.select().from(users).where(eq(users.id, id));
        return data[0];
    },
    createUser: async (values: NewUser) => {
        const data = await db.insert(users).values(values).returning();
        return data[0];
    },
    updateUser: async (id: number, values: NewUser) => {
        const data = await db.update(users).set(values).where(eq(users.id, id)).returning();
        return data[0];
    },
    deleteUser: async (id: number) => {
        const data = await db.delete(users).where(eq(users.id, id)).returning();
        return data[0];
    }
}