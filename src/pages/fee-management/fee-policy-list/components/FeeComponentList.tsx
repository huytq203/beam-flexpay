import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import {
  FEE_SCOPE_LABEL,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { FeeComponentReadout } from '@pages/fee-management/fee-config/components/FeeComponentReadout'
import { SectionHeading } from '@pages/fee-management/fee-config/components/SectionHeading'
import type { FeeComponentFormValues } from '@pages/fee-management/fee-config/schemas/feeConfig.schema'
import { buildFeeBasis } from '../utils/feeBasis'
import { groupReadoutComponents } from '../utils/groupReadoutComponents'
import { FeeBasisFormula } from './FeeBasisFormula'
import { FeeComponentGroupReadout } from './FeeComponentGroupReadout'

interface FeeComponentListProps {
  components: FeeComponentFormValues[]
  feeScope: FeeScope
  /** Ghép vào id neo của thẻ vì nhiều dòng chính sách có thể cùng mở trên một màn. */
  policyId: string
  /** Loại giao dịch của chính sách; quyết định nhãn bên chịu phí. */
  serviceType?: string
}

/** Chỉ các thành phần của luồng đang xem, để đối soát từng luồng riêng. */
export const FeeComponentList = ({
  components,
  feeScope,
  policyId,
  serviceType
}: FeeComponentListProps) => {
  const scoped = components.filter(
    (component) => component.feeScope === feeScope
  )
  const groups = groupReadoutComponents(scoped)
  const anchorOf = (index: number) => `fee-${policyId}-${feeScope}-${index}`

  return (
    <div>
      <SectionHeading>{FEE_SCOPE_LABEL[feeScope]}</SectionHeading>
      {scoped.length === 0 ? (
        <p className='text-[13px] text-muted-foreground'>
          Chính sách không có {FEE_SCOPE_LABEL[feeScope].toLowerCase()}.
        </p>
      ) : (
        <div className='flex flex-col gap-3'>
          {groups.map((group, index) => {
            const title = getFeeLabel(
              group.componentType,
              COMPONENT_TYPE_LABELS
            )
            const headingId = `${anchorOf(index + 1)}-title`
            return (
              <article
                key={group.key}
                aria-labelledby={headingId}
                className='scroll-mt-24 rounded-lg border border-border bg-background target:border-primary'
                id={anchorOf(index + 1)}
              >
                <h3
                  className='border-b border-border px-4 py-3 text-[15px] font-semibold text-foreground'
                  id={headingId}
                >
                  {index + 1}. {title}
                </h3>
                <div className='flex flex-col gap-3 px-4 py-3'>
                  <FeeBasisFormula
                    anchorOf={anchorOf}
                    model={buildFeeBasis(group, groups)}
                    title={title}
                  />
                  {group.members.length === 1 ? (
                    <FeeComponentReadout
                      component={group.members[0]}
                      hideBasis
                      serviceType={serviceType}
                    />
                  ) : (
                    <FeeComponentGroupReadout
                      hideBasis
                      members={group.members}
                      serviceType={serviceType}
                    />
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
