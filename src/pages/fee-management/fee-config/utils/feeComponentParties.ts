import {
  EXECUTABLE_BENEFICIARY,
  allowsReceiverPayer
} from '@utils/fee-execution'
import {
  BENEFICIARY_TYPE_OPTIONS,
  getOutputPayerOptions,
  INPUT_COST_BENEFICIARY_OPTIONS,
  PAYER_TYPE_LABEL,
  type FeeScope
} from '../constants/feeConfigFields'
import { outputBeneficiaryFor } from '../constants/feeComponentParties'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import { BOTH_BEARERS } from './bearerPairs'
import { emptyComponent } from './feeComponentDefaults'

interface PartyOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComponentPartyOptions {
  payerTypeOptions: PartyOption[]
  defaultPayerType: string
  beneficiaryTypeOptions: readonly PartyOption[]
  defaultBeneficiaryType: string
}

/**
 * Người chịu và người hưởng trên hộp thoại. Giá trị đầu tiên suy theo loại giao dịch chỉ là mặc
 * định; người vận hành vẫn đổi được sang mọi giá trị hợp lệ của luồng phí. Phí đầu vào luôn do
 * SYSTEM chịu và trả cho ngân hàng/đối tác, phí đầu ra không do SYSTEM chịu — khớp schema.
 * Phí hoàn không bày "Người nhận" khi loại giao dịch gốc không cho người nhận chịu.
 */
export const getComponentPartyOptions = (
  isInputCost: boolean,
  serviceType: string,
  originalTransactionType?: string | null
): ComponentPartyOptions => {
  if (isInputCost) {
    return {
      payerTypeOptions: [{ value: 'SYSTEM', label: PAYER_TYPE_LABEL.SYSTEM }],
      defaultPayerType: 'SYSTEM',
      beneficiaryTypeOptions: INPUT_COST_BENEFICIARY_OPTIONS,
      defaultBeneficiaryType: 'BANK'
    }
  }
  const payerTypeOptions = getOutputPayerOptions(serviceType).filter(
    ({ value }) =>
      value !== 'RECEIVER' ||
      allowsReceiverPayer(serviceType, originalTransactionType)
  )
  return {
    payerTypeOptions,
    defaultPayerType: payerTypeOptions[0].value,
    beneficiaryTypeOptions: BENEFICIARY_TYPE_OPTIONS,
    defaultBeneficiaryType: EXECUTABLE_BENEFICIARY
  }
}

interface DialogDefaultsInput {
  parties: ComponentPartyOptions
  feeScope: FeeScope
  initialValue: FeeComponentFormValues | null
  hasPartner: boolean
  /** Cơ sở tính của thành phần mới; bỏ trống là số tiền giao dịch. */
  defaultBaseOn?: string
}

/** Giá trị mở hộp thoại; payer/người hưởng cũ không còn hợp lệ thì về mặc định của luồng. */
export const buildDialogDefaults = ({
  parties,
  feeScope,
  initialValue,
  hasPartner,
  defaultBaseOn
}: DialogDefaultsInput): FeeComponentFormValues => {
  const {
    payerTypeOptions,
    defaultPayerType,
    beneficiaryTypeOptions,
    defaultBeneficiaryType
  } = parties
  if (!initialValue) {
    const component = emptyComponent(
      feeScope,
      defaultPayerType,
      defaultBeneficiaryType
    )
    return defaultBaseOn ? { ...component, baseOn: defaultBaseOn } : component
  }
  const hasAllowedPayer = payerTypeOptions.some(
    ({ value, disabled }) => !disabled && value === initialValue.payerType
  )
  const hasAllowedBeneficiary = beneficiaryTypeOptions.some(
    ({ value }) => value === initialValue.beneficiaryType
  )
  const payerType = hasAllowedPayer ? initialValue.payerType : defaultPayerType
  return {
    ...initialValue,
    feeScope,
    payerType: hasPartner ? BOTH_BEARERS : payerType,
    // Phí đầu ra: người hưởng suy theo loại phí (VAT → Ngân hàng), kể cả bản ghi cũ lưu khác.
    beneficiaryType:
      feeScope === 'OUTPUT_FEE'
        ? outputBeneficiaryFor(initialValue.componentType)
        : hasAllowedBeneficiary
          ? initialValue.beneficiaryType
          : defaultBeneficiaryType
  }
}
