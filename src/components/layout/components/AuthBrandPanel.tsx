import type { ReactElement, RefObject } from 'react'
import type { WeatherStatus } from '../hooks/useAuthWeather'
import { SolarLandscape } from './SolarLandscape'
import { WeatherBadge } from './WeatherBadge'
import type { AuthScene, WeatherCondition } from './weather-scene'

export interface AuthBrandPanelProps {
  scene: AuthScene
  isSynchronized: boolean
  weatherStatus: WeatherStatus
  condition: WeatherCondition | null
  locationLabel: string
  canRequest: boolean
  onRequestLocation: () => void
  brandRef: RefObject<HTMLDivElement | null>
  sceneRef: RefObject<HTMLDivElement | null>
  mascotRef: RefObject<HTMLDivElement | null>
}

interface BrandHeaderProps {
  usesLightText: boolean
}

function BrandHeader({ usesLightText }: BrandHeaderProps): ReactElement {
  return (
    <div className="absolute top-8 left-8 z-30 flex items-center gap-2.5">
      <div className="grid size-10 place-items-center rounded-md bg-white/80 shadow-[0_8px_24px_rgba(13,148,136,0.12)] backdrop-blur-xs">
        <img
          src="/images/BEAM.png"
          alt="Beam"
          className="size-8 object-contain"
        />
      </div>
      <div className="leading-tight">
        <p
          className={`text-sm font-extrabold tracking-tight transition-colors duration-1000 ${
            usesLightText ? 'text-teal-50' : 'text-teal-950'
          }`}
        >
          BEAM
        </p>
        <p
          className={`text-[10px] font-semibold tracking-[0.13em] transition-colors duration-1000 ${
            usesLightText ? 'text-teal-50/80' : 'text-teal-800/65'
          }`}
        >
          FLEXPAY CMS
        </p>
      </div>
    </div>
  )
}

interface StatusBadgesProps {
  scene: AuthScene
  isSynchronized: boolean
  weatherStatus: WeatherStatus
  condition: WeatherCondition | null
  locationLabel: string
  canRequest: boolean
  onRequestLocation: () => void
  usesLightText: boolean
}

interface VietnamTimeBadgeProps {
  scene: AuthScene
  isSynchronized: boolean
  usesLightText: boolean
}

function VietnamTimeBadge({
  scene,
  isSynchronized,
  usesLightText
}: VietnamTimeBadgeProps): ReactElement {
  const badgeClass = usesLightText
    ? 'bg-white/10 text-teal-50'
    : 'bg-white/45 text-teal-900/70'
  const syncDotClass = isSynchronized
    ? 'bg-emerald-300'
    : scene.isNight
      ? 'bg-sky-200'
      : 'bg-amber-400'

  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide transition-colors duration-1000 ${badgeClass}`}
      aria-label={`Giờ Việt Nam ${scene.timeLabel}${
        isSynchronized ? ', đã đồng bộ' : ', theo thiết bị'
      }`}
      title={
        isSynchronized ? 'Đã đồng bộ thời gian' : 'Đang dùng thời gian thiết bị'
      }
    >
      <span className={`size-1.5 rounded-full ${syncDotClass}`} />
      {scene.timeLabel} · VN
    </div>
  )
}

function StatusBadges({
  scene,
  isSynchronized,
  weatherStatus,
  condition,
  locationLabel,
  canRequest,
  onRequestLocation,
  usesLightText
}: StatusBadgesProps): ReactElement {
  return (
    <div className="absolute top-9 right-8 z-30 flex flex-col items-end gap-1.5">
      <VietnamTimeBadge
        scene={scene}
        isSynchronized={isSynchronized}
        usesLightText={usesLightText}
      />

      <WeatherBadge
        status={weatherStatus}
        condition={condition}
        locationLabel={locationLabel}
        canRequest={canRequest}
        usesLightText={usesLightText}
        onRequestLocation={onRequestLocation}
      />
    </div>
  )
}

interface MascotSceneProps {
  scene: AuthScene
  sceneRef: RefObject<HTMLDivElement | null>
  mascotRef: RefObject<HTMLDivElement | null>
}

function MascotScene({
  scene,
  sceneRef,
  mascotRef
}: MascotSceneProps): ReactElement {
  const imageSource = scene.isNoonHour
    ? '/images/assets/capybara/Cappybara 17 Poses-17.png'
    : scene.isEveningImageHour
      ? '/images/assets/capybara/Cappybara_17_Poses-18.png'
      : '/images/assets/capybara/Cappybara_17_Poses-02.png'
  const filter = scene.isNight
    ? 'brightness(0.72) saturate(0.8)'
    : scene.isTwilight
      ? 'brightness(0.9) saturate(0.92)'
      : undefined

  return (
    <div
      ref={sceneRef}
      className="pointer-events-none absolute inset-[12%_3%_13%] z-10 will-change-transform"
      aria-hidden="true"
    >
      <div className="absolute inset-x-[10%] bottom-[10%] h-3 rounded-[50%] bg-black/30 blur-[8px]" />
      <div
        ref={mascotRef}
        className="absolute inset-[6%_0_2%] z-10 flex items-center justify-center will-change-transform"
      >
        <img
          src={imageSource}
          alt=""
          className="h-full w-full object-contain drop-shadow-[0_20px_22px_rgba(9,51,55,0.2)] transition-[filter] duration-1000"
          style={{ filter }}
        />
      </div>
    </div>
  )
}

function BrandCopy(): ReactElement {
  return (
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
  )
}

export function AuthBrandPanel({
  scene,
  isSynchronized,
  weatherStatus,
  condition,
  locationLabel,
  canRequest,
  onRequestLocation,
  brandRef,
  sceneRef,
  mascotRef
}: AuthBrandPanelProps): ReactElement {
  const usesLightText =
    scene.isNight || (scene.isTwilight && scene.isSunset)

  return (
    <div
      ref={brandRef}
      className="relative hidden flex-3 overflow-hidden transition-[background] duration-1000 md:flex"
      style={{ background: scene.sky }}
    >
      <SolarLandscape scene={scene} />
      <BrandHeader usesLightText={usesLightText} />
      <StatusBadges
        scene={scene}
        isSynchronized={isSynchronized}
        weatherStatus={weatherStatus}
        condition={condition}
        locationLabel={locationLabel}
        canRequest={canRequest}
        onRequestLocation={onRequestLocation}
        usesLightText={usesLightText}
      />
      <MascotScene
        scene={scene}
        sceneRef={sceneRef}
        mascotRef={mascotRef}
      />
      <BrandCopy />
    </div>
  )
}
