import { apiMerchant } from "./apiService"

const merchantOrder = apiMerchant.injectEndpoints({
    endpoints: (build) => ({
        getMerchantOrder: build.query({
            query: (params) => ({
                url: "/merchant-orders",
                method: "GET",
                params: params,
            }),
            providesTags: ["Order"],
        }),
        getMerchantOrderById: build.query({
            query: (id) => ({
                url: `/merchant-orders/${id}`,
                method: "GET",
            }),
            providesTags: ["Order"],
        }),

        postMerchantOrderConfirm: build.mutation({
            query: ({body,id}) => ({
                url: `/merchant-orders/${id}/confirm`,
                method: "POST",
                body:body
            }),
            invalidatesTags: ["Order"],
        }),
        postMerchantOrder: build.mutation({
            query: (body) => ({
                url: `/merchant-orders`,
                method: "POST",
                body: body
            }),
            invalidatesTags: ["Order"],
        }),
        postRefreshQr: build.mutation({
            query: (id) => ({
                url: `/merchant-orders/${id}/refresh-qr`,
                method: "POST",
            }),
            invalidatesTags: ["Order"],
        }),
     

    }),
    overrideExisting: false,
})
export const {
    useGetMerchantOrderQuery,
    useGetMerchantOrderByIdQuery,
    usePostMerchantOrderMutation,
    usePostRefreshQrMutation,
    usePostMerchantOrderConfirmMutation
} = merchantOrder