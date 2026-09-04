import React, { Suspense, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useBoolean } from 'ahooks'
import Cookies from 'js-cookie'
import ScreenLoading from '@components/screen-loading/ScreenLoading'
import { useAppSelector } from '@hooks/hook'
import { initInactivityTracker } from '@configs/fetchBaseQueryCustom'
import { PATHS } from '@constants/pathConstant'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { EmployeePassword } from './components/EmployeePassword'
import EmployeeProfile from './components/EmployeeProfile'

/**
 * Layout cho màn khởi động: giữ nguyên mọi ràng buộc phiên của `AppLayout`
 * (chặn khi mất token, đếm giờ không hoạt động, modal hồ sơ/đổi mật khẩu)
 * nhưng bỏ hẳn header và sidebar — trang bên trong chiếm trọn khung nhìn và
 * tự làm điều hướng.
 */
function PortalLayout() {
  const { accessToken } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
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

  useEffect(() => {
    if (!accessToken) return

    window.events.on('show-profile', showProfile)
    window.events.on('show-password', showPassword)

    return () => {
      window.events.off('show-profile', showProfile)
      window.events.off('show-password', showPassword)
    }
  }, [accessToken, showPassword, showProfile])

  return (
    <React.Fragment>
      <div className='min-h-[100dvh] w-full bg-portal-ground'>
        <Suspense fallback={<ScreenLoading />}>
          <Outlet />
        </Suspense>
      </div>
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

export default PortalLayout
