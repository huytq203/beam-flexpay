import { EXPORT_ORDER_HINT } from '@/app/constants/export'
import { omit } from 'lodash'
import { useExportCsv } from '@hooks/useExportCsv'
import { useExportRefundsMutation } from '@services/apiExportCsv'
import { buildRefundParams, type RefundFilters } from '../utils/refund.utils'

export const REFUND_EXPORT_TOOLTIP = `File lấy trọn bộ lọc đang áp, không giới hạn theo trang. ${EXPORT_ORDER_HINT} Số tài khoản thụ hưởng được che theo quyền người xem.`

const PAGING_KEYS = ['page', 'size', 'sort'] as const

interface UseRefundExportResult {
  exportFile: () => void
  isExporting: boolean
}

/** Xuất CSV với đúng bộ lọc của lưới, bỏ phân trang và sắp xếp (BE luôn xuất toàn bộ). */
export const useRefundExport = (
  filters: RefundFilters
): UseRefundExportResult => {
  const [triggerExport, { reset }] = useExportRefundsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset,
    filenamePrefix: 'Quan-ly-giao-dich-hoan-tien'
  })

  const handleExport = (): void => {
    void exportFile(omit(buildRefundParams(filters, 1, 1), PAGING_KEYS))
  }

  return { exportFile: handleExport, isExporting }
}
