import { Navigate } from 'react-router-dom'
import { useScreenAccess } from '@/app/permissions'
import {
  useGetLimitHistoryQuery,
  useGetPendingLimitChangesQuery
} from '@/app/services/merchantLimitApi'
import { CardComponent } from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { ManagementPageHeader } from '../../sub-merchant-management/shared/ManagementPageHeader'
import { LimitChangesTable } from '../components/LimitChangesTable'
import { LimitDecisionDialog } from '../components/LimitDecisionDialog'
import { LimitTargetPicker } from '../components/LimitTargetPicker'
import { WithdrawalLimitForm } from '../components/WithdrawalLimitForm'
import { useLimitDecisions } from '../hooks/useLimitDecisions'
import { useLimitTarget } from '../hooks/useLimitTarget'

const CARD = 'border border-border bg-background shadow-none'

export default function WithdrawalLimitPage() {
  const access = useScreenAccess('MERCHANT_WITHDRAWAL_LIMIT')
  const { level, targetId, setTarget } = useLimitTarget()
  const flow = useLimitDecisions()
  const canView = access.can('view')
  const pending = useGetPendingLimitChangesQuery(undefined, { skip: !canView })
  const canLoadHistory = level === 'SYSTEM' || Boolean(level && targetId)
  const history = useGetLimitHistoryQuery(
    { targetLevel: level ?? 'SYSTEM', targetId },
    { skip: !canView || !canLoadHistory }
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
    onReject: (row: Parameters<typeof flow.open>[0]) =>
      flow.open(row, 'reject'),
    onDeactivate: (row: Parameters<typeof flow.open>[0]) =>
      flow.open(row, 'deactivate')
  }
  const pendingRows = (pending.data ?? []).filter(
    (item) => item.policyDomain === 'WITHDRAWAL'
  )

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className={CARD}>
        <ManagementPageHeader
          description='Hạn mức rút theo cấp hệ thống, Master hoặc Sub-merchant. Thay đổi chỉ làm chặt hơn được áp dụng ngay; nới lỏng cần người có quyền phê duyệt.'
          title='Hạn mức rút'
        />
        <div className='mt-4'>
          <LimitTargetPicker
            level={level}
            onChange={setTarget}
            targetId={targetId}
          />
        </div>
      </CardComponent>
      {canLoadHistory && level && (
        <CardComponent className={CARD}>
          <WithdrawalLimitForm
            key={`${level}:${targetId ?? ''}`}
            level={level}
            targetId={targetId}
          />
        </CardComponent>
      )}
      <CardComponent className={CARD}>
        <LimitChangesTable
          {...actions}
          emptyText='Chưa có đề xuất chờ duyệt'
          isError={pending.isError}
          isLoading={pending.isLoading}
          onRetry={() => void pending.refetch()}
          rows={pendingRows}
          title='Đề xuất chờ duyệt'
        />
      </CardComponent>
      {canLoadHistory && (
        <CardComponent className={CARD}>
          <LimitChangesTable
            {...actions}
            emptyText='Chưa có lịch sử thay đổi'
            isError={history.isError}
            isLoading={history.isLoading}
            onRetry={() => void history.refetch()}
            rows={history.data ?? []}
            title='Lịch sử thay đổi'
          />
        </CardComponent>
      )}
      <LimitDecisionDialog flow={flow} />
    </main>
  )
}
