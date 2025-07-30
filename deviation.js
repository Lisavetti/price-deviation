const fs = require('fs');
const path = require('path');

function aggregateDexDataToHourly(dexData) {
  const hourlyData = {};

  for (const point of dexData) {
    const date = new Date(point.date);
    if (isNaN(date)) {
      console.error(`Некорректная дата в DEX данных: ${point.date}`);
      continue;
    }
    date.setUTCMinutes(0, 0, 0);
    const hourKey = date.toISOString();

    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = { prices: [], timestamp: hourKey };
    }
    hourlyData[hourKey].prices.push(point.price);
  }

  return Object.values(hourlyData).map(hour => ({
    timestamp: hour.timestamp,
    price: hour.prices.reduce((sum, price) => sum + price, 0) / hour.prices.length
  }));
}

function calculateDeviation(oracleData, dexData) {
  let maxDeviation = 0;
  console.log(`Oracle данных: ${oracleData.length}, DEX данных: ${dexData.length}`);

  for (const oraclePoint of oracleData) {
    const oracleTimestamp = oraclePoint.timestamp;
    const oraclePrice = oraclePoint.price;

    const dexPoint = dexData.find(dex => dex.timestamp === oracleTimestamp);
    if (!dexPoint) {
      console.warn(`Не найдена DEX точка для Oracle timestamp: ${oracleTimestamp}`);
      continue;
    }

    const dexPrice = dexPoint.price;
    const deviation = Math.abs(oraclePrice - dexPrice) / oraclePrice;
    console.log(`Timestamp: ${oracleTimestamp}, Oracle: ${oraclePrice}, DEX: ${dexPrice}, Deviation: ${deviation}`);
    maxDeviation = Math.max(maxDeviation, deviation);
  }

  return maxDeviation;
}

function calculateDeviationForSymbol(symbol) {
  const oraclePath = path.join(__dirname, 'oracle-price', `${symbol.toLowerCase()}-oracle.json`);
  let oracleData;
  try {
    oracleData = JSON.parse(fs.readFileSync(oraclePath, 'utf8'));
  } catch (error) {
    throw new Error(`Не удалось прочитать Oracle данные для ${symbol}: ${error.message}`);
  }

  const dexPath = path.join(__dirname, 'dex-price', `${symbol.toLowerCase()}-usdt-dex.json`);
  let dexData;
  try {
    dexData = JSON.parse(fs.readFileSync(dexPath, 'utf8'));
  } catch (error) {
    throw new Error(`Не удалось прочитать DEX данные для ${symbol}: ${error.message}`);
  }

  const dexHourlyData = aggregateDexDataToHourly(dexData);
  console.log(`DEX данные после агрегации для ${symbol}: ${dexHourlyData.length} точек`);

  const startPeriod = new Date('2025-07-28 15:00:00').getTime();
  const endPeriod = new Date('2025-07-30 15:00:00').getTime();

  const filteredOracleData = oracleData
    .map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).toISOString()
    }))
    .filter(point => {
      const timestamp = new Date(point.timestamp).getTime();
      return timestamp >= startPeriod && timestamp <= endPeriod;
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const filteredDexData = dexHourlyData
    .filter(point => {
      const timestamp = new Date(point.timestamp).getTime();
      return timestamp >= startPeriod && timestamp <= endPeriod;
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  console.log(`После фильтрации для ${symbol} - Oracle: ${filteredOracleData.length}, DEX: ${filteredDexData.length}`);

  if (filteredOracleData.length === 0 || filteredDexData.length === 0) {
    throw new Error(`Недостаточно данных для ${symbol}: Oracle (${filteredOracleData.length}), DEX (${filteredDexData.length})`);
  }

  console.log(`\nРасчёт для ${symbol}/USDT:`);
  const maxDeviation = calculateDeviation(filteredOracleData, filteredDexData);
  console.log(`Максимальное отклонение для ${symbol}/USDT: ${maxDeviation}`);

  const deviationDir = path.join(__dirname, 'deviation');
  if (!fs.existsSync(deviationDir)) {
    fs.mkdirSync(deviationDir);
    console.log(`Создана папка: ${deviationDir}`);
  }

  const outputPath = path.join(deviationDir, `${symbol.toLowerCase()}-deviation.json`);
  fs.writeFileSync(outputPath, JSON.stringify({ symbol: `${symbol}/USDT`, maxDeviation }, null, 2));
  console.log(`Отклонение для ${symbol}/USDT сохранено в ${outputPath}`);

  return maxDeviation;
}

function calculateDeviationsForAll() {
  const symbols = ['BTC', 'ETH', 'PEPE', 'DOGE'];
  const newSymbols = ['DAI', 'MATIC'];
  const results = {};

  for (const symbol of newSymbols) {
    try {
      const maxDeviation = calculateDeviationForSymbol(symbol);
      results[`${symbol}/USDT`] = maxDeviation;
    } catch (error) {
      console.error(`Ошибка при расчёте отклонения для ${symbol}: ${error.message}`);
    }
  }

  console.log('\nРезультаты:');
  console.log('Торговая пара\tОтклонение Oracle/DEX');
  for (const [pair, deviation] of Object.entries(results)) {
    console.log(`${pair}\t${deviation}`);
  }
}

calculateDeviationsForAll();