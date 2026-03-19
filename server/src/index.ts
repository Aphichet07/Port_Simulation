import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { testController } from './modules/test/test.controller'

const app = new Elysia()
    .use(cors()) 
    .group('/api', (app) => 
        app
            .use(testController)
    )
    .listen(3001)

export type App = typeof app 
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)