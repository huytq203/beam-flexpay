import { useState } from 'react'
import { useGetSubBalanceReportQuery } from '@/app/services/merchantReconciliationApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, type PickedEntity } from '@components/index'
import { ScopeTargetPicker } from '../../merchant-settlement-scope/components/ScopeTargetPicker'
import { UNAVAILABLE_REPORT_TEXT } from '../constants/reconciliation.constants'
import { isLedgerUnavailable } from '../utils/reconciliation.utils'
import { BalanceReportView } from './BalanceReportView'
import { LedgerUnavailableNotice } from './LedgerUnavailableNotice'

/** Báo cáo số dư độc lập với đối soát; sổ cái chưa đọc được thì BE trả 503. */
export function BalanceReportPanel() {
  const [sub, setSub] = useState<PickedEntity>()
  const report = useGetSubBalanceReportQuery(sub?.id ?? '', { skip: !sub })

  const body = () => {
    if (!sub)
      return (
        <p className='text-sm text-muted-foreground'>
          Chọn Sub-merchant để xem báo cáo số dư
        </p>
      )
    if (report.isError && isLedgerUnavailable(report.error))
      return (
        <LedgerUnavailableNotice
          message={UNAVAILABLE_REPORT_TEXT}
          onRetry={() => void report.refetch()}
        />
      )
    if (report.isError)
      return (
        <div role='alert'>
          <p>
            {getApiErrorDetail(report.error, 'Không tải được báo cáo số dư.')}
          </p>
          <ButtonComponent
            content='Thử lại'
            htmlType='button'
            onClick={() => void report.refetch()}
          />
        </div>
      )
    if (!report.data || report.isFetching)
      return (
        <p
          role='status'
          className='text-sm text-muted-foreground'
        >
          Đang tải báo cáo số dư...
        </p>
      )
    return <BalanceReportView report={report.data} />
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='max-w-md'>
        <ScopeTargetPicker
          kind='sub'
          value={sub}
          onChange={setSub}
        />
      </div>
      {body()}
    </div>
  )
}
