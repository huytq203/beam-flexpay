// AppLayout.tsx
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Logo } from '@components/logo/Logo'
import { useAppDispatch, useAppSelector } from '@hooks/hook'
import useNavigationEw from '@hooks/useNavigation'
import { savePermissions } from '@slices/authSlice'
import { useBoolean, useUpdate } from 'ahooks'
import { Col, Layout, Menu, MenuProps, Row } from 'antd'
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

const { Header, Sider, Content } = Layout

function AppLayout() {
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
  }

  useEffect(() => {
    if (!accessToken) {
      navigate('/auth/login')
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

  const getProfile = useUserGetMyInfoQuery(undefined, {
    skip: !accessToken
  })

  useEffect(() => {
    if (getProfile.data && accessToken) {
      dispatch(savePermissions(getProfile?.data?.permissions as string[]))
      window.events.on('show-profile', () => showProfile())
      window.events.on('show-password', () => showPassword())
      window.events.on('update-layout', () => {
        getProfile.refetch()
        update()
      })
    }
  }, [getProfile.data])
useEffect(() => {
  if ( !isAccess && location.pathname !== FORBIDDENERROR) {
    navigate(FORBIDDENERROR)
  }
}, [isAccess,location.pathname])
console.log(isAccess)
  const currentKey = useMemo(() => {
    const selected = location.pathname.split('/')
    return selected.filter((n) => n !== '')
  }, [location.pathname])

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

  return (
    <React.Fragment>
      <Layout className='app-layout'>
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
            <div className='logo'>
              <Logo collapsed={collapsed} />
            </div>
            <Menu
              className='scroll-custom sidebar-menu'
              mode='inline'
              items={isAccess ? navigation as MenuProps['items'] : []}
              onClick={handleSelectMenu}
              selectedKeys={currentKey}
              defaultOpenKeys={currentKey}
            />
          </Sider>
        </Resizable>
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
                <b className='fs-22 text-blue'>{t(`header-title.${title}`)}</b>
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
