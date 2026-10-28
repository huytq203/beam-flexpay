import { ModalComponent } from '@components/index'
import { supportsBearerSplit } from '@utils/fee-execution'
import { useEffect, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  getBearerSideTitles,
  getOutputBeneficiaryOptions
} from '../constants/feeComponentParties'
import {
  getVatBaseForCategory,
  VAT_COMPONENT_TYPE,
  FEE_SCOPE,
  type FeeBusinessCategory,
  type FeeScope
} from '../constants/feeConfigFields'
import {
  DUPLICATE_FEE_COMPONENT_MESSAGE,
  usesTiers,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import {
  collectBaseTypes,
  summariseBaseType
} from '../utils/feeComponentSummary'
import {
  buildBaseTypeOptions,
  buildComponentTypeOptions,
  buildMethodOptions
} from '../utils/feeComponentFieldOptions'
import {
  allowsGrossAmountBase,
  getBaseOnOptions,
  GROSS_AMOUNT_BASE,
  isAmountBase
} from '../utils/feeComponentBaseOptions'
import { BOTH_BEARERS, SENDER_PAYER } from '../utils/bearerPairs'
import {
  buildDialogDefaults,
  getComponentPartyOptions
} from '../utils/feeComponentParties'
import { useFeeComponentFieldHandlers } from '../hooks/useFeeComponentFieldHandlers'
import { useFeeComponentForms } from '../hooks/useFeeComponentForms'
import { useFeeComponentSubmit } from '../hooks/useFeeComponentSubmit'
import { usePayerSelectOptions } from '../hooks/usePayerSelectOptions'
import { hasBaseOnBothSides } from '../utils/payerSelectOptions'
import { FeeComponentFields } from './FeeComponentFields'

interface FeeComponentDialogProps {
  open: boolean
  /** Bỏ trống là thêm mới. */
  initialValue: FeeComponentFormValues | null
  /** Thành phần người nhận đi cặp với `initialValue` khi cả hai bên cùng chịu. */
  initialPartner?: FeeComponentFormValues | null
  /** Các thành phần đứng trước — chỉ chúng làm cơ sở tính được. */
  precedingComponents: readonly FeeComponentFormValues[]
  /** Toàn bộ thành phần hiện có, dùng để kiểm tra trùng tổ hợp định danh. */
  existingComponents: readonly FeeComponentFormValues[]
  /** Luồng của thành phần đang thêm hoặc sửa; quyết định loại phí, người chịu và người hưởng được chọn. */
  feeScope: FeeScope
  businessCategory: FeeBusinessCategory
  /** Loại giao dịch của chính sách, dùng để suy người chịu phí mặc định. */
  serviceType: string
  /** Loại giao dịch gốc của bản gán phí hoàn; quyết định có cho chọn "Người nhận" không. */
  originalTransactionType?: string
  /** Một thành phần, hoặc hai (người chuyển rồi người nhận) khi cả hai bên cùng chịu. */
  onSave: (values: FeeComponentFormValues[]) => void
  onCancel: () => void
}

export const FeeComponentDialog = ({
  open,
  initialValue,
  initialPartner = null,
  precedingComponents,
  existingComponents,
  feeScope,
  businessCategory,
  serviceType,
  originalTransactionType,
  onSave,
  onCancel
}: FeeComponentDialogProps) => {
  const isInputCost = feeScope === FEE_SCOPE.INPUT_COST
  const bearerSplit =
    supportsBearerSplit(serviceType, originalTransactionType) && !isInputCost
  const parties = useMemo(
    () =>
      getComponentPartyOptions(
        isInputCost,
        serviceType,
        originalTransactionType
      ),
    [isInputCost, serviceType, originalTransactionType]
  )
  const { payerTypeOptions, beneficiaryTypeOptions, defaultBeneficiaryType } =
    parties
  const allowGrossAmount = allowsGrossAmountBase(serviceType, feeScope)

  /**
   * Dựng giá trị mặc định đúng một lần cho mỗi lần mở.
   *
   * Không dùng `values`: nó reset form mỗi khi tham chiếu đổi, mà `emptyComponent()`
   * sinh object mới sau mỗi render — đủ để React báo vượt độ sâu cập nhật.
   */
  const defaultValues = useMemo(
    () =>
      buildDialogDefaults({
        parties,
        feeScope,
        initialValue,
        hasPartner: Boolean(initialPartner),
        defaultBaseOn: allowGrossAmount ? GROSS_AMOUNT_BASE : undefined
      }),
    [allowGrossAmount, feeScope, initialPartner, initialValue, parties]
  )

  const { form, receiverForm } = useFeeComponentForms({
    existingComponents,
    initialValue,
    initialPartner,
    defaultValues,
    feeScope,
    defaultBeneficiaryType
  })
  const { control, setValue, trigger, formState } = form

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
  const tiered = usesTiers(calculationMethod)
  // VAT chỉ chọn "Cả hai bên" (mỗi bên một mức, lưu thành hai dòng) khi phí gốc có ở cả hai bên; các
  // phí phụ thuộc khác không tách.
  const canSplit =
    bearerSplit &&
    (isVat
      ? hasBaseOnBothSides(baseComponentType, precedingComponents)
      : isAmountBase(baseOn))
  const isBoth = payerType === BOTH_BEARERS

  const payerSelectOptions = usePayerSelectOptions({
    payerTypeOptions,
    canSplit,
    isVat,
    baseComponentType,
    precedingComponents,
    payerType,
    serviceType,
    siblings: existingComponents.filter(
      ({ key }) => key !== initialValue?.key && key !== initialPartner?.key
    ),
    editing: initialValue !== null,
    setValue
  })
  const vatBaseComponentType = getVatBaseForCategory(
    businessCategory,
    serviceType
  )
  const baseTypes = collectBaseTypes(
    precedingComponents,
    isBoth ? SENDER_PAYER : payerType
  )
  const hasPrecedingComponents = baseTypes.length > 0
  const hasVatBaseAbove = Boolean(
    vatBaseComponentType && baseTypes.includes(vatBaseComponentType)
  )

  const componentTypeOptions = buildComponentTypeOptions({
    businessCategory,
    serviceType,
    allowVat: hasVatBaseAbove || isVat,
    initialComponentType: initialValue?.componentType
  })

  const { handleComponentTypeChange, handleMethodChange, handlePayerChange } =
    useFeeComponentFieldHandlers({
      setValue,
      receiverSetValue: receiverForm.setValue,
      componentType,
      vatBaseAbove: hasVatBaseAbove ? vatBaseComponentType : null,
      isInputCost
    })

  const allowedBaseTypes = isVat
    ? baseTypes.filter((type) => type === vatBaseComponentType)
    : baseTypes

  const baseTypeOptions = buildBaseTypeOptions(
    allowedBaseTypes,
    precedingComponents,
    isBoth ? SENDER_PAYER : payerType
  )

  const selectedBase =
    baseOn === 'FEE_COMPONENT' && baseComponentType
      ? summariseBaseType(baseComponentType, precedingComponents, payerType)
      : null

  const methodOptions = buildMethodOptions(isVat)

  const baseOnOptions = getBaseOnOptions({
    isBank: isInputCost,
    isVat,
    hasPrecedingComponents,
    allowGrossAmount,
    savedBaseOn: initialValue?.baseOn
  })

  const submit = useFeeComponentSubmit({
    form,
    receiverForm,
    initialValue,
    initialPartner,
    existingComponents,
    onSave
  })

  return (
    <ModalComponent
      open={open}
      title={`${initialValue ? 'Sửa' : 'Thêm'} ${
        isInputCost ? 'phí đầu vào' : 'phí đầu ra'
      }`}
      okText={initialValue ? 'Lưu thành phần' : 'Thêm'}
      cancelText='Huỷ'
      // antd tự giới hạn về `calc(100vw - 32px)` ở màn hẹp, nên một số cố
      // định là đủ và tránh phụ thuộc thứ tự breakpoint của wrapper.
      // Hai bên cùng chịu đặt hai khối mức phí cạnh nhau nên cần rộng hơn.
      width={isBoth ? 1080 : 880}
      onOk={submit}
      onCancel={onCancel}
    >
      <div className='flex flex-col gap-3'>
        <FeeComponentFields
          control={control}
          componentTypeOptions={componentTypeOptions}
          baseOnOptions={baseOnOptions}
          baseTypeOptions={baseTypeOptions}
          methodOptions={methodOptions}
          payerTypeOptions={payerSelectOptions}
          beneficiaryTypeOptions={
            isInputCost
              ? beneficiaryTypeOptions
              : getOutputBeneficiaryOptions(componentType)
          }
          payerType={payerType}
          baseOn={baseOn}
          selectedBase={selectedBase}
          isVat={isVat}
          tiered={tiered}
          tierError={formState.errors.tiers?.message}
          onComponentTypeChange={handleComponentTypeChange}
          receiver={
            isBoth
              ? {
                  control: receiverForm.control,
                  tierError: receiverForm.formState.errors.tiers?.message,
                  titles: getBearerSideTitles(serviceType)
                }
              : undefined
          }
          onMethodChange={handleMethodChange}
          onPayerChange={handlePayerChange}
        />
      </div>
    </ModalComponent>
  )
}
