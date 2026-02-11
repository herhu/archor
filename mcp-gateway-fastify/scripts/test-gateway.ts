import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function testGateway() {
  console.log("Testing Archon at http://localhost:3000/mcp/archon/sse...");
  try {
    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/archon/sse"));
    const client = new Client({
      name: "test-client",
      version: "1.0.0",
    }, {
      capabilities: {}
    });

    await client.connect(transport);
    console.log("✅ Archon Connected!");
    
    const tools = await client.listTools();
    console.log("✅ Archon Tools:", tools.tools.map(t => t.name));
    
    await client.close();
  } catch (err: any) {
    console.error("❌ Archon: Failed", err.message);
  }

  console.log("---\nTesting UML at http://localhost:3000/mcp/uml/sse...");
  try {
    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/uml/sse"));
    const client = new Client({
      name: "test-client",
      version: "1.0.0",
    }, {
      capabilities: {}
    });
    
    await client.connect(transport);
    console.log("✅ UML Connected!");
    
    const tools = await client.listTools();
    console.log("✅ UML Tools:", tools.tools.map(t => t.name));

    await client.close();
  } catch (err: any) {
    console.error("❌ UML: Failed", err.message);
  }
}

testGateway();
