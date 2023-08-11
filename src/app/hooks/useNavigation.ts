import {
  ItemTypeCustom,
  navigationItems
} from '@components/layout/components/Navigation'
import { useAppSelector } from './hook'

const useNavigationEw = () => {
  const {
    profile: { permissions }
  } = useAppSelector((state) => state.auth)

  const getNavigation = () => {
    let test: any[] = []
    if (permissions.includes('admin*')) {
      test = navigationItems
    } else {
      navigationItems.forEach((item, index) => {
        if (
          (item.permission &&
            permissions.includes(`${item.permission}:view`)) ||
          permissions.includes(`${item.permission}*`)
        ) {
          test[index] = item
        } else {
          const children = item.children
          let subItem: any[] = []
          if (children && children.length > 0) {
            children.forEach((childrenItem: ItemTypeCustom, i) => {
              if (
                childrenItem &&
                childrenItem.permission &&
                (permissions.includes(`${childrenItem.permission}:view`) ||
                  permissions.includes(`${childrenItem.permission}*`))
              ) {
                subItem[i] = childrenItem
              }
            })
            if (subItem.length !== 0) {
              subItem = subItem.filter(() => true)
              const newItem = { ...item, children: subItem }
              test[index] = newItem
            }
          }
        }
      })
    }
    return test.filter(() => true)
  }

  const navigation: ItemTypeCustom[] = getNavigation()

  return [navigation, getNavigation]
}
export default useNavigationEw
