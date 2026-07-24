import React, { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'ahooks'
import Cookies from 'js-cookie'

import {
  SidebarProvider,
  SidebarInset,
  useSidebar
} from '@/components/ui/sidebar/Sidebar'
import {
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN
} from '@/components/ui/sidebar/SidebarContext'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable/Resizable'
import type { PanelImperativeHandle } from 'react-resizable-panels'
import SideBar from './SideBar'
import Header from './Header'
import EmployeePassword from './components/EmployeePassword'
import EmployeeProfile from './components/EmployeeProfile'
import ScreenLoading from '@components/screen-loading/ScreenLoading'

import { useAppSelector } from '@hooks/hook'
import usePermission from '@hooks/usePermission'
import { initInactivityTracker } from '@configs/fetchBaseQueryCustom'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { PATHS } from '@constants/pathConstant'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { appName } from '@constants/appConstant'
import './style.css'

function LayoutBody({ title }: { title: string }) {
  const { open, setOpen, isMobile, setSidebarWidth } = useSidebar()
  const panelRef = React.useRef<PanelImperativeHandle | null>(null)
  const syncingPanelRef = React.useRef(false)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || isMobile) return

    syncingPanelRef.current = true
    if (open) panel.expand()
    else panel.collapse()

    requestAnimationFrame(() => {
      syncingPanelRef.current = false
    })
  }, [open, isMobile])

  const handleSidebarResize = React.useCallback(
    (size: { asPercentage: number; inPixels: number }) => {
      if (syncingPanelRef.current) return

      const nextOpen = size.inPixels > 72
      if (nextOpen !== open) setOpen(nextOpen)

      if (size.inPixels >= SIDEBAR_WIDTH_MIN) {
        setSidebarWidth(size.inPixels)
      }
    },
    [open, setOpen, setSidebarWidth]
  )

  const content = (
    <SidebarInset>
      <Header titleKey={title} />
      <main className='app-content flex-1 overflow-auto bg-gray-100 p-3'>
        <Suspense fallback={<ScreenLoading />}>
          <Outlet />
        </Suspense>
      </main>
    </SidebarInset>
  )

  if (isMobile) {
    return (
      <div className='flex h-full w-full'>
        <SideBar />
        {content}
      </div>
    )
  }

  return (
    <ResizablePanelGroup
      direction='horizontal'
      className='h-full w-full'
    >
      <ResizablePanel
        id='app-sidebar'
        defaultSize={`${SIDEBAR_WIDTH_DEFAULT}px`}
        minSize={`${SIDEBAR_WIDTH_MIN}px`}
        maxSize={`${SIDEBAR_WIDTH_MAX}px`}
        collapsible
        collapsedSize={SIDEBAR_WIDTH_ICON}
        groupResizeBehavior='preserve-pixel-size'
        panelRef={panelRef}
        onResize={handleSidebarResize}
        className='overflow-hidden'
      >
        <SideBar />
      </ResizablePanel>

      <ResizableHandle variant='bar' />

      <ResizablePanel
        id='app-content'
        minSize='480px'
        className='overflow-hidden'
      >
        {content}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function AppLayout() {
  const { accessToken } = useAppSelector((state) => state.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isAccess = usePermission()

  const [title, setTitle] = useState<string>(appName)
  const [modalProfile, { setTrue: showProfile, setFalse: hideProfile }] =
    useBoolean(false)
  const [modalPassword, { setTrue: showPassword, setFalse: hidePassword }] =
    useBoolean(false)

  useEffect(() => {
    initInactivityTracker()
  }, [])

  useEffect(() => {
    const refreshToken = Cookies.get(CookieKey.REFRESH_TOKEN)
    if (!accessToken && !refreshToken) {
      navigate(PATHS.AUTH.LOGIN)
    }
  }, [accessToken, navigate])

  const getHeaderTitleKey = (pathname: string): string => {
    if (t(`header-title.${pathname}`) !== `header-title.${pathname}`) {
      return pathname
    }

    const wildcardPath = pathname.replace(/\/[^/]+$/, '/*')
    if (
      wildcardPath !== pathname &&
      t(`header-title.${wildcardPath}`) !== `header-title.${wildcardPath}`
    ) {
      return wildcardPath
    }

    return pathname
  }

  useEffect(() => {
    setTitle(getHeaderTitleKey(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    if (accessToken) {
      window.events.on('show-profile', () => showProfile())
      window.events.on('show-password', () => showPassword())
    }
  }, [accessToken])

  useEffect(() => {
    if (!isAccess && location.pathname !== FORBIDDENERROR) {
      navigate(FORBIDDENERROR)
    }
  }, [isAccess, location.pathname])

  return (
    <React.Fragment>
      <SidebarProvider className='h-[100dvh]'>
        <LayoutBody title={title} />
      </SidebarProvider>
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
