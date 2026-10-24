import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { TagComponent } from '@components/index'
import {
  OUTCOME_LABEL,
  TRIGGER_LABEL,
  UNAVAILABLE_RUN_TEXT
} from '../constants/reconciliation.constants'
import type { ReconciliationResult } from '../types/reconciliation.types'
import { isUnavailableResult } from '../utils/reconciliation.utils'
import { EquationTable } from './EquationTable'
import { LedgerUnavailableNotice } from './LedgerUnavailableNotice'

interface RunOutcomeProps {
  result: ReconciliationResult
  onRetry: () => void
}

/** Kết quả của lần chạy vừa gọi; UNAVAILABLE là trạng thái riêng, không phải lỗi HTTP. */
export function RunOutcome({ result, onRetry }: RunOutcomeProps) {
  const outcome = OUTCOME_LABEL[result.result]
  return (
    <section
      aria-label='Kết quả lần chạy vừa rồi'
      className='flex flex-col gap-3 rounded-lg border border-border p-3'
    >
      <div className='flex flex-wrap items-center gap-2 text-sm'>
        <h3 className='font-semibold'>Lần chạy vừa rồi</h3>
        {outcome && (
          <TagComponent color={outcome.color}>{outcome.label}</TagComponent>
        )}
        <span className='text-xs text-muted-foreground'>
          Lần {result.runNo} · {TRIGGER_LABEL[result.trigger]} ·{' '}
          {formatUTCToLocalDateTime(result.createdAt)}
        </span>
      </div>
      {isUnavailableResult(result) ? (
        <LedgerUnavailableNotice
          message={UNAVAILABLE_RUN_TEXT}
          onRetry={onRetry}
        />
      ) : (
        <>
          {result.result === 'MISMATCH' && (
            <p className='text-sm'>
              Có {result.mismatchCount} phương trình lệch. Sub-merchant bị tạm
              dừng quyết toán cho tới khi được xác nhận đã xử lý.
            </p>
          )}
          <EquationTable equations={result.equations} />
        </>
      )}
    </section>
  )
}
