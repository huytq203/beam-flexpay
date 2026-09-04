import { useMemo } from 'react'
import {
  grantsScreenAccess,
  SCREENS
} from '@/app/permissions'
import {
  navigationItems,
  type ItemTypeCustom
} from '@components/layout/components/Navigation'
import { useAppSelector } from './hook'

const isVisible = (
  item: ItemTypeCustom,
  permissions: readonly string[]
): boolean => {
  if (!item.screen) return true

  const screen = SCREENS[item.screen]
  return grantsScreenAccess(permissions, screen)
}

const filterNavigation = (
  items: readonly ItemTypeCustom[],
  permissions: readonly string[]
): ItemTypeCustom[] =>
  items.reduce<ItemTypeCustom[]>((visibleItems, item) => {
    if (!item.children?.length) {
      if (isVisible(item, permissions)) visibleItems.push(item)
      return visibleItems
    }

    const children = item.children.filter((child) =>
      isVisible(child, permissions)
    )

    if (children.length > 0) {
      visibleItems.push({ ...item, children })
    }

    return visibleItems
  }, [])

const useNavigationEw = (): [ItemTypeCustom[]] => {
  const permissions = useAppSelector(
    (state) => state.auth.profile.permissions
  )
  const navigation = useMemo(
    () => filterNavigation(navigationItems, permissions),
    [permissions]
  )

  return [navigation]
}

export default useNavigationEw
