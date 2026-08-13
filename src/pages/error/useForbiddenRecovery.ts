import { useNavigate } from 'react-router-dom'
import type { ItemTypeCustom } from '@components/layout/components/Navigation'
import { PATHS } from '@constants/pathConstant'
import { useAppDispatch } from '@hooks/hook'
import useNavigationEw from '@hooks/useNavigation'
import { logout } from '@slices/authSlice'

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
  const dispatch = useAppDispatch()
  const [navigation] = useNavigationEw()

  const returnToSafePage = (): void => {
    const safePath = firstAuthorizedPage(navigation)
    if (safePath) {
      void navigate(safePath, { replace: true })
      return
    }
    dispatch(logout())
    void navigate(PATHS.AUTH.LOGIN, { replace: true })
  }

  return {
    returnToSafePage
  }
}
