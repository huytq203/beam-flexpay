export interface feePolicyComponent {
  id: string,
  feePolicyId: string
  componentType: string
  baseOn: string
  baseComponentType: string
  calculationMethod: string
  fixedAmount: number
  percentage: number
  roundMode: string
  minFee: number
  maxFee: number
  payerType: string
  payerObjectType: string
  payerObjectId: string
  beneficiaryType: string
  beneficiaryObjectType: string
  beneficiaryObjectId: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  minValue: number
  maxValue: number
}
export interface FeeComponentResponse {
  content: feePolicyComponent[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const Currency = {
  VND: 'VND',
  USD: 'USD'
} as const

export const feeDomain = {
  EWALLET: "Ewallet",
  BANK: "Bank",
  MERCHANT: "Merchant",
}
export const serviceType = {
  EWALLET_DEPOSIT: "Nạp tiền ví",
  EWALLET_WITHDRAWAL: "Rút tiền ví",
  EWALLET_TRANSFER_INTERNAL: "Chuyển tiền nội bộ",
  EWALLET_TRANSFER_EXTERNAL: "Chuyển tiền liên ngân hàng",
  EWALLET_CASHBACK: "Hoàn tiền",
  MERCHANT_VA_BILL_COLLECTION: "Thu hộ VA",
  PAYOUT_BANK_TRANSFER: "Chi hộ chuyển khoản ngân hàng"
} as const
export const componentType = {
  TRANSACTION_FEE: 'Phí giao dịch cơ bản',
  SYSTEM_FEE: 'Phí hệ thống',
  MERCHANT_FEE: 'Phí merchant',
  BANK_FEE: 'Phí ngân hàng',
  PLATFORM_FEE: 'Phí nền tảng',
  VAT: 'Thuế VAT',
  PROCESSING_FEE: 'Phí xử lý',
  REFUND_FEE: 'Phí hoàn tiền',


}
export const baseOn = {
  AMOUNT: 'Tính trên số tiền giao dịch',
  TRANSACTION_FEE: 'Phí giao dịch cơ bản',
  SYSTEM_FEE: 'Phí hệ thống',
  MERCHANT_FEE: 'Phí merchant',
  BANK_FEE: 'Phí ngân hàng',
  PLATFORM_FEE: 'Phí nền tảng',
  VAT: 'Thuế VAT',
  PROCESSING_FEE: 'Phí xử lý',
  REFUND_FEE: 'Phí hoàn tiền',
}


export const payerType = {
  USER: 'Người dùng',
  MERCHANT: 'Merchant',
  SYSTEM: 'Hệ thống/platform',
  SENDER: 'Người gửi',
  RECEIVER: 'Người nhận',
}
export const beneficiaryType = {
  SYSTEM: 'Hệ thống',
  MERCHANT: 'Merchant',
  BANK: 'Ngân hàng',
  PARTNER: 'Đối tác',
  TAX: 'Cơ quan thuế',
}
export const roundMode = {
  UP: 'Làm tròn lên',
  DOWN: 'Làm tròn xuống',
  NEAREST: 'Làm tròn gần nhất',
  NONE: 'Không làm tròn',
}
export const calculationMethodEnum = {
  FLAT_TIER: 'Bậc lũy tiến',
  DIRECT: 'Tính trực tiếp',
  PROGRESSIVE_TIER: 'Bậc thang toàn phần',
}
export const calculationType = {
  FLAT_TIER: 'Flat Tier',
  DIRECT: 'Direct',
  PROGRESSIVE_TIER: 'Progressive Tier',
}

export interface FeeComponentFormValues {
  componentType: string;
  baseOn: string;
  payerType: string;
  beneficiaryType: string;
  roundMode: string;
  calculationMethod: string | number;
  feeExpression?: string;
  tiers?: feePolicyComponent[];
  minValue?: number;
  maxValue?: number;
}
