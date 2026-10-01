import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "node:net";

async function run() {
  loadEnvConfig(process.cwd());
  const source = new URL(process.env.DATABASE_URL!);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(source.hostname) || source.searchParams.has("socket")) {
    throw new Error("Integration tests require a local MySQL database.");
  }
  const name = "smart_taruna_test_" + randomUUID().replace(/-/g, "");
  const admin = new PrismaClient();
  const uploadDir = await mkdtemp(path.join(tmpdir(), "smart-taruna-test-"));
  let server: ReturnType<typeof spawn> | undefined;
  let created = false;
  try {
    await admin.$executeRawUnsafe("CREATE DATABASE `" + name + "`");
    created = true;
    source.pathname = "/" + name;
    const probe = createServer();
    await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
    const port = (probe.address() as { port: number }).port;
    await new Promise<void>((resolve) => probe.close(() => resolve()));
    const origin = "http://localhost:" + port;
    const env = { ...process.env, DATABASE_URL: source.toString(), NEXTAUTH_URL: origin,
      NEXTAUTH_SECRET: randomUUID(), LOCAL_UPLOAD_DIR: uploadDir, EXAM_SWEEPER_ENABLED: "true", TEST_ORIGIN: origin,
      NEXT_DIST_DIR: ".next-integration", NEXT_TSCONFIG_PATH: "tests/tsconfig.next.json" };
    execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "db", "push", "--skip-generate"], { env, stdio: "pipe" });
    server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "-p", String(port)], { env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let logs = "";
    server.stdout?.on("data", (chunk) => { logs = (logs + chunk.toString()).slice(-8000); });
    server.stderr?.on("data", (chunk) => { logs = (logs + chunk.toString()).slice(-8000); });
    let ready = false;
    for (let i = 0; i < 90; i++) {
      try { const res = await fetch(origin + "/api/auth/session", { signal: AbortSignal.timeout(1500) }); if (res.ok) { ready = true; break; } } catch {}
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!ready) throw new Error("Test server did not start. " + logs);
    console.log("Isolated test server ready; using temporary database and upload directory.");
    const testProcess = spawn(process.execPath, [require.resolve("tsx/cli"), "--test", "tests/integration.test.ts"], { env, stdio: "inherit", windowsHide: true });
    const result = await new Promise<number>((resolve) => testProcess.on("exit", (code) => resolve(code ?? 1)));
    if (result) throw new Error("Integration tests failed.");
  } finally {
    if (server?.pid) {
      if (process.platform === "win32") {
        try { execFileSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
      } else server.kill("SIGTERM");
    }
    if (created && /^smart_taruna_test_[a-f0-9]{32}$/.test(name)) await admin.$executeRawUnsafe("DROP DATABASE `" + name + "`");
    await admin.$disconnect();
    const resolved = path.resolve(uploadDir);
    if (resolved.startsWith(path.resolve(tmpdir()) + path.sep) && path.basename(resolved).startsWith("smart-taruna-test-")) await rm(resolved, { recursive: true, force: true });
  }
}
run().catch((error) => { console.error(error.message); process.exitCode = 1; });
