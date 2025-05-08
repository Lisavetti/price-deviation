# 📉 Price Deviation Calculator

This project calculates the **price deviation** between Oracle data (RedStone) and Decentralized Exchange (DEX) data (CoinGecko) for the following trading pairs:

- BTC/USDT
- ETH/USDT
- PEPE/USDT
- DOGE/USDT

The deviation is computed as the **maximum relative difference** between the hourly aggregated DEX price and the Oracle price over a given time range.

---

## 🧩 Project Overview

The repository consists of three key scripts:

- `oracle.js` — Fetches hourly price data from the [RedStone Oracle API](https://api.redstone.finance).
- `dex.js` — Downloads minute-by-minute price data from [CoinGecko](https://www.coingecko.com/ru/api/dex) and aggregates it to hourly resolution.
- `deviation.js` — Matches timestamps and computes the price deviation ($d_{A/B}$) for each trading pair.

Output JSON files are saved into the `/deviation` folder in the format:

```json
{
  "symbol": "BTC/USDT",
  "maxDeviation": 0.01234
}
```

## 📦 Installation
```bash
git clone https://github.com/Lisavetti/price-deviation.git
cd price-deviation
npm install
```

## 🚀 Usage
You can run all scripts manually or through npm commands:

1. Fetch data from RedStone Oracle:
   ```bash
   npm run oracle
   ```

2. Fetch DEX prices from CoinGecko:
   ```bash
   npm run dex
   ```
   
3. Calculate price deviation:
   ```bash
   node deviation.js
   ```


## 📁 Project Structure

```plaintext
price-deviation/
├── oracle.js           # Oracle price data fetcher
├── dex.js              # DEX price data fetcher + hourly aggregator
├── deviation.js        # Main script to compute price deviation
├── oracle-price/       # Saved RedStone Oracle data
├── dex-price/          # Saved CoinGecko price data
├── deviation/          # Final deviation results (JSON)
├── package.json
└── playwright.config.js

