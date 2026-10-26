import { useExportCsv } from '@hooks/useExportCsv'
import { useExportAuditLogsMutation } from '@services/apiExportCsv'
import type { AuditLogFilterQuery } from '../types/auditLog.types'

// Xuất đúng bộ lọc đang áp dụng, không gửi page/size/sort (BE xuất toàn bộ, mới nhất trước).
// Lỗi 400 (quá 50.000 dòng, sai khoảng thời gian) do errorMiddleware hiện `detail` của BE.
export const useAuditLogExport = (filters: AuditLogFilterQuery) => {
  const [triggerExport, { reset }] = useExportAuditLogsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset,
    filenamePrefix: 'audit-logs'
  })

  return {
    isExporting,
    exportCsv: () => void exportFile({ ...filters })
  }
}
