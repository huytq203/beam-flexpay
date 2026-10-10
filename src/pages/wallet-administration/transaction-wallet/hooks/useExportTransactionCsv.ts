import { useExportCsv } from '@hooks/useExportCsv'
import {
  type ExportTransactionsQuery,
  useExportTransactionsMutation
} from '@services/apiExportCsv'
import { useCallback, useMemo } from 'react'
import { StatusEnum } from '../constants/Transaction.constant'
import { toHasRefundParam } from '../dto/transactionRefund.dto'
import type { FormSearchValues } from '../types/Transaction.type'

/**
 * Các field trong filter lưới mà `/wallet/transactions/export` chưa hỗ trợ.
 * Khi user đang lọc theo một trong các field này, tooltip cảnh báo file sẽ không
 * phản ánh đúng bộ lọc.
 */
const UNSUPPORTED_EXPORT_KEYS = [
  'bankCode',
  'minAmount',
  'maxAmount'
] as const satisfies readonly (keyof FormSearchValues)[]

const UNSUPPORTED_FILTER_TOOLTIP =
  'File xuất không hỗ trợ lọc theo Mã ngân hàng / Số tiền — các bộ lọc còn lại vẫn được áp dụng'

/**
 * Map filter lưới sang params của `/wallet/transactions/export`.
 * Dùng chung một object state — thêm field lọc mới vào `FormSearchValues` thì
 * export tự nhận, không cần cập nhật thêm nơi nào.
 */
const buildExportParams = (
  filter: Partial<FormSearchValues>
): ExportTransactionsQuery => {
  const p: ExportTransactionsQuery = {}

  if (filter.transactionCode) p.transactionCode = filter.transactionCode
  if (filter.transactionType) p.type = filter.transactionType
  if (filter.status) p.status = filter.status
  if (filter.fromDate) p.fromDate = filter.fromDate
  if (filter.toDate) p.toDate = filter.toDate
  if (filter.senderUsername) p.senderUsername = filter.senderUsername
  if (filter.receiverUsername) p.receiverUsername = filter.receiverUsername
  if (filter.sourceDomain) p.sourceDomain = filter.sourceDomain
  if (filter.paymentMethod) p.paymentMethod = filter.paymentMethod
  const hasRefund = toHasRefundParam(filter.hasRefund)
  if (hasRefund !== undefined) p.hasRefund = hasRefund

  return p
}

const LEDGER_STATUS_TOOLTIP =
  'File xuất giữ trạng thái sổ cái (Thất bại), không có nhãn Thất bại hoàn tiền và không có cột số tiền hoàn'

interface UseExportTransactionCsvResult {
  exportFile: () => void
  isExporting: boolean
  exportTooltip: string | undefined
}

/**
 * Xuất CSV cho màn Quản lý giao dịch — gọi `/wallet/transactions/export`
 * với cùng bộ filter đang áp cho lưới (trừ page/size và các field chưa hỗ trợ).
 */
const useExportTransactionCsv = (
  filter: Partial<FormSearchValues>
): UseExportTransactionCsvResult => {
  const [triggerExport, { reset: resetExport }] =
    useExportTransactionsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'danh-sach-giao-dich'
  })

  const exportParams = useMemo(() => buildExportParams(filter), [filter])
  const hasUnsupportedFilter = UNSUPPORTED_EXPORT_KEYS.some((key) =>
    Boolean(filter[key])
  )

  const usesRefundFilter =
    Boolean(filter.hasRefund) || filter.status === StatusEnum.FAILED_REFUND

  const handleExport = useCallback(() => {
    void exportFile(exportParams)
  }, [exportFile, exportParams])

  return {
    exportFile: handleExport,
    isExporting,
    exportTooltip: hasUnsupportedFilter
      ? UNSUPPORTED_FILTER_TOOLTIP
      : usesRefundFilter
        ? LEDGER_STATUS_TOOLTIP
        : undefined
  }
}

export default useExportTransactionCsv
