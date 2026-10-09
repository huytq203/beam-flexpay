import type { ReactNode } from 'react'
import type { Dayjs } from 'dayjs'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  DateInput,
  Input,
  SelectComponent
} from '@components/index'
import type {
  WalletLimitPaymentMethod,
  WalletLimitScope,
  WalletLimitStatus,
  WalletLimitTransactionType
} from '@type/walletLimit.type'
import {
  BANK_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  SCOPE_OPTIONS,
  STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS
} from '../constants/walletLimit.constants'
import type { WalletLimitListFilters } from '../types/walletLimitList.types'

interface WalletLimitListFiltersProps {
  draft: WalletLimitListFilters
  onChange: (filters: WalletLimitListFilters) => void
  onApply: () => void
  onReset: () => void
}

interface FilterFieldProps {
  id: string
  label: string
  children: ReactNode
}

const FilterField = ({ id, label, children }: FilterFieldProps) => (
  <div className='flex min-w-0 flex-col gap-1.5'>
    <label
      className='text-sm font-medium text-foreground'
      htmlFor={id}
    >
      {label}
    </label>
    {children}
  </div>
)

export function WalletLimitListFilters({
  draft,
  onChange,
  onApply,
  onReset
}: WalletLimitListFiltersProps) {
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
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <FilterField
          id='wallet-limit-scope'
          label='Đối tượng'
        >
          <SelectComponent<WalletLimitScope>
            id='wallet-limit-scope'
            allowClear
            className='w-full'
            options={SCOPE_OPTIONS}
            placeholder='Tất cả đối tượng'
            value={draft.scopeType}
            onChange={(scopeType) => onChange({ ...draft, scopeType })}
          />
        </FilterField>
        <FilterField
          id='wallet-limit-keyword'
          label='Mã định danh'
        >
          <Input
            id='wallet-limit-keyword'
            allowClear
            maxLength={100}
            placeholder='SĐT ví hoặc tên nhóm'
            value={draft.targetKeyword}
            onChange={(event) =>
              onChange({ ...draft, targetKeyword: event.target.value })
            }
          />
        </FilterField>
        <FilterField
          id='wallet-limit-transaction-type'
          label='Loại giao dịch'
        >
          <SelectComponent<WalletLimitTransactionType>
            id='wallet-limit-transaction-type'
            allowClear
            className='w-full'
            options={TRANSACTION_TYPE_OPTIONS}
            placeholder='Tất cả loại giao dịch'
            value={draft.transactionType}
            onChange={(transactionType) =>
              onChange({ ...draft, transactionType })
            }
          />
        </FilterField>
        <FilterField
          id='wallet-limit-status'
          label='Trạng thái'
        >
          <SelectComponent<WalletLimitStatus>
            id='wallet-limit-status'
            allowClear
            className='w-full'
            options={STATUS_OPTIONS}
            placeholder='Tất cả trạng thái'
            value={draft.status}
            onChange={(status) => onChange({ ...draft, status })}
          />
        </FilterField>
        <FilterField
          id='wallet-limit-bank'
          label='Ngân hàng'
        >
          <SelectComponent<string>
            id='wallet-limit-bank'
            allowClear
            className='w-full'
            options={BANK_OPTIONS}
            placeholder='Tất cả ngân hàng'
            value={draft.bankCode}
            onChange={(bankCode) => onChange({ ...draft, bankCode })}
          />
        </FilterField>
        <FilterField
          id='wallet-limit-payment-method'
          label='Phương thức'
        >
          <SelectComponent<WalletLimitPaymentMethod>
            id='wallet-limit-payment-method'
            allowClear
            className='w-full'
            options={PAYMENT_METHOD_OPTIONS}
            placeholder='Tất cả phương thức'
            value={draft.paymentMethod}
            onChange={(paymentMethod) => onChange({ ...draft, paymentMethod })}
          />
        </FilterField>
        <FilterField
          id='wallet-limit-created-from'
          label='Tạo từ ngày'
        >
          <DateInput
            id='wallet-limit-created-from'
            className='w-full'
            format='DD/MM/YYYY'
            placeholder='Chọn ngày bắt đầu'
            value={draft.createdFrom ?? null}
            disabledDate={(date: Dayjs) =>
              Boolean(draft.createdTo && date.isAfter(draft.createdTo, 'day'))
            }
            onChange={(createdFrom: Dayjs | null) =>
              onChange({ ...draft, createdFrom: createdFrom ?? undefined })
            }
          />
        </FilterField>
        <FilterField
          id='wallet-limit-created-to'
          label='Tạo đến ngày'
        >
          <DateInput
            id='wallet-limit-created-to'
            className='w-full'
            format='DD/MM/YYYY'
            placeholder='Chọn ngày kết thúc'
            value={draft.createdTo ?? null}
            disabledDate={(date: Dayjs) =>
              Boolean(
                draft.createdFrom && date.isBefore(draft.createdFrom, 'day')
              )
            }
            onChange={(createdTo: Dayjs | null) =>
              onChange({ ...draft, createdTo: createdTo ?? undefined })
            }
          />
        </FilterField>
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
    </form>
  )
}
