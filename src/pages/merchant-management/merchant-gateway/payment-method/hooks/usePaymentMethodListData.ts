import { useExportMerchantPaymentMethodsMutation } from '@services/apiExportCsv'
import { useGetPaymentMethodListQuery } from '@/app/services/merchantPaymentMethodApi'
import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import type { PaymentMethodFilterValues } from '../components/PaymentMethodFilters'

const FILTER_KEYS = ['name', 'code', 'level', 'status'] as const

const includes = (value: string | null | undefined, term: string) =>
  Boolean(value?.toLocaleLowerCase('vi').includes(term))

/** Danh sách cấu hình: tải theo trang, lọc trong trang hiện tại, xuất CSV. */
export function usePaymentMethodListData() {
  const url = useUrlFilters({ keys: FILTER_KEYS })
  const { page, size } = url
  const filters: PaymentMethodFilterValues = {
    name: url.filters.name ?? '',
    code: url.filters.code ?? '',
    level: url.filters.level ?? '',
    status: url.filters.status ?? ''
  }
  const query = useGetPaymentMethodListQuery({ page, size })
  const name = filters.name.trim().toLocaleLowerCase('vi')
  const code = filters.code.trim().toLocaleLowerCase('vi')
  const rows = (query.data?.content ?? []).filter(
    (row) =>
      (!name ||
        includes(row.merchantName, name) ||
        includes(row.subMerchantName, name)) &&
      (!code ||
        includes(row.merchantCode, code) ||
        includes(row.subMerchantCode, code)) &&
      (!filters.level || row.appliedLevel === filters.level) &&
      (!filters.status || row.active === (filters.status === 'ACTIVE'))
  )

  const [triggerExport, exportState] = useExportMerchantPaymentMethodsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: exportState.reset,
    filenamePrefix: 'merchant-payment-methods'
  })
  // BE chỉ nhận một `keyword` (tìm trên tên/mã Master và Sub): ưu tiên tên.
  const keyword = filters.name.trim() || filters.code.trim() || undefined
  const exportCsv = () => void exportFile({ keyword })

  return {
    url,
    page,
    size,
    filters,
    query,
    rows,
    exportCsv,
    isExporting
  }
}
