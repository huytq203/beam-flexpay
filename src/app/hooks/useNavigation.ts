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

  // Create a permission check map for O(1) lookups instead of O(n) array searches
  const permissionMap = useMemo(() => {
    const map = new Set(permissions)
    return {
      hasPermission: (permission: string | undefined): boolean => {
        if (!permission) return false

        // API returns: "EWALLET:FEE:FULL", navigation requires: "FEE:FULL"
        const checkPermission = (map: Set<string>, permission: string) => {
          for (const value of map) {
            // Check exact match OR if user permission contains/ends with required permission
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
      // Check if item has direct permission
      if (item.permission && permissionMap.hasPermission(item.permission)) {
        result.push(item)
        continue
      }
      // Process children if item doesn't have direct permission
      if (item.children && item.children.length > 0) {
        const filteredChildren: ItemTypeCustom[] = []

        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j]
          // console.log(permissionMap.hasPermission(child.permission))
          if (
            child &&
            child.permission &&
            permissionMap.hasPermission(child.permission)
          ) {
            filteredChildren.push(child)
          }
        }
        // console.log(filteredChildren)

        if (filteredChildren.length > 0) {
          result.push({
            ...item,
            children: filteredChildren
          })
        }
      }
    }

    return result
  }

  // Use memoization to prevent unnecessary recalculations
  const navigation = useMemo(() => getNavigation(), [permissions])

  return [navigation, getNavigation]
}

export default useNavigationEw
