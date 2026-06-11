import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (clerkSecretKey) {
  // Wrap in error-safe handler: if Clerk fails (e.g. bad key, expired token),
  // swallow the error and let the frontend handle auth instead of returning 500.
  const clerk = clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      "pk_test_ZmFzdC10b3J0b2lzZS01OC5jbGVyay5hY2NvdW50cy5kZXYk",
    ),
    secretKey: clerkSecretKey,
  }));
  app.use((req, res, next) => {
    clerk(req, res, (err) => {
      if (err) {
        logger.warn({ err: err instanceof Error ? err.message : err }, "Clerk middleware error — continuing without auth");
      }
      next();
    });
  });
}

app.use("/api", router);

// ── Serve cinebook frontend in production ────────────────────────
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(__dirname, "../../cinebook/dist/public");

if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  // SPA fallback — Express 5 requires regex instead of bare "*"
  // Exclude /api and /clerk paths so that they return 404 JSON/errors properly
  app.get(/^(?!\/(api|clerk))(.*)/, (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
