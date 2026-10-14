import {
  FormDatePicker,
  FormInput,
  FormLabelHint,
  FormSelect
} from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, FeeServiceTypeTabs } from '@components/index'
import {
  PAYMENT_METHOD_LABELS,
  SERVICE_TYPE_LABELS
} from '@constants/feeLabels'
import {
  BACKEND_PAYMENT_METHODS,
  getPaymentMethodOptions
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { FeePolicyPartyFilters } from './FeePolicyPartyFilters'
import { FeePolicyProviderFilter } from './FeePolicyProviderFilter'
import { POLICY_STATUS_FILTER_OPTIONS } from '../utils/policyStatusFilter'
import {
  PUBLISHABLE_SERVICE_TYPES,
  withoutHiddenServiceTypes
} from '@utils/fee-execution'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

const APPLIED_TARGET_OPTIONS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Theo nhóm khách hàng', value: 'CUSTOMER_GROUP' },
  { label: 'Riêng ví', value: 'ACCOUNT' }
]

export interface FeePolicyFilterValues {
  keyword: string
  subjectKeyword: string
  status: string
  appliedTarget: string
  bankCode: string
  providerCode: string
  paymentMethod: string
  payerType: string
  beneficiaryType: string
  feeBearer: string
  validFrom: string
  validTo: string
  createdAtFrom: string
  createdAtTo: string
}

interface FeePolicyFilterBarProps {
  serviceType: string | undefined
  values: FeePolicyFilterValues
  onServiceTypeChange: (serviceType: string | undefined) => void
  onSubmit: (values: FeePolicyFilterValues) => void
  onReset: () => void
}

