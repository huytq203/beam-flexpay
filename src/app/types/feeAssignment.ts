// Type cho từng item trong mảng content
export interface FeeAssignment {
  id: string
  feePolicyId: string
  merchantId: string | null
  bankCode: string
  paymentMethod: string | null
  cardType: string | null
  serviceType: string
  customerGroup: string | null
  status: string
  createdAt: string
  updatedBy: string
  createdBy: string
  updatedAt: string
}

export interface Sort {
  empty: boolean
  unsorted: boolean
  sorted: boolean
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: Sort
  offset: number
  unpaged: boolean
  paged: boolean
}

export interface PaginatedData<T> {
  content: T[]
  pageable: Pageable
  totalElements: number
  totalPages: number
  last: boolean
  size: number
  number: number
  numberOfElements: number
  sort: Sort
  first: boolean
  empty: boolean
}

// Type cho toàn bộ response
export interface ApiResponse<T> {
  data: PaginatedData<T>
  message: string
  detail: string
  success: boolean
  status: string
}

// Sử dụng

export interface FeeAssignmentMockup {
  id: string
  type: string
  account: string
  serviceType: string
  method: string
  transactionLimit: string
  fee: string
  minMax: string
  createdDate: string
  appliedDate: string
  expiryDate: string
  status: string
  locked: string
}
export interface FeeAssignResponse {
  content: FeeAssignment[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
export enum bankCodeType {
  VCB = 'VCB',
  VPB = 'VPB'
}
export enum serviceType {
  EWALLET_DEPOSIT = 'Nạp tiền ví',
  EWALLET_WITHDRAWAL = 'Rút tiền ví',
  EWALLET_TRANSFER_INTERNAL = 'Chuyển tiền nội bộ',
  EWALLET_TRANSFER_EXTERNAL = 'Chuyển tiền liên ngân hàng',
  EWALLET_CASHBACK = 'Hoàn tiền',
  MERCHANT_VA_BILL_COLLECTION = 'Thu hộ VA'
}
export enum paymentMethodType {
  ATM = 'ATM'
}
export enum cardTypeType {
  VISA = 'VISA'
}
export enum customerGroupType{
  VIP='VIP'
}
export enum statusType{
  ACTIVE='ACTIVE',
  INACTIVE='INACTIVE'
}
export type FeeAssignmentResponse = ApiResponse<FeeAssignResponse>
