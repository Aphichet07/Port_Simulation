import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { setup } from "./setup";
import { AuthModule } from "./modules/auth";

const app = new Elysia()
    .use(setup)
    .use(AuthModule)
    .get('/', () => { 
        return "Quant Terminal API is online!"; 
    })
    .listen(process.env.PORT || 8000); 

console.log(`Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
