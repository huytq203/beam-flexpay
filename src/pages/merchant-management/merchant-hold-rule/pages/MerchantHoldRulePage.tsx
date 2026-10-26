import { Navigate } from 'react-router-dom'
import { useScreenAccess } from '@/app/permissions'
import {
  useGetHoldRuleHistoryQuery,
  useGetHoldRulePendingQuery
} from '@/app/services/merchantHoldRuleApi'
import { CardComponent } from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { LimitTargetPicker } from '../../merchant-settlement/components/LimitTargetPicker'
import { useLimitTarget } from '../../merchant-settlement/hooks/useLimitTarget'
import { ManagementPageHeader } from '../../sub-merchant-management/shared/ManagementPageHeader'
import { HoldRuleDecisionDialog } from '../components/HoldRuleDecisionDialog'
import { HoldRuleEffectivePanel } from '../components/HoldRuleEffectivePanel'
import { HoldRuleVersionsTable } from '../components/HoldRuleVersionsTable'
import { useHoldRuleDecisions } from '../hooks/useHoldRuleDecisions'
import type { HoldRuleTarget } from '../types/holdRule.types'

const CARD = 'border border-border bg-background shadow-none'

export default function MerchantHoldRulePage() {
  const access = useScreenAccess('MERCHANT_HOLD_RULE')
  const { level, targetId, setTarget } = useLimitTarget()
  const flow = useHoldRuleDecisions()
  // BE cho phép xem với một trong hai quyền đề xuất hoặc duyệt.
  const canView = access.can('view') || access.can('approve')
  const target: HoldRuleTarget | undefined =
    level && (level === 'SYSTEM' || targetId) ? { level, targetId } : undefined
  const pending = useGetHoldRulePendingQuery(undefined, { skip: !canView })
  const history = useGetHoldRuleHistoryQuery(
    { targetLevel: target?.level ?? 'SYSTEM', targetId: target?.targetId },
    { skip: !canView || !target }
  )

  if (!canView)
    return (
      <Navigate
        replace
        to={FORBIDDENERROR}
      />
    )

  const actions = {
    onApprove: (row: Parameters<typeof flow.open>[0]) =>
      flow.open(row, 'approve'),
    onReject: (row: Parameters<typeof flow.open>[0]) => flow.open(row, 'reject')
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className={CARD}>
        <ManagementPageHeader
          description='Quy tắc quyết định mỗi khoản doanh thu của Sub-merchant bị tạm giữ bao nhiêu và bao lâu, đặt ở cấp hệ thống, Master hoặc Sub-merchant. Mọi thay đổi là một đề xuất và chỉ có hiệu lực sau khi được duyệt.'
          title='Quy tắc tạm giữ'
        />
        <div className='mt-4'>
          <LimitTargetPicker
            level={level}
            onChange={setTarget}
            targetId={targetId}
          />
        </div>
      </CardComponent>
      {target ? (
        <CardComponent className={CARD}>
          <HoldRuleEffectivePanel
            key={`${target.level}:${target.targetId ?? ''}`}
            target={target}
          />
        </CardComponent>
      ) : (
        <CardComponent className={CARD}>
          <p className='text-sm text-muted-foreground'>
            Chọn cấp áp dụng và đối tượng để xem quy tắc đang áp dụng và lịch sử
            phiên bản.
          </p>
        </CardComponent>
      )}
      <CardComponent className={CARD}>
        <HoldRuleVersionsTable
          {...actions}
          description='Đề xuất đang chờ duyệt của mọi đối tượng trong phạm vi được gán, mới tạo trước. Người đề xuất có thể tự duyệt nếu có đủ cả hai quyền, nên hãy kiểm tra cột Người đề xuất.'
          emptyText='Chưa có đề xuất chờ duyệt'
          isError={pending.isError}
          isLoading={pending.isLoading}
          onRetry={() => void pending.refetch()}
          rows={pending.data ?? []}
          showDecision={false}
          showTarget
          title='Đề xuất chờ duyệt'
        />
      </CardComponent>
      {target && (
        <CardComponent className={CARD}>
          <HoldRuleVersionsTable
            {...actions}
            key={`${target.level}:${target.targetId ?? ''}`}
            emptyText='Chưa có phiên bản nào'
            isError={history.isError}
            isLoading={history.isLoading}
            onRetry={() => void history.refetch()}
            rows={history.data ?? []}
            showDecision
            showTarget={false}
            title='Lịch sử phiên bản'
          />
        </CardComponent>
      )}
      <HoldRuleDecisionDialog flow={flow} />
    </main>
  )
}
