import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  SOLANA_RPC_URL: z.string().url(),
  JITO_BUNDLE_URL: z.string().url(),
  JITO_TIP_ACCOUNT: z.string().optional(),
  JITO_TIP_LAMPORTS: z.coerce.number().int().nonnegative().default(0),
  MAIN_WALLET_PRIVATE_KEY: z.string().min(1),
  BUNDLE_PRIVATE_KEYS: z.string().min(1),
  BAGSFM_API_BASE_URL: z.string().url(),
  BAGSFM_LAUNCH_PATH: z.string().default("/v1/tx/launch"),
  BAGSFM_BUY_PATH: z.string().default("/v1/tx/buy"),
  BAGSFM_SELL_PATH: z.string().default("/v1/tx/sell"),
  API_KEY: z.string().optional(),
  MAX_TXS_PER_BUNDLE: z.coerce.number().int().min(1).max(20).default(5),
  BUY_AMOUNT_SOL: z.coerce.number().positive().default(0.05),
  SELL_PERCENTAGE: z.coerce.number().min(1).max(100).default(100)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;

export function getBundlePrivateKeys(): string[] {
  return env.BUNDLE_PRIVATE_KEYS.split(",")
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
}
