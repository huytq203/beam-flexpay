// AppLayout.tsx
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Logo } from '@components/logo/Logo'
import { useAppDispatch, useAppSelector } from '@hooks/hook'
import useNavigationEw from '@hooks/useNavigation'
import { useBoolean, useUpdate } from 'ahooks'
import { Layout, Menu, MenuProps, Drawer, Grid, Spin } from 'antd'
import React, { useEffect, useMemo, useState, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import EmployeePassword from './components/EmployeePassword'
import EmployeeProfile from './components/EmployeeProfile'
import NavProfile from './components/NavProfile'
import { Breadcrumb, ButtonComponent } from '@components/index'
import type { ItemTypeCustom } from './components/Navigation'
import { Resizable } from 're-resizable'
import usePermission from '@hooks/usePermission'

import { initInactivityTracker } from '@configs/fetchBaseQueryCustom'
import './style.css'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { PATHS } from '@constants/pathConstant'
import Cookies from 'js-cookie'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { cn } from '@utils/cn'

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

  const handleSelectMenu: NonNullable<MenuProps['onClick']> = (event) => {
    const keys: string[] = event.keyPath
    const segments = [...keys]
      .reverse()
      .flatMap((k: string) => k.split('/').filter(Boolean))
    const path = '/' + segments.join('/')
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
    initInactivityTracker()
  }, [])

  useEffect(() => {
    // Chỉ redirect về login khi CẢ HAI access token và refresh token đều không còn
    // Nếu còn refresh token, không redirect vì fetchBaseQueryCustom sẽ tự refresh khi có API call
    const refreshToken = Cookies.get(CookieKey.REFRESH_TOKEN)
    if (!accessToken && !refreshToken) {
      navigate(PATHS.AUTH.LOGIN)
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
      const traverse = (items: ItemTypeCustom[]) => {
        items.forEach((item) => {
          if (item?.children && item.children.length > 0) {
            if (item.key != null) keys.push(String(item.key))
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
    // Khi Sider collapse, antd tự đóng hết submenu và gọi onOpenChange([]) —
    // bỏ qua sự kiện này để không mất trạng thái submenu đang mở của user,
    // vì khi mở lại sidebar Menu là controlled nên sẽ không tự khôi phục được.
    if (collapsed) return
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
      <div className='logo border-b border-gray-200 flex justify-center items-center bg-white p-3'>
        <Logo collapsed={isMobile ? false : collapsed} />
      </div>
      <Menu
        className='scroll-custom sidebar-menu'
        mode='inline'
        items={isAccess ? navigation as MenuProps['items'] : []}
        onClick={handleSelectMenu}
        selectedKeys={currentKey}
        openKeys={
          !isMobile && collapsed
            ? undefined // để Menu tự quản lý flyout hover khi sidebar thu gọn, tránh xung đột với openKeys đã lưu
            : hasInitOpenKeys
              ? openKeys
              : currentKey
        }
        onOpenChange={handleOpenChange}
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
              className='custom-sidebar border-r border-gray-200 '
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
              className='custom-sidebar border-r border-gray-100'
              width={250}
              style={{ minHeight: '100vh' }}
            >
              {sidebarContent}
            </Sider>
          </Drawer>
        )}
        <Layout className='site-layout'>
          <Header className='app-header flex justify-center items-center'>
            <div className="flex items-center gap-3 flex-1">

              <div >
                {/* {React.createElement(
                  collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                  {
                    className: 'trigger',
                    onClick: () => setCollapsed(!collapsed)
                  }
                )} */}
                <ButtonComponent
                  type="text"
                  size="small"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  className="px-1 py-1 border-1 border-gray-200"
                />
              </div>

              <div className="flex flex-col flex-1">
                <b className={cn(`text-blue`, isMobile ? 'text-[16px]' : 'text-[20px]', 'leading-none')}>{t(`header-title.${title}`)}</b>
                {!isMobile && <Breadcrumb className="mt-1" />}
              </div>
            </div>


            <NavProfile />
          </Header>
          <Content className='app-content'>
            <Suspense fallback={<div className="flex w-full h-full justify-center mt-12"><Spin size="large" /></div>}>
              <Outlet />
            </Suspense>
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
