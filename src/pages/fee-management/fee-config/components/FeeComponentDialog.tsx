import { FormInputNumber, FormSelect } from '@components/form'
import { FeeDomain } from '@components/fee/feeDomain'
import { WarningCircleIcon } from '@components/icons'
import { CardComponent, ModalComponent } from '@components/index'
import { COMPONENT_TYPE_LABELS } from '@constants/feeLabels'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  EXECUTABLE_BENEFICIARY,
  getExecutablePayer
} from '@utils/fee-execution'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  getComponentTypesForCategory,
  getVatBaseForCategory,
  PAYER_TYPE_LABEL,
  PAYER_TYPE_OPTIONS,
  VAT_COMPONENT_TYPE,
  type FeeBusinessCategory
} from '../constants/feeConfigFields'
import {
  CalculationMethod,
  createFeeComponentFormSchema,
  DUPLICATE_FEE_COMPONENT_MESSAGE,
  usesTiers,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import {
  CALCULATION_METHOD_LABEL,
  collectBaseTypes,
  summariseBaseType
} from '../utils/feeComponentSummary'
import { getBaseOnOptions } from '../utils/feeComponentBaseOptions'
import { BaseTypePreview } from './BaseTypePreview'
import { FeeTierEditor } from './FeeTierEditor'

interface FeeComponentDialogProps {
  open: boolean
  /** Bỏ trống là thêm mới. */
  initialValue: FeeComponentFormValues | null
  /** Các thành phần đứng trước — chỉ chúng làm cơ sở tính được. */
  precedingComponents: readonly FeeComponentFormValues[]
  /** Toàn bộ thành phần hiện có, dùng để kiểm tra trùng tổ hợp định danh. */
  existingComponents: readonly FeeComponentFormValues[]
  feeDomain: FeeDomain
  businessCategory: FeeBusinessCategory
  /** Loại giao dịch của chính sách, dùng để suy người chịu phí mặc định. */
  serviceType: string
  onSave: (value: FeeComponentFormValues) => void
  onCancel: () => void
}

const CALCULATION_METHOD_VALUES = [
  CalculationMethod.DIRECT,
  CalculationMethod.PROGRESSIVE_TIER,
  CalculationMethod.FLAT_TIER
]

const emptyComponent = (payerType: string): FeeComponentFormValues => ({
  key: crypto.randomUUID(),
  componentType: '',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType,
  beneficiaryType: EXECUTABLE_BENEFICIARY,
  fixedAmount: null,
  percentage: null,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: []
})

export const FeeComponentDialog = ({
  open,
  initialValue,
  precedingComponents,
  existingComponents,
  feeDomain,
  businessCategory,
  serviceType,
  onSave,
  onCancel
}: FeeComponentDialogProps) => {
  const executablePayer = getExecutablePayer(serviceType)

  /**
   * Dựng giá trị mặc định đúng một lần cho mỗi lần mở.
   *
   * Không dùng `values`: nó reset form mỗi khi tham chiếu đổi, mà `emptyComponent()`
   * sinh object mới sau mỗi render — đủ để React báo vượt độ sâu cập nhật.
   */
  const defaultValues = useMemo(
    () => initialValue ?? emptyComponent(executablePayer ?? 'USER'),
    [initialValue, executablePayer]
  )

  const componentSchema = useMemo(
    () =>
      createFeeComponentFormSchema(existingComponents, initialValue?.key),
    [existingComponents, initialValue?.key]
  )

  const { control, handleSubmit, setValue, trigger, formState } =
    useForm<FeeComponentFormValues>({
      resolver: zodResolver(componentSchema),
      defaultValues,
      mode: 'onTouched'
    })

  const componentType = useWatch({ control, name: 'componentType' })
  const baseOn = useWatch({ control, name: 'baseOn' })
  const baseComponentType = useWatch({ control, name: 'baseComponentType' })
  const calculationMethod = useWatch({ control, name: 'calculationMethod' })
  const payerType = useWatch({ control, name: 'payerType' })
  const beneficiaryType = useWatch({ control, name: 'beneficiaryType' })
  const hasDuplicateIdentityError = [
    formState.errors.componentType,
    formState.errors.payerType,
    formState.errors.beneficiaryType
  ].some((error) => error?.message === DUPLICATE_FEE_COMPONENT_MESSAGE)

  /**
   * Resolver kiểm tra trùng theo một tổ hợp ba trường. Sau lần submit đầu tiên,
   * đổi một trường phải kiểm tra lại cả nhóm để không giữ lỗi cũ trên hai ô
   * còn lại dù tổ hợp mới đã hợp lệ.
   */
  useEffect(() => {
    if (!hasDuplicateIdentityError) return

    void trigger(['componentType', 'payerType', 'beneficiaryType'])
  }, [
    beneficiaryType,
    componentType,
    hasDuplicateIdentityError,
    payerType,
    trigger
  ])

  const isVat = componentType === VAT_COMPONENT_TYPE
  const isBank = feeDomain === FeeDomain.BANK
  const tiered = usesTiers(calculationMethod)
  const vatBaseComponentType = getVatBaseForCategory(businessCategory)

  const componentTypeOptions = getComponentTypesForCategory(
    businessCategory
  ).map((value) => ({
    value,
    label: COMPONENT_TYPE_LABELS[value] ?? value
  }))

  const baseTypes = collectBaseTypes(precedingComponents)
  const hasPrecedingComponents = baseTypes.length > 0
  const hasVatBaseAbove = Boolean(
    vatBaseComponentType && baseTypes.includes(vatBaseComponentType)
  )

  /**
   * Thuế giá trị gia tăng luôn tính trên khoản phí gốc của nhóm. Khoá luôn ô cơ sở tính
   * thay vì để người dùng chọn rồi báo lỗi ở bước lưu.
   *
   * Chỉ trỏ sẵn sang phí giao dịch khi nó thật sự đứng phía trên. Gán một tham
   * chiếu tới thành phần chưa tồn tại chỉ tạo ra một ô hiển thị mã enum thô mà
   * người dùng không sửa được.
   */
  const handleComponentTypeChange = (next: string | number) => {
    if (next !== VAT_COMPONENT_TYPE) {
      if (componentType === VAT_COMPONENT_TYPE) {
        setValue('baseOn', 'AMOUNT', { shouldValidate: true })
        setValue('baseComponentType', null, { shouldValidate: true })
      }
      return
    }
    setValue('baseOn', 'FEE_COMPONENT', { shouldValidate: true })
    setValue(
      'baseComponentType',
      hasVatBaseAbove ? vatBaseComponentType : null,
      { shouldValidate: true }
    )
    setValue('calculationMethod', CalculationMethod.DIRECT)
    setValue('fixedAmount', null)
  }

  const allowedBaseTypes = isVat
    ? baseTypes.filter((type) => type === vatBaseComponentType)
    : baseTypes

  const baseTypeOptions = allowedBaseTypes.map((type) => {
    const summary = summariseBaseType(type, precedingComponents)
    const detail = summary.isSum
      ? `tổng ${summary.formulas.length} thành phần`
      : summary.formulas[0]
    return { value: type, label: `${summary.label} — ${detail}` }
  })

  const selectedBase =
    baseOn === 'FEE_COMPONENT' && baseComponentType
      ? summariseBaseType(baseComponentType, precedingComponents)
      : null

  const methodOptions = (
    isVat ? [CalculationMethod.DIRECT] : CALCULATION_METHOD_VALUES
  ).map((value) => ({ value, label: CALCULATION_METHOD_LABEL[value] }))

  const baseOnOptions = getBaseOnOptions({
    isBank,
    isVat,
    hasPrecedingComponents
  })

  const payerMismatch = Boolean(
    executablePayer && payerType && payerType !== executablePayer
  )

  return (
    <ModalComponent
      open={open}
      title={initialValue ? 'Sửa phí thành phần' : 'Thêm phí thành phần'}
      okText={initialValue ? 'Lưu thành phần' : 'Thêm'}
      cancelText='Huỷ'
      // antd tự giới hạn về `calc(100vw - 32px)` ở màn hẹp, nên một số cố
      // định là đủ và tránh phụ thuộc thứ tự breakpoint của wrapper.
      width={880}
      onOk={handleSubmit(onSave)}
      onCancel={onCancel}
    >
      <div className='flex flex-col gap-3'>
        <CardComponent
          size='small'
          // Nền modal là #fafafa nên card phải trắng đặc và viền theo hairline của
          // hệ thiết kế, nếu không các khối chìm vào nhau đúng như lúc chưa tách.
          className='border-border! bg-background!'
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
            <FormSelect
              name='componentType'
              control={control}
              required
              label='Loại phí'
              placeholder='Chọn loại phí'
              allowClear={false}
              options={componentTypeOptions}
              onChange={handleComponentTypeChange}
              className='col-span-12 flex flex-col md:col-span-6'
            />
            <FormSelect
              name='baseOn'
              control={control}
              required
              label='Tính dựa trên'
              placeholder='Chọn cơ sở tính'
              allowClear={false}
              disabled={isVat}
              // Luật thuế giá trị gia tăng thắng giới hạn của miền Bank: nó
              // tính trên một khoản phí, không tính trên số tiền giao dịch.
              // Thành phần thường chỉ được tính trên thành phần khác khi phía
              // trên thực sự đã có một thành phần để chọn làm cơ sở.
              options={baseOnOptions}
              className='col-span-12 flex flex-col md:col-span-6'
            />
            {isVat && (
              <p className='col-span-12 text-[13px] text-muted-foreground'>
                Thuế giá trị gia tăng luôn tính trên{' '}
                {vatBaseComponentType
                  ? COMPONENT_TYPE_LABELS[vatBaseComponentType]?.toLowerCase()
                  : 'khoản phí gốc'}
                , không tính trực tiếp trên số tiền giao dịch.
                {!hasVatBaseAbove &&
                  ' Thêm khoản phí gốc phía trên trước đã.'}
              </p>
            )}
            {baseOn === 'FEE_COMPONENT' && (
              <FormSelect
                name='baseComponentType'
                control={control}
                required
                label='Thành phần làm cơ sở'
                placeholder={
                  baseTypeOptions.length === 0
                    ? 'Chưa có thành phần nào đứng trước'
                    : 'Chọn thành phần'
                }
                allowClear={false}
                options={baseTypeOptions}
                className='col-span-12 flex flex-col'
              />
            )}
            {selectedBase && (
              <div className='col-span-12'>
                <BaseTypePreview summary={selectedBase} />
              </div>
            )}
            <FormSelect
              name='calculationMethod'
              control={control}
              required
              label='Phương thức tính'
              placeholder='Chọn phương thức'
              allowClear={false}
              options={methodOptions}
              className='col-span-12 flex flex-col'
            />
          
          </div>
        </CardComponent>

        <CardComponent
          size='small'
          className='border-border! bg-background!'
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
            <FormSelect
              name='payerType'
              control={control}
              required
              label='Người chịu'
              placeholder='Chọn người chịu phí'
              allowClear={false}
              options={[...PAYER_TYPE_OPTIONS]}
              className='col-span-12 flex flex-col md:col-span-6'
            />
            <FormSelect
              name='beneficiaryType'
              control={control}
              required
              label='Người hưởng'
              allowClear={false}
              disabled
              options={[
                {
                  value: EXECUTABLE_BENEFICIARY,
                  label: 'Hệ thống FlexPay'
                }
              ]}
              className='col-span-12 flex flex-col md:col-span-6'
            />
            {payerMismatch && executablePayer && (
              <p className='col-span-12 flex items-start gap-2 text-[13px] font-medium text-warning-strong'>
                <WarningCircleIcon
                  size={16}
                  weight='bold'
                  aria-hidden
                  className='mt-0.5 shrink-0'
                />
                Loại giao dịch này chỉ thu được từ{' '}
                {PAYER_TYPE_LABEL[executablePayer]}. Chọn khác đi thì bước duyệt
                sẽ từ chối chính sách.
              </p>
            )}
            {isBank && (
              <p className='col-span-12 text-[13px] text-muted-foreground'>
                Miền Bank chưa đặt được người chịu và người hưởng là ngân hàng:
                danh mục người chịu của dịch vụ phí không có giá trị ngân hàng,
                và người hưởng khác hệ thống bị chặn ở bước duyệt.
              </p>
            )}
          </div>
        </CardComponent>

        <CardComponent
          size='small'
          className='border-border! bg-background!'
          title='Mức phí'
        >
          {tiered ? (
            <FeeTierEditor
              control={control}
              error={formState.errors.tiers?.message}
            />
          ) : (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
              <FormInputNumber
                name='percentage'
                control={control}
                allowEmpty
                label='Phí %'
                placeholder='Để trống nếu không thu theo phần trăm'
                className='col-span-12 flex flex-col md:col-span-6'
              />
              {!isVat && (
                <FormInputNumber
                  name='fixedAmount'
                  control={control}
                  allowEmpty
                  label='Phí cố định (VNĐ)'
                  placeholder='Để trống nếu không thu phí cố định'
                  className='col-span-12 flex flex-col md:col-span-6'
                />
              )}
            </div>
          )}
        </CardComponent>

        <CardComponent
          size='small'
          className='border-border! bg-background!'
          title='Giới hạn'
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
            <FormInputNumber
              name='minFee'
              control={control}
              allowEmpty
              label='Phí tối thiểu (VNĐ)'
              placeholder='Để trống nếu không đặt sàn'
              className='col-span-12 flex flex-col md:col-span-6'
            />
            <FormInputNumber
              name='maxFee'
              control={control}
              allowEmpty
              label='Phí tối đa (VNĐ)'
              placeholder='Để trống nếu không đặt trần'
              className='col-span-12 flex flex-col md:col-span-6'
            />
          </div>
        </CardComponent>
      </div>
    </ModalComponent>
  )
}
