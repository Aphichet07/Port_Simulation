interface CoinGeckoPriceResponse {
    [key: string]: {
        usd: number;
        usd_24h_change: number;
    };
}

export class FinanceService {
    private static BASE_URL = 'https://api.coingecko.com/api/v3';

    static async getCryptoPrice(coinId: string) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch data from CoinGecko');
            }

            // 2. ใช้ 'as' เพื่อเปลี่ยนจาก unknown เป็น Interface ที่เราสร้างไว้
            const data = (await response.json()) as CoinGeckoPriceResponse;
            
            if (!data[coinId]) {
                throw new Error(`Coin '${coinId}' not found`);
            }

            return {
                symbol: coinId,
                price: data[coinId].usd,
                change24h: data[coinId].usd_24h_change,
                updatedAt: new Date().toISOString()
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}