import { useExportCsv } from '@hooks/useExportCsv'
import { useExportSubMerchantsMutation } from '@services/apiExportCsv'

/** Bộ lọc BE nhận ở `/sub-merchants/export` (bỏ page/size). */
export interface SubMerchantExportParams {
  merchantId?: string
  code?: string
  name?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
}

export const useSubMerchantExport = (params: SubMerchantExportParams) => {
  const [trigger, { reset }] = useExportSubMerchantsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger,
    reset,
    filenamePrefix: 'sub-merchants'
  })

  return { isExporting, exportCsv: () => void exportFile({ ...params }) }
}
