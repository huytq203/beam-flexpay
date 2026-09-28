import { useState } from 'react'
import { FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { useForm } from 'react-hook-form'
import type { MerchantSearchParams, MerchantStatus } from '@type/merchant'

interface SearchValues {
  name: string
  code: string
  taxCode: string
  status: MerchantStatus | ''
}

const initialValues: SearchValues = { name: '', code: '', taxCode: '', status: '' }

const statusOptions = [
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Chờ duyệt', value: 'PENDING_APPROVAL' },
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Bị khóa', value: 'LOCKED' },
  { label: 'Đã kết thúc', value: 'TERMINATED' }
]

const fieldClass = 'min-w-0 flex flex-col gap-1.5'
const labelClass = 'text-sm font-medium text-foreground'

export type MerchantFilters = Partial<Pick<MerchantSearchParams, 'name' | 'code' | 'taxCode' | 'status'>>

const FormSearch = ({ onSearch }: { onSearch: (values: MerchantFilters) => void }) => {
  const { control, handleSubmit, reset } = useForm<SearchValues>({ defaultValues: initialValues })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const submit = ({ name, code, taxCode, status }: SearchValues) => {
    setIsSubmitted(true)
    onSearch({
      name: name.trim() || undefined,
      code: code.trim() || undefined,
      taxCode: taxCode.trim() || undefined,
      status: status || undefined
    })
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit(submit)}>
      <div className='flex items-center gap-2 border-b border-border pb-3'>
        <FunnelIcon aria-hidden size={18} className='text-secondary-foreground' />
        <h2 className='font-display text-base font-semibold text-foreground'>Bộ lọc tìm kiếm</h2>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <FormInput control={control} name='name' label='Tên merchant' placeholder='Nhập tên merchant' className={fieldClass} classNameLable={labelClass} />
        <FormInput control={control} name='code' label='Mã merchant' placeholder='Nhập mã merchant' className={fieldClass} classNameLable={labelClass} />
        <FormInput control={control} name='taxCode' label='Mã số thuế' placeholder='Nhập mã số thuế' className={fieldClass} classNameLable={labelClass} />
        <FormSelect control={control} name='status' label='Trạng thái' options={statusOptions} placeholder='Tất cả trạng thái' allowClear className={fieldClass} classNameLable={labelClass} />
      </div>

      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent htmlType='button' type='default' content='Xóa lọc' icon={<BroomIcon aria-hidden size={18} />} disabled={!isSubmitted} className='w-full sm:w-auto' onClick={() => { reset(initialValues); setIsSubmitted(false); onSearch({}) }} />
        <ButtonComponent htmlType='submit' content='Tìm kiếm' icon={<MagnifyingGlassIcon aria-hidden size={18} />} className='w-full sm:w-auto' />
      </div>
    </form>
  )
}

export default FormSearch
