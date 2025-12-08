
import { apiService } from "./apiService";
import { ResponseType } from '@type/api'
import { feePolicies, FeePoliciesResponse } from '@type/feePolicies'
export const feePolicyApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    // 1️⃣ Lấy danh sách tất cả chính sách phí (có phân trang)
    getFeePolicies: build.query({
      query: (pagination) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/policies`,
        method: "GET",
        params: pagination // { page, size, sortBy, sortDirection }
      }),
      transformResponse: (baseQueryReturnValue): FeePoliciesResponse => (baseQueryReturnValue as ResponseType<FeePoliciesResponse>).data
    }),

    // 2️⃣ Lấy thông tin chi tiết chính sách phí theo ID
    getFeePolicyById: build.query({
      query: (id) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/policies/${id}`,
        method: "GET"
      }),
      transformResponse: (baseQueryReturnValue): feePolicies => (baseQueryReturnValue as ResponseType<feePolicies>).data
    })
  })
});

export const {
  useGetFeePoliciesQuery,
  useLazyGetFeePoliciesQuery,
  useGetFeePolicyByIdQuery
} = feePolicyApi;
