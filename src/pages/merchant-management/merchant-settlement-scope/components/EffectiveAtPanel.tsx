import { useState } from 'react'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useGetSubSettlementConfigAtQuery } from '@/app/services/merchantSettlementScopeApi'
import {
  ButtonComponent,
  DateInput,
  type PickedEntity
} from '@components/index'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  FREQUENCY_LABEL,
  MODE_LABEL
} from '../../merchant-settlement/constants/settlementConfig.constants'
import { SCOPE_SOURCE_LABEL } from '../constants/settlementScope.constants'
import { getScopeErrorMessage, toAtParam } from '../utils/settlementScope.utils'
import { ScopeTargetPicker } from './ScopeTargetPicker'

type Lookup = { id: string; at: string }

/** Tra cấu hình quyết toán có hiệu lực của một Sub tại thời điểm quá khứ (FR-MER-0621-02). */
export function EffectiveAtPanel() {
  const [sub, setSub] = useState<PickedEntity>()
  const [at, setAt] = useState<Dayjs | null>(null)
  const [lookup, setLookup] = useState<Lookup>()
  const query = useGetSubSettlementConfigAtQuery(lookup ?? { id: '', at: '' }, {
    skip: !lookup
  })
  const canLookup = Boolean(sub && at)
  const fields = query.data?.fields

  const rows =
    fields &&
    ([
      [
        'Chế độ',
        fields.settlementMode,
        fields.settlementMode.value
          ? MODE_LABEL[fields.settlementMode.value]
          : null
      ],
      [
        'Tần suất',
        fields.autoFrequency,
        fields.autoFrequency.value
          ? FREQUENCY_LABEL[fields.autoFrequency.value]
          : null
      ],
      [
        'T+N (ngày chờ)',
        fields.holdbackDays,
        fields.holdbackDays.value == null
          ? null
          : String(fields.holdbackDays.value)
      ],
      ['Lý do tạm dừng', fields.holdReason, fields.holdReason.value]
    ] as const)

  return (
    <section
      aria-label='Tra cứu theo thời điểm'
      className='flex flex-col gap-3'
    >
      <div className='grid grid-cols-1 items-end gap-3 md:grid-cols-3'>
        <ScopeTargetPicker
          kind='sub'
          value={sub}
          onChange={(next) => {
            setSub(next)
            setLookup(undefined)
          }}
        />
        <div>
          <label
            className='mb-1 block text-xs text-muted-foreground'
            htmlFor='scope-at'
          >
            Thời điểm cần tra
          </label>
          <DateInput
            id='scope-at'
            className='w-full'
            showTime
            format='DD/MM/YYYY HH:mm'
            placeholder='Chọn ngày giờ'
            value={at}
            disabledDate={(current) => current.isAfter(dayjs())}
            onChange={(value) => {
              setAt(value)
              setLookup(undefined)
            }}
          />
        </div>
        <ButtonComponent
          content='Tra cứu'
          htmlType='button'
          disabled={!canLookup}
          loading={query.isFetching}
          onClick={() =>
            sub && at && setLookup({ id: sub.id, at: toAtParam(at.toDate()) })
          }
        />
      </div>
      {!lookup && (
        <p className='text-sm text-muted-foreground'>
          Chọn Sub-merchant và thời điểm để xem cấu hình đã áp dụng lúc đó
        </p>
      )}
      {lookup && query.isError && (
        <div
          role='alert'
          className='text-sm text-danger-strong'
        >
          {getScopeErrorMessage(query.error, 'Không thể tra cứu cấu hình')}
        </div>
      )}
      {rows && query.data && (
        <>
          <p className='text-xs text-muted-foreground'>
            Cấu hình có hiệu lực lúc {formatUTCToLocalDateTime(query.data.at)}.
            Lịch sử chỉ có từ khi tính năng ghi lịch sử bắt đầu.
          </p>
          <dl className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
            {rows.map(([label, field, text]) => (
              <div key={label}>
                <dt className='text-xs text-muted-foreground'>{label}</dt>
                <dd className='mt-1 text-sm font-medium'>{text || '—'}</dd>
                <dd className='text-xs text-muted-foreground'>
                  {SCOPE_SOURCE_LABEL[field.source] ?? field.source}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  )
}
