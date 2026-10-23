import { FormSelect } from '@components/form'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useGetPaymentPartnersQuery } from '@services/apiFeePaymentPartner'
import { useEffect } from 'react'
import type { Control } from 'react-hook-form'
import { useController, useWatch } from 'react-hook-form'
import {
  allowsBankCriteria,
  allowsProviderCriteria,
  getPaymentMethodOptions
} from '../constants/feeConfigFields'
import { toProviderOptions } from '../constants/feeProvider'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { SectionHeading } from './SectionHeading'

interface InputCostRouteSectionProps {
  control: Control<FeeConfigFormValues>
  readOnly?: boolean
}

/**
 * Tuyến thanh toán mà chính sách phí đầu vào áp dụng.
 *
 * Giá đối tác ký chung cho cả tuyến nên chỉ có bốn tiêu chí: NCC, Ngân hàng, phương
 * thức và loại giao dịch (chọn ở phần thông tin chung). Không có merchant, ví, nhóm khách, loại
 * thẻ hay loại giao dịch gốc: backend từ chối các tiêu chí đó trên chính sách phí đầu vào.
 * Ô để trống nghĩa là mọi giá trị.
 */
export const InputCostRouteSection = ({
  control,
  readOnly = false
}: InputCostRouteSectionProps) => {
  const serviceType = useWatch({ control, name: 'serviceType' })
  const { field: paymentMethodField } = useController({
    control,
    name: 'paymentMethod'
  })
  const showProvider = allowsProviderCriteria(serviceType)
  const showBank = allowsBankCriteria(serviceType)
  const paymentMethodOptions = getPaymentMethodOptions(serviceType)

  useEffect(() => {
    if (readOnly) return
    // Ô trống nghĩa là mọi phương thức; chỉ dọn giá trị của loại giao dịch cũ không còn hợp lệ.
    const isCurrentValueAllowed =
      paymentMethodField.value === '' ||
      paymentMethodOptions.some(
        (option) => option.value === paymentMethodField.value
      )
    if (!isCurrentValueAllowed) paymentMethodField.onChange('')
  }, [paymentMethodField, paymentMethodOptions, readOnly])

  // `PaginationRequest` của service phí chặn size trên 100; gửi hơn là ăn 400.
  const { data: bankData } = useGetBankQuery({ page: 1, size: 100 })
  const { data: partners } = useGetPaymentPartnersQuery(undefined, {
    skip: !showProvider
  })
  const bankOptions = (bankData?.content ?? []).map((bank) => ({
    value: bank.code,
    label: `${bank.name} (${bank.code})`
  }))

  const colSpan = showProvider ? 'md:col-span-4' : 'md:col-span-6'

  return (
    <section>
      <SectionHeading>Tuyến thanh toán</SectionHeading>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
        {showProvider && (
          <FormSelect
            name='providerCode'
            control={control}
            label='Nhà cung cấp (NCC)'
            placeholder='Tất cả NCC'
            allowClear
            showSearch
            optionFilterProp='label'
            options={toProviderOptions(partners)}
            disabled={readOnly}
            className={`col-span-12 flex flex-col ${colSpan}`}
          />
        )}
        {showBank && (
          <FormSelect
            name='bankCode'
            control={control}
            label='Ngân hàng'
            placeholder='Tất cả ngân hàng'
            allowClear
            showSearch
            optionFilterProp='label'
            options={bankOptions}
            disabled={readOnly}
            className={`col-span-12 flex flex-col ${colSpan}`}
          />
        )}
        <FormSelect
          name='paymentMethod'
          control={control}
          label='Phương thức thanh toán'
          placeholder='Tất cả phương thức'
          allowClear
          options={[...paymentMethodOptions]}
          disabled={readOnly}
          className={`col-span-12 flex flex-col ${colSpan}`}
        />
      </div>
    </section>
  )
}