/** Bộ lọc dùng chung cho cả hai luồng phí; loại giao dịch là mọi loại đã duyệt được. */
export const FeePolicyFilterBar = ({
  serviceType,
  values,
  onServiceTypeChange,
  onSubmit,
  onReset
}: FeePolicyFilterBarProps) => {
  /**
   * `values` của react-hook-form so sánh theo tham chiếu: truyền thẳng một object
   * dựng tại chỗ là form bị reset sau MỖI render, và giá trị người dùng vừa xoá
   * bị ghi đè lại ngay. Khoá theo các chuỗi thật để chỉ đồng bộ khi URL đổi.
   */
  const syncedValues = useMemo<FeePolicyFilterValues>(
    () => ({
      keyword: values.keyword,
      subjectKeyword: values.subjectKeyword,
      status: values.status,
      appliedTarget: values.appliedTarget,
      bankCode: values.bankCode,
      providerCode: values.providerCode,
      paymentMethod: values.paymentMethod,
      payerType: values.payerType,
      beneficiaryType: values.beneficiaryType,
      feeBearer: values.feeBearer,
      validFrom: values.validFrom,
      validTo: values.validTo,
      createdAtFrom: values.createdAtFrom,
      createdAtTo: values.createdAtTo
    }),
    [
      values.appliedTarget,
      values.bankCode,
      values.providerCode,
      values.createdAtFrom,
      values.createdAtTo,
      values.keyword,
      values.paymentMethod,
      values.payerType,
      values.beneficiaryType,
      values.feeBearer,
      values.status,
      values.subjectKeyword,
      values.validFrom,
      values.validTo
    ]
  )

  const { control, handleSubmit, reset } = useForm<FeePolicyFilterValues>({
    values: syncedValues
  })

  const labels = Object.fromEntries(
    withoutHiddenServiceTypes(PUBLISHABLE_SERVICE_TYPES, serviceType).map(
      (value) => [value, SERVICE_TYPE_LABELS[value] ?? value]
    )
  )
  // Lọc theo LOẠI đối tượng, không theo từng phân khúc: người vận hành muốn
  // gom mọi chính sách cấu hình theo nhóm, tên nhóm cụ thể đã hiện ở cột.
  const appliedTargetOptions = APPLIED_TARGET_OPTIONS
  const paymentMethodOptions = serviceType
    ? [...getPaymentMethodOptions(serviceType)]
    : BACKEND_PAYMENT_METHODS.map((value) => ({
        value,
        label: PAYMENT_METHOD_LABELS[value] ?? value
      }))
  // Danh mục nhỏ, dùng chung cache RTK Query với màn tạo chính sách phí.
  const { data: bankData, isFetching: isFetchingBanks } = useGetBankQuery({
    page: 1,
    size: 100
  })
  const bankOptions = (bankData?.content ?? []).map((bank) => ({
    value: bank.code,
    label: `${bank.name} (${bank.code})`
  }))

  const handleReset = () => {
    reset({
      keyword: '',
      subjectKeyword: '',
      status: '',
      appliedTarget: '',
      bankCode: '',
      providerCode: '',
      paymentMethod: '',
      payerType: '',
      beneficiaryType: '',
      feeBearer: '',
      validFrom: '',
      validTo: '',
      createdAtFrom: '',
      createdAtTo: ''
    })
    onReset()
  }

  return (
    <div className='space-y-4'>
      <FeeServiceTypeTabs
        serviceType={serviceType}
        labels={labels}
        onChange={onServiceTypeChange}
      />

      <form
        id='feePolicyFilter'
        onSubmit={handleSubmit(onSubmit)}
        className='grid grid-cols-1 gap-3 border-t border-border pt-4 md:grid-cols-2 xl:grid-cols-5'
      >
        <FormInput
          name='keyword'
          control={control}
          label='Tên chính sách'
          placeholder='Nhập tên chính sách'
          className='flex flex-col col-span-2'
        />
        <FormInput
          name='subjectKeyword'
          control={control}
          label={
            <FormLabelHint
              label='SĐT người dùng'
              hint='Khớp ví riêng hoặc phân khúc người đó thuộc về'
            />
          }
          placeholder='Nhập số điện thoại'
          inputMode='tel'
          maxLength={100}
          className='flex flex-col col-span-1'
        />
        <FormSelect
          name='status'
          control={control}
          label='Trạng thái'
          placeholder='Mọi trạng thái'
          allowClear
          options={POLICY_STATUS_FILTER_OPTIONS}
          className='flex flex-col'
        />
        <FormSelect
          name='appliedTarget'
          control={control}
          label='Đối tượng áp dụng'
          placeholder='Mọi đối tượng'
          allowClear
          options={appliedTargetOptions}
          className='flex flex-col'
        />
        <FeePolicyProviderFilter control={control} />
        <FormSelect
          name='bankCode'
          control={control}
          label='Ngân hàng phát hành'
          placeholder='Mọi ngân hàng phát hành'
          allowClear
          showSearch
          optionFilterProp='label'
          loading={isFetchingBanks}
          options={bankOptions}
          className='flex flex-col'
        />
        <FormSelect
          name='paymentMethod'
          control={control}
          label='Phương thức giao dịch'
          placeholder='Mọi phương thức'
          allowClear
          options={paymentMethodOptions}
          className='flex flex-col'
        />
        <FeePolicyPartyFilters
          control={control}
          serviceType={serviceType}
        />
        <FormDatePicker
          name='validFrom'
          control={control}
          label='Thời gian áp dụng từ'
          placeholder='Chọn ngày bắt đầu'
          className='flex flex-col'
        />
        <FormDatePicker
          name='validTo'
          control={control}
          label='Thời gian áp dụng đến'
          placeholder='Chọn ngày kết thúc'
          className='flex flex-col'
        />
        <FormDatePicker
          name='createdAtFrom'
          control={control}
          label='Ngày tạo từ'
          placeholder='Chọn ngày bắt đầu'
          className='flex flex-col'
        />
        <FormDatePicker
          name='createdAtTo'
          control={control}
          label='Ngày tạo đến'
          placeholder='Chọn ngày kết thúc'
          className='flex flex-col'
        />
      </form>
      <div>
        <div className='flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-end'>
          <ButtonComponent
            htmlType='submit'
            form='feePolicyFilter'
            content='Tìm'
            icon={
              <MagnifyingGlassIcon
                size={16}
                weight='bold'
                aria-hidden
              />
            }
            className='w-full sm:w-auto'
          />
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Xoá lọc'
            onClick={handleReset}
            icon={
              <BroomIcon
                size={16}
                weight='bold'
                aria-hidden
              />
            }
            className='w-full sm:w-auto'
          />
        </div>
      </div>
    </div>
  )
}
