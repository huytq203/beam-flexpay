import {
  COMPONENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  getFeeLabel
} from '@constants/feeLabels'
import {
  FEE_SCOPE_LABEL,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { FeeComponentReadout } from '@pages/fee-management/fee-config/components/FeeComponentReadout'
import { SectionHeading } from '@pages/fee-management/fee-config/components/SectionHeading'
import type { FeeComponentFormValues } from '@pages/fee-management/fee-config/schemas/feeConfig.schema'
import { toReadoutComponent } from '../utils/toReadoutComponent'
import type {
  AppliedSubject,
  AppliedTarget,
  FeeAssignment,
  FeePolicyConfiguration
} from '@type/fee.type'
import type { ReactNode } from 'react'
import { FeePolicySchedulesSection } from './FeePolicySchedulesSection'

interface FeePolicyExpandedDetailProps {
  /** Luồng phí đang xem; dòng mở rộng chỉ đọc đúng các thành phần của luồng này. */
  feeScope: FeeScope
  policyId: string
  policyName: string
  configuration: FeePolicyConfiguration | undefined
  appliedTargets?: AppliedTarget[]
}

interface FactProps {
  label: string
  children: ReactNode
}

interface AssignmentRowProps {
  assignment: FeeAssignment
  appliedTargets?: AppliedTarget[]
}

interface AssignmentListProps {
  assignments: FeeAssignment[]
  appliedTargets?: AppliedTarget[]
}

interface ComponentListProps {
  components: FeeComponentFormValues[]
  feeScope: FeeScope
}

const FACT_LABEL =
  'text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'

const Fact = ({ label, children }: FactProps) => (
  <div className='flex min-w-0 flex-col gap-0.5'>
    <span className={FACT_LABEL}>{label}</span>
    <span className='break-words text-[13px] text-foreground'>{children}</span>
  </div>
)

const assignmentScope = (
  assignment: FeeAssignment
): { label: string; value: string } => {
  if (assignment.subjectId)
    return { label: 'Cá nhân', value: assignment.subjectId }
  if (assignment.customerGroup)
    return { label: 'Nhóm khách hàng', value: assignment.customerGroup }
  if (assignment.merchantId)
    return {
      label: 'Đơn vị chấp nhận thanh toán',
      value: assignment.merchantId
    }
  return { label: 'Tất cả', value: 'Không giới hạn đối tượng' }
}

const findAppliedSubject = (
  assignment: FeeAssignment,
  appliedTargets?: AppliedTarget[]
): AppliedSubject | undefined => {
  if (!assignment.subjectId) return undefined
  return appliedTargets
    ?.flatMap((target) => target.subjects ?? [])
    .find(
      (subject) =>
        subject.subjectId === assignment.subjectId &&
        subject.subjectType === assignment.subjectType
    )
}

const AssignmentRow = ({ assignment, appliedTargets }: AssignmentRowProps) => {
  const scope = assignmentScope(assignment)
  const subject = findAppliedSubject(assignment, appliedTargets)

  return (
    <div className='grid grid-cols-1 gap-x-8 gap-y-2 rounded-lg border border-border px-3 py-2 sm:grid-cols-2 lg:grid-cols-4'>
      <Fact label='Nhóm đối tượng áp dụng'>{scope.label}</Fact>
      <Fact label={'Đối tượng được áp '}>
        {subject ? (
          <span className='flex flex-col'>
            <span className='font-semibold'>
              {subject.fullName || subject.displayName || subject.subjectId}
            </span>
            {subject.fullName && subject.displayName && (
              <span className='text-muted-foreground'>
                {subject.displayName}
              </span>
            )}
          </span>
        ) : (
          scope.value
        )}
      </Fact>
      <Fact label='Nhà cung cấp (NCC)'>
        {assignment.providerCode || 'Tất cả'}
      </Fact>
      <Fact label='Ngân hàng phát hành'>{assignment.bankCode || 'Tất cả'}</Fact>
      <Fact label='Phương thức giao dịch'>
        {getFeeLabel(assignment.paymentMethod, PAYMENT_METHOD_LABELS)}
      </Fact>
    </div>
  )
}

const AssignmentList = ({
  assignments,
  appliedTargets
}: AssignmentListProps) => (
  <div>
    <SectionHeading>Gán đối tượng</SectionHeading>
    {assignments.length === 0 ? (
      <p className='text-[13px] text-muted-foreground'>
        Chính sách chưa được gán cho đối tượng nào.
      </p>
    ) : (
      <div className='flex flex-col gap-2'>
        {assignments.map((assignment) => (
          <AssignmentRow
            key={assignment.id}
            assignment={assignment}
            appliedTargets={appliedTargets}
          />
        ))}
      </div>
    )}
  </div>
)

/** Chỉ các thành phần của luồng đang xem, để đối soát từng luồng riêng. */
const ComponentList = ({ components, feeScope }: ComponentListProps) => {
  const scoped = components.filter(
    (component) => component.feeScope === feeScope
  )
  return (
    <div>
      <SectionHeading>{FEE_SCOPE_LABEL[feeScope]}</SectionHeading>
      {scoped.length === 0 ? (
        <p className='text-[13px] text-muted-foreground'>
          Chính sách không có {FEE_SCOPE_LABEL[feeScope].toLowerCase()}.
        </p>
      ) : (
        <div className='flex flex-col gap-3'>
          {scoped.map((component, index) => (
            <article
              key={component.key}
              className='rounded-lg border border-border bg-background'
            >
              <h3 className='border-b border-border px-4 py-3 text-[15px] font-semibold text-foreground'>
                {index + 1}.{' '}
                {getFeeLabel(component.componentType, COMPONENT_TYPE_LABELS)}
              </h3>
              <div className='px-4 py-3'>
                <FeeComponentReadout component={component} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export const FeePolicyExpandedDetail = ({
  feeScope,
  policyId,
  policyName,
  configuration,
  appliedTargets
}: FeePolicyExpandedDetailProps) => {
  const assignments = configuration?.assignments ?? []
  const components = (configuration?.components ?? []).map(toReadoutComponent)

  return (
    <section
      role='region'
      aria-label={`Chi tiết ${policyName}`}
      className='space-y-6 px-2 py-4'
    >
      <AssignmentList
        assignments={assignments}
        appliedTargets={appliedTargets}
      />
      <ComponentList
        components={components}
        feeScope={feeScope}
      />
      <FeePolicySchedulesSection policyId={policyId} />
    </section>
  )
}
