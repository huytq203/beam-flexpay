import type { ChangeEvent } from 'react'
import type { Control, UseFormSetValue } from 'react-hook-form'

import { FormInput, FormSelect } from '@components/form'

import {
  BANK_OPTIONS,
  FORM_FIELD_CLASS,
  FORM_FIELD_FULL_CLASS,
  FORM_LABEL_CLASS
} from '../constants/bank-account.constant'
import type { BankAccountFormValues } from '../schemas/bank-account.schema'
import { BankAccountFormSection } from './BankAccountFormSection'

interface BankAccountSettlementSectionProps {
  control: Control<BankAccountFormValues>
  setValue: UseFormSetValue<BankAccountFormValues>
}

export function BankAccountSettlementSection({
  control,
  setValue
}: BankAccountSettlementSectionProps) {
  // Tên chủ tài khoản phải khớp bản in trên hệ thống ngân hàng — luôn viết hoa.
  const handleAccountNameChange = (event: ChangeEvent<HTMLInputElement>): void =>
    setValue('accountName', event.target.value.toUpperCase())

  return (
    <>
      <BankAccountFormSection
        id='bank-account-settlement'
        step='II'
        title='Tài khoản nhận quyết toán'
      />
      <FormSelect
        control={control}
        name='bankCode'
        label='Ngân hàng'
        required
        showSearch
        optionFilterProp='label'
        placeholder='Chọn ngân hàng thụ hưởng'
        options={BANK_OPTIONS}
        className={FORM_FIELD_CLASS}
        classNameLable={FORM_LABEL_CLASS}
      />
      <div className={FORM_FIELD_CLASS}>
        <FormInput
          control={control}
          name='accountNumber'
          label='Số tài khoản'
          required
          inputMode='numeric'
          placeholder='Chỉ nhập số'
          className={FORM_FIELD_CLASS}
          classNameLable={FORM_LABEL_CLASS}
          inputClassName='tabular-nums'
        />
        <p className='text-xs text-muted-foreground'>Độ dài 6–20 số.</p>
      </div>
      <div className={FORM_FIELD_FULL_CLASS}>
        <FormInput
          control={control}
          name='accountName'
          label='Tên chủ tài khoản'
          required
          placeholder='TỰ ĐỘNG VIẾT HOA'
          onChange={handleAccountNameChange}
          className={FORM_FIELD_CLASS}
          classNameLable={FORM_LABEL_CLASS}
        />
        <p className='text-xs text-muted-foreground'>
          Phải khớp pháp nhân / chủ ví đã xác thực (KYB · eKYC).
        </p>
      </div>
      <FormInput
        control={control}
        name='branchName'
        label='Chi nhánh'
        placeholder='Chi nhánh ngân hàng (nếu có)'
        className={FORM_FIELD_CLASS}
        classNameLable={FORM_LABEL_CLASS}
      />
    </>
  )
}
