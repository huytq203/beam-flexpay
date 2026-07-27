import ScreenLoading from '@components/screen-loading/ScreenLoading'
import { resetInactivityTimer } from '@configs/fetchBaseQueryCustom'
import { TRANSACTIONMANAGEMENT } from '@constants/routersConstant'
import { useAppSelector } from '@hooks/hook'
import gsap from 'gsap'
import { getPosition, getTimes } from 'suncalc'
import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useVietnamTime } from './hooks/useVietnamTime'
import './style.css'

const HO_CHI_MINH_COORDINATES = {
  latitude: 10.8231,
  longitude: 106.6297
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum)

interface SolarScene {
  isNight: boolean
  isTwilight: boolean
  isSunset: boolean
  isNoonHour: boolean
  isEveningImageHour: boolean
  sunLeft: string
  sunTop: string
  sunOpacity: number
  sky: string
  sunColor: string
  farMountain: string
  middleMountain: string
  nearMountain: string
  timeLabel: string
}

/**
 * Chuyển dữ liệu thiên văn của SunCalc thành các token thị giác cho panel.
 */
function getSolarScene(now: Date): SolarScene {
  const { latitude, longitude } = HO_CHI_MINH_COORDINATES
  const { altitude } = getPosition(now, latitude, longitude)
  const { sunrise, sunset, solarNoon } = getTimes(
    now,
    latitude,
    longitude
  )
  const sunriseAt = sunrise?.getTime() ?? now.getTime()
  const sunsetAt = sunset?.getTime() ?? now.getTime()
  const daylightProgress = clamp(
    (now.getTime() - sunriseAt) / Math.max(sunsetAt - sunriseAt, 1),
    0,
    1
  )
  const easedDaylightProgress =
    daylightProgress ** 3 *
    (daylightProgress * (daylightProgress * 6 - 15) + 10)
  const sunArc = Math.max(
    Math.sin(daylightProgress * Math.PI),
    0
  ) ** 0.28
  const isSunset = now.getTime() > solarNoon.getTime()
  const isNight = altitude < -6
  const isTwilight = altitude < 10 && !isNight
  const vietnamHour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      hourCycle: 'h23'
    }).format(now)
  )
  const sunTop =
    altitude >= 0
      ? 64 - sunArc * 52
      : 64 + Math.min(Math.abs(altitude), 12) * 1.2

  let sky = 'linear-gradient(165deg, #c9fffa 0%, #9cece5 52%, #70d3ca 100%)'
  let sunColor = '#fff1a8'
  let farMountain = '#83d8cf'
  let middleMountain = '#48afa7'
  let nearMountain = '#237d78'

  if (isNight) {
    sky = 'linear-gradient(165deg, #102c46 0%, #164b5c 55%, #1b6870 100%)'
    sunColor = '#ffc47d'
    farMountain = '#367681'
    middleMountain = '#285f6a'
    nearMountain = '#194b56'
  } else if (isTwilight && isSunset) {
    sky = 'linear-gradient(165deg, #4a7897 0%, #dc927b 58%, #ffc481 100%)'
    sunColor = '#ffb35f'
    farMountain = '#799a91'
    middleMountain = '#477b73'
    nearMountain = '#245b59'
  } else if (isTwilight) {
    sky = 'linear-gradient(165deg, #80cfd1 0%, #f4bd91 58%, #ffe0ab 100%)'
    sunColor = '#ffd98a'
    farMountain = '#8fc6b9'
    middleMountain = '#5d9e91'
    nearMountain = '#34766f'
  }

  return {
    isNight,
    isTwilight,
    isSunset,
    isNoonHour: vietnamHour === 12,
    isEveningImageHour: vietnamHour >= 17 && vietnamHour <= 23,
    sunLeft: `${4 + easedDaylightProgress * 92}%`,
    sunTop: `${sunTop}%`,
    sunOpacity: clamp((altitude + 6) / 6, 0, 1),
    sky,
    sunColor,
    farMountain,
    middleMountain,
    nearMountain,
    timeLabel: new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now)
  }
}

