import { useParams } from 'react-router-dom'
import { WalletLimitDetailBreadcrumb } from '../components/WalletLimitDetailBreadcrumb'
import { WalletLimitDetailFallback } from '../components/WalletLimitDetailFallback'
import { WalletLimitHistoryList } from '../components/WalletLimitHistoryList'
import { useWalletLimitHistory } from '../hooks/useWalletLimitHistory'
import { walletLimitPaths } from '../utils/walletLimit.paths'

const WalletLimitHistoryPage = () => {
  const { id = '' } = useParams()
  const history = useWalletLimitHistory(id)
  const { query } = history
  // 404 hoặc lỗi lần tải đầu: không có trang dữ liệu nào để hiển thị.
  const showFallback = !query.data

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <WalletLimitDetailBreadcrumb
        items={[
          { label: 'Hạn mức ví', to: walletLimitPaths.list },
          { label: history.policyTitle, to: walletLimitPaths.detail(id) },
          { label: 'Lịch sử cập nhật' }
        ]}
      />
      {showFallback ? (
        <WalletLimitDetailFallback
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <WalletLimitHistoryList history={history} />
      )}
    </main>
  )
}

export default WalletLimitHistoryPage
