// RedirectRouter.tsx
import { ItemTypeCustom } from '@components/layout/components/Navigation'
import useNavigationEw from '@hooks/useNavigation'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function RedirectRouter() {
  const [navigation] = useNavigationEw()
  const navigate = useNavigate()

  useEffect(() => {
    if (navigation && navigation.length > 0) {
      const firstItem = (navigation as ItemTypeCustom[])[0]
      let url = ''
      if (firstItem.children && firstItem.children?.length > 0) {
        url = `${firstItem.key}/${firstItem?.children[0].key}`
        let subItem = firstItem?.children[0]?.children as ItemTypeCustom[]
        if (subItem?.length) {
          url = `${url}/${subItem[0].key}`
        }
      } else {
        url = `/${firstItem.key}`
      }
      if (url === '') {
        navigate('/forbidden')
      } else {
        navigate(url)
      }
    }
  })

  return <></>
}
export default RedirectRouter
