# BagsApp Bundler Bot (Solana + Jito)

TypeScript trading bot scaffold for BagsApp/BagsFM token flows:

- Launch a new coin on BagsFM
- Bundle multi-wallet buy transactions through Jito
- Gather flow to sell from all bundle wallets

## Features

- `launch-and-buy` flow:
  - Creates launch transaction from BagsFM API
  - Signs launch tx with main wallet
  - Builds buy txs for all bundle wallets
  - Sends launch + buys as Jito bundles
- `gather-sell` flow:
  - Builds sell tx for each bundle wallet
  - Signs sells and submits via Jito bundles
- Config-driven via `.env`

## Important Integration Note

This bot expects your BagsFM API (or your proxy) to return a serialized base64 transaction for launch/buy/sell endpoints and to include `mint` in launch response.

You can adjust payload/response contracts in:

- `src/integrations/bagsfm.ts`
- `src/types/bot.ts`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Fill required envs:

- `SOLANA_RPC_URL`
- `JITO_BUNDLE_URL`
- `MAIN_WALLET_PRIVATE_KEY`
- `BUNDLE_PRIVATE_KEYS`
- `BAGSFM_API_BASE_URL`

4. (Optional) Build:

```bash
npm run build
```

## Run

### Launch and Bundle Buy

```bash
npm run start -- launch-and-buy --name "My Coin" --symbol "MYC" --description "My launch coin"
```

Optional flags: `--image-url`, `--website`, `--twitter`, `--telegram`

### Gather Sell (All Bundle Wallets)

```bash
npm run start -- gather-sell --mint <MINT_ADDRESS>
```

## Scripts

- `npm run start` - run bot
- `npm run dev` - run with watch mode
- `npm run build` - compile TS
- `npm run typecheck` - static type check
- `npm run lint` - lint code

## 📞 Support

- telegram: https://t.me/trade_SEB
- twitter:  https://x.com/TradeSEB_
