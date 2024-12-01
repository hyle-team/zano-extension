export const getZanoPrice = async () => {
  const coinId = "zano";
  const vsCurrency = "usd";

  // Fetch current price
  const priceResponse = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`
  );
  const priceData = await priceResponse.json();
  const currentPrice = priceData[coinId][vsCurrency];

  // Fetch 24-hour price change
  const coinResponse = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
  );
  const coinData = await coinResponse.json();
  const priceChange24h = coinData.market_data.price_change_percentage_24h;

  console.log(`Current price of Zano: $${currentPrice}`);
  console.log(`24-hour price change: ${priceChange24h.toFixed(2)}%`);

  return { price: currentPrice, change: priceChange24h.toFixed(2) };
};
