import { ButtonComponent, CardComponent } from '@components/index'
import { useGetWalletLimitPolicyQuery } from '@services/apiWalletLimit'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { walletLimitPaths } from '../utils/walletLimit.paths'
import { WalletLimitFormView } from './WalletLimitFormView'

const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  error.status === 404

/** Tải cấu hình cho màn Cập nhật với đủ trạng thái loading / lỗi / không tìm thấy. */
export function WalletLimitFormEditLoader({ id }: { id: string }) {
  const navigate = useNavigate()
  const { data, isError, error, refetch, isFetching } =
    useGetWalletLimitPolicyQuery(id)
  // Bản trong cache có thể cũ: chỉ dựng form khi lần tải đầu đã xong, để
  // `rowVersion` hiển thị là bản mới nhất. Sau đó refetch (Tải lại) không dựng lại form.
  const [isReady, setIsReady] = useState(false)
  if (!isReady && data && !isFetching) setIsReady(true)

  if (isReady && data) {
    return (
      <WalletLimitFormView
        key={id}
        policy={data}
        onReload={async () => (await refetch()).data}
      />
    )
  }
  if (!isError)
    return (
      <CardComponent
        loading
        aria-busy
      />
    )

  const notFound = isNotFound(error)
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div
        role='alert'
        className='flex flex-col items-start gap-3'
      >
        <p className='font-medium text-foreground'>
          {notFound ? 'Không tìm thấy cấu hình' : 'Không thể tải cấu hình.'}
        </p>
        {notFound ? (
          <ButtonComponent
            type='default'
            content='Về danh sách'
            onClick={() => navigate(walletLimitPaths.list)}
          />
        ) : (
          <ButtonComponent
            type='default'
            content='Thử lại'
            onClick={() => void refetch()}
          />
        )}
      </div>
    </CardComponent>
  )
}
