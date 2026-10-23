import { CardComponent, ExportCsvButton } from '@components/index'
import { useExportCsv } from '@hooks/useExportCsv'
import { useExportInputCostReportMutation } from '@services/apiExportCsv'
import {
  useGetInputCostReportSummaryQuery,
  useGetInputCostReportTransactionsQuery
} from '@services/apiFeeInputCostReport.api'
import { useMemo, useState } from 'react'
import {
  inputCostReportFilterSchema,
  type InputCostReportFilters
} from '@/app/schemas/fee-input-cost-report.schema'
import { InputCostReportDetailTable } from './components/InputCostReportDetailTable'
import { InputCostReportFilterBar } from './components/InputCostReportFilterBar'
import { InputCostReportSummaryTable } from './components/InputCostReportSummaryTable'
import { defaultReportFilters } from './utils/reportFilters'

/** Báo cáo phí đầu vào (chỉ đọc): đối soát cuối tháng số tiền Beam trả NAPAS/ngân hàng. */
const FeeInputCostReport = () => {
  const [applied, setApplied] = useState<InputCostReportFilters>(() => ({
    ...defaultReportFilters()
  }))
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)

  const valid = useMemo(
    () => inputCostReportFilterSchema.safeParse(applied).success,
    [applied]
  )

  const summary = useGetInputCostReportSummaryQuery(applied, { skip: !valid })
  const detail = useGetInputCostReportTransactionsQuery(
    { filters: applied, page, size },
    { skip: !valid }
  )

  const [triggerExport, { reset: resetExport }] =
    useExportInputCostReportMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'bao-cao-phi-dau-vao'
  })

  const handleSubmit = (filters: InputCostReportFilters) => {
    setApplied(filters)
    setPage(1)
  }

  return (
    <>
      <CardComponent className='mb-3!'>
        <InputCostReportFilterBar onSubmit={handleSubmit} />
      </CardComponent>

      <CardComponent className='mb-3!'>
        <h3 className='mb-3 text-base font-semibold'>Tổng hợp</h3>
        <InputCostReportSummaryTable
          summary={summary.data}
          loading={summary.isFetching}
        />
      </CardComponent>

      <CardComponent>
        <h3 className='mb-3 text-base font-semibold'>Chi tiết giao dịch</h3>
        <InputCostReportDetailTable
          data={detail.data}
          loading={detail.isFetching}
          page={page}
          size={size}
          onPageChange={(nextPage, nextSize) => {
            if (nextSize !== size) {
              setSize(nextSize)
              setPage(1)
              return
            }
            setPage(nextPage)
          }}
          toolbar={
            <ExportCsvButton
              onExport={() => exportFile(applied)}
              loading={isExporting}
              disabled={!valid}
              tooltip='File lấy trọn bộ lọc đang áp, không giới hạn theo trang.'
            />
          }
        />
      </CardComponent>
    </>
  )
}

export default FeeInputCostReport
