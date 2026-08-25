import { useExportCsv } from '@hooks/useExportCsv'
import {
  type ExportTransactionsQuery,
  useExportTransactionsMutation
} from '@services/apiExportCsv'
import { useCallback, useMemo } from 'react'
import type { FormSearchValues } from '../types/Transaction.type'

/** Filter của màn hình nhưng `/wallet/transactions/export` không nhận. */
const UNSUPPORTED_FILTER_KEYS = [
  'sourceDomain',
  'paymentMethod',
  'initiatorUsername',
  'counterpartyUsername',
  'bankCode',
  'minAmount',
  'maxAmount'
] as const satisfies readonly (keyof FormSearchValues)[]

const UNSUPPORTED_FILTER_TOOLTIP =
  'File xuất chỉ áp dụng bộ lọc Mã giao dịch / Loại / Trạng thái / Thời gian'

/** `/wallet/transactions/export` chỉ nhận các filter dưới đây; bỏ giá trị rỗng. */
const buildExportParams = (
  filter: Partial<FormSearchValues>
): ExportTransactionsQuery => ({
  transactionCode: filter.transactionCode || undefined,
  type: filter.transactionType || undefined,
  status: filter.status || undefined,
  fromDate: filter.fromDate || undefined,
  toDate: filter.toDate || undefined
})

interface UseExportTransactionCsvResult {
  exportFile: () => void
  isExporting: boolean
  exportTooltip: string | undefined
}

/**
 * Xuất CSV cho màn Quản lý giao dịch — gọi `/wallet/transactions/export`
 * KHÔNG kèm `ownerId` (spec khai báo `ownerId` bắt buộc, cần xác nhận backend
 * có chấp nhận xuất toàn hệ thống hay không).
 */
const useExportTransactionCsv = (
  filter: Partial<FormSearchValues>
): UseExportTransactionCsvResult => {
  const [triggerExport, { reset: resetExport }] = useExportTransactionsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'danh-sach-giao-dich'
  })

  const exportParams = useMemo(() => buildExportParams(filter), [filter])
  const hasUnsupportedFilter = UNSUPPORTED_FILTER_KEYS.some((key) =>
    Boolean(filter[key])
  )

  const handleExport = useCallback(() => {
    void exportFile(exportParams)
  }, [exportFile, exportParams])

  return {
    exportFile: handleExport,
    isExporting,
    exportTooltip: hasUnsupportedFilter ? UNSUPPORTED_FILTER_TOOLTIP : undefined
  }
}

export default useExportTransactionCsv
