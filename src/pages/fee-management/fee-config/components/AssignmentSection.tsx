import { FormLabelHint, FormSelect } from '@components/form'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useGetCustomerSegmentsQuery } from '@services/apiCustomerSegment'
import { useEffect } from 'react'
import type { Control } from 'react-hook-form'
import { useController, useWatch } from 'react-hook-form'
import {
  ASSIGNMENT_SCOPE_OPTIONS,
  getPaymentMethodOptions,
  getFormFieldRules
} from '../constants/feeConfigFields'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { MerchantPickerField } from './MerchantPickerField'
import { UserPickerField } from './UserPickerField'
import { SectionHeading } from './SectionHeading'

const REFUND_BANK_HINT =
  'Mã ngân hàng chỉ khớp hoàn tiền về ngân hàng. Hoàn về ví không có mã ngân hàng, nên cần có một bản gán mặc định không ghi ngân hàng.'

interface AssignmentSectionProps {
  control: Control<FeeConfigFormValues>
  readOnly?: boolean
}

/**
 * Tiêu chí khớp lệnh của bản gán.
 *
 * Ô để trống mang nghĩa "áp cho tất cả", nên placeholder phải nói ra điều đó —
 * người vận hành đọc ô rỗng là "chưa điền" chứ không phải "mọi ngân hàng".
 */
export const AssignmentSection = ({
  control,
  readOnly = false
}: AssignmentSectionProps) => {
  const feeDomain = useWatch({ control, name: 'feeDomain' })
  const serviceType = useWatch({ control, name: 'serviceType' })
  const { field: paymentMethodField } = useController({
    control,
    name: 'paymentMethod'
  })
  const { field: scopeField } = useController({
    control,
    name: 'assignmentScope'
  })
  const { field: segmentField } = useController({
    control,
    name: 'customerGroup'
  })
  const { field: subjectField } = useController({ control, name: 'subjectId' })
  const rules = getFormFieldRules(feeDomain, serviceType)
  const paymentMethodOptions = getPaymentMethodOptions(serviceType)

  useEffect(() => {
    if (readOnly) return
    // Ô trống nghĩa là mọi phương thức; chỉ dọn giá trị của loại giao dịch cũ không còn hợp lệ.
    const isCurrentValueAllowed =
      paymentMethodField.value === '' ||
      paymentMethodOptions.some(
        (option) => option.value === paymentMethodField.value
      )
    if (!isCurrentValueAllowed) {
      paymentMethodField.onChange('')
    }
  }, [paymentMethodField, paymentMethodOptions, readOnly])

  // `PaginationRequest` của service phí chặn size trên 100; gửi hơn là ăn 400.
  const { data: bankData } = useGetBankQuery({ page: 1, size: 100 })

  const scope = scopeField.value
  const canScope = rules.showSegment || rules.showSubject

  /**
   * Ba phạm vi loại trừ nhau, nên đổi phạm vi phải xoá tiêu chí của phạm vi cũ ngay. Để lại
   * giá trị cũ là gửi lên backend một tiêu chí mà màn hình không còn hiện ô nào để sửa.
   *
   * `FormSelect` đã tự ghi giá trị vào form trước khi gọi hàm này, nên ở đây chỉ dọn dẹp.
   */
  const handleScopeChange = (next: string | number) => {
    if (next !== 'SEGMENT') segmentField.onChange('')
    if (next !== 'SUBJECT') subjectField.onChange('')
  }

  // Danh mục phân khúc nhỏ và hiếm đổi nên lấy trọn, không phân trang.
  const { data: segments } = useGetCustomerSegmentsQuery(undefined, {
    skip: !rules.showSegment || scope !== 'SEGMENT'
  })
  const segmentOptions = (segments ?? []).map((segment) => ({
    value: segment.code,
    label: segment.name ? `${segment.name} (${segment.code})` : segment.code
  }))

  const bankOptions = (bankData?.content ?? []).map((bank) => ({
    value: bank.code,
    label: `${bank.name} (${bank.code})`
  }))

  return (
    <section>
      <SectionHeading hint='Bỏ trống một tiêu chí nghĩa là chính sách áp cho mọi giá trị của tiêu chí đó.'>
        Gán đối tượng
      </SectionHeading>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
        <FormSelect
          name='bankCode'
          control={control}
          required={rules.bankRequired}
          label={
            serviceType === 'EWALLET_REFUND' ? (
              <FormLabelHint
                label='Ngân hàng'
                hint={REFUND_BANK_HINT}
              />
            ) : (
              'Ngân hàng'
            )
          }
          placeholder={rules.bankRequired ? 'Chọn ngân hàng' : 'Mọi ngân hàng'}
          showSearch
          optionFilterProp='label'
          options={bankOptions}
          disabled={readOnly}
          className='col-span-12 flex flex-col md:col-span-4'
        />
        <FormSelect
          name='paymentMethod'
          control={control}
          label='Phương thức giao dịch'
          placeholder='Tất cả phương thức'
          options={[...paymentMethodOptions]}
          disabled={readOnly}
          className='col-span-12 flex flex-col md:col-span-4'
        />
        {rules.showMerchant && (
          <MerchantPickerField
            control={control}
            readOnly={readOnly}
            className='col-span-12 flex flex-col '
          />
        )}
        {canScope && (
          <FormSelect
            name='assignmentScope'
            control={control}
            required
            label='Đối tượng áp dụng'
            placeholder='Chọn đối tượng áp dụng'
            allowClear={false}
            options={[...ASSIGNMENT_SCOPE_OPTIONS]}
            onChange={handleScopeChange}
            disabled={readOnly}
            className='col-span-12 flex flex-col md:col-span-4'
          />
        )}
        {canScope && rules.showSegment && scope === 'SEGMENT' && (
          <FormSelect
            name='customerGroup'
            control={control}
            required
            label='Nhóm khách hàng'
            placeholder='Chọn nhóm khách hàng'
            showSearch
            optionFilterProp='label'
            options={segmentOptions}
            disabled={readOnly}
            className='col-span-12 flex flex-col md:col-span-4'
          />
        )}
        {canScope && rules.showSubject && scope === 'SUBJECT' && (
          <UserPickerField
            control={control}
            readOnly={readOnly}
            className='col-span-12 flex flex-col'
          />
        )}
      </div>
    </section>
  )
}
