import { Elysia, t } from 'elysia';
import { FinanceService } from './finance.service';

export const financeModule = new Elysia({ prefix: '/finance' })
    .get('/price/:coin', async ({ params: { coin }, set }) => { 
        try {
            const data = await FinanceService.getCryptoPrice(coin.toLowerCase());
            return data;
        } catch (e: any) {
            set.status = 404; 
            return { 
                success: false,
                message: e.message 
            };
        }
    }, {
        params: t.Object({
            coin: t.String()
        })
    });