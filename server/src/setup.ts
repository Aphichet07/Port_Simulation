import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

export const setup = new Elysia({ name: "setup" })
  .use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }),
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Quant Terminal API",
          version: "1.0.0",
          description: "API Documentation for the All-in-One Quant Terminal",
        },
      },
      path: "/docs", // http://localhost:8080/docs
    }),
  );
