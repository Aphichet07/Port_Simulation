import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { testController } from './modules/test/test.controller'

import { financeModule } from './modules/finance/finance.controller';

const app = new Elysia()
    .onError(({ code, error, set }) => {
        if (code === 'NOT_FOUND') {
            set.status = 404
            return { status: 'error', message: error.message }
        }
        
        return { status: 'internal_error', message: 'Something went wrong' }
    })
    .use(financeModule)
    .listen(3001)

export type App = typeof app;



// ลอง bun run dev
// แล้ว curl ใน terminal
// curl http://localhost:3001/finance/price/bitcoin