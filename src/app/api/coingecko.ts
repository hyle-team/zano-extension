// Returns null when the price is unavailable (network error, rate limit, unexpected shape),
// so the UI can say so instead of showing a made-up number.
export const getZanoPrice = async () => {
	const coinId = 'zano';
	const vsCurrency = 'usd';

	try {
		// Fetch current price
		const priceResponse = await fetch(
			`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`,
		);
		if (!priceResponse.ok) throw new Error(`HTTP error! status: ${priceResponse.status}`);
		const priceData = await priceResponse.json();
		const currentPrice = priceData?.[coinId]?.[vsCurrency];

		// Fetch 24-hour price change
		const coinResponse = await fetch(
			`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
		);
		if (!coinResponse.ok) throw new Error(`HTTP error! status: ${coinResponse.status}`);
		const coinData = await coinResponse.json();
		const priceChange24h = coinData?.market_data?.price_change_percentage_24h;

		if (!Number.isFinite(currentPrice) || !Number.isFinite(priceChange24h)) {
			throw new Error('Unexpected price response');
		}

		return { price: currentPrice, change: priceChange24h.toFixed(2) };
	} catch (error) {
		console.warn('ZANO price unavailable:', error);
		return null;
	}
};
