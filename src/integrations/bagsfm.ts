import axios, { type AxiosInstance } from "axios";
import type { PublicKey } from "@solana/web3.js";
import { env } from "../config/env.js";
import type { BagsFmSerializedTxResponse } from "../types/bot.js";
import type { LaunchInput } from "../types/bot.js";

interface BuildLaunchTxInput extends LaunchInput {
  creator: PublicKey;
}

interface BuildBuyTxInput {
  buyer: PublicKey;
  mint: PublicKey;
  amountSol: number;
}

interface BuildSellTxInput {
  seller: PublicKey;
  mint: PublicKey;
  percentage: number;
}

export class BagsFmClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.BAGSFM_API_BASE_URL,
      timeout: 30_000,
      headers: env.API_KEY ? { "x-api-key": env.API_KEY } : undefined
    });
  }

  async buildLaunchTx(input: BuildLaunchTxInput): Promise<BagsFmSerializedTxResponse> {
    const response = await this.http.post<BagsFmSerializedTxResponse>(env.BAGSFM_LAUNCH_PATH, {
      creator: input.creator.toBase58(),
      name: input.name,
      symbol: input.symbol,
      description: input.description,
      imageUrl: input.imageUrl,
      website: input.website,
      twitter: input.twitter,
      telegram: input.telegram
    });
    return response.data;
  }

  async buildBuyTx(input: BuildBuyTxInput): Promise<BagsFmSerializedTxResponse> {
    const response = await this.http.post<BagsFmSerializedTxResponse>(env.BAGSFM_BUY_PATH, {
      buyer: input.buyer.toBase58(),
      mint: input.mint.toBase58(),
      amountSol: input.amountSol
    });
    return response.data;
  }

  async buildSellTx(input: BuildSellTxInput): Promise<BagsFmSerializedTxResponse> {
    const response = await this.http.post<BagsFmSerializedTxResponse>(env.BAGSFM_SELL_PATH, {
      seller: input.seller.toBase58(),
      mint: input.mint.toBase58(),
      percentage: input.percentage
    });
    return response.data;
  }
}
