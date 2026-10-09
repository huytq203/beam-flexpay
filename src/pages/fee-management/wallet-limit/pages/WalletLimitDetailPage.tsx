import { useParams } from 'react-router-dom'
import { useGetWalletLimitPolicyQuery } from '@services/apiWalletLimit'
import { CardComponent } from '@components/index'
import { WalletLimitDetailAudit } from '../components/WalletLimitDetailAudit'
import { WalletLimitDetailBreadcrumb } from '../components/WalletLimitDetailBreadcrumb'
import { WalletLimitDetailFallback } from '../components/WalletLimitDetailFallback'
import { WalletLimitDetailHeader } from '../components/WalletLimitDetailHeader'
import { WalletLimitDetailLimits } from '../components/WalletLimitDetailLimits'
import { WalletLimitDetailOverrides } from '../components/WalletLimitDetailOverrides'
import {
  WalletLimitDetailField,
  WalletLimitDetailGrid,
  WalletLimitDetailSection
} from '../components/WalletLimitDetailSection'
import {
  SCOPE_LABELS,
  TRANSACTION_TYPE_LABELS
} from '../constants/walletLimit.constants'
import { walletLimitPaths } from '../utils/walletLimit.paths'

const BREADCRUMB = [
  { label: 'Hạn mức ví', to: walletLimitPaths.list },
  { label: 'Chi tiết' }
]

const WalletLimitDetailPage = () => {
  const { id = '' } = useParams()
  const {
    data: policy,
    isLoading,
    error,
    refetch
  } = useGetWalletLimitPolicyQuery(id, { skip: !id })

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <WalletLimitDetailBreadcrumb items={BREADCRUMB} />
      {!policy ? (
        <WalletLimitDetailFallback
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <WalletLimitDetailHeader policy={policy} />
          <CardComponent className='border border-border bg-background shadow-none'>
            <WalletLimitDetailSection title='Đối tượng áp dụng'>
              <WalletLimitDetailGrid>
                <WalletLimitDetailField label='Đối tượng'>
                  {SCOPE_LABELS[policy.scopeType]}
                </WalletLimitDetailField>
                <WalletLimitDetailField label='Mã định danh'>
                  {policy.targetDisplay ?? 'Toàn hệ thống'}
                </WalletLimitDetailField>
                <WalletLimitDetailField label='Loại ví'>
                  {policy.walletType === 'ALL' ? 'Tất cả' : policy.walletType}
                </WalletLimitDetailField>
                <WalletLimitDetailField label='Loại giao dịch'>
                  {TRANSACTION_TYPE_LABELS[policy.transactionType]}
                </WalletLimitDetailField>
              </WalletLimitDetailGrid>
            </WalletLimitDetailSection>
            <WalletLimitDetailSection title='Hạn mức'>
              <WalletLimitDetailLimits policy={policy} />
            </WalletLimitDetailSection>
            <WalletLimitDetailSection title='Theo ngân hàng / phương thức'>
              <WalletLimitDetailOverrides overrides={policy.bankOverrides} />
            </WalletLimitDetailSection>
            <WalletLimitDetailSection title='Thông tin lưu vết'>
              <WalletLimitDetailAudit policy={policy} />
            </WalletLimitDetailSection>
          </CardComponent>
        </>
      )}
    </main>
  )
}

export default WalletLimitDetailPage
