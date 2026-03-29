import { launchAndBundleBuy } from "./flows/launchAndBundleBuy.js";
import { gatherAndSellAll } from "./flows/gatherAndSellAll.js";
import { logger } from "./utils/logger.js";

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index < 0 || index + 1 >= process.argv.length) {
    return undefined;
  }
  return process.argv[index + 1];
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (!command) {
    printHelp();
    process.exit(1);
  }

  if (command === "launch-and-buy") {
    const name = getArgValue("--name");
    const symbol = getArgValue("--symbol");
    const description = getArgValue("--description");

    if (!name || !symbol || !description) {
      throw new Error("launch-and-buy requires --name, --symbol, --description");
    }

    await launchAndBundleBuy({
      name,
      symbol,
      description,
      imageUrl: getArgValue("--image-url"),
      website: getArgValue("--website"),
      twitter: getArgValue("--twitter"),
      telegram: getArgValue("--telegram")
    });
    return;
  }

  if (command === "gather-sell") {
    const mint = getArgValue("--mint");
    if (!mint) {
      throw new Error("gather-sell requires --mint");
    }

    await gatherAndSellAll(mint);
    return;
  }

  printHelp();
  process.exit(1);
}

function printHelp(): void {
  logger.info(
    [
      "Usage:",
      "  npm run start -- launch-and-buy --name <NAME> --symbol <SYMBOL> --description <TEXT> [--image-url URL] [--website URL] [--twitter URL] [--telegram URL]",
      "  npm run start -- gather-sell --mint <MINT_ADDRESS>"
    ].join("\n")
  );
}

main().catch((error: unknown) => {
  logger.error({ err: error }, "Bot execution failed");
  process.exit(1);
});
