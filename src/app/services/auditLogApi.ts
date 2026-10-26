import type { MerchantEnvelope, MerchantPage } from '@type/merchant'
import type {
  AuditLogQuery,
  AuditLogRecord
} from '@/pages/role-management-V2/audit-log/types/auditLog.types'
import { apiMerchant } from './apiService'

// BE trả `message` là tên mã lỗi; màn tự hiển thị `detail` nên tắt toast tập trung.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data

/** Nhật ký hệ thống Admin (`/api/v1/admin/audit-logs`); không nhầm với `/merchants/{id}/audit-logs`. */
export const auditLogApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<MerchantPage<AuditLogRecord>, AuditLogQuery>({
      query: (params) => ({ url: '/audit-logs', params }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<MerchantPage<AuditLogRecord>>
    }),
    // Id không tồn tại vẫn là HTTP 200 với `data: null` (không phải 404).
    getAuditLogById: builder.query<AuditLogRecord | null, string>({
      query: (id) => `/audit-logs/${id}`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<AuditLogRecord | null>
    })
  })
})

export const { useGetAuditLogsQuery, useGetAuditLogByIdQuery } = auditLogApi
