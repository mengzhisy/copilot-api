import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import { completionRoutes } from "./routes/chat-completions/route"
import { embeddingRoutes } from "./routes/embeddings/route"
import { messageRoutes } from "./routes/messages/route"
import { modelRoutes } from "./routes/models/route"
import { tokenRoute } from "./routes/token/route"
import { usageRoute } from "./routes/usage/route"
import { formatSize } from "./lib/utils"

export const server = new Hono()

server.use(logger())
server.use(cors())

server.use(async (c, next) => {
  const reqText = await c.req.raw.clone().text()

  await next()

  const resText = await c.res.clone().text()

  console.log(
    `[Size] ${c.req.method} ${c.req.path} req=${formatSize(new TextEncoder().encode(reqText).length)} res=${formatSize(new TextEncoder().encode(resText).length)}`,
  )
})

server.get("/", (c) => c.text("Server running"))

server.route("/chat/completions", completionRoutes)
server.route("/models", modelRoutes)
server.route("/embeddings", embeddingRoutes)
server.route("/usage", usageRoute)
server.route("/token", tokenRoute)

// Compatibility with tools that expect v1/ prefix
server.route("/v1/chat/completions", completionRoutes)
server.route("/v1/models", modelRoutes)
server.route("/v1/embeddings", embeddingRoutes)

// Anthropic compatible endpoints
server.route("/v1/messages", messageRoutes)
