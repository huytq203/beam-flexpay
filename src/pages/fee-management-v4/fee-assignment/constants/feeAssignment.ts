// Kiểu bản gán đã chuyển lên `src/app/types/fee.type.ts` để tầng service không
// còn phụ thuộc vào thư mục của một màn. Re-export để màn cũ chưa gỡ vẫn chạy.
import type { FeeAssignment } from '@type/fee.type'
export type { FeeAssignment }

/**
 * Item of `GET /fee/banks` -> `data.content`.
 * The endpoint is declared untyped in `@services/apiFeeBank`; only the two
 * fields below are read by the fee-assignment forms.
 */
export interface FeeBank {
  code: string
  name: string
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


export interface FeeAssignResponse {
  content: FeeAssignment[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
export const bankCodeType ={
  VCB : 'VCB',
  VPB : 'VPB'
}as const;
export const serviceType ={
  EWALLET_DEPOSIT : 'Nạp tiền ví',
  EWALLET_WITHDRAWAL : 'Rút tiền ví',
  EWALLET_TRANSFER_INTERNAL : 'Chuyển tiền nội bộ',
  EWALLET_TRANSFER_EXTERNAL : 'Chuyển tiền liên ngân hàng',
  EWALLET_CASHBACK : 'Hoàn tiền',
  MERCHANT_VA_BILL_COLLECTION : 'Thu hộ VA',
  PAYOUT_BANK_TRANSFER : 'Chi hộ chuyển khoản ngân hàng'
}as const;
export const paymentMethodType ={
  ATM : 'ATM',
  QR_CODE : 'Quét mã QR',
  CREDIT_CARD : 'Thẻ tín dụng',
  BANK_TRANSFER : 'Chuyển khoản ngân hàng',
  LINKED_ACCOUNT : 'Tài khoản liên kết ',
  VA : 'Virtual Account (tài khoản ảo)',

}as const;
export const cardTypeType ={
  VISA : 'VISA',
  NAPAS : 'Napas',

}as const;
export const customerGroupType ={
  VIP :'VIP',
  PREMIUM :'User Premium',
  MERCHANT :'User Premium',
  STANDARD :'User thường',
}as const;
export const statusType ={
  ACTIVE :'Hoạt động',
  INACTIVE :'Không hoạt động',
}as const;
export type FeeAssignmentResponse = ApiResponse<FeeAssignResponse>


