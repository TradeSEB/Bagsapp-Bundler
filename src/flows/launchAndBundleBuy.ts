import { PublicKey } from "@solana/web3.js";
import { env, getBundlePrivateKeys } from "../config/env.js";
import { buildTipTransactionBase64, createConnection, signSerializedTx } from "../core/solana.js";
import { keypairFromBase58 } from "../core/wallet.js";
import { BagsFmClient } from "../integrations/bagsfm.js";
import { JitoClient } from "../integrations/jito.js";
import type { LaunchInput } from "../types/bot.js";
import { chunkArray } from "../utils/chunk.js";
import { logger } from "../utils/logger.js";

export async function launchAndBundleBuy(input: LaunchInput): Promise<void> {
  const connection = createConnection(env.SOLANA_RPC_URL);
  const mainWallet = keypairFromBase58(env.MAIN_WALLET_PRIVATE_KEY);
  const buyerWallets = getBundlePrivateKeys().map((secret) => keypairFromBase58(secret));

  const bagsfm = new BagsFmClient();
  const jito = new JitoClient();

  logger.info(
    {
      launchWallet: mainWallet.publicKey.toBase58(),
      buyers: buyerWallets.length
    },
    "Building launch transaction"
  );

  const launchTxResp = await bagsfm.buildLaunchTx({
    creator: mainWallet.publicKey,
    ...input
  });

  const launchTx = signSerializedTx(launchTxResp.transaction, mainWallet);

  const mint = extractMintFromLaunchResponseOrThrow(launchTxResp.mint);
  logger.info({ mint: mint.toBase58() }, "Launch transaction prepared");

  const signedBuyerTxsBase64: string[] = [];
  for (const wallet of buyerWallets) {
    const buyTxResp = await bagsfm.buildBuyTx({
      buyer: wallet.publicKey,
      mint,
      amountSol: env.BUY_AMOUNT_SOL
    });

    const signedBuyTx = signSerializedTx(buyTxResp.transaction, wallet);
    signedBuyerTxsBase64.push(Buffer.from(signedBuyTx.serialize()).toString("base64"));
  }

  const maxPerBundle = env.MAX_TXS_PER_BUNDLE;
  const buyChunks = chunkArray(signedBuyerTxsBase64, Math.max(1, maxPerBundle - 1));

  const launchTxBase64 = Buffer.from(launchTx.serialize()).toString("base64");
  for (let i = 0; i < buyChunks.length; i++) {
    const txs: string[] = [];

    if (i === 0) {
      txs.push(launchTxBase64);
    }

    if (env.JITO_TIP_LAMPORTS > 0 && env.JITO_TIP_ACCOUNT) {
      const tipTx = await buildTipTransactionBase64({
        connection,
        payer: mainWallet,
        tipAccount: env.JITO_TIP_ACCOUNT,
        lamports: env.JITO_TIP_LAMPORTS
      });
      txs.push(tipTx);
    }

    txs.push(...buyChunks[i]);
    const bundleId = await jito.sendBundle(txs);
    logger.info({ bundleId, index: i + 1, total: buyChunks.length }, "Submitted launch/buy bundle");
  }
}

function extractMintFromLaunchResponseOrThrow(mint: string | undefined): PublicKey {
  if (!mint) {
    throw new Error("BagsFM launch API response must include mint.");
  }
  return new PublicKey(mint);
}
