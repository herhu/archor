import { config } from "../src/config.js";

async function main() {
  const apiKey = "your-api-key"; // Replace with a valid key created via dashboard or DB
  const url = `http://localhost:${config.port}/mcp?apiKey=${apiKey}`;

  console.log("Testing Generation Flow...");
  console.log("URL:", url);

  const spec = {
    name: "TestProject",
    module: "test",
    domain: "TestDomain",
    models: [{ name: "Item", fields: [{ name: "name", type: "string" }] }],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "archon_generate_project",
          arguments: {
            spec: spec,
            dryRun: false,
          },
        },
      }),
    });

    if (!response.ok) {
      console.error("HTTP Error:", response.status, await response.text());
      return;
    }

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.result?.content?.[0]?.text?.includes("Download ZIP")) {
      console.log("✅ SUCCESS: S3 Links returned!");
    } else {
      console.log("❌ FAILED: S3 Links missing.");
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

main();
