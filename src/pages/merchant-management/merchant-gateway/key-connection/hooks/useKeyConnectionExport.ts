import type { ApiCredentialListParams } from '@/app/services/merchantGatewayApi'
import { useExportCsv } from '@hooks/useExportCsv'
import { useExportMerchantApiCredentialsMutation } from '@services/apiExportCsv'

// Xuất đúng bộ lọc đang áp dụng, không gửi page/size (BE bỏ qua phân trang).
export const useKeyConnectionExport = (filters: ApiCredentialListParams) => {
  const [triggerExport, { reset }] = useExportMerchantApiCredentialsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset,
    filenamePrefix: 'merchant-api-credentials'
  })

  return {
    isExporting,
    exportCsv: () =>
      void exportFile({
        merchantId: filters.merchantId,
        status: filters.status
      })
  }
}
