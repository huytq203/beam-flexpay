import { useState } from 'react'
import type { Dayjs } from 'dayjs'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  DateInput,
  Input,
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  describePicked,
  toPickedEntity
} from '@components/index'
import {
  MERCHANT_TRANSACTION_STATUS_OPTIONS,
  MERCHANT_TRANSACTION_TYPE_OPTIONS
} from '../constants/merchantTransaction.constants'
import type { MerchantTransactionFilters } from '../types/merchantTransaction.types'

interface MerchantTransactionFiltersProps {
  draft: MerchantTransactionFilters
  onChange: (filters: MerchantTransactionFilters) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'text-sm font-medium text-foreground'

export function MerchantTransactionFilters({
  draft,
  onChange,
  onApply,
  onReset
}: MerchantTransactionFiltersProps) {
  const [isPicking, setIsPicking] = useState(false)

  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      onReset={onReset}
    >
      <div className='flex items-center gap-2 border-b border-border pb-3'>
        <FunnelIcon
          aria-hidden
          size={18}
          className='text-secondary-foreground'
        />
        <h2 className='font-display text-base font-semibold text-foreground'>
          Bộ lọc tìm kiếm
        </h2>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        <PickerTrigger
          id='merchant-transaction-merchant'
          label='Merchant'
          value={describePicked(draft.merchant)}
          placeholder='Tất cả Merchant'
          onOpen={() => setIsPicking(true)}
          onClear={() => onChange({ ...draft, merchant: undefined })}
        />
        <div className='flex min-w-0 flex-col gap-1.5'>
          <label
            className={labelClass}
            htmlFor='merchant-transaction-keyword'
          >
            Từ khóa
          </label>
          <Input
            id='merchant-transaction-keyword'
            allowClear
            maxLength={100}
            placeholder='Mã GD, mã bút toán, SĐT'
            value={draft.keyword}
            onChange={(event) =>
              onChange({ ...draft, keyword: event.target.value })
            }
          />
        </div>
        <div className='flex min-w-0 flex-col gap-1.5'>
          <label
            className={labelClass}
            htmlFor='merchant-transaction-type'
          >
            Loại giao dịch
          </label>
          <SelectComponent
            id='merchant-transaction-type'
            allowClear
            className='w-full'
            options={MERCHANT_TRANSACTION_TYPE_OPTIONS}
            placeholder='Tất cả loại giao dịch'
            value={draft.transactionType}
            onChange={(transactionType: string | undefined) =>
              onChange({ ...draft, transactionType })
            }
          />
        </div>
        <div className='flex min-w-0 flex-col gap-1.5'>
          <label
            className={labelClass}
            htmlFor='merchant-transaction-status'
          >
            Trạng thái
          </label>
          <SelectComponent
            id='merchant-transaction-status'
            allowClear
            className='w-full'
            options={MERCHANT_TRANSACTION_STATUS_OPTIONS}
            placeholder='Tất cả trạng thái'
            value={draft.status}
            onChange={(status: string | undefined) =>
              onChange({ ...draft, status })
            }
          />
        </div>
        <div className='flex min-w-0 flex-col gap-1.5'>
          <label
            className={labelClass}
            htmlFor='merchant-transaction-from'
          >
            Từ ngày
          </label>
          <DateInput
            id='merchant-transaction-from'
            className='w-full'
            format='DD/MM/YYYY'
            placeholder='Chọn ngày bắt đầu'
            value={draft.fromDate ?? null}
            disabledDate={(date: Dayjs) =>
              Boolean(draft.toDate && date.isAfter(draft.toDate, 'day'))
            }
            onChange={(fromDate: Dayjs | null) =>
              onChange({ ...draft, fromDate: fromDate ?? undefined })
            }
          />
        </div>
        <div className='flex min-w-0 flex-col gap-1.5'>
          <label
            className={labelClass}
            htmlFor='merchant-transaction-to'
          >
            Đến ngày
          </label>
          <DateInput
            id='merchant-transaction-to'
            className='w-full'
            format='DD/MM/YYYY'
            placeholder='Chọn ngày kết thúc'
            value={draft.toDate ?? null}
            disabledDate={(date: Dayjs) =>
              Boolean(draft.fromDate && date.isBefore(draft.fromDate, 'day'))
            }
            onChange={(toDate: Dayjs | null) =>
              onChange({ ...draft, toDate: toDate ?? undefined })
            }
          />
        </div>
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent
          className='w-full sm:w-auto'
          type='default'
          htmlType='reset'
          content='Xóa bộ lọc'
          icon={
            <BroomIcon
              aria-hidden
              size={18}
            />
          }
        />
        <ButtonComponent
          className='w-full sm:w-auto'
          htmlType='submit'
          content='Tìm kiếm'
          icon={
            <MagnifyingGlassIcon
              aria-hidden
              size={18}
            />
          }
        />
      </div>
      <MerchantPickerDialog
        open={isPicking}
        selectedId={draft.merchant?.id}
        onCancel={() => setIsPicking(false)}
        onSelect={(value) => {
          onChange({ ...draft, merchant: toPickedEntity(value) })
          setIsPicking(false)
        }}
      />
    </form>
  )
}
