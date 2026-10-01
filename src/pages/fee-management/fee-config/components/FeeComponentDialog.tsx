import { FeeDomain } from '@components/fee/feeDomain'
import { ModalComponent } from '@components/index'
import { COMPONENT_TYPE_LABELS } from '@constants/feeLabels'
import { zodResolver } from '@hookform/resolvers/zod'
import { EXECUTABLE_BENEFICIARY } from '@utils/fee-execution'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  BENEFICIARY_TYPE_OPTIONS,
  getComponentTypesForCategory,
  getPayerTypeOptions,
  getVatBaseForCategory,
  INPUT_COST_BENEFICIARY_OPTIONS,
  WALLET_FEE_BENEFICIARY_OPTIONS,
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
import { FeeComponentFields } from './FeeComponentFields'

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

const emptyComponent = (
  payerType: string,
  beneficiaryType: string
): FeeComponentFormValues => ({
  key: crypto.randomUUID(),
  componentType: '',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType,
  beneficiaryType,
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
  const isBank = feeDomain === FeeDomain.BANK
  const isWallet = feeDomain === FeeDomain.EWALLET
  // Khoản thu theo payer thực thi; SYSTEM là chi phí đầu vào riêng.
  const payerTypeOptions = useMemo(
    () => getPayerTypeOptions(serviceType),
    [serviceType]
  )
  // Component cũ mang payer chưa hỗ trợ (SENDER/RECEIVER) về giá trị này.
  const defaultPayerType = isBank ? 'SYSTEM' : payerTypeOptions[0].value
  // Bank/NCC mặc định là chi phí đầu vào; phí ví mặc định về SYSTEM.
  const defaultBeneficiaryType = isBank ? 'BANK' : EXECUTABLE_BENEFICIARY

  /**
   * Dựng giá trị mặc định đúng một lần cho mỗi lần mở.
   *
   * Không dùng `values`: nó reset form mỗi khi tham chiếu đổi, mà `emptyComponent()`
   * sinh object mới sau mỗi render — đủ để React báo vượt độ sâu cập nhật.
   */
  const defaultValues = useMemo(() => {
    if (!initialValue) {
      return emptyComponent(defaultPayerType, defaultBeneficiaryType)
    }

    const hasAllowedPayer = payerTypeOptions.some(
      ({ value }) => value === initialValue.payerType
    )
    const effectivePayer = hasAllowedPayer
      ? initialValue.payerType
      : defaultPayerType
    const allowedBeneficiaries =
      effectivePayer === 'SYSTEM'
        ? INPUT_COST_BENEFICIARY_OPTIONS
        : isWallet
          ? WALLET_FEE_BENEFICIARY_OPTIONS
          : BENEFICIARY_TYPE_OPTIONS
    const hasAllowedBeneficiary = allowedBeneficiaries.some(
      ({ value }) => value === initialValue.beneficiaryType
    )
    return {
      ...initialValue,
      payerType: effectivePayer,
      beneficiaryType: hasAllowedBeneficiary
        ? initialValue.beneficiaryType
        : defaultBeneficiaryType
    }
  }, [
    defaultBeneficiaryType,
    defaultPayerType,
    initialValue,
    isWallet,
    payerTypeOptions
  ])

  const componentSchema = useMemo(
    () => createFeeComponentFormSchema(existingComponents, initialValue?.key),
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
  const beneficiaryTypeOptions =
    payerType === 'SYSTEM'
      ? INPUT_COST_BENEFICIARY_OPTIONS
      : isWallet
        ? WALLET_FEE_BENEFICIARY_OPTIONS
        : BENEFICIARY_TYPE_OPTIONS
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
  const tiered = usesTiers(calculationMethod)
  const vatBaseComponentType = getVatBaseForCategory(businessCategory)

  const componentTypeOptions = getComponentTypesForCategory(
    businessCategory
  ).map((value) => ({
    value,
    label: COMPONENT_TYPE_LABELS[value] ?? value
  }))

  const baseTypes = collectBaseTypes(precedingComponents, payerType)
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
    const summary = summariseBaseType(type, precedingComponents, payerType)
    const detail = summary.isSum
      ? `tổng ${summary.formulas.length} thành phần`
      : summary.formulas[0]
    return { value: type, label: `${summary.label} — ${detail}` }
  })

  const selectedBase =
    baseOn === 'FEE_COMPONENT' && baseComponentType
      ? summariseBaseType(baseComponentType, precedingComponents, payerType)
      : null

  const methodOptions = (
    isVat ? [CalculationMethod.DIRECT] : CALCULATION_METHOD_VALUES
  ).map((value) => ({ value, label: CALCULATION_METHOD_LABEL[value] }))

  const baseOnOptions = getBaseOnOptions({
    isBank,
    isVat,
    hasPrecedingComponents
  })

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
        <FeeComponentFields
          control={control}
          componentTypeOptions={componentTypeOptions}
          baseOnOptions={baseOnOptions}
          baseTypeOptions={baseTypeOptions}
          methodOptions={methodOptions}
          payerTypeOptions={payerTypeOptions}
          beneficiaryTypeOptions={beneficiaryTypeOptions}
          beneficiaryDisabled={isWallet && payerType !== 'SYSTEM'}
          payerType={payerType}
          baseOn={baseOn}
          selectedBase={selectedBase}
          isVat={isVat}
          tiered={tiered}
          tierError={formState.errors.tiers?.message}
          onComponentTypeChange={handleComponentTypeChange}
          onPayerChange={(next) => {
            setValue('beneficiaryType', next === 'SYSTEM' ? 'BANK' : 'SYSTEM', {
              shouldValidate: true
            })
            setValue('baseComponentType', null, { shouldValidate: true })
          }}
        />
      </div>
    </ModalComponent>
  )
}
