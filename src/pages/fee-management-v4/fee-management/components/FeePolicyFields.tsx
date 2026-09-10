import { FormDatePicker, FormInput, FormSelect, FormTextArea } from '@components/form'
import { FeeDirectionFilter, Input } from '@components/index'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import {
  FEE_DIRECTION_HINT,
  FeeDirection,
  filterServiceTypeLabels,
  getFeeDirection
} from '@utils/fee-direction'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import type { Control, UseFormSetValue } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import {
  Currency,
  FEE_PRIORITY_OPTIONS,
  feeDomain,
  serviceType,
  STATUS_LABEL,
  statusType
} from '../constants/FeeManagement.constant'
import type { PolicyType } from '../schemas/FeeManagement.schema'

interface FeePolicyFieldsProps {
  control: Control<PolicyType>
  setValue: UseFormSetValue<PolicyType>
  isCreate: boolean
  isEdit: boolean
  id?: string
  status?: string
  /**
   * Miền phí do màn quyết định (ví dụ màn Phí ngân hàng luôn là `BANK`). Khi có
   * giá trị, ô chọn được thay bằng một dòng chỉ đọc để không ai gán nhầm miền.
   */
  lockedFeeDomain?: string
}

const RequiredLabel = ({ text }: { text: string }) => (
  <span>
    {text} <span className='text-red-600'>*</span>
  </span>
)

const disabledPastDate = (current: Dayjs) =>
  current && current < dayjs().startOf('day')

const disabledPastTime = (current: Dayjs) => {
  if (!current || !current.isSame(dayjs(), 'day')) return {}
  const now = dayjs()
  return {
    disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
    disabledMinutes: (hour: number) =>
      hour === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : [],
    disabledSeconds: (hour: number, minute: number) =>
      hour === now.hour() && minute === now.minute()
        ? Array.from({ length: now.second() }, (_, i) => i)
        : []
  }
}

