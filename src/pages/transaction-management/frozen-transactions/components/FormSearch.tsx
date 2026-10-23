import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import * as Icons from '@components/icons'
import { ButtonComponent } from '@components/index'
import {
  FREEZE_STATUS_CONFIG,
  FREEZE_TYPE_LABEL,
  FreezeDisplayStatus
} from '@constants/freeze.constant'
import type { FreezeSearchParams } from '@services/apiFreezes'
import type { FrozenFilters } from '../hooks/useFrozenTransactions'
import { BroomIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useForm } from 'react-hook-form'

type FormSearchValues = Pick<
  FreezeSearchParams,
  | 'freezeCode'
  | 'displayStatus'
  | 'username'
  | 'sourceTransactionCode'
  | 'type'
  | 'fromDate'
  | 'toDate'
>

interface FormSearchProps {
  /** Bộ lọc đang áp (đọc từ URL/bản sao) để ô nhập hiện lại khi quay về màn. */
  defaultValues?: FrozenFilters
  onSearch?: (values: FrozenFilters) => void
  onReset?: () => void
}

const EMPTY_VALUES: FormSearchValues = {
  freezeCode: '',
  username: '',
  sourceTransactionCode: '',
  displayStatus: undefined,
  type: undefined,
  fromDate: '',
  toDate: ''
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

const omitEmpty = (values: FormSearchValues): FrozenFilters =>
  Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1] !== ''
    )
  )

const FormSearch = ({ defaultValues, onSearch, onReset }: FormSearchProps) => {
  const { control, handleSubmit, reset } = useForm<FormSearchValues>({
    defaultValues: { ...EMPTY_VALUES, ...defaultValues }
  })

  const onSubmit = (values: FormSearchValues) => {
    // BE khớp tuyệt đối, không phân biệt hoa/thường; chuẩn hoá để URL hiện đúng dạng mã.
    const freezeCode = values.freezeCode?.trim().toUpperCase()
    onSearch?.(omitEmpty({ ...values, freezeCode }))
  }

  const handleReset = () => {
    reset(EMPTY_VALUES)
    onReset?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
        {' '}
        <Icons.FunnelIcon /> Bộ lọc tìm kiếm
      </p>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        <FormInput
          control={control}
          name='freezeCode'
          className='col-span-1'
          label='Mã đóng băng'
          placeholder='VD: FZ7K4M9Q2H'
        />
        <FormInput
          control={control}
          name='username'
          className='col-span-1'
          label='Tên tài khoản (username)'
          placeholder='Nhập tên User...'
        />
        <FormInput
          control={control}
          name='sourceTransactionCode'
          className='col-span-1'
          label='Mã giao dịch gốc'
          placeholder='Nhập mã giao dịch gốc...'
        />
        <FormSelect
          control={control}
          name='displayStatus'
          className='col-span-1'
          label='Trạng thái'
          options={DISPLAY_STATUS_OPTIONS}
        />
        {/* <FormSelect
            control={control}
            name='type'
            className='col-span-2'
            label='Loại đóng băng'
            options={FREEZE_TYPE_OPTIONS}
          /> */}
        <FormDatePicker
          showTime
          control={control}
          name='fromDate'
          className='col-span-1'
          label='Từ ngày'
        />
        <FormDatePicker
          showTime
          control={control}
          name='toDate'
          className='col-span-1'
          label='Đến ngày'
        />
      </div>
      <div className='flex justify-end mt-3 gap-2'>
        <ButtonComponent
          icon={<MagnifyingGlassIcon size={18} />}
          htmlType='submit'
          content='Tìm kiếm'
        />
        <ButtonComponent
          icon={<BroomIcon size={18} />}
          type='default'
          content='Đặt lại'
          onClick={handleReset}
        />
      </div>
    </form>
  )
}

export default FormSearch
