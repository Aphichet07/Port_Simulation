import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { PortfolioService } from './service';

export const PortfolioModule = new Elysia({ prefix: '/portfolio' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .derive(async ({ jwt, headers: { authorization } }) => {
    if (!authorization?.startsWith('Bearer ')) throw new Error('Unauthorized');
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) throw new Error('Unauthorized');
    return { userId: payload.userId as number };
  })
  
  // ดึงภาพรวมพอร์ต
  .get('/', async ({ userId, set }) => {
    try {
      const data = await PortfolioService.getPortfolioSummary(userId);
      return { success: true, data };
    } catch (error: any) {
      set.status = 400;
      return { success: false, error: error.message };
    }
  })

  // ดึงประวัติการซื้อขาย 
  .get('/history', async ({ userId, set }) => {
    try {
      const data = await PortfolioService.getTransactionHistory(userId);
      return { success: true, data };
    } catch (error: any) {
      set.status = 400;
      return { success: false, error: error.message };
    }
  });