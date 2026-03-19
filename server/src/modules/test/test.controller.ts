import { Elysia, t } from 'elysia'
import { testService } from './test.service'

export const testController = new Elysia({ prefix: '/testder' })
    .get('/test', async () => {
        return await testService.test()
    }, {
        params: t.Object({ id: t.String() })
    })