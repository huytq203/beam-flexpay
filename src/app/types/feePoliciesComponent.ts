export interface feePolicyComponent {
  id: string,
  feePolicyId: string
  componentType: string
  baseOn: string
  baseComponentType: number
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
}
export interface FeeComponentResponse {
  content: feePolicyComponent[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
export enum feeDomain {
  EWALLET = "Ewallet",
  BANK = "Bank",
  MERCHANT = "Merchant",
}
export enum serviceType {
   EWALLET_DEPOSIT = "Nạp tiền ví",
  EWALLET_WITHDRAWAL = "Rút tiền ví",
  EWALLET_TRANSFER_INTERNAL = "Chuyển tiền nội bộ",
  EWALLET_TRANSFER_EXTERNAL = "Chuyển tiền liên ngân hàng",
  EWALLET_CASHBACK = "Hoàn tiền",
  MERCHANT_VA_BILL_COLLECTION = "Thu hộ VA"
}
export enum componentType{
  TRANSACTION_FEE='Phí giao dịch cơ bản',
  SYSTEM_FEE='Phí hệ thống',
  MERCHANT_FEE='Phí merchant',
  BANK_FEE='Phí ngân hàng',
  PLATFORM_FEE='Phí nền tảng',
  VAT='Thuế VAT',
  PROCESSING_FEE='Phí xử lý',
  REFUND_FEE='Phí hoàn tiền',
  
}
export enum baseOn{
  AMOUNT='Tính trên số tiền giao dịch',
  MERCHANT_FEE='Tính trên kết quả của MERCHANT_FEE component',
  USER_FEE="Tính trên kết quả của USER_FEE component",
}
export enum payerType{
  USER='Người dùng',
  MERCHANT='Merchant',
  SYSTEM='Hệ thống/platform',
  BANK='Ngân hàng',
  PARTNER='Đối tác',
  TAX='Cơ quan thuế',
}
export enum roundMode{
UP='Làm tròn lên',
DOWN='Làm tròn xuống',
NEAREST='Làm tròn gần nhất',
NONE='Không làm tròn',
}
export enum calculationMethodEnum{
  FLAT_TIER='Bậc lũy tiến',
  DIRECT='Tính trực tiếp',
  PROGRESSIVE_TIER='Bậc thang thành phần',
}
export enum calculationType {
  FLAT_TIER='Flat Tier',
  DIRECT='Direct',
  PROGRESSIVE_TIER='Progressive Tier',
}