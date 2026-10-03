import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import {
  BENEFICIARY_TYPE_LABEL,
  FEE_SCOPE_LABEL,
  PAYER_TYPE_LABEL,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { describeFormula } from '@pages/fee-management/fee-config/utils/feeComponentSummary'
import type { FeePolicyConfiguration } from '@type/fee.type'
import { toReadoutComponent } from '../utils/toReadoutComponent'

interface ScopeComponentsCellProps {
  configuration: FeePolicyConfiguration | undefined
  feeScope: FeeScope
}

/**
 * Các thành phần của đúng một luồng phí, mỗi thành phần một dòng: tên, mức phí, rồi bên chịu
 * và bên hưởng. Đây là thứ người đối soát cần đọc ngay trên bảng mà không phải mở từng dòng.
 */
export const ScopeComponentsCell = ({
  configuration,
  feeScope
}: ScopeComponentsCellProps) => {
  const components = (configuration?.components ?? [])
    .map(toReadoutComponent)
    .filter((component) => component.feeScope === feeScope)

  if (components.length === 0) {
    return (
      <span className='text-xs text-muted-foreground'>
        Không có {FEE_SCOPE_LABEL[feeScope].toLowerCase()}
      </span>
    )
  }

  return (
    <ul className='flex flex-col gap-2'>
      {components.map((component) => (
        <li
          key={component.key}
          className='flex flex-col gap-0.5'
        >
          <span className='text-[13px] text-foreground'>
            <span className='font-semibold'>
              {getFeeLabel(component.componentType, COMPONENT_TYPE_LABELS)}
            </span>
            <span className='ml-2 tabular-nums'>{describeFormula(component)}</span>
          </span>
          <span className='text-xs text-muted-foreground'>
            {component.payerType === 'SYSTEM'
              ? BENEFICIARY_TYPE_LABEL.SYSTEM
              : (PAYER_TYPE_LABEL[component.payerType] ?? component.payerType)}{' '}
            →{' '}
            {BENEFICIARY_TYPE_LABEL[component.beneficiaryType] ??
              component.beneficiaryType}
          </span>
        </li>
      ))}
    </ul>
  )
}
