// types/fastify.d.ts
import "fastify";
import { NatsConnection } from "nats";

declare module "fastify" {
  interface FastifyInstance {
    nats: NatsConnection;
  }
}
