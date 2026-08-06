import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ItemTypeCustom } from '@components/layout/components/Navigation'
import { PATHS } from '@constants/pathConstant'
import { useAppDispatch, useAppSelector } from '@hooks/hook'
import useNavigationEw from '@hooks/useNavigation'
import { logout } from '@slices/authSlice'

interface ForbiddenLocationState {
  forbiddenFrom?: string
}

const firstAuthorizedPage = (navigation: ItemTypeCustom[]): string | null => {
  for (const group of navigation) {
    const firstChild = group.children?.[0]
    if (group.key && firstChild?.key) {
      return `/${String(group.key)}/${String(firstChild.key)}`
    }
  }
  return null
}

export function useForbiddenRecovery() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [navigation] = useNavigationEw()
  const email = useAppSelector((state) => state.auth.profile.email)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const state = location.state as ForbiddenLocationState | null
  const requestedPath = state?.forbiddenFrom

  const requestedArea = useMemo(() => {
    if (!requestedPath) return 'Chức năng vừa thao tác'
    const key = `header-title.${requestedPath}`
    const translated = t(key)
    return translated === key ? 'Chức năng vừa thao tác' : translated
  }, [requestedPath, t])

  const returnToSafePage = (): void => {
    const safePath = firstAuthorizedPage(navigation)
    if (safePath) {
      void navigate(safePath, { replace: true })
      return
    }
    dispatch(logout())
    void navigate(PATHS.AUTH.LOGIN, { replace: true })
  }

  const copySupportRequest = async (): Promise<void> => {
    const summary = [
      'Yêu cầu hỗ trợ quyền truy cập FlexPay CMS',
      `Tài khoản: ${email || 'Không xác định'}`,
      `Khu vực: ${requestedArea}`,
      `Đường dẫn: ${requestedPath || 'Không xác định'}`,
      'Nội dung: Vui lòng kiểm tra và bổ sung nhóm quyền phù hợp.'
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return {
    copyStatus,
    returnToSafePage,
    copySupportRequest
  }
}
