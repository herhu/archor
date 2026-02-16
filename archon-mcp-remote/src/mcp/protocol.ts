export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
};
export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: any;
};

export function ok(id: any, result: any): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}
export function err(
  id: any,
  code: number,
  message: string,
  data?: any,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}
