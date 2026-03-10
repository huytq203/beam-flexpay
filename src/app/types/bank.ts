import { Pagination } from './table'

export interface IBankQuery {
  page: number
  limit?: number
  take?: number
  name?: string
  active?: string
  orderBy: string
  type?: string
  isLoading?: boolean
  key?: string
}

export interface BankInformation {
  bankId: string
  address: string
  website: string
  logo: string
  createdTime: string
  status: boolean
  order: number
  name: string | null
  tradingName: string | null
  active: 0
  image: string | null
  shortLogo: string | null
  priority: number | null
  id: number | null
  createdAt: string | null
  updatedAt: string | null
  bankCode: string | null
  deletedAt: null
  no?: string | number
  type: string
}

export interface PublicBankInterface {
  bankCode: string
  id: number
  image: null
  name: string
  tradingName: string
}

export interface BankConfig {
  bankName: string
  order: number
  bankCode: string
  status: string
}

export interface BankResponse {
  data: BankInformation[]
  meta: Pagination
}

export enum TYPE_BANK {
  DEPOSIT_BANK = 'DEPOSIT_BANK',
  WITHDRAWAL_BANK = 'WITHDRAWAL_BANK'
}

export enum BANK_CHANNEL {
  DIRECT = 'DIRECT',
  NAPAS = 'NAPAS',
  IBFT = 'IBFT',
  NONE = 'NONE'
}

export enum PaymentMethod{
    /**
     * Thanh toán bằng thẻ ATM
     */
    ATM_CARD = 'ATM_CARD',
    /**
     * Thanh toán QR Code
     */
    QR_CODE = 'QR_CODE',
    /**
     * Thanh toán bằng tài khoản ngân hàng (chuyển khoản)
     */
    BANK_TRANSFER = 'BANK_TRANSFER',
    /**
     * Thanh toán bằng thẻ quốc tế (Visa, Mastercard, v.v.)
     */
    INTERNATIONAL_CARD = 'INTERNATIONAL_CARD',
    /**
     * Thanh toán qua Ví điện tử (chuyển ví đến ví)
     */
    E_WALLET = 'E_WALLET'
}