import ScreenLoading from '@components/screen-loading/ScreenLoading'
import { resetInactivityTimer } from '@configs/fetchBaseQueryCustom'
import { TRANSACTIONMANAGEMENT } from '@constants/routersConstant'
import { useAppSelector } from '@hooks/hook'
import { Suspense, useEffect, type ReactElement } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AuthBrandPanel } from './components/AuthBrandPanel'
import { getSolarScene } from './components/solar-scene'
import { applyWeather } from './components/weather-scene'
import { useAuthIntroAnimation } from './hooks/useAuthIntroAnimation'
import { useAuthWeather } from './hooks/useAuthWeather'
import { useVietnamTime } from './hooks/useVietnamTime'
import './style.css'

function AuthLayout(): ReactElement {
  const { accessToken } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const { now, isSynchronized } = useVietnamTime()
  const { brandRef, sceneRef, mascotRef, formRef } = useAuthIntroAnimation()
  const { status, condition, locationLabel, canRequest, requestLocation } =
    useAuthWeather()
  const scene = applyWeather(getSolarScene(now), condition)

  useEffect(() => {
    if (accessToken) {
      navigate(`${TRANSACTIONMANAGEMENT}/transaction-wallet`, { replace: true })
    }
  }, [accessToken, navigate])

  useEffect(() => {
    resetInactivityTimer()
  }, [location])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <AuthBrandPanel
        scene={scene}
        isSynchronized={isSynchronized}
        weatherStatus={status}
        condition={condition}
        locationLabel={locationLabel}
        canRequest={canRequest}
        onRequestLocation={requestLocation}
        brandRef={brandRef}
        sceneRef={sceneRef}
        mascotRef={mascotRef}
      />

      <div
        ref={formRef}
        className="flex-1 min-w-[320px] md:min-w-[420px] overflow-y-auto bg-white"
      >
        <div className="flex min-h-full items-center justify-center px-4 py-6 md:px-8">
          <Suspense fallback={<ScreenLoading />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
