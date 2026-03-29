import { PublicKey } from "@solana/web3.js";
import { env, getBundlePrivateKeys } from "../config/env.js";
import { buildTipTransactionBase64, createConnection, signSerializedTx } from "../core/solana.js";
import { keypairFromBase58 } from "../core/wallet.js";
import { BagsFmClient } from "../integrations/bagsfm.js";
import { JitoClient } from "../integrations/jito.js";
import { chunkArray } from "../utils/chunk.js";
import { logger } from "../utils/logger.js";

export async function gatherAndSellAll(mintAddress: string): Promise<void> {
  const connection = createConnection(env.SOLANA_RPC_URL);
  const mainWallet = keypairFromBase58(env.MAIN_WALLET_PRIVATE_KEY);
  const sellerWallets = getBundlePrivateKeys().map((secret) => keypairFromBase58(secret));
  const mint = new PublicKey(mintAddress);

  const bagsfm = new BagsFmClient();
  const jito = new JitoClient();

  const signedSellTxBase64: string[] = [];
  for (const wallet of sellerWallets) {
    const sellTxResp = await bagsfm.buildSellTx({
      seller: wallet.publicKey,
      mint,
      percentage: env.SELL_PERCENTAGE
    });

    const signedSellTx = signSerializedTx(sellTxResp.transaction, wallet);
    signedSellTxBase64.push(Buffer.from(signedSellTx.serialize()).toString("base64"));
  }

  const sellChunks = chunkArray(signedSellTxBase64, Math.max(1, env.MAX_TXS_PER_BUNDLE - 1));
  for (let i = 0; i < sellChunks.length; i++) {
    const txs: string[] = [];
    if (env.JITO_TIP_LAMPORTS > 0 && env.JITO_TIP_ACCOUNT) {
      const tipTx = await buildTipTransactionBase64({
        connection,
        payer: mainWallet,
        tipAccount: env.JITO_TIP_ACCOUNT,
        lamports: env.JITO_TIP_LAMPORTS
      });
      txs.push(tipTx);
    }
    txs.push(...sellChunks[i]);

    const bundleId = await jito.sendBundle(txs);
    logger.info({ bundleId, index: i + 1, total: sellChunks.length }, "Submitted gather-sell bundle");
  }
}
