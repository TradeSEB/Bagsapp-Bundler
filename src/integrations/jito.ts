import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

interface JsonRpcSuccess<T> {
  jsonrpc: "2.0";
  id: number;
  result: T;
}

interface JsonRpcFailure {
  jsonrpc: "2.0";
  id: number;
  error: { code: number; message: string; data?: unknown };
}

type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcFailure;

export class JitoClient {
  async sendBundle(base64Transactions: string[]): Promise<string> {
    const response = await axios.post<JsonRpcResponse<string>>(env.JITO_BUNDLE_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "sendBundle",
      params: [base64Transactions, { encoding: "base64" }]
    });

    if ("error" in response.data) {
      throw new Error(`Jito sendBundle failed: ${response.data.error.message}`);
    }

    logger.info({ bundleId: response.data.result }, "Bundle submitted to Jito");
    return response.data.result;
  }

  async getBundleStatus(bundleId: string): Promise<unknown> {
    const response = await axios.post<JsonRpcResponse<unknown>>(env.JITO_BUNDLE_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "getBundleStatuses",
      params: [[bundleId]]
    });

    if ("error" in response.data) {
      throw new Error(`Jito getBundleStatuses failed: ${response.data.error.message}`);
    }

    return response.data.result;
  }
}
