import { t } from 'elysia';

export const registerBodySchema = t.Object({
  name: t.String({ minLength: 2 }),
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
});

export const loginBodySchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String()
});