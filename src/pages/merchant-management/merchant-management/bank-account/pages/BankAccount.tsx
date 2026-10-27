import { useSearchParams } from 'react-router-dom'
import { TabComponent } from '@components/index'
import { BankAccountChangeRequestsPanel } from '../components/BankAccountChangeRequestsPanel'
import { BankAccountListPanel } from '../components/BankAccountListPanel'

type BankAccountTab = 'accounts' | 'requests'

const TAB_PARAM = 'tab'

const BankAccount = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: BankAccountTab =
    searchParams.get(TAB_PARAM) === 'requests' ? 'requests' : 'accounts'

  return (
    <div className='flex min-w-0 flex-col gap-3'>
      <TabComponent
        activeKey={tab}
        items={[
          { key: 'accounts', label: 'Tài khoản ngân hàng' },
          { key: 'requests', label: 'Yêu cầu chờ duyệt' }
        ]}
        // Mỗi tab có bộ lọc và phân trang riêng nên đổi tab bỏ mọi tham số cũ.
        onChange={(key) => setSearchParams({ [TAB_PARAM]: key })}
      />
      {tab === 'accounts' ? (
        <BankAccountListPanel />
      ) : (
        <BankAccountChangeRequestsPanel />
      )}
    </div>
  )
}

export default BankAccount
