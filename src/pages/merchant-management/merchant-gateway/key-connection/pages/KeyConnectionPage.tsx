import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TabComponent } from '@components/index'
import KeyConnectionKeysPanel from '../components/KeyConnectionKeysPanel'

const WebhookPage = lazy(() => import('../../webhook/pages/WebhookPage'))

const TAB_PARAM = 'tab'

const KeyConnectionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get(TAB_PARAM) === 'webhook' ? 'webhook' : 'keys'

  return (
    <div className='flex min-w-0 flex-col gap-3'>
      <TabComponent
        defaultActiveKey={tab}
        items={[
          { key: 'keys', label: 'Key kết nối' },
          { key: 'webhook', label: 'Webhook (IPN)' }
        ]}
        // Mỗi tab có bộ lọc và phân trang riêng nên đổi tab bỏ mọi tham số cũ.
        onChange={(key) => setSearchParams({ [TAB_PARAM]: key })}
      />
      {tab === 'keys' ? (
        <KeyConnectionKeysPanel />
      ) : (
        <Suspense fallback={null}>
          <WebhookPage />
        </Suspense>
      )}
    </div>
  )
}

export default KeyConnectionPage
