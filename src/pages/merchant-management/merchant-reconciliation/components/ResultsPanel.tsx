import { useState } from 'react'
import type { Dayjs } from 'dayjs'
import { Can } from '@/app/permissions'
import {
  useGetReconciliationResultsQuery,
  useRunReconciliationMutation
} from '@/app/services/merchantReconciliationApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  ButtonComponent,
  DateInput,
  feedback,
  type PickedEntity
} from '@components/index'
import { ScopeTargetPicker } from '../../merchant-settlement-scope/components/ScopeTargetPicker'
import type { ReconciliationResult } from '../types/reconciliation.types'
import {
  isUnavailableResult,
  toBusinessDate
} from '../utils/reconciliation.utils'
import { ResultsTable } from './ResultsTable'
import { RunOutcome } from './RunOutcome'

const LABEL = 'text-xs font-medium text-muted-foreground'

/** Chọn Sub, xem kết quả (lọc theo ngày nghiệp vụ) và đối soát ngay. */
export function ResultsPanel() {
  const [sub, setSub] = useState<PickedEntity>()
  const [date, setDate] = useState<Dayjs | null>(null)
  const [lastRun, setLastRun] = useState<ReconciliationResult>()
  const [runReconciliation, { isLoading: isRunning }] =
    useRunReconciliationMutation()
  const [runError, setRunError] = useState('')
  const results = useGetReconciliationResultsQuery(
    { subId: sub?.id ?? '', date: toBusinessDate(date) },
    { skip: !sub }
  )

  const changeSub = (next?: PickedEntity) => {
    setSub(next)
    setLastRun(undefined)
    setRunError('')
  }

  const run = async () => {
    if (!sub) return
    setRunError('')
    try {
      const result = await runReconciliation(sub.id).unwrap()
      setLastRun(result)
      // UNAVAILABLE vẫn là HTTP 200 nhưng chưa đối soát được: không báo thành công.
      if (isUnavailableResult(result)) return
      if (result.result === 'MISMATCH')
        feedback.warning(`Đối soát lệch ${result.mismatchCount} phương trình`)
      else feedback.success('Đối soát xong: các phương trình đều cân')
    } catch (failure) {
      setRunError(getApiErrorDetail(failure, 'Không thể chạy đối soát'))
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-end gap-3'>
        <div className='w-full max-w-md'>
          <ScopeTargetPicker
            kind='sub'
            value={sub}
            onChange={changeSub}
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <label
            className={LABEL}
            htmlFor='reconciliation-date'
          >
            Ngày nghiệp vụ
          </label>
          <DateInput
            id='reconciliation-date'
            format='DD/MM/YYYY'
            placeholder='Tất cả các ngày'
            value={date}
            onChange={(value: Dayjs | null) => setDate(value)}
          />
        </div>
        <Can
          screen='MERCHANT_RECONCILIATION'
          action='run'
        >
          <ButtonComponent
            content='Đối soát ngay'
            disabled={!sub || isRunning}
            htmlType='button'
            loading={isRunning}
            onClick={() => void run()}
            type='primary'
          />
        </Can>
      </div>
      {runError && (
        <p
          role='alert'
          className='rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger-strong'
        >
          {runError}
        </p>
      )}
      {lastRun && (
        <RunOutcome
          result={lastRun}
          onRetry={() => void run()}
        />
      )}
      {sub ? (
        <ResultsTable
          rows={results.data ?? []}
          isLoading={results.isFetching}
          isError={results.isError}
          errorText={getApiErrorDetail(
            results.error,
            'Không tải được kết quả đối soát.'
          )}
          onRetry={() => void results.refetch()}
        />
      ) : (
        <p className='text-sm text-muted-foreground'>
          Chọn Sub-merchant để xem các kết quả đối soát. Tối đa 200 bản ghi mới
          nhất, mỗi lần chạy lại là một bản ghi mới.
        </p>
      )}
    </div>
  )
}
