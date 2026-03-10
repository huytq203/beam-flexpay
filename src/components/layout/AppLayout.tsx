// AppLayout.tsx
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Logo } from '@components/logo/Logo'
import { useAppDispatch, useAppSelector } from '@hooks/hook'
import useNavigationEw from '@hooks/useNavigation'
import { savePermissions } from '@slices/authSlice'
import { useBoolean, useUpdate } from 'ahooks'
import { Col, Layout, Menu, MenuProps, Row, Drawer, Grid } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import EmployeePassword from './components/EmployeePassword'
import EmployeeProfile from './components/EmployeeProfile'
import NavProfile from './components/NavProfile'
import { Resizable } from 're-resizable'
import { useUserGetMyInfoQuery } from '@services/cmsService'
import usePermission from '@hooks/usePermission'

import './style.scss'
import { FORBIDDENERROR } from '@constants/routersConstant'
import Cookies from 'js-cookie'
import { CookieKey } from '@configs/fetchBaseQuery.types'

const { Header, Sider, Content } = Layout
const { useBreakpoint } = Grid

function AppLayout() {
  const screens = useBreakpoint()
  const isMobile = screens.lg === false
  const [collapsed, setCollapsed] = useState(false)
  const { accessToken } = useAppSelector((state) => state.auth)

  const [modalProfile, { setTrue: showProfile, setFalse: hideProfile }] =
    useBoolean(false)
  const [modalPassword, { setTrue: showPassword, setFalse: hidePassword }] =
    useBoolean(false)

  const [title, setTitle] = useState<string>(import.meta.env.VITE_APP_NAME)

  const dispatch = useAppDispatch()

  const update = useUpdate()
  const location = useLocation()
  const navigate = useNavigate()

  const [navigation] = useNavigationEw()
  const isAccess = usePermission()
  const { t } = useTranslation()

  const handleSelectMenu = (event: any) => {
    const keys: string[] = event.keyPath
    const format = keys.map((r) => {
      if (!r.includes('/')) {
        return r
      } else {
        return r.replaceAll('/', '')
      }
    })
    const path = '/' + format.reverse().join('/')
    navigate(path, {
      replace: true
    })
    if (isMobile) {
      setCollapsed(true)
    }
  }

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [isMobile])

  useEffect(() => {
    // Chỉ redirect về login khi CẢ HAI access token và refresh token đều không còn
    // Nếu còn refresh token, không redirect vì fetchBaseQueryCustom sẽ tự refresh khi có API call
    const refreshToken = Cookies.get(CookieKey.REFRESH_TOKEN)
    if (!accessToken && !refreshToken) {
      navigate('/secure-panel/auth/login')
    }
  }, [accessToken, navigate])

  // Helper function to get header title key with wildcard matching support
  const getHeaderTitleKey = (pathname: string): string => {
    if (t(`header-title.${pathname}`) !== `header-title.${pathname}`) {
      return pathname
    }

    const wildcardPath = pathname.replace(/\/[^/]+$/, '/*')
    if (wildcardPath !== pathname && t(`header-title.${wildcardPath}`) !== `header-title.${wildcardPath}`) {
      return wildcardPath
    }

    return pathname
  }

  useEffect(() => {
    setTitle(getHeaderTitleKey(location.pathname))
  }, [location.pathname])

  // TẠM TẮT: API cũ không nhận token mới → gây 401 → logout loop
  // TODO: Cần tạo endpoint lấy profile trên API mới (ENV.API_LOGIN) hoặc decode JWT
  // const getProfile = useUserGetMyInfoQuery(undefined, {
  //   skip: !accessToken
  // })

  useEffect(() => {
    if (accessToken) {
      // dispatch(savePermissions(getProfile?.data?.permissions as string[]))
      window.events.on('show-profile', () => showProfile())
      window.events.on('show-password', () => showPassword())
      // window.events.on('update-layout', () => {
      //   getProfile.refetch()
      //   update()
      // })
    }
  }, [accessToken])
  useEffect(() => {
    if (!isAccess && location.pathname !== FORBIDDENERROR) {
      navigate(FORBIDDENERROR)
    }
  }, [isAccess, location.pathname])
  const currentKey = useMemo(() => {
    const selected = location.pathname.split('/')
    return selected.filter((n) => n !== '')
  }, [location.pathname])

  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [hasInitOpenKeys, setHasInitOpenKeys] = useState(false)

  useEffect(() => {
    if (!hasInitOpenKeys && isAccess && navigation && Array.isArray(navigation) && navigation.length > 0) {
      const keys: string[] = []
      const traverse = (items: any[]) => {
        items.forEach((item: any) => {
          if (item?.children && item.children.length > 0) {
            keys.push(item.key)
            traverse(item.children)
          }
        })
      }
      traverse(navigation)
      // Mở tất cả keys hợp lệ và currentKey hiện tại
      setOpenKeys([...new Set([...keys, ...currentKey])])
      setHasInitOpenKeys(true)
    }
  }, [navigation, currentKey, isAccess, hasInitOpenKeys])

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  const enable = {
    top: false,
    right: true,
    bottom: false,
    left: false,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
    topLeft: false
  }

  const sidebarContent = (
    <>
      <div className='logo'>
        <Logo collapsed={isMobile ? false : collapsed} />
      </div>
      <Menu
        className='scroll-custom sidebar-menu'
        mode='inline'
        items={isAccess ? navigation as MenuProps['items'] : []}
        onClick={handleSelectMenu}
        selectedKeys={currentKey}
        openKeys={hasInitOpenKeys ? openKeys : currentKey}
        onOpenChange={handleOpenChange as any}
      />
    </>
  )

  return (
    <React.Fragment>
      <Layout className='app-layout'>
        {!isMobile ? (
          <Resizable
            maxWidth={collapsed ? '80px' : '378px'}
            minWidth={collapsed ? '80px' : '250px'}
            className='resizable'
            enable={enable}
          >
            <Sider
              trigger={null}
              collapsible
              collapsed={collapsed}
              theme='light'
              className='custom-sidebar'
            >
              {sidebarContent}
            </Sider>
          </Resizable>
        ) : (
          <Drawer
            placement='left'
            closable={false}
            onClose={() => setCollapsed(true)}
            open={!collapsed}
            bodyStyle={{ padding: 0 }}
            width={250}
            className='mobile-sidebar-drawer'
          >
            <Sider
              trigger={null}
              collapsible
              collapsed={false}
              theme='light'
              className='custom-sidebar'
              width={250}
              style={{ minHeight: '100vh' }}
            >
              {sidebarContent}
            </Sider>
          </Drawer>
        )}
        <Layout className='site-layout'>
          <Header className='app-header'>
            <div>
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: 'trigger',
                  onClick: () => setCollapsed(!collapsed)
                }
              )}
            </div>
            <Row>
              <Col>
                <b className={`text-blue ${isMobile ? 'fs-16' : 'fs-22'}`}>{t(`header-title.${title}`)}</b>
              </Col>
            </Row>
            <NavProfile />
          </Header>
          <Content className='app-content'>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <EmployeePassword
        open={modalPassword}
        onClose={hidePassword}
      />
      <EmployeeProfile
        open={modalProfile}
        onClose={hideProfile}
      />
    </React.Fragment>
  )
}

export default AppLayout
