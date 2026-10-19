import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import {
  EKYC_DATETIME_FORMAT,
  PICKER_VALUE_FORMAT,
  UNVERIFIED,
  type EkycUrlFilters
} from '../constants/ekycFilter.constants'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import * as Icons from '@components/icons'

// Trạng thái PHIÊN eKYC mới nhất (latestStatus), đủ 10 giá trị của EkycSessionStatus ở BE — không nhận VERIFIED/INVALID.
const STATUS_OPTIONS = [
  { label: 'Khởi tạo', value: 'INITIATED' },
  { label: 'Đang xử lý', value: 'IN_PROGRESS' },
  { label: 'Thành công', value: 'COMPLETED' },
  { label: 'Thất bại', value: 'FAILED' },
  { label: 'Hết hạn', value: 'EXPIRED' },
  { label: 'Chờ duyệt thủ công', value: 'PENDING_REVIEW' },
  { label: 'Đã duyệt thủ công', value: 'MANUALLY_APPROVED' },
  { label: 'Đã từ chối thủ công', value: 'MANUALLY_REJECTED' },
  { label: 'Đã thay thế', value: 'SUPERSEDED' }
]

// Kết quả xác thực chung cuộc của người (profileStatus ở BE), tách biệt với trạng thái phiên.
const VERIFIED_OPTIONS = [
  { label: 'Đã xác thực', value: 'VERIFIED' },
  { label: 'Hết hạn giấy tờ', value: 'EXPIRED' },
  { label: 'Đã thu hồi', value: 'INVALID' },
  { label: 'Chờ xác thực lại', value: 'REVERIFY_REQUIRED' },
  { label: 'Chưa xác thực', value: UNVERIFIED }
]

interface EkycSearchValues {
  keyword?: string
  latestStatus?: string
  profileStatus?: string
  createdFrom?: string
  createdTo?: string
}

// Lưu đúng chuỗi BE nhận (giữ nguyên chữ số giờ đã chọn, như trước khi lên URL).
const toApiText = (value?: string): string | undefined =>
  value ? dayjs.utc(value).format(EKYC_DATETIME_FORMAT) : undefined

const toPickerText = (value?: string): string =>
  value ? dayjs(value).format(PICKER_VALUE_FORMAT) : ''

const toFormValues = (filters: EkycUrlFilters): EkycSearchValues => ({
  keyword: filters.keyword ?? '',
  latestStatus: filters.latestStatus,
  profileStatus: filters.profileStatus,
  createdFrom: toPickerText(filters.createdFrom),
  createdTo: toPickerText(filters.createdTo)
})

interface FormSearchProps {
  /** Bộ lọc đang áp dụng (URL/bản sao) để ô nhập hiện lại khi quay về màn. */
  filters: EkycUrlFilters
  onSearch: (values: EkycUrlFilters) => void
  onReset: () => void
}

const FormSearch = ({ filters, onSearch, onReset }: FormSearchProps) => {
  const formSearch = useForm<EkycSearchValues>({
    defaultValues: toFormValues(filters)
  })

  const handleSubmit = formSearch.handleSubmit((data) => {
    onSearch({
      keyword: data.keyword || undefined,
      latestStatus: data.latestStatus || undefined,
      profileStatus: data.profileStatus || undefined,
      createdFrom: toApiText(data.createdFrom),
      createdTo: toApiText(data.createdTo)
    })
  })

  const handleReset = () => {
    formSearch.reset(toFormValues({}))
    onReset()
  }

  return (
    <div>
      <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
        {' '}
        <Icons.FunnelIcon /> Bộ lọc tìm kiếm
      </p>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-5 gap-3'>
          <FormInput
            control={formSearch.control}
            name='keyword'
            className='col-span-1'
            label='Từ khoá tìm kiếm'
            placeholder='Nhập từ khóa ...'
          />
          <FormSelect
            control={formSearch.control}
            name='latestStatus'
            className='col-span-1'
            label='Trạng thái phiên'
            options={STATUS_OPTIONS}
          />
          <FormSelect
            control={formSearch.control}
            name='profileStatus'
            className='col-span-1'
            label='Xác thực'
            options={VERIFIED_OPTIONS}
          />
          <FormDatePicker
            control={formSearch.control}
            name='createdFrom'
            className='col-span-1'
            label='Ngày tạo từ'
            showTime
          />
          <FormDatePicker
            control={formSearch.control}
            name='createdTo'
            className='col-span-1'
            label='Ngày tạo đến'
            showTime
          />
        </div>
        <div className='flex justify-end items-center gap-2 mt-3'>
          <ButtonComponent
            icon={<BroomIcon size={18} />}
            content='Đặt lại'
            type='default'
            onClick={handleReset}
          />
          <ButtonComponent
            icon={<MagnifyingGlassIcon size={18} />}
            content='Tìm kiếm'
            htmlType='submit'
          />
        </div>
      </form>
    </div>
  )
}

export default FormSearch
