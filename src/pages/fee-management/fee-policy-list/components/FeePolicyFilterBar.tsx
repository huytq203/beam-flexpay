import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, FeeServiceTypeTabs } from '@components/index'
import {
  PAYMENT_METHOD_LABELS,
  SERVICE_TYPE_LABELS
} from '@constants/feeLabels'
import {
  BACKEND_PAYMENT_METHODS,
  getPaymentMethodOptions,
  POLICY_KIND
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { FeePolicyPartyFilters } from './FeePolicyPartyFilters'
import { FeePolicyProviderFilter } from './FeePolicyProviderFilter'
import { POLICY_STATUS_FILTER_OPTIONS } from '../utils/policyStatusFilter'
import {
  FEE_SCREEN,
  FEE_SCREEN_CONFIG,
  visibleServiceTypesFor,
  type FeeScreen
} from '@pages/fee-management/fee-config/constants/feeScreen'
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

/** Màn ĐVCNTT: cùng giá trị gửi BE, chỉ đổi nhãn sang merchant. */
const MERCHANT_APPLIED_TARGET_OPTIONS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Theo nhóm merchant', value: 'CUSTOMER_GROUP' },
  { label: 'Merchant cụ thể', value: 'ACCOUNT' }
]

export interface FeePolicyFilterValues {
  keyword: string
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
  /**
   * Màn đang lọc: quyết định tab loại giao dịch nào hiện; màn Phí đầu vào còn ẩn bộ lọc đối tượng khách,
   * người chịu phí và bên chịu phí chuyển tiền.
   */
  screen?: FeeScreen
  serviceType: string | undefined
  values: FeePolicyFilterValues
  onServiceTypeChange: (serviceType: string | undefined) => void
  onSubmit: (values: FeePolicyFilterValues) => void
  onReset: () => void
}

/** Bộ lọc dùng chung cho cả hai luồng phí; loại giao dịch là Tất cả loại đã duyệt được. */
export const FeePolicyFilterBar = ({
  screen = FEE_SCREEN.CUSTOMER_FEE,
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
      values.validFrom,
      values.validTo
    ]
  )

  const { control, handleSubmit, reset } = useForm<FeePolicyFilterValues>({
    values: syncedValues
  })

  const inputCost =
    FEE_SCREEN_CONFIG[screen].policyKind === POLICY_KIND.INPUT_COST
  // Màn ĐVCNTT chỉ hiện hai loại merchant và không giữ loại ngoài đó dù URL có. Hai màn ví giữ nguyên
  // như trước: chỉ ẩn các loại tạm ẩn chung (loại đang chọn vẫn hiện), không ẩn thêm theo loại chính sách.
  const serviceTypeOptions =
    screen === FEE_SCREEN.MERCHANT_FEE
      ? visibleServiceTypesFor(screen, PUBLISHABLE_SERVICE_TYPES)
      : withoutHiddenServiceTypes(PUBLISHABLE_SERVICE_TYPES, serviceType)
  const labels = Object.fromEntries(
    serviceTypeOptions.map((value) => [
      value,
      SERVICE_TYPE_LABELS[value] ?? value
    ])
  )
  // Lọc theo LOẠI đối tượng, không theo từng phân khúc: người vận hành muốn
  // gom Tất cả chính sách cấu hình theo nhóm, tên nhóm cụ thể đã hiện ở cột.
  const appliedTargetOptions =
    screen === FEE_SCREEN.MERCHANT_FEE
      ? MERCHANT_APPLIED_TARGET_OPTIONS
      : APPLIED_TARGET_OPTIONS
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
        className='grid grid-cols-1 gap-3 border-t border-border pt-4 md:grid-cols-4 xl:grid-cols-5'
      >
        <FormInput
          name='keyword'
          control={control}
          label='Tên chính sách / Mã phí'
          placeholder='Nhập tên chính sách hoặc mã phí (FF...)'
          className='flex flex-col md:col-span-2 xl:col-span-3'
        />
        <FormSelect
          name='status'
          control={control}
          label='Trạng thái'
          placeholder='Tất cả trạng thái'
          allowClear
          options={POLICY_STATUS_FILTER_OPTIONS}
          className='flex flex-col'
        />
        {!inputCost && (
          <FormSelect
            name='appliedTarget'
            control={control}
            label='Đối tượng áp dụng'
            placeholder='Tất cả đối tượng'
            allowClear
            options={appliedTargetOptions}
            className='flex flex-col'
          />
        )}
        <FeePolicyProviderFilter control={control} />
        <FormSelect
          name='bankCode'
          control={control}
          label='Ngân hàng'
          placeholder='Tất cả ngân hàng'
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
          placeholder='Tất cả phương thức'
          allowClear
          options={paymentMethodOptions}
          className='flex flex-col'
        />
        <FeePolicyPartyFilters
          control={control}
          serviceType={serviceType}
          inputCost={inputCost}
          screen={screen}
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
            content='Tìm kiếm'
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
