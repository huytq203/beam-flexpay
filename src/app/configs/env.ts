export const ENV = {
  API_LOGIN: import.meta.env.VITE_API_LOGIN,
  API_FEE: import.meta.env.VITE_FEE_API_URL,
  API_WALLETCORE: import.meta.env.VITE_API_WALLETCORE,
  API_MERCHANT: import.meta.env.VITE_API_MERCHANT,
  // Không phải secret. Có default để panel vẫn chạy khi quên khai báo .env.
  WEATHER: (import.meta.env.VITE_WEATHER_API_URL ||
    'https://api.open-meteo.com/v1') as string,
  // Công tắc tổng của linh vật Capy. Thiếu hoặc khác 'true' thì tính năng không tồn tại với mọi người.
  CAPY_ENABLED: import.meta.env.VITE_CAPY_ENABLED === 'true',
  REVERSE_GEOCODING: (import.meta.env.VITE_REVERSE_GEOCODING_API_URL ||
    'https://api.bigdatacloud.net') as string
}