export const FeePolicyFields = ({
  control,
  setValue,
  isCreate,
  isEdit,
  id,
  status,
  lockedFeeDomain
}: FeePolicyFieldsProps) => {
  const lockedAfterInit =
    (!!id && isEdit && status !== statusType.INIT) || (!!id && isCreate)
  const lockedWhileViewing = !!id && isCreate

  const selectedServiceType = useWatch({ control, name: 'serviceType' })
  const selectedFeeDomain = useWatch({ control, name: 'feeDomain' })
  const [directionDraft, setDirectionDraft] = useState<FeeDirection | null>(null)

  useEffect(() => {
    if (lockedFeeDomain && selectedFeeDomain !== lockedFeeDomain) {
      setValue('feeDomain', lockedFeeDomain, { shouldValidate: true })
    }
  }, [lockedFeeDomain, selectedFeeDomain, setValue])

  // Khi đã chọn loại dịch vụ thì chính nó là nguồn sự thật của chiều tiền;
  // bản nháp chỉ dùng để lọc danh sách trước lúc người dùng chọn.
  const direction = getFeeDirection(selectedServiceType) ?? directionDraft
  const serviceTypeOptions = filterServiceTypeLabels(serviceType, direction)

  const handleDirectionChange = (next: FeeDirection | null) => {
    setDirectionDraft(next)
    if (next && getFeeDirection(selectedServiceType) !== next) {
      setValue('serviceType', '', { shouldValidate: false })
    }
  }

  // Select lưu KEY của bảng nhãn (xem `mapEnumToSelectOptions`), không lưu nhãn.
  const isInternalBankMismatch =
    direction === FeeDirection.INTERNAL && selectedFeeDomain === 'BANK'

  return (
    <div className='grid grid-cols-12 gap-2'>
      <div className='col-span-12 mb-1 rounded-xl border border-border bg-slate-50 p-3'>
        <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground'>
          Chiều tiền
        </p>
        <FeeDirectionFilter
          value={direction}
          onChange={lockedAfterInit ? () => undefined : handleDirectionChange}
        />
        <p className='mt-2 text-xs text-muted-foreground'>
          {direction
            ? FEE_DIRECTION_HINT[direction]
            : 'Chọn chiều tiền để thu hẹp danh sách loại dịch vụ bên dưới.'}
        </p>
        {isInternalBankMismatch && (
          <p className='mt-1 text-xs font-medium text-warning-strong'>
            Giao dịch nội bộ không đi qua ngân hàng — kiểm tra lại phí domain
            &ldquo;Bank&rdquo;.
          </p>
        )}
      </div>

      <FormSelect
        className='col-span-12 md:col-span-6'
        name='serviceType'
        control={control}
        label={
          isCreate ? <RequiredLabel text='Loại dịch vụ' /> : 'Loại dịch vụ'
        }
        placeholder={
          direction ? 'Chọn loại dịch vụ' : 'Chọn chiều tiền trước'
        }
        options={mapEnumToSelectOptions(serviceTypeOptions)}
        disabled={lockedAfterInit}
      />
      {lockedFeeDomain ? (
        // Miền phí do màn quyết định: hiển thị nhãn người đọc được, không phải
        // mã enum, và không cho sửa. Giá trị thật đã được gán vào form ở trên.
        <div className='col-span-12 flex flex-col md:col-span-6'>
          <label htmlFor='feeDomain' className='font-medium inline-flex items-center'>
            Phí domain
          </label>
          <Input
            id='feeDomain'
            disabled
            value={
              (feeDomain as Record<string, string>)[lockedFeeDomain] ??
              lockedFeeDomain
            }
          />
        </div>
      ) : (
        <FormSelect
          className='col-span-12 md:col-span-6'
          name='feeDomain'
          control={control}
          label={isCreate ? <RequiredLabel text='Phí domain' /> : 'Phí domain'}
          options={mapEnumToSelectOptions(feeDomain)}
          disabled={lockedAfterInit}
        />
      )}

      <FormInput
        name='name'
        control={control}
        label={
          isCreate ? <RequiredLabel text='Tên chính sách phí' /> : 'Tên chính sách phí'
        }
        placeholder='Nhập tên chính sách...'
        className='col-span-12 md:col-span-6'
        disabled={lockedAfterInit}
      />
      <FormSelect
        className='col-span-12 md:col-span-6'
        name='priority'
        control={control}
        label={<RequiredLabel text='Mức độ ưu tiên' />}
        placeholder='Chọn mức độ ưu tiên'
        options={[...FEE_PRIORITY_OPTIONS]}
        allowClear={false}
        disabled={lockedWhileViewing}
      />

      <FormDatePicker
        className='col-span-12 md:col-span-6 flex flex-col'
        name='validFrom'
        control={control}
        label={isCreate ? <RequiredLabel text='Thời gian áp dụng từ' /> : 'Thời gian áp dụng từ'}
        showTime
        disabledDate={disabledPastDate}
        disabledTime={disabledPastTime}
        disabled={lockedAfterInit}
      />
      <FormDatePicker
        className='col-span-12 md:col-span-6 flex flex-col'
        name='validTo'
        control={control}
        label='Thời gian áp dụng đến'
        showTime
        disabled={lockedWhileViewing}
      />

      <FormSelect
        className='col-span-12 md:col-span-6'
        name='status'
        control={control}
        label={<RequiredLabel text='Trạng thái hoạt động' />}
        options={
          isCreate || (isEdit && status === statusType.INIT)
            ? mapEnumToSelectOptions(STATUS_LABEL).slice(0, 1)
            : mapEnumToSelectOptions(STATUS_LABEL).slice(1)
        }
        disabled={!isEdit}
      />
      <FormSelect
        className='col-span-12 md:col-span-6'
        name='currency'
        control={control}
        options={mapEnumToSelectOptions(Currency)}
        label={
          isCreate ? <RequiredLabel text='Đơn vị tiền tệ' /> : 'Đơn vị tiền tệ'
        }
        placeholder='Nhập đơn vị tiền tệ...'
        disabled={lockedAfterInit}
      />

      <FormTextArea
        className='col-span-12'
        name='description'
        control={control}
        label='Mô tả'
        placeholder='Nhập mô tả chính sách...'
        disabled={lockedAfterInit}
      />
    </div>
  )
}
