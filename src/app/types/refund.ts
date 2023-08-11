export type RefundSearchParamsType = {
  page: number
  take: number
  from?: string
  to?: string
  merchantAccount?: string
  merchant?: string
  code?: string
  status?: string
}

export interface RefundListPayloadType {
  data: RefundListDataType[]
  meta: Pagination
}

export interface Pagination {
  page: number
  take: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type RefundListDataType = {
  id?: string
  createdAt?: string
  code?: string
  type?: string
  amount?: number
  fee?: number
  status?: string
  transactionInfo?: string
  gateway?: string
  from?: string
  to?: number
  note?: string
  fromCustomer: FromCustomerType
  toCustomer: ToCustomerType
}

export type FromCustomerType = {
  accountNumber: string
  accountName: string
  device: string
  fullName: string
  phoneNumber: string
}

export type ToCustomerType = {
  accountNumber: string
  accountName: string
  device: string
  fullName: string
  phoneNumber: string
}

export type RefundListCustomerType = {
  id?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  type?: string
  gender?: number
  fullName?: string
  birthDay?: string
  avatar?: string
  phoneNumber?: string
  identityNumber?: number
  dateOfIdentityIssuance?: string
  placeOfIdentityIssuance?: string
  address?: string
  village?: string
  district?: string
  province?: string
  email?: string
  referralCode?: string
  needReLogin?: number
  changePasswordRequired?: number
  changePasswordToken?: string
  active?: number
  securityMethod?: string
  usageLimit?: string
  emailVerified?: number
  device?: string
  accountNumber?: string
  accountName?: string
  lastChangePassword?: string
  accountGroupId?: number
  reasonLock?: string
  status?: string
  customerVerificationId?: number
  hasTransactions?: number
  lockedAt?: string
  isNotification?: number
  isMyOffer?: number
  isTransaction?: number
  isGeneralSetting?: number
  isRemind?: number
}

export enum REFUND_STATUS {
  'SUCCESS' = 'SUCCESS',
  'REFUND_SUCCESS' = 'REFUND_SUCCESS'
}
