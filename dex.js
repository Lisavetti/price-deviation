const axios = require("axios");
const fs = require("fs");
const path = require("path");
const randomUseragent = require("random-useragent");

function formatDate(ms) {
  return new Date(ms).toISOString().replace("T", " ").substring(0, 19);
}

const coinPairs = {
  "btc-usdt": "bitcoin",
  "eth-usdt": "ethereum",
  "doge-usdt": "dogecoin",
  "pepe-usdt": "pepe"
};

async function fetchPrices(coinId, days = 2) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`;
  const userAgent = randomUseragent.getRandom();

  const response = await axios.get(url, {
    params: {
      vs_currency: "usd",
      days: days
    },
    headers: {
      "User-Agent": userAgent
    }
  });

  return response.data.prices.map(([timestamp, price]) => ({
    date: formatDate(timestamp),
    price
  }));
}

async function saveAllPairs() {
  const outputDir = path.join(__dirname, "dex-price");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const [pair, coinId] of Object.entries(coinPairs)) {
    try {
      console.log(`📥 Загружаем данные для ${pair}...`);
      const prices = await fetchPrices(coinId, 2);
      const filePath = path.join(outputDir, `${pair}.json`);
      fs.writeFileSync(filePath, JSON.stringify(prices, null, 2), "utf-8");
      console.log(`✅ Сохранено ${prices.length} записей в ${filePath}`);
    } catch (err) {
      console.error(`❌ Ошибка с парой ${pair}:`, err.response?.data || err.message);
    }
  }
}

saveAllPairs();
