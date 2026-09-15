import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import * as Icons from '@components/icons'
import { ButtonComponent } from '@components/index'
import {
  FREEZE_STATUS_CONFIG,
  FREEZE_TYPE_LABEL,
  FreezeDisplayStatus,
  RELEASE_TYPE_LABEL
} from '@constants/freeze.constant'
import type { FreezeSearchParams } from '@services/apiFreezes'
import { BroomIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useForm } from 'react-hook-form'

type FormSearchValues = Pick<
  FreezeSearchParams,
  | 'displayStatus'
  | 'username'
  | 'sourceTransactionCode'
  | 'type'
  | 'releaseType'
  | 'fromDate'
  | 'toDate'
>

interface FormSearchProps {
  onSearch?: (values: FreezeSearchParams) => void
}

/**
 * Nhãn lấy thẳng từ bảng cấu hình dùng chung để lựa chọn trong bộ lọc luôn khớp với chữ
 * hiện trên lưới. Bỏ PENDING_APPROVAL vì đó là trạng thái FE ghép từ lệnh mở băng,
 * wallet-core chưa lọc được theo nó.
 */
const DISPLAY_STATUS_OPTIONS = Object.values(FreezeDisplayStatus).map(
  (value) => ({
    label: FREEZE_STATUS_CONFIG[value].label,
    value
  })
)

const FREEZE_TYPE_OPTIONS = Object.entries(FREEZE_TYPE_LABEL).map(
  ([value, label]) => ({ label, value })
)

const RELEASE_TYPE_OPTIONS = Object.entries(RELEASE_TYPE_LABEL).map(
  ([value, label]) => ({ label, value })
)

const omitEmpty = (values: FormSearchValues): FreezeSearchParams =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => Boolean(value))
  )

const FormSearch = ({ onSearch }: FormSearchProps) => {
  const { control, handleSubmit, reset } = useForm<FormSearchValues>()

  const onSubmit = (values: FormSearchValues) => {
    onSearch?.(omitEmpty(values))
  }

  const handleReset = () => {
    reset()
    onSearch?.({})
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
        {' '}
        <Icons.FunnelIcon /> Bộ lọc tìm kiếm
      </p>
        <div className=' grid grid-cols-12 gap-3'>
          <FormInput
            control={control}
            name='username'
            className='col-span-3'
            label='Tên tài khoản (username)'
            placeholder='Nhập tên User...'
          />
          <FormInput
            control={control}
            name='sourceTransactionCode'
            className='col-span-3'
            label='Mã giao dịch nguồn'
            placeholder='Nhập mã giao dịch nguồn...'
          />
          <FormSelect
            control={control}
            name='displayStatus'
            className='col-span-2'
            label='Trạng thái'
            options={DISPLAY_STATUS_OPTIONS}
          />
          <FormSelect
            control={control}
            name='type'
            className='col-span-2'
            label='Loại đóng băng'
            options={FREEZE_TYPE_OPTIONS}
          />
          <FormSelect
            control={control}
            name='releaseType'
            className='col-span-2'
            label='Cách mở băng'
            options={RELEASE_TYPE_OPTIONS}
          />
        </div>
        <div className='grid grid-cols-12 gap-3'>
          <FormDatePicker
            showTime
            control={control}
            name='fromDate'
            className='col-span-6'
            label='Từ ngày'
          />
          <FormDatePicker
            showTime
            control={control}
            name='toDate'
            className='col-span-6'
            label='Đến ngày'
          />
        </div>
      <div className='flex justify-end mt-3 gap-2'>
        <ButtonComponent
          icon={<BroomIcon size={18} />}
          type='default'
          content='Đặt lại'
          onClick={handleReset}
        />
        <ButtonComponent
          icon={<MagnifyingGlassIcon size={18} />}
          htmlType='submit'
          content='Tìm kiếm'
        />
      </div>
    </form>
  )
}

export default FormSearch
