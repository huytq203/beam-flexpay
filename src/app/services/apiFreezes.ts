import { apiWalletCore } from '@services/apiService'
import { ResponseType } from '@type/api'
import { DataFreeze, ManualMoneyCommand } from '@type/freeze.type'

export interface FreezeSearchParams {
    page?: number
    size?: number
    sort?: string
    sortBy?: string
    accountId?: string
    type?: string
    status?: string
    displayStatus?: string
    releaseType?: string
    username?: string
    sourceTransactionCode?: string
    /** TRUE = chỉ lệnh còn thiếu tiền, FALSE = chỉ lệnh đã giữ đủ. */
    shortfall?: boolean
    /** Mặc định chỉ trả lệnh gốc; bật để lấy cả bản ghi bù do hệ thống sinh khi tiền về. */
    includeTopUps?: boolean
    fromDate?: string
    toDate?: string
    /**
     * wallet-core KHÔNG lọc theo trường này — nó không có trong FreezeSearchCriteria.
     * Nơi gọi phải tự lọc lại `content` phía client sau khi nhận kết quả.
     */
    sourceTransactionId?: string
    includeSummary?:boolean
}

export interface UnfreezeRequest {
    accountId: string
    freezeId: string
    amount: number
    reason: string
    /** Bắt buộc trên wallet-core đang deploy — thiếu thì trả VALIDATION_ERROR 3001. */
    idempotencyKey: string
}

export const apiFreezes = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getFreezes: build.query<DataFreeze, FreezeSearchParams>({
            query: (params) => ({
                url: '/wallet/freezes',
                params: params,
                method: 'GET',
            }),
            transformResponse: (res: ResponseType<DataFreeze>) => res.data,
            providesTags: ['Wallet'],
        }),
        /**
         * Bước maker: tạo lệnh mở băng. Tiền CHƯA rời hold, lệnh về trạng thái PENDING_APPROVAL.
         * Đường dẫn đúng là /wallet/accounts/unfreeze — wallet-core không có /wallet/freezes/unfreeze.
         */
        postUnfreeze: build.mutation<ResponseType<ManualMoneyCommand>, UnfreezeRequest>({
            query: (body) => ({
                url: '/wallet/accounts/unfreeze',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        /** Bước checker: duyệt lệnh. Chỉ ở bước này tiền mới rời hold về ví khả dụng. */
        approveUnfreeze: build.mutation<ResponseType<ManualMoneyCommand>, string>({
            query: (commandId) => ({
                url: `/wallet/unfreeze-commands/${commandId}/approve`,
                method: 'POST',
            }),
            invalidatesTags: ['Wallet', 'Journal'],
        }),
        /** Bước checker: từ chối lệnh chờ duyệt. Không đồng nào rời hold. */
        rejectUnfreeze: build.mutation<ResponseType<ManualMoneyCommand>, string>({
            query: (commandId) => ({
                url: `/wallet/unfreeze-commands/${commandId}/reject`,
                method: 'POST',
            }),
            invalidatesTags: ['Wallet'],
        }),
    }),
})

export const {
    useGetFreezesQuery,
    useLazyGetFreezesQuery,
    usePostUnfreezeMutation,
    useApproveUnfreezeMutation,
    useRejectUnfreezeMutation,
} = apiFreezes
