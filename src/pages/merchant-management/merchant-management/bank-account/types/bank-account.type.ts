/** Cấp áp dụng của cấu hình: đặt ở Master hay override riêng cho một Sub. */
export const BankAccountScope = {
  MASTER: 'MASTER',
  SUB: 'SUB'
} as const
export type BankAccountScope =
  (typeof BankAccountScope)[keyof typeof BankAccountScope]

export const WithdrawMode = {
  MANUAL: 'MANUAL',
  AUTO: 'AUTO'
} as const
export type WithdrawMode = (typeof WithdrawMode)[keyof typeof WithdrawMode]

export const WithdrawCycle = {
  T0: 'T+0',
  T1: 'T+1',
  T2: 'T+2',
  T3: 'T+3'
} as const
export type WithdrawCycle = (typeof WithdrawCycle)[keyof typeof WithdrawCycle]

/** Khóa tài khoản = chuyển sang INACTIVE; mở khóa = về ACTIVE. */
export const BankAccountStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const
export type BankAccountStatus =
  (typeof BankAccountStatus)[keyof typeof BankAccountStatus]

/** Kết quả đối chiếu tài khoản với ngân hàng thụ hưởng. */
export const BankLinkStatus = {
  LINKED: 'LINKED',
  PENDING: 'PENDING',
  FAILED: 'FAILED'
} as const
export type BankLinkStatus =
  (typeof BankLinkStatus)[keyof typeof BankLinkStatus]

export interface BankAccountRow {
  id: string
  scope: BankAccountScope
  /** Đơn vị mà cấu hình áp lên: Master, hoặc Sub khi là bản override. */
  merchantName: string
  merchantCode: string
  /** Master gốc — bằng `merchantCode` khi bản ghi ở cấp Master. */
  masterMerchantCode: string
  bankCode: string
  bankName: string
  /** Số đầy đủ — cell hiển thị tự che, chỉ mở khi có quyền. */
  accountNumber: string
  accountName: string
  branchName?: string
  withdrawMode: WithdrawMode
  withdrawCycle?: WithdrawCycle
  minAmount?: number
  maxAmount?: number
  status: BankAccountStatus
  linkStatus: BankLinkStatus
}

export type BankAccountFormMode = 'create' | 'edit'
export type BankAccountLockMode = 'lock' | 'unlock'

export type BankAccountDialogState =
  | { kind: 'form'; mode: BankAccountFormMode; row: BankAccountRow | null }
  | { kind: 'lock'; mode: BankAccountLockMode; row: BankAccountRow }
