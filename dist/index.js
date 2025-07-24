"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const nats_1 = require("nats");
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
const fastify = (0, fastify_1.default)({ logger: true });
// 建立 NATS 連線並註冊到 fastify
fastify.register(function (fastifyInstance, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const nc = yield (0, nats_1.connect)({ servers: "nats://demo.nats.io" });
        // 註冊為 decorator，方便在其他地方使用
        fastifyInstance.decorate("nats", nc);
        // 可選：設定應用關閉時自動關閉 NATS
        fastifyInstance.addHook("onClose", (instance, done) => {
            nc.drain()
                .then(() => done())
                .catch(done);
        });
        // 測試用 route：發送訊息
        fastify.get("/send", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            yield fastifyInstance.nats.publish("test.subject", new TextEncoder().encode("Hello from Fastify"));
            return { status: "sent" };
        }));
        // NATS 訂閱
        const sub = fastifyInstance.nats.subscribe("test.subject");
        (() => __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            try {
                for (var _d = true, sub_1 = __asyncValues(sub), sub_1_1; sub_1_1 = yield sub_1.next(), _a = sub_1_1.done, !_a; _d = true) {
                    _c = sub_1_1.value;
                    _d = false;
                    const m = _c;
                    console.log(`收到訊息：${new TextDecoder().decode(m.data)}`);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = sub_1.return)) yield _b.call(sub_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }))();
    });
});
// 啟動伺服器
fastify.listen({ port: 3000 }, (err, address) => {
    if (err)
        throw err;
    console.log(`🚀 Server is running at ${address}`);
});
