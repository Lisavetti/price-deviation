const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'oracle-price');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function fetchWithRetry(url, options, retries = 3, timeout = 10000) {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Ответ не является JSON: ${text}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (i === retries - 1) throw error;
      console.log(`Попытка ${i + 1} не удалась для ${url}, повтор через 2 секунды...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function getHistoricalPricesForSymbol(symbol) {
  const url = `https://api.redstone.finance/prices?symbol=${symbol}&provider=redstone&limit=3000`;
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  console.log(`Статус ответа для ${symbol}:`, response.status, response.statusText);
  const data = await response.json();

  const formattedData = data.map(point => ({
    symbol: point.symbol,
    price: point.value,
    timestamp: new Date(point.timestamp).toISOString().split("T").join(" ").slice(0, 19),
    permawebTx: point.permawebTx,
    rawTimestamp: point.timestamp
  }));

  const hourlyData = formattedData.filter(point => {
    const date = new Date(point.timestamp);
    return date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
  });

  const outputPath = path.join(outputDir, `${symbol.toLowerCase()}-prices.json`);
  fs.writeFileSync(outputPath, JSON.stringify(hourlyData, null, 2));
  console.log(`Данные для ${symbol} сохранены в ${outputPath}`);

  return hourlyData;
}

async function getHistoricalPrices() {
  const symbols = ['ETH', 'BTC', 'PEPE', 'DOGE'];

  for (const symbol of symbols) {
    try {
      await getHistoricalPricesForSymbol(symbol);
    } catch (error) {
      console.error(`Ошибка при получении данных для ${symbol}:`, error.message);
    }
  }
}

getHistoricalPrices().catch(error => {
  console.error('Общая ошибка:', error.message);
});