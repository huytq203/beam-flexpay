import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import ScreenLoading from '@components/screen-loading/ScreenLoading'
import NotFound from '@pages/auth/not-found/NotFound'
import {
  canReloadForChunkError,
  isChunkLoadError,
  reloadForChunkError
} from '@utils/chunkError'

import AppErrorState from './AppErrorState'

const readDetail = (error: unknown): string | undefined => {
  if (error instanceof Error) return error.stack ?? error.message
  if (typeof error === 'string') return error
  return undefined
}

/**
 * Error boundary cấp route. Trước đây mọi route dùng thẳng `NotFound` làm
 * `errorElement`, nên lỗi nạp chunk hay lỗi render đều hiện ra màn 404 sai sự
 * thật. Ở đây tách ba nhánh: 404 thật của router, lỗi chunk (tự reload) và các
 * lỗi còn lại.
 */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const isChunkError = isChunkLoadError(error)
  const willReload = isChunkError && canReloadForChunkError()

  useEffect(() => {
    if (willReload) reloadForChunkError()
  }, [willReload])

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />
  }

  if (isChunkError) {
    if (willReload) return <ScreenLoading />

    return (
      <AppErrorState
        title='Ứng dụng vừa được cập nhật'
        description='Phiên bản trên máy bạn đã cũ nên không tải được nội dung. Vui lòng tải lại trang.'
        detail={readDetail(error)}
      />
    )
  }

  return <AppErrorState detail={readDetail(error)} />
}

export default RouteErrorBoundary
