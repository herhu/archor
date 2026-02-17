import { McpWorker } from "./worker.js";
import { db } from "../db/index.js";

type PoolOpts = {
  size: number;
  cmd: string;
  args: string[];
  allowExecTools: boolean;
};

// Define tool permissions
const TOOL_SCOPE: Record<string, string> = {
  archon_validate_spec: "archon:write",
  archon_generate_project: "archon:write",
  archon_get_schema: "archon:read",
  archon_list_modules: "archon:read",
  archon_generate_from_uml: "archon:write",
  archon_launch_demo: "archon:exec", // keep disabled by default
};

export type DispatchCtx = { 
    scopes: string[];
    apiKeyId: string;
};

export function toolAllowed(
  toolName: string,
  scopes: string[],
  allowExecTools: boolean,
): boolean {
  const required = TOOL_SCOPE[toolName];
  
  // Implicitly allow unknown tools if they are read-only? 
  // For security, default deny is better. 
  // But standard MCP tools like 'list_tools' should be open.
  if (toolName === "tools/list" || toolName === "resources/list") return true;

  if (!required) return false; // deny unknown tools
  if (required === "archon:exec" && !allowExecTools) return false;
  
  return (
    scopes.includes(required) ||
    (required === "archon:read" && scopes.includes("archon:write"))
  );
}

export async function buildWorkerPool(opts: PoolOpts) {
  const workers: McpWorker[] = [];
  for (let i = 0; i < opts.size; i++)
    workers.push(new McpWorker(opts.cmd, opts.args));

  const queue: Array<{
    ctx: DispatchCtx;
    method: string;
    params: any;
    resolve: (v: any) => void;
    reject: (e: any) => void;
  }> = [];

  function getIdle() {
    return workers.find((w) => !w.busy) ?? null;
  }

  async function pump() {
    const w = getIdle();
    if (!w) return;
    const job = queue.shift();
    if (!job) return;

    w.busy = true;
    const startTime = Date.now();
    let status = "ok";

    try {
      // Gate tool calls
      let toolName = "";
      if (job.method === "tools/call") {
        toolName = String(job.params?.name ?? "");
        if (!toolAllowed(toolName, job.ctx.scopes, opts.allowExecTools)) {
            status = "denied";
          throw Object.assign(new Error(`Tool denied: ${toolName}`), {
            statusCode: 403,
          });
        }
      }

      const res = await w.request(job.method, job.params);
      job.resolve(res);
    } catch (e: any) {
        console.error("[Pool Error Details]", JSON.stringify(e, Object.getOwnPropertyNames(e)));
        status = e?.statusCode === 403 ? "denied" : "error";
      job.reject(e);
    } finally {
        const duration = Date.now() - startTime;
        
        // Usage tracking
        if (job.method === "tools/call") {
             const toolName = String(job.params?.name ?? "");
             // Fire and forget log
             db.none("insert into usage_events(api_key_id, tool_name, status, duration_ms) values($1, $2, $3, $4)",
                 [job.ctx.apiKeyId, toolName, status, duration]
             ).catch(err => console.error("Failed to log usage:", err));
        }

      w.busy = false;
      setImmediate(pump);
    }
  }

  async function dispatch(ctx: DispatchCtx, method: string, params?: any) {
    return new Promise((resolve, reject) => {
      if (queue.length > 5000)
        return reject(
          Object.assign(new Error("Server busy"), { statusCode: 429 }),
        );
      queue.push({ ctx, method, params, resolve, reject });
      setImmediate(pump);
    });
  }

  async function close() {
    for (const w of workers) await w.close();
  }

  return { dispatch, close };
}
