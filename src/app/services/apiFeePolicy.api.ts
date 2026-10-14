import { apiFeeService } from '@services/apiService'
import { ResponseType } from '@type/api'
import type { FeeApprovalArg, FeeReasonArg } from '@type/feeApproval.type'
import type {
  CancelFeePolicyScheduleArg,
  CreateFeePolicyScheduleArg,
  FeePage,
  FeePolicy,
  FeePolicySchedule,
  FeePolicyScheduleStatus
} from '@type/fee.type'
import type {
  FeeAssignmentCreateRequest,
  FeePolicySetupRequest,
  FeePolicySetupResponse
} from '@/app/schemas/fee-setup.schema'

/**
 * Sửa trọn cấu hình phí. Dịch vụ phí chỉ có endpoint lẻ nên mutation này gọi
 * lần lượt từng cái bên trong một `queryFn`: cache chỉ bị làm mới một lần ở cuối
 * thay vì sau từng request, và không bật loader toàn cục chớp liên tục.
 */
export interface FeePolicyConfigUpdateArg {
  policyId: string
  policy: FeePolicySetupRequest['policy']
  /** Theo đúng thứ tự form: thứ tự quyết định thành phần nào tính dựa trên thành phần nào. */
  components: FeePolicySetupRequest['components']
  removeComponentIds: readonly string[]
  assignmentId: string | null
  assignment: FeeAssignmentCreateRequest
}

export interface SearchFeePoliciesParams {
  keyword?: string
  subjectKeyword?: string
  includeConfiguration?: boolean
  feeDomain?: string
  /** OUTPUT_FEE (phí đầu ra) hoặc INPUT_COST (phí đầu vào). */
  feeScope?: string
  serviceType?: string
  status?: string
  /** PENDING | ACTIVE | EXPIRED; chỉ tính trên chính sách đã duyệt và đang bật. */
  effectiveStatus?: string
  appliedTarget?: string
  bankCode?: string
  paymentMethod?: string
  /** Người chịu của một thành phần phí; USER khớp cả người gửi dạng SENDER. */
  payerType?: string
  /** Người hưởng của một thành phần phí. */
  beneficiaryType?: string
  /** Bên chịu phí chuyển tiền: SENDER | RECEIVER | BOTH. */
  feeBearer?: string
  validFrom?: string
  validTo?: string
  createdAtFrom?: string
  createdAtTo?: string
  page: number
  size: number
  sortBy: string
  sortDirection: string
}

