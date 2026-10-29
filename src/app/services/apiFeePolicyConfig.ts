import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { apiFeeService } from './apiService'
import { ResponseType } from '@type/api'
import type {
  FeeAssignment,
  FeeComponentTier,
  FeePolicy,
  FeePolicyComponent
} from '@type/fee.type'
import { hideLoading, showLoading } from '@utils/events'

/** Toàn bộ cấu hình một chính sách, đủ để dựng lại màn sửa. */
export interface FeePolicyConfig {
  policy: FeePolicy
  components: FeePolicyComponent[]
  assignments: FeeAssignment[]
  tiersByComponent: Record<string, FeeComponentTier[]>
}

type FetchResult = { data?: unknown; error?: FetchBaseQueryError }

/** Gỡ vỏ `ResponseType`; lỗi thì ném để `queryFn` trả về một lỗi duy nhất. */
const unwrap = <T>({ data, error }: FetchResult): T | undefined => {
  if (error) throw error
  return (data as ResponseType<T> | undefined)?.data
}

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error !== null && 'status' in error

export const feePolicyConfigApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Gom policy, thành phần, bản gán và bậc phí của từng thành phần vào một query. Backend không
     * trả bậc kèm thành phần nên vẫn phải gọi riêng, nhưng loader toàn màn chỉ bật một lần cho
     * cả lượt thay vì bật/tắt theo từng request (gây nháy màn).
     */
    getFeePolicyConfig: build.query<FeePolicyConfig, string>({
      extraOptions: { suppressGlobalLoading: true },
      async queryFn(policyId, _api, _extraOptions, baseQuery) {
        showLoading()
        try {
          const [policyRes, componentRes, assignmentRes] = await Promise.all([
            baseQuery(`/fee/policies/${policyId}`),
            baseQuery(`/fee/policy-components/by-policy/${policyId}`),
            baseQuery(`/fee/policy-assignments/by-policy/${policyId}`)
          ])
          const policy = unwrap<FeePolicy>(policyRes)
          if (!policy) {
            return {
              error: { status: 404, data: 'Không tìm thấy chính sách phí' }
            }
          }
          const components =
            unwrap<FeePolicyComponent[] | null>(componentRes) ?? []
          const assignments =
            unwrap<FeeAssignment[] | null>(assignmentRes) ?? []

          const tierEntries = await Promise.all(
            components.map(async ({ id }) => {
              const tiers = unwrap<FeeComponentTier[] | null>(
                await baseQuery(`/fee/component-tiers/by-component/${id}`)
              )
              return [id, tiers ?? []] as const
            })
          )

          return {
            data: {
              policy,
              components,
              assignments,
              tiersByComponent: Object.fromEntries(tierEntries)
            }
          }
        } catch (error) {
          return {
            error: isFetchBaseQueryError(error)
              ? error
              : { status: 'CUSTOM_ERROR', error: String(error) }
          }
        } finally {
          hideLoading()
        }
      },
      providesTags: [
        'FeePolicy',
        'FeePolicyComponent',
        'feeComponentTier',
        'feeAssign'
      ]
    })
  })
})

export const { useGetFeePolicyConfigQuery } = feePolicyConfigApi