function SolarLandscape({ scene }: { scene: SolarScene }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute size-[clamp(64px,8vw,108px)] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[top,left,opacity,background-color,box-shadow] duration-1000"
        style={{
          left: scene.sunLeft,
          top: scene.sunTop,
          opacity: scene.sunOpacity,
          backgroundColor: scene.sunColor,
          boxShadow: `0 0 55px 16px ${scene.sunColor}55`
        }}
      />

      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          scene.isNight ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {[
          ['12%', '19%', '2px'],
          ['27%', '31%', '3px'],
          ['46%', '14%', '2px'],
          ['64%', '26%', '2px'],
          ['82%', '17%', '3px'],
          ['91%', '39%', '2px']
        ].map(([left, top, size]) => (
          <span
            key={`${left}-${top}`}
            className="absolute rounded-full bg-white/70"
            style={{ left, top, width: size, height: size }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[78%] w-full"
      >
        <path
          className="auth-mountain-layer transition-[fill] duration-1000"
          d="M0 410 C95 370 145 288 235 306 C305 319 332 389 411 370 C498 349 532 230 626 243 C724 258 733 357 815 342 C893 328 930 263 1000 274 L1000 700 L0 700 Z"
          fill={scene.farMountain}
        />
        <path
          className="auth-mountain-layer transition-[fill] duration-1000"
          d="M0 485 C91 454 137 367 211 375 C284 382 301 449 372 438 C450 426 486 323 564 330 C652 338 675 443 758 427 C847 410 903 334 1000 363 L1000 700 L0 700 Z"
          fill={scene.middleMountain}
        />
        <path
          className="auth-mountain-layer transition-[fill] duration-1000"
          d="M0 560 C112 518 178 504 270 521 C351 536 408 586 502 552 C598 518 661 497 747 530 C835 564 899 526 1000 501 L1000 700 L0 700 Z"
          fill={scene.nearMountain}
        />
      </svg>
    </div>
  )
}

function AuthLayout() {
  const { accessToken } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const brandRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const { now, isSynchronized } = useVietnamTime()
  const solarScene = getSolarScene(now)

  useEffect(() => {
    if (accessToken) {
      navigate(`${TRANSACTIONMANAGEMENT}/transaction-wallet`, { replace: true })
    }
  }, [accessToken, navigate])

  useEffect(() => {
    resetInactivityTimer()
  }, [location])

  useEffect(() => {
    if (!brandRef.current) return

    const media = gsap.matchMedia()
    const ctx = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline()
          .fromTo(
            '.auth-mountain-layer',
            { opacity: 0, y: 34 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: 'expo.out'
            }
          )
          .fromTo(
            mascotRef.current,
            { opacity: 0, y: 54, clipPath: 'inset(100% 0 0 0)' },
            {
              opacity: 1,
              y: 0,
              clipPath: 'inset(0% 0 0 0)',
              duration: 1.1,
              ease: 'expo.out'
            },
            '-=0.65'
          )
          .fromTo(
            '.auth-brand-copy > *',
            { opacity: 0, x: -24 },
            {
              opacity: 1,
              x: 0,
              duration: 0.65,
              stagger: 0.08,
              ease: 'power3.out'
            },
            '-=0.55'
          )

        if (formRef.current) {
          gsap.fromTo(
            formRef.current,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: 0.15,
              ease: 'power3.out'
            }
          )
        }
      })
    }, brandRef)

    const moveSceneX = gsap.quickTo(sceneRef.current, 'x', {
      duration: 0.8,
      ease: 'power3.out'
    })
    const moveSceneY = gsap.quickTo(sceneRef.current, 'y', {
      duration: 0.8,
      ease: 'power3.out'
    })
    const handlePointerMove = (event: PointerEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const bounds = brandRef.current?.getBoundingClientRect()
      if (!bounds) return

      moveSceneX(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 12
      )
      moveSceneY(((event.clientY - bounds.top) / bounds.height - 0.5) * 9)
    }
    const resetScene = () => {
      moveSceneX(0)
      moveSceneY(0)
    }
    const brandPanel = brandRef.current
    brandPanel.addEventListener('pointermove', handlePointerMove)
    brandPanel.addEventListener('pointerleave', resetScene)

    return () => {
      brandPanel.removeEventListener('pointermove', handlePointerMove)
      brandPanel.removeEventListener('pointerleave', resetScene)
      media.revert()
      ctx.revert()
    }
  }, [])

  const nightText = solarScene.isNight
  const headerUsesLightText =
    solarScene.isNight || (solarScene.isTwilight && solarScene.isSunset)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <div
        ref={brandRef}
        className="relative hidden flex-3 overflow-hidden transition-[background] duration-1000 md:flex"
        style={{ background: solarScene.sky }}
      >
        <SolarLandscape scene={solarScene} />

        <div className="absolute top-8 left-8 z-30 flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-md  bg-white/80 shadow-[0_8px_24px_rgba(13,148,136,0.12)] backdrop-blur-xs">
            <img
              src="/images/BEAM.png"
              alt="Beam"
              className="size-8 object-contain"
            />
          </div>
          <div className="leading-tight">
            <p
              className={`text-sm font-extrabold tracking-tight transition-colors duration-1000 ${
                headerUsesLightText ? 'text-teal-50' : 'text-teal-950'
              }`}
            >
              BEAM
            </p>
            <p
              className={`text-[10px] font-semibold tracking-[0.13em] transition-colors duration-1000 ${
                headerUsesLightText
                  ? 'text-teal-50/80'
                  : 'text-teal-800/65'
              }`}
            >
              FLEXPAY CMS
            </p>
          </div>
        </div>

        <div
          className={`absolute top-9 right-8 z-30 flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide transition-colors duration-1000 ${
            headerUsesLightText
              ? 'bg-white/10 text-teal-50'
              : 'bg-white/45 text-teal-900/70'
          }`}
          aria-label={`Giờ Việt Nam ${solarScene.timeLabel}${
            isSynchronized ? ', đã đồng bộ' : ', theo thiết bị'
          }`}
          title={
            isSynchronized
              ? 'Đã đồng bộ thời gian'
              : 'Đang dùng thời gian thiết bị'
          }
        >
          <span
            className={`size-1.5 rounded-full ${
              isSynchronized
                ? 'bg-emerald-300'
                : nightText
                  ? 'bg-sky-200'
                  : 'bg-amber-400'
            }`}
          />
          {solarScene.timeLabel} · VN
        </div>

        <div
          ref={sceneRef}
          className="pointer-events-none absolute inset-[12%_3%_13%] z-10 will-change-transform"
          aria-hidden="true"
        >
          <div className="absolute inset-x-[10%] bottom-[10%] h-3 rounded-[50%] bg-black/30 blur-[8px]" />
          <div
            ref={mascotRef}
            className="absolute inset-[6%_0_2%] z-10 flex items-center justify-center will-change-transform "
          >
            <img
              src={
                solarScene.isNoonHour
                  ? '/images/assets/capybara/Cappybara 17 Poses-17.png'
                  : solarScene.isEveningImageHour
                    ? '/images/assets/capybara/Cappybara_17_Poses-18.png'
                  : '/images/assets/capybara/Cappybara_17_Poses-02.png'
              }
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_20px_22px_rgba(9,51,55,0.2)] transition-[filter] duration-1000"
              style={{
                filter: nightText
                  ? 'brightness(0.72) saturate(0.8)'
                  : solarScene.isTwilight
                    ? 'brightness(0.9) saturate(0.92)'
                    : undefined
              }}
            />
          </div>
        </div>

        <div className="auth-brand-copy absolute bottom-8 left-8 z-30 max-w-[390px]">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-teal-50/65" />
            <p className="text-[10px] font-bold tracking-[0.14em] text-teal-50/80">
              BEAM EWALLET
            </p>
            <span className="h-px w-8 bg-teal-50/65" />
          </div>
          <h2 className="mb-2 text-xl font-extrabold tracking-tight text-[#c9fff9] drop-shadow-[0_1px_2px_rgba(5,47,50,0.25)]">
            Vận hành FlexPay trong một nhịp
          </h2>
          <p className="max-w-[280px] text-xs leading-relaxed text-teal-50/80">
            Hệ thống quản trị ví điện tử chuyên nghiệp, an toàn và hiệu quả.
          </p>
        </div>
      </div>

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
