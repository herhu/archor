import { spawn } from "child_process";
import { database } from "../src/db/index.js";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Starting smoke test...");

  // 1. Build
  console.log("Building...");
  // Assuming build is already done or we run this after build
  
  // 2. Start Server
  console.log("Starting server...");
  const server = spawn("node", ["dist/server.js"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: "3001", // Use different port for testing
      DATABASE_URL: process.env.DATABASE_URL || "postgres://archon:password@localhost:5432/archon", // Fallback text
      API_KEY_PEPPER: "test-pepper",
      MCP_WORKERS: "1",
      // Mock other required envs
      BASE_URL: "http://localhost:3001",
      OIDC_ISSUER: "https://example.com",
      OIDC_CLIENT_ID: "test-client",
      OIDC_CLIENT_SECRET: "test-secret",
      SESSION_SECRET: "01234567890123456789012345678901", // 32 chars
    }
  });

  // Give it time to boot
  await sleep(3000);

  try {
    // 3. Check Health
    console.log("Checking health...");
    const healthRes = await fetch("http://localhost:3001/health");
    if (!healthRes.ok) {
        throw new Error(`Health check failed: ${healthRes.status} ${healthRes.statusText}`);
    }
    const healthJson = await healthRes.json();
    console.log("Health OK:", healthJson);

    // 4. Check API Key creation (will fail without login/session, but we can check 401)
    console.log("Checking auth protection...");
    const keyRes = await fetch("http://localhost:3001/v1/keys", { method: "POST" });
    if (keyRes.status !== 401) {
         throw new Error(`Expected 401 for keys endpoint, got ${keyRes.status}`);
    }
    console.log("Auth protection OK (got 401 as expected)");

  } catch (err) {
    console.error("Smoke test failed:", err);
    process.exit(1);
  } finally {
    console.log("Stopping server...");
    server.kill();
    // database.close(); // we didn't open it in this process, but good practice if we did
  }
}

main();
