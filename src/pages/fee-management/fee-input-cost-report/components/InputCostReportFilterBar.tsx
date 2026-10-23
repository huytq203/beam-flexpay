import { FormDatePicker, FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import {
  PAYMENT_METHOD_LABELS,
  SERVICE_TYPE_LABELS
} from '@constants/feeLabels'
import { BACKEND_PAYMENT_METHODS } from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { toProviderOptions } from '@pages/fee-management/fee-config/constants/feeProvider'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useGetPaymentPartnersQuery } from '@services/apiFeePartner'
import { useForm } from 'react-hook-form'
import {
  inputCostReportFilterSchema,
  type InputCostReportFilters
} from '@/app/schemas/fee-input-cost-report.schema'
import { defaultReportFilters, dateOnly } from '../utils/reportFilters'

const SERVICE_OPTIONS = ['EWALLET_DEPOSIT', 'EWALLET_WITHDRAWAL'].map(
  (value) => ({ value, label: SERVICE_TYPE_LABELS[value] ?? value })
)

const PAYMENT_METHOD_OPTIONS = BACKEND_PAYMENT_METHODS.map((value) => ({
  value,
  label: PAYMENT_METHOD_LABELS[value] ?? value
}))

interface Props {
  onSubmit: (filters: InputCostReportFilters) => void
}

/** Thanh lọc: chỉ áp dụng khi hợp lệ (Từ ngày ≤ Đến ngày, tối đa 366 ngày), nên truy vấn không chạy với dữ liệu sai. */
export const InputCostReportFilterBar = ({ onSubmit }: Props) => {
  const { control, handleSubmit, reset, setError } = useForm<
    Record<keyof InputCostReportFilters, string>
  >({ defaultValues: { ...defaultReportFilters(), providerCode: '', bankCode: '', serviceType: '', paymentMethod: '' } })
  const { data: partners, isFetching: isFetchingPartners } =
    useGetPaymentPartnersQuery()
  const { data: bankData, isFetching: isFetchingBanks } = useGetBankQuery({
    page: 1,
    size: 100
  })
  const bankOptions = (bankData?.content ?? []).map((bank) => ({
    value: bank.code,
    label: `${bank.name} (${bank.code})`
  }))

  const submit = handleSubmit((values) => {
    const candidate = {
      ...values,
      from: dateOnly(values.from),
      to: dateOnly(values.to)
    }
    const parsed = inputCostReportFilterSchema.safeParse(candidate)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] === 'from' ? 'from' : 'to'
        setError(field, { type: 'validate', message: issue.message })
      })
      return
    }
    onSubmit(parsed.data)
  })

  const handleReset = () => {
    const defaults = defaultReportFilters()
    reset({
      ...defaults,
      providerCode: '',
      bankCode: '',
      serviceType: '',
      paymentMethod: ''
    })
    onSubmit({ ...defaults })
  }

  return (
    <form
      id='inputCostReportFilter'
      onSubmit={submit}
      className='space-y-4'
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6'>
        <FormDatePicker
          name='from'
          control={control}
          label='Từ ngày'
          required
          placeholder='Chọn ngày bắt đầu'
          className='flex flex-col'
        />
        <FormDatePicker
          name='to'
          control={control}
          label='Đến ngày'
          required
          placeholder='Chọn ngày kết thúc'
          className='flex flex-col'
        />
        <FormSelect
          name='providerCode'
          control={control}
          label='Nhà cung cấp'
          placeholder='Tất cả nhà cung cấp'
          allowClear
          showSearch
          optionFilterProp='label'
          loading={isFetchingPartners}
          options={toProviderOptions(partners)}
          className='flex flex-col'
        />
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
          name='serviceType'
          control={control}
          label='Dịch vụ'
          placeholder='Tất cả dịch vụ'
          allowClear
          options={SERVICE_OPTIONS}
          className='flex flex-col'
        />
        <FormSelect
          name='paymentMethod'
          control={control}
          label='Phương thức'
          placeholder='Tất cả phương thức'
          allowClear
          options={PAYMENT_METHOD_OPTIONS}
          className='flex flex-col'
        />
      </div>
      <div className='flex flex-col-reverse justify-end gap-2 sm:flex-row'>
        <ButtonComponent
          htmlType='submit'
          form='inputCostReportFilter'
          content='Xem báo cáo'
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
    </form>
  )
}
