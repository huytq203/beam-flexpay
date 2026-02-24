const isDev = import.meta.env.DEV

export const ENV = {
    API_URL: isDev ? '/proxy/admin' : import.meta.env.VITE_API_URL,
    API_LOGIN: isDev ? '/proxy/identity' : import.meta.env.VITE_API_LOGIN,
    API_FEE: isDev ? '/proxy/fee' : import.meta.env.VITE_FEE_API_URL,
    API_WALLETCORE: isDev ? '/proxy/wallet-core' : import.meta.env.VITE_API_WALLETCORE,
    API_MERCHANT: isDev ? '/proxy/merchant' : import.meta.env.VITE_API_MERCHANT
}
