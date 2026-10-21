import { EXPORT_ORDER_HINT } from '@/app/constants/export'
import { useExportCsv } from '@hooks/useExportCsv'
import {
  type ExportWalletAccountsQuery,
  useExportWalletAccountsMutation
} from '@services/apiExportCsv'
import type { EwalletFilterKey } from '../constants/ewalletFilter.constants'

export const WALLET_ACCOUNT_EXPORT_TOOLTIP = `File lấy trọn bộ lọc đang áp, không giới hạn theo trang. ${EXPORT_ORDER_HINT}`

interface UseExportWalletAccountsResult {
  exportFile: () => void
  isExporting: boolean
}

/** Bỏ ô lọc trống để query string chỉ mang bộ lọc thật sự đang áp. */
const buildExportParams = (
  filters: Partial<Record<EwalletFilterKey, string>>
): ExportWalletAccountsQuery => {
  const params: ExportWalletAccountsQuery = {}
  if (filters.username) params.username = filters.username
  if (filters.ownerId) params.ownerId = filters.ownerId
  if (filters.status) params.status = filters.status
  if (filters.walletType) params.walletType = filters.walletType
  if (filters.fromDate) params.fromDate = filters.fromDate
  if (filters.toDate) params.toDate = filters.toDate
  return params
}

/** Xuất CSV danh sách ví với đúng bộ lọc của lưới, không page/size/sort. */
export const useExportWalletAccounts = (
  filters: Partial<Record<EwalletFilterKey, string>>
): UseExportWalletAccountsResult => {
  const [triggerExport, { reset }] = useExportWalletAccountsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset,
    filenamePrefix: 'Danh-sach-vi'
  })

  return {
    exportFile: () => void exportFile(buildExportParams(filters)),
    isExporting
  }
}
