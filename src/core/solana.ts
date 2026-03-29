import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import type { Keypair } from "@solana/web3.js";

export function createConnection(rpcUrl: string): Connection {
  return new Connection(rpcUrl, "confirmed");
}

export function deserializeBase64Tx(serializedTxBase64: string): VersionedTransaction {
  return VersionedTransaction.deserialize(Buffer.from(serializedTxBase64, "base64"));
}

export function serializeBase64Tx(tx: VersionedTransaction): string {
  return Buffer.from(tx.serialize()).toString("base64");
}

export function signSerializedTx(serializedTxBase64: string, signer: Keypair): VersionedTransaction {
  const tx = deserializeBase64Tx(serializedTxBase64);
  tx.sign([signer]);
  return tx;
}

export async function buildTipTransactionBase64(params: {
  connection: Connection;
  payer: Keypair;
  tipAccount: string;
  lamports: number;
}): Promise<string> {
  const { connection, payer, tipAccount, lamports } = params;
  const { blockhash } = await connection.getLatestBlockhash("confirmed");

  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions: [
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: new PublicKey(tipAccount),
        lamports
      })
    ]
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);
  tx.sign([payer]);
  return serializeBase64Tx(tx);
}
