module.exports = {
  apps: [
    {
      name: "archon-mcp-remote",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork", // pool handles concurrency internally
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        // user must provide these in .env or via system env
        // DATABASE_URL: "...",
        // API_KEY_PEPPER: "...",
        // OIDC_...
        MCP_WORKERS: 6,
        ARCHON_MCP_CMD: "node",
        ARCHON_MCP_ARGS: "../archon-mcp/dist/index.js",
        ALLOW_EXEC_TOOLS: "false",
      },
    },
  ],
};
