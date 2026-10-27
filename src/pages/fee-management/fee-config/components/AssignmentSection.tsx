import { FormSelect } from '@components/form'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useGetPaymentPartnersQuery } from '@services/apiFeePaymentPartner'
import { useGetCustomerSegmentsQuery } from '@services/apiCustomerSegment'
import { useEffect } from 'react'
import type { Control } from 'react-hook-form'
import { useController, useWatch } from 'react-hook-form'
import {
  allowsBankCriteria,
  allowsProviderCriteria,
  getAssignmentScopeOptions,
  getPaymentMethodOptions,
  getFormFieldRules,
  isMerchantAssignmentFlow
} from '../constants/feeConfigFields'
import {
  ORIGINAL_TYPE_OPTIONS,
  allowsOriginalTypeCriteria
} from '../constants/feeRefundOriginalType'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { MerchantPickerField } from './MerchantPickerField'
import { UserPickerField } from './UserPickerField'
import { SectionHeading } from './SectionHeading'

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
  const { field: merchantField } = useController({
    control,
    name: 'merchantId'
  })
  const rules = getFormFieldRules(feeDomain, serviceType)
  // Thu hộ / chi hộ chọn phạm vi theo merchant; miền Bank cũ giữ ô Merchant đứng riêng.
  const merchantFlow = isMerchantAssignmentFlow(feeDomain, serviceType)
  const showProvider = allowsProviderCriteria(serviceType)
  const showBank = allowsBankCriteria(serviceType)
  const showOriginalType = allowsOriginalTypeCriteria(serviceType)
  // Báo giá hoàn tiền không nêu phương thức thanh toán nên bản gán có phương thức sẽ không bao giờ khớp;
  // ẩn ô thay vì để một danh sách rỗng. Giá trị cũ (nếu có) đã được hiệu ứng dọn bên dưới xoá về rỗng.
  const showPaymentMethod = !showOriginalType
  // Chuyển ví chỉ có hai ô (phương thức, đối tượng); nạp/rút ví có thêm NCC nên đủ bốn ô một hàng.
  const isInternalTransfer = serviceType === 'EWALLET_TRANSFER_INTERNAL'
  // Phí hoàn tiền ẩn ô phương thức nên còn đúng bốn ô (NCC, loại giao dịch gốc, ngân hàng, đối tượng): một hàng.
  const colSpan = showProvider
    ? 'md:col-span-3'
    : isInternalTransfer
      ? 'md:col-span-6'
      : 'md:col-span-4'
  const paymentMethodOptions = getPaymentMethodOptions(serviceType)

  useEffect(() => {
    if (readOnly) return
    // Chuyển ví chỉ có một phương thức (ví điện tử) nên điền sẵn, khỏi bắt người vận hành chọn.
    if (isInternalTransfer && paymentMethodField.value === '') {
      paymentMethodField.onChange(paymentMethodOptions[0]?.value ?? '')
      return
    }
    // Ô trống nghĩa là mọi phương thức; chỉ dọn giá trị của loại giao dịch cũ không còn hợp lệ.
    const isCurrentValueAllowed =
      paymentMethodField.value === '' ||
      paymentMethodOptions.some(
        (option) => option.value === paymentMethodField.value
      )
    if (!isCurrentValueAllowed) {
      paymentMethodField.onChange('')
    }
  }, [paymentMethodField, paymentMethodOptions, readOnly, isInternalTransfer])

  // `PaginationRequest` của service phí chặn size trên 100; gửi hơn là ăn 400.
  const { data: bankData } = useGetBankQuery({ page: 1, size: 100 })
  const scope = scopeField.value
  const canScope = rules.showSegment || rules.showSubject

  /**
   * Ba phạm vi loại trừ nhau, nên đổi phạm vi phải xoá tiêu chí của phạm vi cũ ngay. Để lại
   * giá trị cũ là gửi lên backend một tiêu chí mà màn hình không còn hiện ô nào để sửa.
   *
   * `FormSelect` đã tự ghi giá trị vào form trước khi gọi hàm này, nên ở đây chỉ dọn dẹp.
   * Luồng merchant chọn "Merchant cụ thể" qua `merchantId`, nên đổi phạm vi thì xoá ô đó thay
   * cho ô cá nhân.
   */
  const handleScopeChange = (next: string | number) => {
    if (next !== 'SEGMENT') segmentField.onChange('')
    if (next !== 'SUBJECT') {
      subjectField.onChange('')
      if (merchantFlow) merchantField.onChange('')
    }
  }

  // Danh mục phân khúc nhỏ và hiếm đổi nên lấy trọn, không phân trang.
  const { data: segments } = useGetCustomerSegmentsQuery(undefined, {
    skip: !rules.showSegment || scope !== 'SEGMENT'
  })
  const segmentOptions = (segments ?? []).map((segment) => ({
    value: segment.code,
    label: segment.name ? `${segment.name} (${segment.code})` : segment.code
  }))

  // Ô NCC chỉ liệt kê cổng trung gian (provider, không phải issuer); VCB/VPB là ngân hàng trực tiếp
  // và backend từ chối chúng ở đây. NCC INACTIVE vẫn được chọn để cấu hình trước khi go-live.
  const { data: partners } = useGetPaymentPartnersQuery(undefined, {
    skip: !showProvider
  })
  const providerOptions = (partners ?? [])
    .filter((partner) => partner.provider && !partner.issuer)
    .map((partner) => ({
      value: partner.code,
      label:
        partner.status === 'INACTIVE'
          ? `${partner.name} (${partner.code}) · chưa kích hoạt`
          : `${partner.name} (${partner.code})`
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
        {showProvider && (
          <FormSelect
            name='providerCode'
            control={control}
            label='Nhà cung cấp  '
            placeholder='Tất cả NCC'
            showSearch
            optionFilterProp='label'
            options={providerOptions}
            disabled={readOnly}
            className={`col-span-12 flex flex-col ${colSpan}`}
          />
        )}
        {showOriginalType && (
          <FormSelect
            name='originalTransactionType'
            control={control}
            label={'Loại giao dịch gốc'}
            placeholder='Tất cả giao dịch'
            allowClear
            options={[...ORIGINAL_TYPE_OPTIONS]}
            disabled={readOnly}
            className={`col-span-12 flex flex-col ${colSpan}`}
          />
        )}
        {showBank && (
          <FormSelect
            name='bankCode'
            control={control}
            required={rules.bankRequired}
            label={
              serviceType !== 'EWALLET_REFUND' && showProvider
                ? 'Ngân hàng'
                : 'Ngân hàng'
            }
            placeholder={
              rules.bankRequired ? 'Chọn ngân hàng' : 'Tất cả ngân hàng'
            }
            showSearch
            optionFilterProp='label'
            options={bankOptions}
            disabled={readOnly}
            className={`col-span-12 flex flex-col ${colSpan}`}
          />
        )}
        {showPaymentMethod && (
          <FormSelect
            name='paymentMethod'
            control={control}
            label='Phương thức giao dịch'
            placeholder='Tất cả phương thức'
            options={[...paymentMethodOptions]}
            allowClear={!isInternalTransfer}
            disabled={readOnly || isInternalTransfer}
            className={`col-span-12 flex flex-col ${colSpan}`}
          />
        )}
        {rules.showMerchant && !merchantFlow && (
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
            options={[...getAssignmentScopeOptions(serviceType)]}
            onChange={handleScopeChange}
            disabled={readOnly}
            className={`col-span-12 flex flex-col ${colSpan}`}
          />
        )}
        {canScope && rules.showSegment && scope === 'SEGMENT' && (
          <FormSelect
            name='customerGroup'
            control={control}
            required
            label={merchantFlow ? 'Nhóm merchant' : 'Nhóm khách hàng'}
            placeholder={
              merchantFlow ? 'Chọn nhóm merchant' : 'Chọn nhóm khách hàng'
            }
            showSearch
            optionFilterProp='label'
            options={segmentOptions}
            disabled={readOnly}
            className={`col-span-12 flex flex-col ${colSpan}`}
          />
        )}
        {canScope && rules.showSubject && scope === 'SUBJECT' && (
          <UserPickerField
            control={control}
            readOnly={readOnly}
            className='col-span-12 flex flex-col'
          />
        )}
        {merchantFlow && scope === 'SUBJECT' && (
          <MerchantPickerField
            control={control}
            readOnly={readOnly}
            required
            className='col-span-12 flex flex-col'
          />
        )}
      </div>
      {merchantFlow && (
        <p className='mt-2 text-[13px] text-muted-foreground'>
          Khi nhiều chính sách cùng áp dụng cho một giao dịch: Merchant cụ thể
          được ưu tiên hơn Nhóm merchant, và Nhóm merchant được ưu tiên hơn Tất
          cả merchant.
        </p>
      )}
    </section>
  )
}
