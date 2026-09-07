import type { Control } from 'react-hook-form'

import { FormSelect } from '@components/form'

import {
  FORM_FIELD_CLASS,
  FORM_LABEL_CLASS,
  WITHDRAW_CYCLE_OPTIONS
} from '../constants/bank-account.constant'
import type { BankAccountFormValues } from '../schemas/bank-account.schema'
import { WithdrawMode, type WithdrawMode as WithdrawModeValue } from '../types/bank-account.type'
import { BankAccountFormSection } from './BankAccountFormSection'
import { BankAccountNotice } from './BankAccountNotice'
import { WithdrawLimitField } from './WithdrawLimitField'
import { WithdrawModeField } from './WithdrawModeField'

interface BankAccountWithdrawSectionProps {
  control: Control<BankAccountFormValues>
  withdrawMode: WithdrawModeValue
}

export function BankAccountWithdrawSection({
  control,
  withdrawMode
}: BankAccountWithdrawSectionProps) {
  const isAuto = withdrawMode === WithdrawMode.AUTO

  return (
    <>
      <BankAccountFormSection
        id='bank-account-withdraw'
        step='III'
        title='Cấu hình rút tiền'
      />
      <WithdrawModeField control={control} />
      <div className={FORM_FIELD_CLASS}>
        <FormSelect
          control={control}
          name='withdrawCycle'
          label='Chu kỳ rút tự động'
          required={isAuto}
          disabled={!isAuto}
          placeholder={isAuto ? 'Chọn chu kỳ' : 'Chỉ dùng cho rút tự động'}
          options={WITHDRAW_CYCLE_OPTIONS}
          className={FORM_FIELD_CLASS}
          classNameLable={FORM_LABEL_CLASS}
        />
        {!isAuto && (
          <p className='text-xs text-muted-foreground'>
            Chuyển sang “Tự động theo chu kỳ” để đặt chu kỳ T+n.
          </p>
        )}
      </div>
      <WithdrawLimitField control={control} />
      <BankAccountNotice tone='warning' className='md:col-span-2'>
        Thay đổi / thêm tài khoản yêu cầu{' '}
        <strong className='font-semibold'>
          xác thực nhạy cảm (OTP hoặc mật khẩu)
        </strong>{' '}
        và ghi Audit Log theo cơ chế maker–checker.
      </BankAccountNotice>
    </>
  )
}
