import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import {
  BENEFICIARY_TYPE_LABEL,
  FEE_SCOPE_LABEL,
  PAYER_TYPE_LABEL,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { describeFormula } from '@pages/fee-management/fee-config/utils/feeComponentSummary'
import type { FeePolicyConfiguration } from '@type/fee.type'
import { groupReadoutComponents } from '../utils/groupReadoutComponents'
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
      {groupReadoutComponents(components).map((group) => (
        <li
          key={group.key}
          className='flex flex-col gap-0.5'
        >
          <span className='text-[13px] font-semibold text-foreground'>
            {getFeeLabel(group.componentType, COMPONENT_TYPE_LABELS)}
          </span>
          {group.members.map((component) => (
            <span
              key={component.key}
              className='text-xs text-muted-foreground'
            >
              <span className='text-[13px] tabular-nums text-foreground'>
                {describeFormula(component)}
              </span>
              <span className='ml-2'>
                {component.payerType === 'SYSTEM'
                  ? BENEFICIARY_TYPE_LABEL.SYSTEM
                  : (PAYER_TYPE_LABEL[component.payerType] ??
                    component.payerType)}{' '}
                →{' '}
                {BENEFICIARY_TYPE_LABEL[component.beneficiaryType] ??
                  component.beneficiaryType}
              </span>
            </span>
          ))}
        </li>
      ))}
    </ul>
  )
}
