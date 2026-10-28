import {
  StorefrontIcon,
  UserCheckIcon,
  UserIcon,
  WalletIcon
} from '@components/icons'
import { TooltipComponent } from '@components/index'
import {
  getCustomerSegmentName,
  type CustomerSegmentNames
} from '@hooks/useCustomerSegmentNames'
import { cn } from '@lib/utils/cn'
import { allowsMerchantCriteria } from '@utils/fee-execution'
import type { AppliedSubject, AppliedTarget } from '@type/fee.type'
import type { ComponentType } from 'react'

interface AppliedTargetCellProps {
  targets?: AppliedTarget[]
  customerSegmentNames: CustomerSegmentNames
  /** Loại giao dịch của chính sách: thu hộ / chi hộ đổi nhãn đối tượng sang merchant. */
  serviceType?: string
}

interface TargetPresentation {
  eyebrow: string
  title: string
  detail?: string
  Icon: ComponentType<{
    size?: number
    weight?: 'bold'
    className?: string
    'aria-hidden'?: boolean
  }>
  tone: string
}

const getSubjectPresentation = (
  subject: AppliedSubject,
  merchantFlow: boolean
) => {
  const isMerchant = merchantFlow || subject.subjectType === 'MERCHANT'
  const fallbackName = isMerchant ? 'Merchant' : 'Thành viên ví'

  return {
    name: subject.fullName ?? fallbackName,
    identifier: subject.displayName ?? subject.subjectId,
    Icon: isMerchant ? StorefrontIcon : UserIcon
  }
}

const getTargetPresentation = (
  target: AppliedTarget,
  customerSegmentNames: CustomerSegmentNames,
  merchantFlow: boolean
): TargetPresentation => {
  if (target.type === 'ALL') {
    return {
      eyebrow: 'Phạm vi chung',
      title: merchantFlow ? 'Tất cả merchant' : 'Tất cả khách hàng',
      detail: 'Không giới hạn đối tượng',
      Icon: UserIcon,
      tone: 'text-slate-600'
    }
  }

  const subjectTotal = target.subjectCount ?? target.count

  if (target.type === 'CUSTOMER_GROUP') {
    return {
      eyebrow: merchantFlow ? 'Nhóm merchant' : 'Phân khúc',
      title: target.code
        ? getCustomerSegmentName(target.code, customerSegmentNames)
        : 'Chưa xác định phân khúc',
      detail: `${subjectTotal} chủ thể`,
      Icon: UserCheckIcon,
      tone: 'text-violet-700'
    }
  }

  const singleSubject =
    subjectTotal === 1 && target.subjects?.length === 1
      ? getSubjectPresentation(target.subjects[0], merchantFlow)
      : null

  return {
    eyebrow: 'Gán trực tiếp',
    title:
      singleSubject?.name ??
      `${subjectTotal} ${merchantFlow ? 'merchant cụ thể' : 'ví riêng'}`,
    detail: singleSubject?.identifier ?? 'Ưu tiên cao nhất',
    Icon: merchantFlow ? StorefrontIcon : WalletIcon,
    tone: 'text-teal-700'
  }
}

const AppliedSubjectTooltip = ({
  target,
  merchantFlow
}: {
  target: AppliedTarget
  merchantFlow: boolean
}) => {
  const subjects = target.subjects ?? []
  const total = Math.max(target.subjectCount ?? target.count, subjects.length)
  const remaining = Math.max(total - subjects.length, 0)

  return (
    <div className='w-80 overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-[rgba(16,24,40,0.04)_0_1px_4px,rgba(0,0,0,0.03)_0_4px_24px]'>
      <div className='flex items-center justify-between border-b border-border px-3 py-2.5'>
        <span className='text-[13px] font-semibold'>Chủ thể áp dụng</span>
        <span className='tabular-nums text-xs text-muted-foreground'>
          {total} chủ thể
        </span>
      </div>

      <div className='max-h-72 divide-y divide-border/70 overflow-y-auto px-3'>
        {subjects.map((subject) => {
          const { name, identifier, Icon } = getSubjectPresentation(
            subject,
            merchantFlow
          )

          return (
            <div
              key={`${subject.subjectType}-${subject.subjectId}`}
              className='flex min-w-0 items-center gap-2.5 py-2.5'
            >
              <Icon
                size={16}
                weight='bold'
                aria-hidden
                className='shrink-0 text-muted-foreground'
              />
              <div className='min-w-0 flex-1'>
                <p className='break-words text-[13px] font-medium text-foreground'>
                  {name}
                </p>
                <p className='break-all text-xs text-muted-foreground'>
                  {identifier}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {remaining > 0 && (
        <p className='border-t border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground'>
          Còn {remaining} chủ thể khác
        </p>
      )}
    </div>
  )
}

const TargetSummary = ({
  target,
  customerSegmentNames,
  merchantFlow
}: {
  target: AppliedTarget
  customerSegmentNames: CustomerSegmentNames
  merchantFlow: boolean
}) => {
  const { eyebrow, title, detail, Icon, tone } = getTargetPresentation(
    target,
    customerSegmentNames,
    merchantFlow
  )

  return (
    <span className='flex min-w-0 items-start gap-2'>
      <Icon
        size={17}
        weight='bold'
        aria-hidden
        className={cn('mt-0.5 shrink-0', tone)}
      />
      <span className='min-w-0'>
        <span className='block truncate text-[13px] font-semibold text-foreground'>
          {title}
        </span>
        <span className='block truncate text-xs text-muted-foreground'>
          {[eyebrow, detail].filter(Boolean).join(' · ')}
        </span>
      </span>
    </span>
  )
}

export const AppliedTargetCell = ({
  targets,
  customerSegmentNames,
  serviceType
}: AppliedTargetCellProps) => {
  const merchantFlow = allowsMerchantCriteria(serviceType)

  if (!targets?.length) {
    return <span className='text-[13px] text-muted-foreground'>Chưa gán</span>
  }

  return (
    <div className='flex min-w-0 flex-col gap-1.5'>
      {targets.map((target, index) => {
        const key = `${target.type}-${target.code ?? index}`
        const hasSubjects =
          target.type !== 'ALL' && Boolean(target.subjects?.length)

        if (!hasSubjects) {
          return (
            <div
              key={key}
              className='px-1 py-1.5'
            >
              <TargetSummary
                target={target}
                customerSegmentNames={customerSegmentNames}
                merchantFlow={merchantFlow}
              />
            </div>
          )
        }

        const { title } = getTargetPresentation(
          target,
          customerSegmentNames,
          merchantFlow
        )
        const total = Math.max(
          target.subjectCount ?? target.count,
          target.subjects?.length ?? 0
        )

        return (
          <TooltipComponent
            key={key}
            placement='topLeft'
            trigger={['hover', 'focus', 'click']}
            color='#ffffff'
            styles={{
              root: { maxWidth: 340 },
              body: { padding: 0, boxShadow: 'none' }
            }}
            title={
              <AppliedSubjectTooltip
                target={target}
                merchantFlow={merchantFlow}
              />
            }
          >
            <button
              type='button'
              className='block w-full cursor-help rounded-lg border border-border bg-background px-2.5 py-1.5 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              aria-label={`Xem ${total} chủ thể áp dụng của ${title}`}
            >
              <TargetSummary
                target={target}
                customerSegmentNames={customerSegmentNames}
                merchantFlow={merchantFlow}
              />
            </button>
          </TooltipComponent>
        )
      })}
    </div>
  )
}
