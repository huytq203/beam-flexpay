import { FormInput, FormSelect } from '@components/form'
import type { FeeDomain } from '@components/fee/feeDomain'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, FeeServiceTypeTabs } from '@components/index'
import { POLICY_STATUS_CONFIG, SERVICE_TYPE_LABELS } from '@constants/feeLabels'
import { getDomainFieldRules } from '@pages/fee-management/fee-config/constants/feeConfigFields'
import {
  BE_SUPPORTS_SERVICE_TYPE_LIST,
  type FeeDirection
} from '@utils/fee-direction'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

export interface FeePolicyFilterValues {
  keyword: string
  status: string
}

interface FeePolicyFilterBarProps {
  feeDomain: FeeDomain
  direction: FeeDirection | null
  serviceType: string | undefined
  values: FeePolicyFilterValues
  onScopeChange: (next: {
    direction: FeeDirection | null
    serviceType: string | undefined
  }) => void
  onSubmit: (values: FeePolicyFilterValues) => void
  onReset: () => void
}

const STATUS_OPTIONS = Object.entries(POLICY_STATUS_CONFIG).map(
  ([value, config]) => ({ value, label: config.label })
)

/**
 * Loại giao dịch bày ra khác nhau theo miền phí: miền ví không có thu chi hộ,
 * miền ĐVCNTT không có nạp rút. Lọc bảng nhãn theo miền đang xem để người dùng
 * không chọn được một tổ hợp chắc chắn trả về bảng rỗng.
 */
export const FeePolicyFilterBar = ({
  feeDomain,
  direction,
  serviceType,
  values,
  onScopeChange,
  onSubmit,
  onReset
}: FeePolicyFilterBarProps) => {
  /**
   * `values` của react-hook-form so sánh theo tham chiếu: truyền thẳng một object
   * dựng tại chỗ là form bị reset sau MỖI render, và giá trị người dùng vừa xoá
   * bị ghi đè lại ngay. Khoá theo hai chuỗi thật để chỉ đồng bộ khi URL đổi.
   */
  const syncedValues = useMemo(
    () => ({ keyword: values.keyword, status: values.status }),
    [values.keyword, values.status]
  )

  const { control, handleSubmit, reset } = useForm<FeePolicyFilterValues>({
    values: syncedValues
  })

  const allowed = getDomainFieldRules(feeDomain).serviceTypes
  const labels = Object.fromEntries(
    allowed.map((value) => [value, SERVICE_TYPE_LABELS[value] ?? value])
  )

  const handleReset = () => {
    reset({ keyword: '', status: '' })
    onReset()
  }

  return (
    <div className='space-y-4'>
      <FeeServiceTypeTabs
        direction={direction}
        serviceType={serviceType}
        labels={labels}
        supportsMultiServiceType={BE_SUPPORTS_SERVICE_TYPE_LIST}
        onChange={(next) =>
          onScopeChange({
            direction: next.direction,
            serviceType: next.serviceType
          })
        }
      />

      <form
        id='feePolicyFilter'
        onSubmit={handleSubmit(onSubmit)}
        className='grid grid-cols-1 gap-3 border-t border-border pt-4 md:grid-cols-12'
      >
        <FormInput
          name='keyword'
          control={control}
          label='Tên chính sách'
          placeholder='Nhập tên chính sách'
          className='col-span-12 flex flex-col md:col-span-6'
        />
        <FormSelect
          name='status'
          control={control}
          label='Trạng thái'
          placeholder='Mọi trạng thái'
          allowClear
          options={STATUS_OPTIONS}
          className='col-span-12 flex flex-col md:col-span-3'
        />
        <div className='col-span-12 flex flex-col gap-2 md:col-span-3 md:flex-row md:items-end'>
          <ButtonComponent
            htmlType='submit'
            form='feePolicyFilter'
            content='Tìm'
            icon={<MagnifyingGlassIcon size={16} weight='bold' aria-hidden />}
            className='flex-1'
          />
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Xoá lọc'
            onClick={handleReset}
            icon={<BroomIcon size={16} weight='bold' aria-hidden />}
            className='flex-1'
          />
        </div>
      </form>
    </div>
  )
}
