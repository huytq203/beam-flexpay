import { TagComponent } from '@components/index'
import {
  FREQUENCY_LABEL,
  MODE_LABEL,
  SOURCE_LABEL
} from '../constants/settlementConfig.constants'
import type {
  InheritedField,
  SettlementConfigDto
} from '../types/settlementConfig.types'
import { formatVnd } from '../utils/money'

interface EffectiveConfigSummaryProps {
  config: SettlementConfigDto
}

const sourceOf = (field?: InheritedField<unknown>): string =>
  field?.inherited && field.source
    ? `Kế thừa từ ${SOURCE_LABEL[field.source] ?? field.source}`
    : 'Đặt riêng cho Sub-merchant'

function Row({
  label,
  value,
  field,
  money
}: {
  label: string
  value: string
  field?: InheritedField<unknown>
  money?: boolean
}) {
  return (
    <div>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd
        className={`mt-1 text-sm font-medium text-foreground ${money ? 'tabular-nums' : ''}`}
      >
        {value}
      </dd>
      {field && (
        <dd className='text-xs text-muted-foreground'>{sourceOf(field)}</dd>
      )}
    </div>
  )
}

export function EffectiveConfigSummary({
  config
}: EffectiveConfigSummaryProps) {
  const mode = config.settlementMode.value
  const frequency = config.autoFrequency.value
  const limits: [string, InheritedField<number> | undefined][] = [
    ['Ngưỡng tự duyệt', config.autoApprovalThreshold],
    ['Mức rút tối thiểu', config.minimumWithdrawalAmount],
    ['Hạn mức rút trong ngày', config.dailyWithdrawalLimit]
  ]
  return (
    <section aria-label='Cấu hình đang hiệu lực'>
      <h2 className='mb-3 text-sm font-semibold'>Cấu hình đang hiệu lực</h2>
      <dl className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Row
          label='Chế độ'
          value={mode ? MODE_LABEL[mode] : '—'}
          field={config.settlementMode}
        />
        <Row
          label='Tần suất'
          value={frequency ? FREQUENCY_LABEL[frequency] : '—'}
          field={config.autoFrequency}
        />
        <Row
          label='T+N (ngày chờ)'
          value={String(config.holdbackDays.value ?? 0)}
          field={config.holdbackDays}
        />
        {limits.map(([label, field]) => (
          <Row
            key={label}
            label={label}
            value={field?.value == null ? '—' : formatVnd(field.value)}
            field={field}
            money
          />
        ))}
      </dl>
      <p className='mt-3 text-xs text-muted-foreground'>
        Chỉnh hạn mức tại màn Hạn mức rút.
      </p>
      {config.pendingChangeId && (
        <TagComponent color='warning'>Có đề xuất đang chờ duyệt</TagComponent>
      )}
    </section>
  )
}
