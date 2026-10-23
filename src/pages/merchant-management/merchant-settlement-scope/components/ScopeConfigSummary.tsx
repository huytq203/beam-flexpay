import { TagComponent } from '@components/index'
import {
  FREQUENCY_LABEL,
  MODE_LABEL
} from '../../merchant-settlement/constants/settlementConfig.constants'
import { SCOPE_SOURCE_LABEL } from '../constants/settlementScope.constants'
import type {
  ScopeConfigView,
  ScopeField
} from '../types/settlementScope.types'

function Row({
  label,
  value,
  field
}: {
  label: string
  value: string
  field: ScopeField<unknown>
}) {
  return (
    <div>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='mt-1 text-sm font-medium text-foreground'>{value}</dd>
      <dd className='text-xs text-muted-foreground'>
        {SCOPE_SOURCE_LABEL[field.source] ?? field.source}
      </dd>
    </div>
  )
}

export function ScopeConfigSummary({ view }: { view: ScopeConfigView }) {
  const { settlementMode, autoFrequency, holdbackDays, holdReason } = view
  const isMaster = view.level === 'MASTER'
  return (
    <section aria-label='Cấu hình đang hiệu lực'>
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <h2 className='text-sm font-semibold'>Cấu hình đang hiệu lực</h2>
        {isMaster && !view.configuredAtThisLevel && (
          <TagComponent>
            Chưa có cấu hình riêng, đang kế thừa hệ thống
          </TagComponent>
        )}
        {isMaster && view.configuredAtThisLevel && !view.active && (
          <TagComponent color='warning'>Khối riêng đang tạm tắt</TagComponent>
        )}
      </div>
      <dl className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
        <Row
          label='Chế độ'
          value={settlementMode.value ? MODE_LABEL[settlementMode.value] : '—'}
          field={settlementMode}
        />
        <Row
          label='Tần suất'
          value={
            autoFrequency.value ? FREQUENCY_LABEL[autoFrequency.value] : '—'
          }
          field={autoFrequency}
        />
        <Row
          label='T+N (ngày chờ)'
          value={String(holdbackDays.value ?? 0)}
          field={holdbackDays}
        />
        <Row
          label='Lý do tạm dừng'
          value={holdReason.value || '—'}
          field={holdReason}
        />
      </dl>
    </section>
  )
}
