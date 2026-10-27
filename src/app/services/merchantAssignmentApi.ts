import { apiMerchant } from './apiService'
import type { GatewayPage, GatewayResponse } from './merchantGatewayApi'

/** Cấp được gán: Master (`/merchants/{id}`) hoặc outlet (`/sub-merchants/{id}`). */
export type AssignmentLevel = 'master' | 'sub'

export interface AssignmentTarget {
  level: AssignmentLevel
  id: string
}

/** `includeInherited` chỉ có tác dụng ở Sub: thêm người được gán ở Master của Sub. */
export interface AssignmentQuery extends AssignmentTarget {
  includeInherited?: boolean
}

/**
 * `assignedBy` là null với dòng tạo ngoài API (seed/script). Các trường tên/email
 * null khi người đó đã bị xóa khỏi Keycloak hoặc identity không phản hồi.
 */
export interface AdminAssignment {
  adminUserId: string
  assignedAt: string
  assignedBy?: string | null
  adminFullName?: string | null
  adminUsername?: string | null
  adminEmail?: string | null
  /** Chỉ có khi hỏi Sub với `includeInherited=true`, ngược lại null. */
  inheritedFromMaster?: boolean | null
}

export type AssignmentListLevel = 'MASTER' | 'SUB'

/** Bộ lọc dùng chung của `/merchant-assignments` và `/users/{id}/assignments`. */
export interface AssignmentListQuery {
  /** Từ 1. */
  page: number
  size: number
  /** Master: gồm dòng gán của chính Master lẫn các Sub thuộc nó. */
  merchantId?: string
  /** Chỉ dòng gán trực tiếp ở Sub, không gồm kế thừa. */
  subMerchantId?: string
  adminUserId?: string
  level?: AssignmentListLevel
  /** Tối đa 100 ký tự. */
  search?: string
}

/** Ba trường Sub null khi `level=MASTER`; các trường `admin*`/`assignedByName` có thể null. */
export interface AssignmentListItem {
  level: AssignmentListLevel
  merchantId: string
  merchantCode: string
  merchantName: string
  subMerchantId?: string | null
  subMerchantCode?: string | null
  subMerchantName?: string | null
  adminUserId: string
  adminFullName?: string | null
  adminUsername?: string | null
  adminEmail?: string | null
  adminRole?: string | null
  assignedAt: string
  assignedBy?: string | null
  assignedByName?: string | null
}

export interface MyAssignmentAccess {
  /** Quyền `MERCHANT_ASSIGNMENT:MANAGE` vẫn được BE kiểm riêng ở endpoint ghi. */
  canManageAssignments: boolean
  roles: string[]
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
    getMerchantAssignments: build.query<AdminAssignment[], AssignmentQuery>({
      query: ({ includeInherited, ...target }) => ({
        url: assignmentUrl(target),
        method: 'GET',
        // Chỉ Sub có kế thừa; Master gửi tham số này cũng không đổi kết quả.
        params:
          includeInherited && target.level === 'sub'
            ? { includeInherited: true }
            : undefined
      }),
      transformResponse: (response: GatewayResponse<AdminAssignment[]>) =>
        response.data ?? [],
      extraOptions: OWN_ERROR_HANDLING,
      providesTags: ['Assignment']
    }),
    // Mọi dòng gán Master + Sub trong phạm vi của người gọi; BE xếp cố định, không nhận sort.
    listMerchantAssignments: build.query<
      GatewayPage<AssignmentListItem>,
      AssignmentListQuery
    >({
      query: (params) => ({ url: '/merchant-assignments', params }),
      transformResponse: (
        response: GatewayResponse<GatewayPage<AssignmentListItem>>
      ) => response.data,
      extraOptions: OWN_ERROR_HANDLING,
      providesTags: ['Assignment']
    }),
    // Tab "Phụ trách" của một người: `adminUserId` lấy từ path.
    listUserAssignments: build.query<
      GatewayPage<AssignmentListItem>,
      AssignmentListQuery & { adminUserId: string }
    >({
      query: ({ adminUserId, ...params }) => ({
        url: `/users/${adminUserId}/assignments`,
        params
      }),
      transformResponse: (
        response: GatewayResponse<GatewayPage<AssignmentListItem>>
      ) => response.data,
      extraOptions: OWN_ERROR_HANDLING,
      providesTags: ['Assignment']
    }),
    // Cờ để ẩn nút Gán/Gỡ thay vì chờ 403.
    getMyAssignmentAccess: build.query<MyAssignmentAccess, void>({
      query: () => ({ url: '/merchant-assignments/me' }),
      transformResponse: (response: GatewayResponse<MyAssignmentAccess>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING
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
  useListMerchantAssignmentsQuery,
  useListUserAssignmentsQuery,
  useGetMyAssignmentAccessQuery,
  usePostMerchantAssignmentMutation,
  useDeleteMerchantAssignmentMutation
} = merchantAssignmentApi
