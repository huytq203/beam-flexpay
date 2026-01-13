import {
  ItemTypeCustom,
  navigationItems
} from '@components/layout/components/Navigation'
import { useAppSelector } from './hook'
import { useMemo } from 'react'

const useNavigationEw = () => {
  const {
    profile: { permissions }
  } = useAppSelector((state) => state.auth)

  const permissionMap = useMemo(() => {
    const map = new Set(permissions)
    return {
      hasPermission: (permission: string | undefined): boolean => {
        if (!permission) return false

        const checkPermission = (map: Set<string>, permission: string) => {
          for (const value of map) {
            if (
              value === permission ||
              value.endsWith(`:${permission}`) ||
              value.includes(`:${permission}:`)
            ) {
              return true
            }
          }
          return false
        }

        return checkPermission(map, permission)
      }
    }
  }, [permissions])
  const getNavigation = () => {
    // Fast path: admin access
    // if (permissions.includes('admin*')) {
    //   return [...navigationItems] // Return shallow copy to avoid mutations
    // }

    // Process navigation items
    // const hasFullAccess = (perms: string[]): boolean => {
    //   return perms.some(p => p.endsWith(':FULL'))
    // }
    // if (permissions.includes('EWALLET:PERMISSION:FULL')) {
    //   return [...navigationItems] // Return shallow copy to avoid mutations
    // }
    const result: ItemTypeCustom[] = []

    for (let i = 0; i < navigationItems.length; i++) {
      const item = navigationItems[i]

      // 1. Item có permission và user có quyền đó → push toàn bộ (bao gồm children)
      if (item.permission && permissionMap.hasPermission(item.permission)) {
        result.push(item)
        continue
      }

      // 2. Item KHÔNG có permission HOẶC user không có quyền → cần lọc children
      if (item.children && item.children.length > 0) {
        const filteredChildren: ItemTypeCustom[] = []

        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j]

          // Child chỉ được push nếu: không có permission HOẶC user có quyền
          if (
            !child.permission ||
            permissionMap.hasPermission(child.permission)
          ) {
            filteredChildren.push(child)
          }
        }

        if (filteredChildren.length > 0) {
          result.push({
            ...item,
            children: filteredChildren
          })
        }
      } else if (!item.permission) {
        // Item không có children và không có permission → push
        result.push(item)
      }
    }

    return result
  }

  const navigation = useMemo(() => getNavigation(), [permissions])

  return [navigation, getNavigation]
}

export default useNavigationEw
