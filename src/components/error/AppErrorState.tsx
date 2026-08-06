import { Result } from 'antd'
import { Link } from 'react-router-dom'

import ButtonComponent from '@components/ui/button-component'

interface AppErrorStateProps {
  title?: string
  description?: string
  /** Chỉ hiển thị chi tiết kỹ thuật khi dev — tránh lộ thông tin nội bộ. */
  detail?: string
  onRetry?: () => void
}

export function AppErrorState({
  title = 'Không tải được nội dung',
  description = 'Đã có lỗi xảy ra khi mở trang này. Vui lòng tải lại trang hoặc quay về trang chủ.',
  detail,
  onRetry
}: AppErrorStateProps) {
  const showDetail = Boolean(detail) && import.meta.env.DEV

  return (
    <Result
      status='error'
      title={title}
      subTitle={description}
      extra={[
        <ButtonComponent
          key='retry'
          htmlType='button'
          content='Tải lại trang'
          onClick={onRetry ?? (() => window.location.reload())}
        />,
        <Link
          key='home'
          to='/'
        >
          Về trang chủ
        </Link>
      ]}
    >
      {showDetail ? (
        <pre className='overflow-auto rounded-md bg-gray-100 p-3 text-xs text-gray-600'>
          {detail}
        </pre>
      ) : null}
    </Result>
  )
}

export default AppErrorState
