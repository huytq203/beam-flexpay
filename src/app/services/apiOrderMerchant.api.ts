import { apiMerchant } from './apiService'
import type { GatewayPage, GatewayResponse } from './merchantGatewayApi'

/** Trạng thái đơn theo `MerchantOrderStatus` của BE; gửi lọc đúng tên hằng. */
export type MerchantOrderStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'PAYMENT_CONFIRMED'
  | 'CREDIT_PENDING'
  | 'CREDIT_POSTING'
  | 'CREDIT_RECONCILIATION_REQUIRED'
  | 'SUCCESS'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'

export type OrderBankCode = 'VPB' | 'VCB'
export type OrderPaymentMethod =
  | 'QR'
  | 'VIRTUAL_ACCOUNT'
  | 'DOMESTIC_CARD'
  | 'INTERNATIONAL_CARD'
  | 'LINKED_WALLET'

export interface OrderVirtualAccount {
  virtualAccId?: string
  virtualAccountNo?: string
  virtualAccountName?: string
  qrCode?: string
}

/** Trường null vẫn có mặt trong JSON; ngày giờ là giờ Việt Nam, không múi giờ. */
export interface MerchantOrder {
  id: string
  merchantId: string
  subMerchantId?: string | null
  terminalId?: string | null
  sourceLedgerVersion?: string | null
  merchantName?: string | null
  merchantCode?: string | null
  orderCode: string
  orderDescription?: string | null
  netAmount: number
  amount: number
  currency?: string | null
  status: MerchantOrderStatus
  bankCode: OrderBankCode
  expiredAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  virtualAccount?: OrderVirtualAccount | null
  qrCode?: string | null
  qrCodeImage?: string | null
  paymentRef?: string | null
  paymentName?: string | null
  transactionCode?: string | null
  journalId?: string | null
  creditTransactionId?: string | null
  feeAmount?: number | null
  feeCalculationId?: string | null
  feePolicyId?: string | null
  feeCode?: string | null
  feePolicyVersion?: string | null
  creditFailureReason?: string | null
}

export interface MerchantOrderListParams {
  page: number
  size: number
  merchantCode?: string
  merchantId?: string
  orderCode?: string
  status?: MerchantOrderStatus
}

/** Chỉ các trường BE cho phép; trường lạ bị từ chối 400. */
export interface MerchantOrderCreateBody {
  merchantId: string
  orderCode: string
  orderDescription?: string
  amount: number
  expiredAt?: string
  purpose?: string
  bankCode: OrderBankCode
  paymentMethod?: OrderPaymentMethod
  subMerchantId?: string
  terminalId?: string
}

export type PaymentAnomalyReason =
  | 'ORDER_NOT_PAYABLE'
  | 'ORDER_EXPIRED'
  | 'AMOUNT_MISMATCH'
  | 'DUPLICATE_PAYMENT'
export type PaymentAnomalyStatus = 'OPEN' | 'RESOLVED'

export interface MerchantPaymentAnomaly {
  id: string
  orderId: string
  /** Null khi đơn không còn tra được. */
  orderCode?: string | null
  /** Null khi Merchant/Sub không còn tra được. */
  merchantName?: string | null
  subMerchantName?: string | null
  bankCode: OrderBankCode
  paymentRef?: string | null
  billNumber?: string | null
  amount: number
  expectedAmount: number
  /** Trạng thái đơn lúc ghi nhận, không phải trạng thái hiện tại. */
  orderStatus: MerchantOrderStatus
  reason: PaymentAnomalyReason
  status: PaymentAnomalyStatus
  createdAt: string
  /** Ba trường dưới chỉ có sau khi đã xử lý. */
  resolvedBy?: string | null
  resolvedAt?: string | null
  resolutionReason?: string | null
}

export interface PaymentAnomalyListParams {
  page: number
  size: number
  status?: PaymentAnomalyStatus
}

/**
 * Màn tự hiển thị `detail` của lỗi (BE đặt `message` là tên mã lỗi, không phải
 * câu hiển thị), nên tắt thông báo tập trung.
 */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

const unwrap = <T>(response: GatewayResponse<T>): T => response.data

const merchantOrder = apiMerchant.injectEndpoints({
  endpoints: (build) => ({
    getMerchantOrder: build.query<
      GatewayPage<MerchantOrder>,
      MerchantOrderListParams
    >({
      query: (params) => ({ url: '/merchant-orders', method: 'GET', params }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      providesTags: ['Order']
    }),
    getMerchantOrderById: build.query<MerchantOrder, string>({
      query: (id) => ({ url: `/merchant-orders/${id}`, method: 'GET' }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      providesTags: ['Order']
    }),
    getMerchantPaymentAnomalies: build.query<
      GatewayPage<MerchantPaymentAnomaly>,
      PaymentAnomalyListParams
    >({
      query: (params) => ({
        url: '/merchant-orders/payment-anomalies',
        method: 'GET',
        params
      }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      providesTags: ['Order']
    }),
    // Người xử lý lấy từ người đăng nhập; `reason` bắt buộc, tối đa 500 ký tự.
    // 409 mã 4329 khi khoản này đã được xử lý.
    resolveMerchantPaymentAnomaly: build.mutation<
      MerchantPaymentAnomaly,
      { id: string; body: { reason: string } }
    >({
      query: ({ id, body }) => ({
        url: `/merchant-orders/payment-anomalies/${id}/resolve`,
        method: 'POST',
        body
      }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['Order']
    }),
    postMerchantOrder: build.mutation<MerchantOrder, MerchantOrderCreateBody>({
      query: (body) => ({ url: '/merchant-orders', method: 'POST', body }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['Order']
    }),
    // `amount` phải là số nguyên đồng và bằng đúng số tiền của đơn.
    postMerchantOrderConfirm: build.mutation<
      MerchantOrder,
      { id: string; body: { amount: number } }
    >({
      query: ({ id, body }) => ({
        url: `/merchant-orders/${id}/confirm`,
        method: 'POST',
        body
      }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['Order']
    }),
    postMerchantOrderRetryCredit: build.mutation<MerchantOrder, string>({
      query: (id) => ({
        url: `/merchant-orders/${id}/retry-credit`,
        method: 'POST'
      }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['Order']
    }),
    postRefreshQr: build.mutation<MerchantOrder, string>({
      query: (id) => ({
        url: `/merchant-orders/${id}/refresh-qr`,
        method: 'POST'
      }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['Order']
    }),
    postMerchantOrderCancel: build.mutation<MerchantOrder, string>({
      query: (id) => ({
        url: `/merchant-orders/${id}/cancel`,
        method: 'POST'
      }),
      transformResponse: unwrap,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['Order']
    })
  }),
  overrideExisting: false
})

export const {
  useGetMerchantOrderQuery,
  useGetMerchantOrderByIdQuery,
  useGetMerchantPaymentAnomaliesQuery,
  useResolveMerchantPaymentAnomalyMutation,
  usePostMerchantOrderMutation,
  usePostRefreshQrMutation,
  usePostMerchantOrderConfirmMutation,
  usePostMerchantOrderRetryCreditMutation,
  usePostMerchantOrderCancelMutation
} = merchantOrder
