import type { ContentAccountWallet } from '@type/responseAccountWallet'

export const BUSINESS_WALLET_TYPE = 'BUSINESS' as const

export interface BusinessWalletRow extends ContentAccountWallet {
  no: number
}
