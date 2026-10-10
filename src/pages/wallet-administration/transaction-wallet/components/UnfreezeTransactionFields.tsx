import type { Control } from 'react-hook-form'
import {
  FormInputNumber,
  FormRadio,
  FormSelect,
  FormTextArea
} from '@components/form'
import { WarningIcon } from '@components/icons'
import type { FreezeItem } from '@type/freeze.type'
import { blockLeadingAndRepeatedSpace } from '@utils/inputHandlers'
import { formatCurrency } from '@utils/formatNumber'
import type { UnfreezeTransactionFormValues } from '../schemas/unfreezeTransaction.schema'

interface UnfreezeTransactionFieldsProps {
  control: Control<UnfreezeTransactionFormValues>
  transactionCode?: string
  currency: string
  maxAmount: number
  releasableOrders: FreezeItem[]
  unfreezeType: UnfreezeTransactionFormValues['unfreezeType']
}

const getFreezeLabel = (freeze: FreezeItem) => {
  const owner = freeze.ownerUsername || `${freeze.accountId.slice(0, 8)}…`
  return `${owner}${freeze.parentFreezeId ? ' (khoản bù)' : ''}`
}

export function UnfreezeTransactionFields({
  control,
  transactionCode,
  currency,
  maxAmount,
  releasableOrders,
  unfreezeType
}: UnfreezeTransactionFieldsProps) {
  return (
    <>
      <div className='grid grid-cols-1 gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 sm:grid-cols-2'>
        <div className='min-w-0'>
          <p className='text-xs text-emerald-800'>Mã giao dịch</p>
          <p
            className='truncate font-medium text-emerald-950'
            title={transactionCode}
          >
            {transactionCode || '--'}
          </p>
        </div>
        <div className='sm:text-right'>
          <p className='text-xs text-emerald-800'>Số tiền đang giữ</p>
          <p className='font-semibold text-emerald-950'>
            {formatCurrency(maxAmount, {
              symbol: currency,
              position: 'after'
            })}
          </p>
        </div>
      </div>

      <div className='mt-3 flex flex-col gap-3'>
        {releasableOrders.length > 1 && (
          <FormSelect
            required
            label='Khoản cần mở băng'
            control={control}
            name='freezeId'
            options={releasableOrders.map((freeze) => ({
              value: freeze.id,
              label: `${getFreezeLabel(freeze)} - ${formatCurrency(
                freeze.remainingAmount,
                {
                  symbol: currency,
                  position: 'after'
                }
              )}`
            }))}
            allowClear={false}
          />
        )}

        {releasableOrders.length === 1 && (
          <div className='rounded-md bg-gray-50 p-3'>
            <p className='text-xs text-gray-500'>Ví đang giữ tiền</p>
            <p
              className='truncate font-medium text-gray-900'
              title={getFreezeLabel(releasableOrders[0])}
            >
              {getFreezeLabel(releasableOrders[0])}
            </p>
          </div>
        )}

        <FormRadio
          label='Hình thức mở băng'
          control={control}
          name='unfreezeType'
          options={[
            { value: 1, label: 'Mở băng toàn bộ' },
            { value: 2, label: 'Mở băng một phần' }
          ]}
        />

        <FormInputNumber
          required
          disabled={unfreezeType === 1}
          min={1}
          max={maxAmount}
          suffix={currency}
          control={control}
          name='amount'
          placeholder='Nhập số tiền...'
          formatter={(value) =>
            `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
          parser={(value) => Number(value?.replace(/,/g, ''))}
          label='Số tiền cần mở băng'
          onKeyDown={blockLeadingAndRepeatedSpace}
        />

        <FormTextArea
          required
          maxLength={500}
          showCount
          control={control}
          name='reason'
          placeholder='Nhập lý do mở băng...'
          label='Lý do mở băng'
          onKeyDown={blockLeadingAndRepeatedSpace}
        />
      </div>

      <div className='mt-3 rounded-md bg-orange-50 p-3 text-orange-800'>
        <p className='flex items-center gap-1 font-medium'>
          <WarningIcon aria-hidden />
          Lưu ý
        </p>
        <p className='mt-1 text-sm'>
          Tiền sẽ được chuyển trực tiếp từ số dư đóng băng về số dư khả dụng của
          đúng ví đã giữ tiền trong giao dịch này.
        </p>
      </div>
    </>
  )
}
