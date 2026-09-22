import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form'

import { PARENT_MERCHANT_FIXTURES } from '../constants/subMerchant.fixture'
import {
  subMerchantFormSchema,
  type SubMerchantFormValue
} from '../schemas/subMerchant.schema'
import type { SubMerchantRow } from '../types/subMerchant.type'
import { InheritedLegalSection } from './InheritedLegalSection'
import { OperatingConfigurationSection } from './OperatingConfigurationSection'
import { ParentMerchantSection } from './ParentMerchantSection'
import { SubMerchantProfileSection } from './SubMerchantProfileSection'

interface SubMerchantFormProps {
  mode: 'create' | 'edit'
  record?: SubMerchantRow
  onSubmit: (value: SubMerchantFormValue) => void
}

const getDefaultValues = (record?: SubMerchantRow): SubMerchantFormValue => ({
  parentMerchantId: record?.parentMerchantId ?? '',
  name: record?.name ?? '',
  phoneInherited: record?.phoneInherited ?? true,
  phone: record?.phone ?? '',
  addressInherited: record?.addressInherited ?? true,
  address: record?.address ?? '',
  businessField: record?.businessField ?? ''
})

export function SubMerchantForm({ mode, record, onSubmit }: SubMerchantFormProps) {
  const form = useForm<SubMerchantFormValue>({
    defaultValues: getDefaultValues(record),
    resolver: zodResolver(subMerchantFormSchema)
  })
  const parentMerchantId = useWatch({ control: form.control, name: 'parentMerchantId' })
  const parent = PARENT_MERCHANT_FIXTURES[parentMerchantId]
  const handleSubmit: SubmitHandler<SubMerchantFormValue> = onSubmit

  return (
    <form className='flex flex-col gap-3' id='sub-merchant-form' noValidate onSubmit={form.handleSubmit(handleSubmit)}>
      <ParentMerchantSection control={form.control} isEditMode={mode === 'edit'} subMerchantId={record?.id} />
      <SubMerchantProfileSection control={form.control} parent={parent} setValue={form.setValue} />
      <InheritedLegalSection parent={parent} />
      <OperatingConfigurationSection sources={record?.configurationSources} />
    </form>
  )
}
