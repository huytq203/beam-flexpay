export const ENV = {
    API_LOGIN: import.meta.env.VITE_API_LOGIN,
    API_FEE: import.meta.env.VITE_FEE_API_URL,
    API_WALLETCORE: import.meta.env.VITE_API_WALLETCORE,
    API_MERCHANT: import.meta.env.VITE_API_MERCHANT,
    // Không phải secret. Có default để panel vẫn chạy khi quên khai báo .env.
    WEATHER: (import.meta.env.VITE_WEATHER_API_URL ||
        'https://api.open-meteo.com/v1') as string,
    REVERSE_GEOCODING: (import.meta.env.VITE_REVERSE_GEOCODING_API_URL ||
        'https://api.bigdatacloud.net') as string
}
