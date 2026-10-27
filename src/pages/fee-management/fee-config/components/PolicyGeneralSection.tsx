import {
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextArea
} from '@components/form'
import { CopyableText } from '@components/index'
import { SERVICE_TYPE_LABELS } from '@constants/feeLabels'
import dayjs from 'dayjs'
import type { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import {
  FEE_PRIORITY_OPTIONS,
  getFormFieldRules
} from '../constants/feeConfigFields'
import {
  FEE_SCREEN,
  visibleServiceTypesFor,
  type FeeScreen
} from '../constants/feeScreen'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { disablePastDate, disablePastTime } from '../utils/futureDateTime'
import { SectionHeading } from './SectionHeading'

interface PolicyGeneralSectionProps {
  control: Control<FeeConfigFormValues>
  readOnly?: boolean
  /** Mã đối soát do BE sinh; chỉ có khi xem hoặc sửa chính sách đã lưu. */
  feeCode?: string | null
  /** Màn đang mở: quyết định loại giao dịch nào hiện trong ô chọn. */
  screen?: FeeScreen
  /** Đổi loại giao dịch kéo theo miền phí và các ô gán đối tượng. */
  onServiceTypeChange: (next: string) => void
}

const PRIORITY_OPTIONS = FEE_PRIORITY_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label
}))

/**
 * Thông tin chính sách.
 *
 * Loại giao dịch là ô chọn bắt buộc chứ không phải hàng chip lọc: một chính
 * sách khớp đúng MỘT loại giao dịch, nên "Tất cả" không phải một lựa chọn hợp
 * lệ ở đây. Chiều tiền ghép sẵn vào nhãn để người vận hành đọc được ý nghĩa mà
 * không cần một hàng điều khiển thứ hai.
 */
export const PolicyGeneralSection = ({
  control,
  readOnly = false,
  feeCode,
  screen = FEE_SCREEN.CUSTOMER_FEE,
  onServiceTypeChange
}: PolicyGeneralSectionProps) => {
  const feeDomain = useWatch({ control, name: 'feeDomain' })
  const validFrom = useWatch({ control, name: 'validFrom' })

  // Mốc kết thúc không được sớm hơn mốc bắt đầu, cũng không được ở quá khứ.
  const validToFloor = validFrom ? dayjs(validFrom) : null

  const currentServiceType = useWatch({ control, name: 'serviceType' })
  // Giữ loại đang chọn để chính sách cũ thuộc loại bị ẩn vẫn hiện đúng nhãn khi mở sửa.
  const serviceTypeOptions = visibleServiceTypesFor(
    screen,
    getFormFieldRules(feeDomain, '').serviceTypes,
    currentServiceType
  ).map((value) => {
    const name = SERVICE_TYPE_LABELS[value] ?? value
    return {
      value,
      label: name
    }
  })

  return (
    <section>
      <SectionHeading
        action={
          feeCode ? (
            <CopyableText
              label='Mã phí'
              value={feeCode}
              className='tabular-nums'
            />
          ) : undefined
        }
      >
        Thông tin chung
      </SectionHeading>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
        <FormInput
          name='name'
          control={control}
          required
          label='Tên chính sách phí'
          placeholder='Ví dụ: Phí rút tiền ví qua VPBank'
          disabled={readOnly}
          className='col-span-12 flex flex-col md:col-span-8'
        />
        <FormSelect
          name='priority'
          control={control}
          label='Mức độ ưu tiên'
          placeholder='Chọn mức ưu tiên'
          allowClear={false}
          options={PRIORITY_OPTIONS}
          disabled={readOnly}
          className='col-span-12 flex flex-col md:col-span-4'
        />
        <FormTextArea
          name='description'
          control={control}
          label='Mô tả'
          placeholder='Ghi lại vì sao có chính sách này, để người duyệt hiểu ngữ cảnh'
          rows={3}
          disabled={readOnly}
          className='col-span-12 flex flex-col'
        />
      </div>

      <div className='mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 md:grid-cols-12'>
        <FormSelect
          name='serviceType'
          control={control}
          required
          label='Loại giao dịch'
          placeholder='Chọn đúng một loại giao dịch'
          allowClear={false}
          options={serviceTypeOptions}
          onChange={(next) => onServiceTypeChange(String(next))}
          disabled={readOnly}
          className='col-span-12 flex flex-col md:col-span-4'
        />
        <FormDatePicker
          name='validFrom'
          control={control}
          showTime
          required
          label='Áp dụng từ'
          placeholder='Chọn thời điểm bắt đầu'
          disabledDate={disablePastDate()}
          disabledTime={disablePastTime()}
          disabled={readOnly}
          className='col-span-12 flex flex-col md:col-span-4'
        />
        <FormDatePicker
          name='validTo'
          control={control}
          showTime
          label='Áp dụng đến'
          placeholder='Để trống nếu vô thời hạn'
          disabledDate={disablePastDate(validToFloor)}
          disabledTime={disablePastTime(validToFloor)}
          disabled={readOnly}
          className='col-span-12 flex flex-col md:col-span-4'
        />
      </div>
    </section>
  )
}
