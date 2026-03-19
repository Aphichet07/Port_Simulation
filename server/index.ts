import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'

const app = new Elysia()
    .use(cors()) 
    .get('/', () => ({ message: 'Hello from Elysia!' }))
    .post('/hello', ({ body }) => `Hello ${body.name}`, {
        body: t.Object({
            name: t.String()
        })
    })
    .listen(3001)

export type App = typeof app 
console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`)