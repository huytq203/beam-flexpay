import { resolveFeeScope } from '@pages/fee-management/fee-config/constants/feeConfigFields'
import type { FeeComponentFormValues } from '@pages/fee-management/fee-config/schemas/feeConfig.schema'
import type { FeePolicyComponentWithTiers } from '@type/fee.type'

/**
 * Dữ liệu thành phần từ API sang dạng form chỉ đọc, dùng chung cho cột tóm tắt và dòng mở
 * rộng để hai chỗ không mô tả cùng một thành phần theo hai kiểu.
 */
export const toReadoutComponent = (
  component: FeePolicyComponentWithTiers
): FeeComponentFormValues => ({
  key: component.id,
  feeScope: resolveFeeScope(component.feeScope, component.payerType),
  componentType: component.componentType,
  baseOn: component.baseOn,
  baseComponentType: component.baseComponentType,
  calculationMethod: component.calculationMethod,
  payerType: component.payerType,
  beneficiaryType: component.beneficiaryType,
  fixedAmount: component.fixedAmount || null,
  percentage: component.percentage || null,
  minFee: component.minFee || null,
  maxFee: component.maxFee || null,
  roundMode: component.roundMode,
  tiers: component.tiers.map((tier) => ({
    maxValue: tier.maxValue ?? null,
    fixedAmount: tier.fixedAmount || null,
    percentage: tier.percentage || null,
    minFee: tier.minFee || null,
    maxFee: tier.maxFee || null
  }))
})
