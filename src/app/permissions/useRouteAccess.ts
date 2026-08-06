import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@hooks/hook'
import { buildPermissionCode, grants } from './access'
import { findScreenByPath } from './registry'

/** Path ngoài registry là trang công khai hoặc trang hệ thống và được cho qua. */
export const useRouteAccess = (): boolean => {
  const { pathname } = useLocation()
  const permissions = useAppSelector(
    (state) => state.auth.profile.permissions
  )

  return useMemo(() => {
    const screen = findScreenByPath(pathname)
    if (!screen) return true

    const required = buildPermissionCode(screen.module, screen.view)
    return grants(permissions, required)
  }, [pathname, permissions])
}
