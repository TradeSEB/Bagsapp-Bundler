export interface LaunchInput {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

export interface BagsFmSerializedTxResponse {
  transaction: string;
  mint?: string;
}

export interface BotCommandContext {
  mint?: string;
}
