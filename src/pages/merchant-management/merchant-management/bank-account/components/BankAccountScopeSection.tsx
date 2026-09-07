import type { Control } from 'react-hook-form'

import { FormSelect } from '@components/form'

import {
  FORM_FIELD_CLASS,
  FORM_LABEL_CLASS,
  MASTER_MERCHANT_OPTIONS,
  SUB_MERCHANT_OPTIONS
} from '../constants/bank-account.constant'
import type { BankAccountFormValues } from '../schemas/bank-account.schema'
import { BankAccountFormSection } from './BankAccountFormSection'
import { BankAccountNotice } from './BankAccountNotice'

interface BankAccountScopeSectionProps {
  control: Control<BankAccountFormValues>
}

export function BankAccountScopeSection({
  control
}: BankAccountScopeSectionProps) {
  return (
    <>
      <BankAccountFormSection
        id='bank-account-scope'
        step='I'
        title='Phạm vi áp dụng'
        withDivider={false}
      />
      <FormSelect
        control={control}
        name='masterMerchantId'
        label='Chọn Master Merchant'
        required
        showSearch
        optionFilterProp='label'
        placeholder='Tìm theo tên hoặc mã merchant'
        options={MASTER_MERCHANT_OPTIONS}
        className={FORM_FIELD_CLASS}
        classNameLable={FORM_LABEL_CLASS}
      />
      <FormSelect
        control={control}
        name='subMerchantId'
        label='Chọn Sub-merchant (tùy chọn — để override)'
        showSearch
        allowClear
        optionFilterProp='label'
        placeholder='Để trống = kế thừa cấu hình Master'
        options={SUB_MERCHANT_OPTIONS}
        className={FORM_FIELD_CLASS}
        classNameLable={FORM_LABEL_CLASS}
      />
      <BankAccountNotice tone='info' className='md:col-span-2'>
        Cấu hình áp cho Master và mặc định kế thừa xuống toàn bộ Sub. Chỉ chọn
        Sub khi muốn thiết lập riêng (override).
      </BankAccountNotice>
    </>
  )
}
