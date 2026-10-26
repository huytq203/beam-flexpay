import { apiMerchant } from './apiService'
import type { GatewayResponse } from './merchantGatewayApi'

/** Cấp được gán: Master (`/merchants/{id}`) hoặc outlet (`/sub-merchants/{id}`). */
export type AssignmentLevel = 'master' | 'sub'

export interface AssignmentTarget {
  level: AssignmentLevel
  id: string
}

/** `assignedBy` là null với dòng tạo ngoài API (seed/script). */
export interface AdminAssignment {
  adminUserId: string
  assignedAt: string
  assignedBy?: string | null
}

/** Chỉ hai trường BE cho phép; trường lạ bị từ chối 400. */
export interface AdminAssignmentBody {
  adminUserId: string
  reason: string
}

export interface AssignmentRemoveArgs extends AssignmentTarget {
  adminUserId: string
  /** Bắt buộc, tối đa 255 ký tự: thiếu hoặc quá dài BE trả 500 chứ không 400. */
  reason: string
}

/** BE đặt `message` là tên mã lỗi; màn tự hiển thị `detail` nên tắt thông báo chung. */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

const assignmentUrl = ({ level, id }: AssignmentTarget): string =>
  `/${level === 'master' ? 'merchants' : 'sub-merchants'}/${id}/assignments`

export const merchantAssignmentApi = apiMerchant.injectEndpoints({
  endpoints: (build) => ({
    // Mảng không phân trang, chỉ gồm dòng gán trực tiếp ở đúng cấp đang hỏi.
    getMerchantAssignments: build.query<AdminAssignment[], AssignmentTarget>({
      query: (target) => ({ url: assignmentUrl(target), method: 'GET' }),
      transformResponse: (response: GatewayResponse<AdminAssignment[]>) =>
        response.data ?? [],
      extraOptions: OWN_ERROR_HANDLING,
      providesTags: ['Assignment']
    }),
    // Idempotent: gán lại cặp đã có trả về dòng cũ với HTTP 200.
    postMerchantAssignment: build.mutation<
      AdminAssignment,
      AssignmentTarget & AdminAssignmentBody
    >({
      query: ({ level, id, ...body }) => ({
        url: assignmentUrl({ level, id }),
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<AdminAssignment>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['Assignment']
    }),
    // `reason` đi qua query param vì proxy hay bỏ body của DELETE.
    deleteMerchantAssignment: build.mutation<void, AssignmentRemoveArgs>({
      query: ({ level, id, adminUserId, reason }) => ({
        url: `${assignmentUrl({ level, id })}/${adminUserId}`,
        method: 'DELETE',
        params: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['Assignment']
    })
  })
})

export const {
  useGetMerchantAssignmentsQuery,
  usePostMerchantAssignmentMutation,
  useDeleteMerchantAssignmentMutation
} = merchantAssignmentApi
