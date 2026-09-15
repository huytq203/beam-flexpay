import { apiWalletCore } from "@services/apiService"
import { ResponseType } from "@type/api"
import { ContentAccountWallet, DataAccountWallet } from "@type/responseAccountWallet"

export interface WalletAccountQueryParams {
    page?: number
    size?: number
    username?: string
    ownerId?: string
    ownerType?: string
    glCode?: string
    status?: string
    enabled?: string
    walletType?: string
    currency?: string
    /** Khoảng thời gian tạo ví (createdAt), ISO date-time. */
    fromDate?: string
    toDate?: string
}

/**
 * Hợp đồng băng / mở băng của wallet-core KHÔNG đối xứng về `idempotencyKey`.
 * Bảng dưới đây kiểm bằng chính API dev đang chạy, không phải đọc từ source —
 * source ở repo BE đã lệch so với bản deploy:
 *
 * | Endpoint                        | idempotencyKey             |
 * |---------------------------------|----------------------------|
 * | `/accounts/freeze`              | chưa kiểm                  |
 * | `/accounts/freeze-transaction`  | KHÔNG nhận (1006 nếu gửi)  |
 * | `/accounts/unfreeze`            | chưa kiểm                  |
 * | `/accounts/unfreeze-transaction`| BẮT BUỘC (3001 nếu thiếu)  |
 *
 * Đừng "dọn cho đồng bộ" bằng cách thêm field vào cả bốn — đó là cách làm hỏng
 * `/freeze-transaction`. Kiểm bằng request thật trước khi đổi dòng nào.
 */
export interface FreezeRequest {
    accountId: string
    amount: number
    reason: string
}

/** Khớp `AdminUnfreezeRequest`. */
export interface UnfreezeRequest {
    accountId: string
    reason: string
}

/** Khớp `AdminFreezeTransactionRequest` — đúng 4 field, không hơn. */
export interface FreezeTransactionRequest {
    accountId: string
    sourceTransactionId: string
    amount: number
    reason: string
}

export interface UnfreezeTransactionRequest {
    accountId: string
    freezeId: string
    sourceTransactionId: string
    amount: number
    reason: string
    /** Bắt buộc — thiếu thì wallet-core trả VALIDATION_ERROR 3001. */
    idempotencyKey: string
}

const apiEWallet = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getAccount: build.query<DataAccountWallet, WalletAccountQueryParams>({
            query: (params) => ({
                url: `/wallet/accounts`,
                params: params,
                method: 'GET'
            }),
            transformResponse: (res: ResponseType<DataAccountWallet>) => res.data,
            providesTags: ['Wallet'],
        }),
        getAccountById: build.query<ContentAccountWallet, string>({
            query: (id) => ({
                url: `/wallet/accounts/${id}`,
                method: 'GET'
            }),
            transformResponse: (res: ResponseType<ContentAccountWallet>) => res.data,
            providesTags: ['Wallet'],
        }),
        postUnfreeze: build.mutation<unknown, UnfreezeRequest>({
            query: (body) => ({
                url: '/wallet/accounts/unfreeze',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        postFreeze: build.mutation<unknown, FreezeRequest>({
            query: (body) => ({
                url: '/wallet/accounts/freeze',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        postFreezeTransaction: build.mutation<unknown, FreezeTransactionRequest>({
            query: (body) => ({
                url: '/wallet/accounts/freeze-transaction',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet', 'Journal'],
        }),
        postUnfreezeTransaction: build.mutation<unknown, UnfreezeTransactionRequest>({
            query: (body) => ({
                url: '/wallet/accounts/unfreeze-transaction',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet', 'Journal'],
        }),
        postUnlock: build.mutation({
            query: (body) => ({
                url: '/wallet/accounts/unlock',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        postLock: build.mutation({
            query: (body) => ({
                url: '/wallet/accounts/lock',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
    })
})
export const {
    useGetAccountQuery,
    useLazyGetAccountQuery,
    useGetAccountByIdQuery,
    useLazyGetAccountByIdQuery,
    usePostUnfreezeMutation,
    usePostFreezeMutation,
    usePostFreezeTransactionMutation,
    usePostUnfreezeTransactionMutation,
    usePostUnlockMutation,
    usePostLockMutation
} = apiEWallet