export const feePolicyApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getFeePolicies: build.query({
      query: (pagination) => ({
        url: `/fee/policies`,
        method: 'GET',
        params: pagination // { page, size, sortBy, sortDirection }
      }),
      transformResponse: (res: ResponseType<FeePage<FeePolicy>>) => res.data,
      providesTags: ['FeePolicy']
    }),
    searchFeePolicies: build.query<FeePage<FeePolicy>, SearchFeePoliciesParams>(
      {
        query: (params) => ({
          url: `/fee/policies/search`,
          method: 'GET',
          params: params
        }),
        transformResponse: (res: ResponseType<FeePage<FeePolicy>>) => res.data,
        providesTags: [
          'FeePolicy',
          'feeAssign',
          'FeePolicyComponent',
          'feeComponentTier'
        ]
      }
    ),
    getFeePolicyById: build.query({
      query: (id) => ({
        url: `/fee/policies/${id}`,
        method: 'GET'
      }),
      transformResponse: (res: ResponseType<FeePolicy>) => res.data,
      providesTags: ['FeePolicy']
    }),
    postNewPolicy: build.mutation({
      query: (body) => ({
        url: `/fee/policies`,
        method: 'POST',
        body: body,
        params: { isLoading: false }
      }),
      invalidatesTags: ['FeePolicy']
    }),
    patchDeactivateFee: build.mutation<ResponseType<FeePolicy>, string>({
      query: (id) => ({
        url: `/fee/policies/${id}/deactivate`,
        method: 'PATCH'
      }),
      invalidatesTags: ['FeePolicy']
    }),
    patchActivateFee: build.mutation<ResponseType<FeePolicy>, FeeReasonArg>({
      query: ({ id, reason }) => ({
        url: `/fee/policies/${id}/activate`,
        method: 'PATCH',
        params: { reason }
      }),
      invalidatesTags: ['FeePolicy']
    }),
    patchApproveFeePolicy: build.mutation<
      ResponseType<FeePolicy>,
      FeeApprovalArg
    >({
      query: ({ id, ...body }) => ({
        url: `/fee/policies/${id}/approve`,
        method: 'PATCH',
        body,
        params: { isLoading: false }
      }),
      // Duyệt chính sách duyệt luôn các bản gán đang chờ của nó, nên cache bản gán
      // cũng phải bỏ đi, không thì danh sách vẫn hiện trạng thái khởi tạo.
      invalidatesTags: ['FeePolicy', 'feeAssign']
    }),
    patchRejectFeePolicy: build.mutation<ResponseType<FeePolicy>, FeeReasonArg>(
      {
        query: ({ id, reason }) => ({
          url: `/fee/policies/${id}/reject`,
          method: 'PATCH',
          params: { isLoading: false, reason }
        }),
        invalidatesTags: ['FeePolicy']
      }
    ),
    putFeePolicy: build.mutation({
      query: ({ id, body }) => ({
        url: `/fee/policies/${id}`,
        method: 'PUT',
        body: body
      }),
      invalidatesTags: ['FeePolicy']
    }),
    /**
     * Thiết lập trọn gói: chính sách, thành phần phí và bậc phí lưu trong MỘT
     * transaction. Ba lời gọi rời trước đây hỏng ở giữa là để lại một chính sách
     * rỗng trong DB trong khi người dùng thấy báo lỗi.
     *
     * Bản gán đối tượng vẫn là lời gọi riêng — endpoint này chưa nhận nó.
     */
    updateFeePolicyConfig: build.mutation<null, FeePolicyConfigUpdateArg>({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        // Có nút lưu báo trạng thái đang chạy, nên mỗi request con không bật loader toàn cục.
        const params = { isLoading: false }

        const steps = [
          () =>
            baseQuery({
              url: `/fee/policies/${arg.policyId}`,
              method: 'PUT',
              body: arg.policy,
              params
            }),
          ...arg.removeComponentIds.map(
            (id) => () =>
              baseQuery({
                url: `/fee/policy-components/${id}`,
                method: 'DELETE',
                params
              })
          )
        ]
        for (const step of steps) {
          const { error } = await step()
          if (error) return { error }
        }

        for (const { tiers, ...component } of arg.components) {
          const created = await baseQuery({
            url: `/fee/policy-components`,
            method: 'POST',
            body: { ...component, feePolicyId: arg.policyId },
            params
          })
          if (created.error) return { error: created.error }

          const componentId = (created.data as ResponseType<{ id?: string }>)
            ?.data?.id
          if (!componentId) {
            return {
              error: { status: 'CUSTOM_ERROR', error: 'Thiếu id thành phần' }
            }
          }

          // POST /component-tiers nhận cả mảng, kể cả khi chỉ có một bậc.
          if (tiers.length === 0) continue
          const savedTiers = await baseQuery({
            url: `/fee/component-tiers`,
            method: 'POST',
            body: tiers.map((tier) => ({
              ...tier,
              feeComponentId: componentId
            })),
            params
          })
          if (savedTiers.error) return { error: savedTiers.error }
        }

        const assigned = await baseQuery({
          url: arg.assignmentId
            ? `/fee/policy-assignments/${arg.assignmentId}`
            : `/fee/policy-assignments`,
          method: arg.assignmentId ? 'PUT' : 'POST',
          body: arg.assignment,
          params
        })
        if (assigned.error) return { error: assigned.error }

        return { data: null }
      },
      invalidatesTags: [
        'FeePolicy',
        'FeePolicyComponent',
        'feeComponentTier',
        'feeAssign'
      ]
    }),
    getFeePolicySchedules: build.query<
      FeePolicySchedule[],
      { policyId: string; status?: FeePolicyScheduleStatus }
    >({
      query: ({ policyId, status }) => ({
        url: `/fee/policies/${policyId}/schedules`,
        method: 'GET',
        params: { status, isLoading: false }
      }),
      transformResponse: (res: ResponseType<FeePolicySchedule[]>) => res.data,
      providesTags: (_result, _error, { policyId }) => [
        { type: 'FeePolicySchedule', id: policyId }
      ]
    }),
    createFeePolicySchedule: build.mutation<
      FeePolicySchedule,
      CreateFeePolicyScheduleArg
    >({
      query: ({ policyId, ...body }) => ({
        url: `/fee/policies/${policyId}/schedules`,
        method: 'POST',
        body,
        params: { isLoading: false }
      }),
      transformResponse: (res: ResponseType<FeePolicySchedule>) => res.data,
      invalidatesTags: (_result, _error, { policyId }) => [
        { type: 'FeePolicySchedule', id: policyId }
      ]
    }),
    cancelFeePolicySchedule: build.mutation<
      FeePolicySchedule,
      CancelFeePolicyScheduleArg
    >({
      query: ({ policyId, scheduleId }) => ({
        url: `/fee/policies/${policyId}/schedules/${scheduleId}`,
        method: 'DELETE',
        params: { isLoading: false }
      }),
      transformResponse: (res: ResponseType<FeePolicySchedule>) => res.data,
      invalidatesTags: (_result, _error, { policyId }) => [
        { type: 'FeePolicySchedule', id: policyId }
      ]
    }),
    setupFeePolicy: build.mutation<
      FeePolicySetupResponse,
      FeePolicySetupRequest
    >({
      query: (body) => ({
        url: `/fee/policies/setup`,
        method: 'POST',
        body
      }),
      transformResponse: (res: ResponseType<FeePolicySetupResponse>) =>
        res.data,
      invalidatesTags: ['FeePolicy', 'FeePolicyComponent', 'feeComponentTier']
    })
  })
})
export const {
  useLazySearchFeePoliciesQuery,
  useSearchFeePoliciesQuery,
  useGetFeePoliciesQuery,
  useLazyGetFeePoliciesQuery,
  useGetFeePolicyByIdQuery,
  usePostNewPolicyMutation,
  usePatchDeactivateFeeMutation,
  usePatchActivateFeeMutation,
  usePatchApproveFeePolicyMutation,
  usePatchRejectFeePolicyMutation,
  usePutFeePolicyMutation,
  useSetupFeePolicyMutation,
  useUpdateFeePolicyConfigMutation,
  useGetFeePolicySchedulesQuery,
  useCreateFeePolicyScheduleMutation,
  useCancelFeePolicyScheduleMutation
} = feePolicyApi
