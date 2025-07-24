import * as http from "http";
import Fastify from "fastify";
import { connect } from "nats";

/*
const server = http.createServer((req, resp) => {
  console.log("收到Request" + req.url);
  if (req.url === "/api/hello" && req.method === "GET") {
    resp.writeHead(200, { "content-type": "application/json" });
    resp.end(JSON.stringify("Hello world jsServer"));
  } else {
    resp.writeHead(404, { "Content-Type": "application/json" });
    resp.end(JSON.stringify({ error: "Not Found!!!aaaaa" }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


const fastifyServer = Fastify();

fastifyServer.get("/api/hello", (req, resp) => {
  return { message: "Hello world fastifyServer" };
});

fastifyServer.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log("Server running at" + address);
});
*/

const fastify = Fastify({ logger: true });

// 建立 NATS 連線並註冊到 fastify
fastify.register(async function (fastifyInstance, opts) {
  const nc = await connect({ servers: "nats://demo.nats.io" });

  // 註冊為 decorator，方便在其他地方使用
  fastifyInstance.decorate("nats", nc);

  // 可選：設定應用關閉時自動關閉 NATS
  fastifyInstance.addHook("onClose", (instance, done) => {
    nc.drain()
      .then(() => done())
      .catch(done);
  });

  // 測試用 route：發送訊息
  fastify.get("/send", async (request, reply) => {
    await fastifyInstance.nats.publish(
      "test.subject",
      new TextEncoder().encode("Hello from Fastify")
    );
    return { status: "sent" };
  });

  // NATS 訂閱
  const sub = fastifyInstance.nats.subscribe("test.subject");
  (async () => {
    for await (const m of sub) {
      console.log(`收到訊息：${new TextDecoder().decode(m.data)}`);
    }
  })();
});

// 啟動伺服器
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`🚀 Server is running at ${address}`);
});
