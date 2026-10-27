import { useState } from 'react'
import {
  DateInput,
  MerchantPickerDialog,
  PickerTrigger,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'
import { AccessFilterActions } from '../../merchant-access/components/AccessFilterActions'
import { resolvePicked } from '../../merchant-access/utils/merchantAccess.utils'
import type {
  SettlementItemFilterError,
  SettlementItemFilters as Filters
} from '../types/settlementItem.types'
import {
  describeFilterError,
  fromDateString,
  toDateString
} from '../utils/settlementItem.utils'

interface Props {
  draft: Filters
  error?: SettlementItemFilterError
  getMerchant: (
    id: string
  ) => { id: string; name: string; code?: string } | undefined
  getSub: (
    id: string
  ) => { id: string; name: string; code?: string } | undefined
  onChange: (filters: Filters) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'

export function SettlementItemFilters({
  draft,
  error,
  getMerchant,
  getSub,
  onChange,
  onApply,
  onReset
}: Props) {
  const [pickingMerchant, setPickingMerchant] = useState(false)
  const [picking, setPicking] = useState(false)
  const [merchant, setMerchant] = useState<PickedEntity>()
  const [sub, setSub] = useState<PickedEntity>()
  const merchantValue = resolvePicked(draft.merchantId, merchant, getMerchant)
  const subValue = resolvePicked(draft.subMerchantId, sub, getSub)
  const from = fromDateString(draft.paidFrom)
  const to = fromDateString(draft.paidTo)

  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      onReset={onReset}
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        <PickerTrigger
          id='settlement-item-filter-merchant'
          label='Merchant'
          value={describePicked(merchantValue)}
          placeholder='Tất cả Merchant'
          onOpen={() => setPickingMerchant(true)}
          // Đổi Master thì bỏ Sub đã chọn: Sub không thuộc Master bị BE từ chối 400.
          onClear={() =>
            onChange({
              ...draft,
              merchantId: undefined,
              subMerchantId: undefined
            })
          }
        />
        <PickerTrigger
          id='settlement-item-filter-sub'
          label='Sub-merchant'
          value={describePicked(subValue)}
          placeholder='Chọn Sub-merchant'
          onOpen={() => setPicking(true)}
          onClear={() => onChange({ ...draft, subMerchantId: undefined })}
        />
        <div>
          <label
            className={labelClass}
            htmlFor='settlement-item-filter-paid'
          >
            Ngày thanh toán (bắt buộc)
          </label>
          <DateInput
            isRange
            id='settlement-item-filter-paid'
            allowClear
            className='w-full'
            format='DD/MM/YYYY'
            placeholder={['Từ ngày', 'Đến ngày']}
            value={from && to ? [from, to] : null}
            onChange={(range) =>
              onChange({
                ...draft,
                paidFrom: range?.[0] ? toDateString(range[0]) : undefined,
                paidTo: range?.[1] ? toDateString(range[1]) : undefined
              })
            }
          />
        </div>
      </div>
      {error && (
        <p
          role='alert'
          className='text-sm text-danger-strong'
        >
          {describeFilterError(error)}
        </p>
      )}
      <AccessFilterActions />
      <MerchantPickerDialog
        open={pickingMerchant}
        selectedId={draft.merchantId}
        onCancel={() => setPickingMerchant(false)}
        onSelect={(value) => {
          setMerchant(toPickedEntity(value))
          onChange({
            ...draft,
            merchantId: value.id,
            subMerchantId:
              value.id === draft.merchantId ? draft.subMerchantId : undefined
          })
          setPickingMerchant(false)
        }}
      />
      <SubMerchantPickerDialog
        open={picking}
        merchantId={draft.merchantId}
        selectedId={draft.subMerchantId}
        onCancel={() => setPicking(false)}
        onSelect={(value) => {
          setSub(toPickedEntity(value))
          onChange({ ...draft, subMerchantId: value.id })
          setPicking(false)
        }}
      />
    </form>
  )
}
