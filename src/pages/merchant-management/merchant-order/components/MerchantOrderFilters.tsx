import { useState } from 'react'
import {
  Input,
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'
import { AccessFilterActions } from '../../merchant-access/components/AccessFilterActions'
import { resolvePicked } from '../../merchant-access/utils/merchantAccess.utils'
import {
  ORDER_CODE_MAX,
  ORDER_STATUS_FILTER_VALUES,
  ORDER_STATUS_LABELS
} from '../constants/merchantOrder.constants'
import type {
  MerchantOrderStatus,
  OrderFilters
} from '../types/merchantOrder.types'

interface Props {
  draft: OrderFilters
  getMerchant: (
    id: string
  ) => { id: string; name: string; code?: string } | undefined
  onChange: (filters: OrderFilters) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'
const statusOptions = ORDER_STATUS_FILTER_VALUES.map((value) => ({
  label: ORDER_STATUS_LABELS[value],
  value
}))

export function MerchantOrderFilters({
  draft,
  getMerchant,
  onChange,
  onApply,
  onReset
}: Props) {
  const [picking, setPicking] = useState(false)
  const [merchant, setMerchant] = useState<PickedEntity>()
  const merchantValue = resolvePicked(draft.merchantId, merchant, getMerchant)

  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      onReset={onReset}
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <div>
          <label
            className={labelClass}
            htmlFor='merchant-order-filter-order-code'
          >
            Mã đơn hàng
          </label>
          <Input
            id='merchant-order-filter-order-code'
            allowClear
            maxLength={ORDER_CODE_MAX}
            placeholder='Nhập mã đơn (khớp chứa)'
            value={draft.orderCode}
            onChange={(event) =>
              onChange({ ...draft, orderCode: event.target.value })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='merchant-order-filter-merchant-code'
          >
            Mã Merchant
          </label>
          <Input
            id='merchant-order-filter-merchant-code'
            allowClear
            maxLength={50}
            placeholder='Ví dụ MC0001'
            value={draft.merchantCode}
            onChange={(event) =>
              onChange({ ...draft, merchantCode: event.target.value })
            }
          />
        </div>
        <PickerTrigger
          id='merchant-order-filter-merchant'
          label='Merchant'
          value={describePicked(merchantValue)}
          placeholder='Tất cả Merchant'
          onOpen={() => setPicking(true)}
          onClear={() => onChange({ ...draft, merchantId: undefined })}
        />
        <div>
          <label
            className={labelClass}
            htmlFor='merchant-order-filter-status'
          >
            Trạng thái
          </label>
          <SelectComponent
            id='merchant-order-filter-status'
            allowClear
            className='w-full'
            options={statusOptions}
            placeholder='Tất cả trạng thái'
            value={draft.status}
            onChange={(status: MerchantOrderStatus | undefined) =>
              onChange({ ...draft, status })
            }
          />
        </div>
      </div>
      <AccessFilterActions />
      <MerchantPickerDialog
        open={picking}
        selectedId={draft.merchantId}
        onCancel={() => setPicking(false)}
        onSelect={(value) => {
          setMerchant(toPickedEntity(value))
          onChange({ ...draft, merchantId: value.id })
          setPicking(false)
        }}
      />
    </form>
  )
}
