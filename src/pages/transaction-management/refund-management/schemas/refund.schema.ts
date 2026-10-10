import { z } from 'zod'

export const RefundStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  WAITING_FUNDS: 'WAITING_FUNDS',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  REJECTED: 'REJECTED'
} as const
export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus]

export const RefundChannel = {
  TO_WALLET: 'TO_WALLET',
  TO_BANK: 'TO_BANK'
} as const
export type RefundChannel = (typeof RefundChannel)[keyof typeof RefundChannel]

export const RefundSource = {
  ADMIN_PORTAL: 'ADMIN_PORTAL',
  CLIENT_APP: 'CLIENT_APP',
  API: 'API'
} as const
export type RefundSource = (typeof RefundSource)[keyof typeof RefundSource]

export const RefundOriginalType = {
  CASH_IN: 'CASH_IN',
  CASH_OUT: 'CASH_OUT',
  P2P_TRANSFER: 'P2P_TRANSFER',
  MERCHANT_PAYMENT: 'MERCHANT_PAYMENT'
} as const
export type RefundOriginalType =
  (typeof RefundOriginalType)[keyof typeof RefundOriginalType]

const optionalText = z.string().nullish()

export const refundListItemSchema = z.object({
  id: z.string(),
  refundCode: z.string(),
  originalTransactionId: z.string(),
  originalTransactionCode: optionalText,
  payoutWithdrawalId: optionalText,
  userId: optionalText,
  merchantId: optionalText,
  channel: z.enum(RefundChannel),
  requestedAmount: z.number(),
  netCredit: z.number(),
  status: z.enum(RefundStatus),
  createdAt: z.string(),
  approvedAt: optionalText,
  originalAmount: z.number().nullish(),
  senderProcessingFee: z.number().nullish(),
  receiverProcessingFee: z.number().nullish(),
  createdSource: z.enum(RefundSource),
  beneficiaryBankCode: optionalText,
  beneficiaryAccountNumber: optionalText,
  beneficiaryAccountName: optionalText,
  payoutCode: optionalText,
  customerName: optionalText,
  customerPhone: optionalText
})
export type RefundListItem = z.infer<typeof refundListItemSchema>

const componentSegmentSchema = z.object({
  tierId: optionalText,
  originalFee: z.number(),
  reversedFee: z.number(),
  appliedRoundMode: optionalText
})

const componentAllocationSchema = z.object({
  componentId: z.string(),
  componentType: optionalText,
  payerType: optionalText,
  originalFee: z.number(),
  reversedFee: z.number(),
  segments: z.array(componentSegmentSchema).nullish()
})

/** Chỉ `GET /refunds/{id}` trả `createdBy`, `failureReason`, `originalType`; danh sách thì không. */
export const refundDetailSchema = refundListItemSchema.extend({
  createdBy: optionalText,
  failureReason: optionalText,
  originalType: z.enum(RefundOriginalType),
  originalSenderFee: z.number().nullish(),
  originalReceiverFee: z.number().nullish(),
  senderFeeReversal: z.number().nullish(),
  receiverFeeReversal: z.number().nullish(),
  netDebit: z.number(),
  reason: optionalText,
  approvedBy: optionalText,
  rejectedReason: optionalText,
  componentAllocations: z.array(componentAllocationSchema).nullish()
})
export type RefundDetail = z.infer<typeof refundDetailSchema>

/** Dòng danh sách hoặc bản chi tiết; ba field của chi tiết chỉ có khi đã gọi `GET /refunds/{id}`. */
export type RefundTarget = RefundListItem &
  Partial<Pick<RefundDetail, 'createdBy' | 'failureReason' | 'originalType'>>

export interface RefundPage {
  content: RefundListItem[]
  totalElements: number
  totalPages?: number | null
  number?: number | null
  size?: number | null
}

/** Body `POST /refunds`; ràng buộc nhập liệu nằm ở form schema của màn tạo, BE kiểm tra lại. */
export interface CreateRefundRequest {
  originalTransactionId: string
  requestedAmount: number
  channel: RefundChannel
  reason: string
  sendNotification?: boolean
  createdSource: RefundSource
  beneficiaryBankCode?: string
  beneficiaryAccountNumber?: string
  beneficiaryAccountName?: string
}
