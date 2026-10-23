import { FormRadio, FormSelect } from '@components/form'
import {
  WalletLimitScope,
  WalletLimitTransactionType
} from '@type/walletLimit.type'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  SCOPE_LABELS,
  STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS
} from '../constants/walletLimit.constants'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'
import { getInapplicableKeys } from '../utils/walletLimit.formMapper'
import { WalletLimitFormSection } from './WalletLimitFormSection'
import { WalletLimitFormTargetField } from './WalletLimitFormTargetField'

interface WalletLimitFormObjectSectionProps {
  isEdit: boolean
}

const FIELD_CLASS = 'flex min-w-0 flex-col gap-1.5'
const GRID = 'grid grid-cols-1 gap-3 md:grid-cols-2'
const WALLET_TYPE_OPTIONS = [{ value: 'ALL', label: 'Tất cả' }]

// Nhãn cùng bề rộng để ba lựa chọn Đối tượng đồng cỡ.
const SCOPE_RADIO_OPTIONS = Object.values(WalletLimitScope).map((scope) => ({
  value: scope,
  label: <span className='inline-block w-20'>{SCOPE_LABELS[scope]}</span>
}))

function ReadonlyFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='mt-0.5 font-medium text-foreground'>{value}</dd>
    </div>
  )
}

const RequiredMark = () => <span className='ml-1 text-danger-strong!'>*</span>

export function WalletLimitFormObjectSection({
  isEdit
}: WalletLimitFormObjectSectionProps) {
  const { control, setValue } = useFormContext<WalletLimitFormValues>()
  const [scope, targetDisplay, walletType] = useWatch({
    control,
    name: ['scopeType', 'targetDisplay', 'walletType']
  })
  const isSystem = scope === WalletLimitScope.SYSTEM

  // Đổi loại giao dịch: ô không còn áp dụng phải về trống để không gửi nhầm.
  const handleTransactionTypeChange = (next: string | number) => {
    const transactionType = Object.values(WalletLimitTransactionType).find(
      (item) => item === next
    )
    if (!transactionType) return
    getInapplicableKeys(transactionType).forEach((key) => setValue(key, null))
  }

  return (
    <WalletLimitFormSection
      title='Đối tượng áp dụng'
    >
      {isEdit ? (
        <dl className='grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-3'>
          <ReadonlyFact
            label='Đối tượng'
            value={SCOPE_LABELS[scope]}
          />
          <ReadonlyFact
            label='Mã định danh'
            value={targetDisplay || 'Toàn hệ thống'}
          />
          <ReadonlyFact
            label='Loại ví'
            value={walletType === 'ALL' ? 'Tất cả' : walletType}
          />
        </dl>
      ) : (
        <>
          <FormRadio<WalletLimitFormValues>
            control={control}
            name='scopeType'
            label='Đối tượng'
            options={SCOPE_RADIO_OPTIONS}
            className='flex flex-col gap-1.5'
            classNameLabel='text-sm font-medium'
          />
          <WalletLimitFormTargetField />
        </>
      )}
      <div className={GRID}>
        {!isEdit && (
          <FormSelect<WalletLimitFormValues>
            control={control}
            name='walletType'
            label='Loại ví'
            options={WALLET_TYPE_OPTIONS}
            disabled
            allowClear={false}
            className={FIELD_CLASS}
            classNameLable='text-sm font-medium'
          />
        )}
        <FormSelect<WalletLimitFormValues>
          control={control}
          name='transactionType'
          label={
            <>
              Loại giao dịch
              {!isEdit && <RequiredMark />}
            </>
          }
          options={TRANSACTION_TYPE_OPTIONS}
          disabled={isEdit && isSystem}
          allowClear={false}
          onChange={handleTransactionTypeChange}
          className={FIELD_CLASS}
          classNameLable='text-sm font-medium'
        />
        {isEdit && (
          <FormSelect<WalletLimitFormValues>
            control={control}
            name='status'
            label='Trạng thái'
            options={STATUS_OPTIONS}
            allowClear={false}
            className={FIELD_CLASS}
            classNameLable='text-sm font-medium'
          />
        )}
      </div>
    </WalletLimitFormSection>
  )
}
