import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class McpWorker {
  private client: Client;
  private transport: StdioClientTransport;
  busy = false;

  constructor(
    private cmd: string,
    private args: string[],
  ) {
    this.transport = new StdioClientTransport({
      command: this.cmd,
      args: this.args,
    });

    this.client = new Client(
      { name: "archon-mcp-remote", version: "0.1.0" },
      { capabilities: {} },
    );
    this.client.connect(this.transport).catch((err) => {
        console.error("Failed to connect to MCP worker:", err);
    });
  }

  async request(method: string, params?: any) {
    // Schema that accepts anything
    const PassthroughSchema = { 
        parse: (x: any) => x,
        safeParse: (x: any) => ({ success: true, data: x })
    }; 
    return this.client.request({ method, params }, PassthroughSchema as any);
  }

  async close() {
    try {
      await this.client.close();
    } catch {}
    try {
      await this.transport.close();
    } catch {}
  }
}
