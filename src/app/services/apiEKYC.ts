import { authApiService } from '@services/apiService'
import type { DataEKYC, ContentEKYC } from '@type/apiResponseEKYC'

interface EkycEnvelope<T> {
  data: T
  success: boolean
  detail?: string
}

export interface CancelEkycArg {
  profileId: string
  reason: string
}

export interface RestoreEkycResult {
  profileId: string
  detail: string | null
}

interface EkycSearchParams {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
  keyword?: string
  latestStatus?: string
  createdFrom?: string
  createdTo?: string
  verified?: boolean
  includeSummary?: boolean
}

export const apiEKYC = authApiService.injectEndpoints({
  endpoints: (build) => ({
    getEKYCById: build.query<ContentEKYC, string>({
      async queryFn(sessionId, _api, _extra, baseQuery) {
        const response = await baseQuery({
          url: `/verified-kyc-profiles/${encodeURIComponent(sessionId)}`,
          method: 'GET'
        })
        if (response.error) return { error: response.error }
        const result = response.data as EkycEnvelope<ContentEKYC>
        if (result?.success !== true || !result.data) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'BUSINESS_ERROR',
              data: response.data
            }
          }
        }
        return { data: result.data }
      },
      providesTags: ['EKYC']
    }),
    getEKYCSearch: build.query<DataEKYC, EkycSearchParams>({
      async queryFn(params, _api, _extra, baseQuery) {
        const response = await baseQuery({
          url: '/verified-kyc-profiles/search',
          params,
          method: 'GET'
        })
        if (response.error) return { error: response.error }
        const result = response.data as EkycEnvelope<DataEKYC>
        if (result?.success !== true || !result.data?.content) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'BUSINESS_ERROR',
              data: response.data
            }
          }
        }
        return { data: result.data }
      },
      providesTags: ['EKYC']
    }),
    approveEKYC: build.mutation<ContentEKYC, string>({
      async queryFn(sessionId, _api, _extra, baseQuery) {
        const response = await baseQuery({
          url: `/verified-kyc-profiles/${encodeURIComponent(sessionId)}/approve`,
          method: 'POST'
        })
        if (response.error) return { error: response.error }
        const result = response.data as EkycEnvelope<ContentEKYC>
        if (result?.success !== true) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'BUSINESS_ERROR',
              data: response.data
            }
          }
        }
        return { data: result.data }
      },
      invalidatesTags: ['EKYC']
    }),
    rejectEKYC: build.mutation<ContentEKYC, string>({
      async queryFn(sessionId, _api, _extra, baseQuery) {
        const response = await baseQuery({
          url: `/verified-kyc-profiles/${encodeURIComponent(sessionId)}/reject`,
          method: 'POST'
        })
        if (response.error) return { error: response.error }
        const result = response.data as EkycEnvelope<ContentEKYC>
        if (result?.success !== true) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'BUSINESS_ERROR',
              data: response.data
            }
          }
        }
        return { data: result.data }
      },
      invalidatesTags: ['EKYC']
    }),
    cancelEKYC: build.mutation<string, CancelEkycArg>({
      async queryFn({ profileId, reason }, _api, _extra, baseQuery) {
        const response = await baseQuery({
          url: `/verified-kyc-profiles/${encodeURIComponent(profileId)}/cancel`,
          method: 'POST',
          body: { reason }
        })
        if (response.error) return { error: response.error }
        const result = response.data as EkycEnvelope<string>
        if (result?.success !== true) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'BUSINESS_ERROR',
              data: response.data
            }
          }
        }
        return { data: result.data }
      },
      invalidatesTags: ['EKYC']
    }),
    restoreVerifiedKycProfile: build.mutation<RestoreEkycResult, string>({
      async queryFn(profileId, _api, _extra, baseQuery) {
        const response = await baseQuery({
          url: `/verified-kyc-profiles/${encodeURIComponent(profileId)}/restore`,
          method: 'POST'
        })
        if (response.error) return { error: response.error }
        const result = response.data as EkycEnvelope<string>
        if (result?.success !== true) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'BUSINESS_ERROR',
              data: response.data
            }
          }
        }
        return {
          data: { profileId: result.data, detail: result.detail ?? null }
        }
      },
      invalidatesTags: ['EKYC']
    })
  })
})

export const {
  useGetEKYCByIdQuery,
  useGetEKYCSearchQuery,
  useApproveEKYCMutation,
  useRejectEKYCMutation,
  useCancelEKYCMutation,
  useRestoreVerifiedKycProfileMutation
} = apiEKYC
