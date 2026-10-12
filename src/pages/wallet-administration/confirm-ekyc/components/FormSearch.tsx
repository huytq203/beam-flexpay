import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { EKYCFilterType } from '../hooks/useConfirmEKYC'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import * as Icons from '@components/icons'

// Trạng thái PHIÊN eKYC mới nhất (latestStatus), đủ 10 giá trị của EkycSessionStatus ở BE — không nhận VERIFIED/INVALID.
const STATUS_OPTIONS = [
  { label: 'Khởi tạo', value: 'INITIATED' },
  { label: 'Đang xử lý', value: 'IN_PROGRESS' },
  { label: 'Thành công', value: 'COMPLETED' },
  { label: 'Thất bại', value: 'FAILED' },
  { label: 'Hết hạn', value: 'EXPIRED' },
  { label: 'Bỏ dở', value: 'ABANDONED' },
  { label: 'Chờ duyệt thủ công', value: 'PENDING_REVIEW' },
  { label: 'Đã duyệt thủ công', value: 'MANUALLY_APPROVED' },
  { label: 'Đã từ chối thủ công', value: 'MANUALLY_REJECTED' },
  { label: 'Đã thay thế', value: 'SUPERSEDED' }
]

// Kết quả xác thực chung cuộc của người (hồ sơ), tách biệt với trạng thái phiên.
const VERIFIED_OPTIONS = [
  { label: 'Đã xác thực', value: 'true' },
  { label: 'Chưa xác thực', value: 'false' }
]

// Trạng thái hồ sơ chính xác của người (KycProfileStatus ở BE); người chưa có hồ sơ không thuộc mục nào.
const PROFILE_STATUS_OPTIONS = [
  { label: 'Đã xác thực', value: 'VERIFIED' },
  { label: 'Hết hạn giấy tờ', value: 'EXPIRED' },
  { label: 'Đã thu hồi', value: 'INVALID' },
  { label: 'Chờ xác thực lại', value: 'REVERIFY_REQUIRED' }
]

interface FormSearchProps {
  onSearch: (values: EKYCFilterType) => void
  onReset: () => void
}

const FormSearch = ({ onSearch, onReset }: FormSearchProps) => {
  const formSearch = useForm()

  const handleSubmit = formSearch.handleSubmit((data) => {
    const payload: EKYCFilterType = {
      keyword: data.keyword || undefined,
      latestStatus: data.latestStatus || undefined,
      verified: data.verified ? data.verified === 'true' : undefined,
      profileStatus: data.profileStatus || undefined,
      createdFrom: data.createdFrom
        ? dayjs.utc(data.createdFrom).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      createdTo: data.createdTo
        ? dayjs.utc(data.createdTo).format('YYYY-MM-DD HH:mm:ss')
        : undefined
    }
    onSearch(payload)
  })

  const handleReset = () => {
    formSearch.reset()
    onReset()
  }

  return (
    <div>
      <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
        {' '}
        <Icons.FunnelIcon /> Bộ lọc tìm kiếm
      </p>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-3 gap-3'>
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
            name='verified'
            className='col-span-1'
            label='Xác thực'
            options={VERIFIED_OPTIONS}
          />
          <FormSelect
            control={formSearch.control}
            name='profileStatus'
            className='col-span-1'
            label='Trạng thái hồ sơ'
            options={PROFILE_STATUS_OPTIONS}
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
