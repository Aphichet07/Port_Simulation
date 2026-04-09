import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { setup } from "./setup";
import { AuthModule } from "./modules/auth";
import { MarketModule } from "./modules/market";
import { OrderModule } from "./modules/order";
import { PortfolioModule } from "./modules/portfolio";
import { NewsModule } from "./modules/news";
import { AlgoModule } from "./modules/algo";

const app = new Elysia()
    .use(setup)
    .use(AuthModule)
    .use(MarketModule)
    .use(OrderModule)
    .use(PortfolioModule)
    .use(NewsModule)
    .use(AlgoModule)
    .use(cors())
    .get('/', () => {
        return "Quant Terminal API is online!"; 
    })
    .listen(process.env.PORT || 8000); 

console.log(`Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`Swagger UI available at http://${app.server?.hostname}:${app.server?.port}/docs`);
