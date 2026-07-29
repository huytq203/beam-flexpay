# Thời tiết realtime cho panel AuthLayout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Panel thương hiệu bên trái màn đăng nhập đổ mưa và dày mây theo thời tiết thực tế lấy từ Open-Meteo, chồng lên cảnh mặt trời theo giờ đã có.

**Architecture:** Thời tiết là **lớp modifier thuần hàm** phủ lên `SolarScene`, không thay thế nó — `applyWeather(scene, condition)` trả về `AuthScene`. Dữ liệu đi qua một RTK Query slice **cô lập hoàn toàn** khỏi luồng auth (base query riêng + nằm trong `SILENT_ENDPOINTS` của `errorMiddleware`). Toạ độ lấy theo chiến lược silent-first: chỉ đọc geolocation khi quyền đã ở trạng thái `granted`, còn lại dùng Hà Nội.

**Tech Stack:** Vite 8, React 19, TypeScript strict, RTK Query, Zod 4, Tailwind v4, GSAP, Vitest + Testing Library + msw.

**Spec:** `docs/superpowers/specs/2026-07-29-auth-weather-panel-design.md`

## Global Constraints

- Component < 200 dòng, function < 50 dòng, file < 300 dòng. `AuthLayout.tsx` hiện 258 dòng → Task 2 tách bắt buộc.
- Cấm `any`, cấm `@ts-ignore`, cấm `as` tuỳ tiện. Dùng type guard hoặc Zod parse để narrow.
- Enum dùng `as const` object + union type, **không** dùng `enum`.
- Named export bắt buộc (trừ default export của Page/Layout react-router).
- Zod là nguồn sự thật cho type có I/O: viết schema rồi `z.infer`, không viết type tay song song.
- Hàm public phải có kiểu trả về tường minh.
- Import dùng alias (`@/`, `@components`, `@services`, `@configs`, `@hooks`, `@utils`, `@slices`, `@type`, `@constants`), không dùng relative dài. Trong cùng thư mục thì relative ngắn (`./`, `../`) vẫn theo đúng thói quen hiện có của `src/components/layout`.
- Mọi UI đọc dữ liệu API phải xử lý đủ 4 trạng thái: loading / error / empty / data.
- Thời tiết là trang trí: **cấm** bắn `notification`, `Swal`, `globalMessage`; cấm chặn hay làm chậm đăng nhập; cấm log toạ độ người dùng.
- **Toạ độ** mặc định toàn dự án: Hà Nội `{ latitude: 21.0278, longitude: 105.8342 }`.
- **Múi giờ** trong `solar-scene.ts` giữ nguyên `'Asia/Ho_Chi_Minh'`. Đây là mã IANA của múi giờ **toàn Việt Nam** gồm cả Hà Nội — `Asia/Hanoi` và `Asia/Ha_Noi` không tồn tại trong tzdb, đổi sang là `Intl.DateTimeFormat` ném `RangeError`. Đồng hồ này cố ý luôn hiện giờ Việt Nam (nhãn "· VN").
- **Múi giờ trong request Open-Meteo** thì ngược lại: dùng `timezone=auto`, để API tự suy từ toạ độ. Hai chỗ này khác mục đích, đừng đồng bộ chúng với nhau.
- `src/test/setup.ts` chạy msw với `onUnhandledRequest: 'error'` → bất kỳ test nào chạm tới request Open-Meteo đều **phải** có handler, nếu không test fail.
- Chạy `yarn lint` (tsc --noEmit + eslint) trước mỗi commit. `lint-staged` chạy eslint với `--max-warnings=0`.
- Text tiếng Việt của panel hard-code tại chỗ, không qua `src/app/languages` (theo đúng convention hiện có của panel).

## File Structure

**Tạo mới**

| File | Trách nhiệm |
| --- | --- |
| `src/app/schemas/weather.schema.ts` | Zod schema + type cho response Open-Meteo |
| `src/app/services/apiWeather.ts` | RTK Query slice cô lập, base query riêng |
| `src/components/layout/components/weather-scene.ts` | Hằng số + hàm thuần: WMO → `WeatherCondition`, `applyWeather` |
| `src/components/layout/components/RainField.tsx` | Lớp mưa CSS |
| `src/components/layout/components/rain-field.css` | Keyframes mưa |
| `src/components/layout/components/WeatherBadge.tsx` | Badge nhiệt độ + nút opt-in vị trí |
| `src/components/layout/components/AuthBrandPanel.tsx` | Panel trái tách khỏi `AuthLayout` |
| `src/components/layout/hooks/useAuthIntroAnimation.ts` | GSAP intro + parallax tách khỏi `AuthLayout` |
| `src/components/layout/hooks/useWeatherCoords.ts` | Geolocation silent-first + cache |
| `src/components/layout/hooks/useAuthWeather.ts` | Gộp coords + query → 4 trạng thái |

**Sửa**

| File | Thay đổi |
| --- | --- |
| `src/components/layout/components/solar-scene.ts` | Toạ độ → Hà Nội, `getSolarScene(now, coords?)` |
| `src/components/layout/components/SolarLandscape.tsx` | Nhận `AuthScene`, render overcast + `RainField` |
| `src/components/layout/components/CloudField.tsx` | Nhận `opacityScale` |
| `src/components/layout/AuthLayout.tsx` | Rút gọn còn khung + redirect |
| `src/app/store.ts` | Đăng ký reducer + middleware `apiWeather` |
| `src/app/middleware/errorMiddleware.ts` | Thêm `'getCurrentWeather'` vào `SILENT_ENDPOINTS` |
| `src/test/mocks/handlers.ts` | Handler Open-Meteo mặc định + handler lỗi |
| `src/app/configs/env.ts` | Thêm `WEATHER` vào object `ENV` |
| `.env`, `.env.example`, `.env.production` | `VITE_WEATHER_API_URL` |

---

### Task 1: Đổi toạ độ mặc định sang Hà Nội

**Files:**
- Modify: `src/components/layout/components/solar-scene.ts:4-6,33-36`
- Test: `src/components/layout/components/test/solar-scene.test.ts` (create)

**Interfaces:**
- Consumes: không có
- Produces: `HANOI_COORDINATES: GeoCoordinates`, `getSolarScene(now: Date, coords?: GeoCoordinates): SolarScene`, `export interface GeoCoordinates { latitude: number; longitude: number }`

- [ ] **Step 1: Viết test thất bại**

Tạo `src/components/layout/components/test/solar-scene.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getSolarScene, HANOI_COORDINATES } from '../solar-scene'

const HO_CHI_MINH = { latitude: 10.8231, longitude: 106.6297 }
const MORNING = new Date('2026-07-29T02:30:00Z')

describe('getSolarScene', () => {
  it('phơi ra toạ độ Hà Nội làm mặc định', () => {
    expect(HANOI_COORDINATES).toEqual({
      latitude: 21.0278,
      longitude: 105.8342
    })
  })

  it('dùng Hà Nội khi không truyền toạ độ', () => {
    expect(getSolarScene(MORNING)).toEqual(
      getSolarScene(MORNING, HANOI_COORDINATES)
    )
  })

  it('cho cảnh khác nhau giữa Hà Nội và TP.HCM', () => {
    expect(getSolarScene(MORNING).sunLeft).not.toBe(
      getSolarScene(MORNING, HO_CHI_MINH).sunLeft
    )
  })

  it('vẫn format nhãn giờ theo múi giờ Việt Nam bất kể toạ độ', () => {
    // 02:30 UTC = 09:30 giờ Việt Nam (UTC+7)
    expect(getSolarScene(MORNING).timeLabel).toBe('09:30:00')
    expect(getSolarScene(MORNING, HO_CHI_MINH).timeLabel).toBe('09:30:00')
  })

  it('nhận diện ban đêm ở Hà Nội lúc nửa đêm giờ Việt Nam', () => {
    // 17:00 UTC = 00:00 giờ Việt Nam ngày hôm sau
    expect(getSolarScene(new Date('2026-07-29T17:00:00Z')).isNight).toBe(true)
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận nó fail**

Run: `yarn vitest run src/components/layout/components/test/solar-scene.test.ts`
Expected: FAIL — `HANOI_COORDINATES` chưa được export.

- [ ] **Step 3: Sửa `solar-scene.ts`**

Thay khối hằng số ở đầu file:

```ts
export interface GeoCoordinates {
  latitude: number
  longitude: number
}

export const HANOI_COORDINATES: GeoCoordinates = {
  latitude: 21.0278,
  longitude: 105.8342
}
```

Đổi signature và dòng đọc toạ độ trong `getSolarScene`:

```ts
export function getSolarScene(
  now: Date,
  coords: GeoCoordinates = HANOI_COORDINATES
): SolarScene {
  const { latitude, longitude } = coords
```

Thêm comment ngay trên mỗi chỗ dùng `timeZone` để chặn sửa nhầm về sau:

```ts
      // 'Asia/Ho_Chi_Minh' là tên IANA của múi giờ toàn Việt Nam, gồm cả Hà Nội.
      // Không tồn tại 'Asia/Hanoi' — đừng đổi theo tên thành phố.
      timeZone: 'Asia/Ho_Chi_Minh',
```

Xoá hằng `HO_CHI_MINH_COORDINATES` cũ.

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn vitest run src/components/layout/components/test/solar-scene.test.ts`
Expected: PASS — 5 test.

- [ ] **Step 5: Lint và commit**

```bash
yarn lint
git add src/components/layout/components/solar-scene.ts src/components/layout/components/test/solar-scene.test.ts
git commit -m "feat(auth-panel): đổi toạ độ cảnh mặt trời sang Hà Nội và tham số hoá getSolarScene"
```

---

### Task 2: Tách AuthLayout (refactor thuần, không đổi hành vi)

`AuthLayout.tsx` đang 258 dòng, vượt ngưỡng 200. Tách trước khi thêm weather để phần ghép sau này rơi vào file đã gọn.

**Files:**
- Create: `src/components/layout/components/AuthBrandPanel.tsx`
- Create: `src/components/layout/hooks/useAuthIntroAnimation.ts`
- Modify: `src/components/layout/AuthLayout.tsx` (viết lại)

**Interfaces:**
- Consumes: `getSolarScene`, `SolarScene` (Task 1)
- Produces:
  - `useAuthIntroAnimation(): { brandRef: RefObject<HTMLDivElement | null>; sceneRef: RefObject<HTMLDivElement | null>; mascotRef: RefObject<HTMLDivElement | null>; formRef: RefObject<HTMLDivElement | null> }`
  - `AuthBrandPanel({ scene, brandRef, sceneRef, mascotRef, isSynchronized }: AuthBrandPanelProps)`

- [ ] **Step 1: Tạo `useAuthIntroAnimation.ts`**

Chuyển nguyên xi hai `useEffect` GSAP (dòng 34–126 của `AuthLayout.tsx` hiện tại) vào hook, giữ y hệt logic:

```ts
import gsap from 'gsap'
import { useEffect, useRef, type RefObject } from 'react'

export interface AuthIntroAnimation {
  brandRef: RefObject<HTMLDivElement | null>
  sceneRef: RefObject<HTMLDivElement | null>
  mascotRef: RefObject<HTMLDivElement | null>
  formRef: RefObject<HTMLDivElement | null>
}

/** Timeline mở màn + parallax con trỏ cho panel thương hiệu. */
export function useAuthIntroAnimation(): AuthIntroAnimation {
  const brandRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

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
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' }
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
            { opacity: 1, y: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' }
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

      moveSceneX(((event.clientX - bounds.left) / bounds.width - 0.5) * 12)
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

  return { brandRef, sceneRef, mascotRef, formRef }
}
```

- [ ] **Step 2: Tạo `AuthBrandPanel.tsx`**

Chuyển nguyên xi khối JSX panel trái (dòng 134–242 hiện tại), nhận ref + scene qua props:

```tsx
import type { RefObject } from 'react'
import { SolarLandscape } from './SolarLandscape'
import type { SolarScene } from './solar-scene'

export interface AuthBrandPanelProps {
  scene: SolarScene
  isSynchronized: boolean
  brandRef: RefObject<HTMLDivElement | null>
  sceneRef: RefObject<HTMLDivElement | null>
  mascotRef: RefObject<HTMLDivElement | null>
}

export function AuthBrandPanel({
  scene,
  isSynchronized,
  brandRef,
  sceneRef,
  mascotRef
}: AuthBrandPanelProps) {
  const nightText = scene.isNight
  const headerUsesLightText =
    scene.isNight || (scene.isTwilight && scene.isSunset)

  return (
    <div
      ref={brandRef}
      className="relative hidden flex-3 overflow-hidden transition-[background] duration-1000 md:flex"
      style={{ background: scene.sky }}
    >
      <SolarLandscape scene={scene} />

      <div className="absolute top-8 left-8 z-30 flex items-center gap-2.5">
        <div className="grid size-10 place-items-center rounded-md bg-white/80 shadow-[0_8px_24px_rgba(13,148,136,0.12)] backdrop-blur-xs">
          <img src="/images/BEAM.png" alt="Beam" className="size-8 object-contain" />
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
              headerUsesLightText ? 'text-teal-50/80' : 'text-teal-800/65'
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
        aria-label={`Giờ Việt Nam ${scene.timeLabel}${
          isSynchronized ? ', đã đồng bộ' : ', theo thiết bị'
        }`}
        title={
          isSynchronized ? 'Đã đồng bộ thời gian' : 'Đang dùng thời gian thiết bị'
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
        {scene.timeLabel} · VN
      </div>

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
            src={
              scene.isNoonHour
                ? '/images/assets/capybara/Cappybara 17 Poses-17.png'
                : scene.isEveningImageHour
                  ? '/images/assets/capybara/Cappybara_17_Poses-18.png'
                  : '/images/assets/capybara/Cappybara_17_Poses-02.png'
            }
            alt=""
            className="h-full w-full object-contain drop-shadow-[0_20px_22px_rgba(9,51,55,0.2)] transition-[filter] duration-1000"
            style={{
              filter: nightText
                ? 'brightness(0.72) saturate(0.8)'
                : scene.isTwilight
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
  )
}
```

- [ ] **Step 3: Viết lại `AuthLayout.tsx`**

```tsx
import ScreenLoading from '@components/screen-loading/ScreenLoading'
import { resetInactivityTimer } from '@configs/fetchBaseQueryCustom'
import { TRANSACTIONMANAGEMENT } from '@constants/routersConstant'
import { useAppSelector } from '@hooks/hook'
import { Suspense, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AuthBrandPanel } from './components/AuthBrandPanel'
import { getSolarScene } from './components/solar-scene'
import { useAuthIntroAnimation } from './hooks/useAuthIntroAnimation'
import { useVietnamTime } from './hooks/useVietnamTime'
import './style.css'

function AuthLayout() {
  const { accessToken } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const { now, isSynchronized } = useVietnamTime()
  const { brandRef, sceneRef, mascotRef, formRef } = useAuthIntroAnimation()
  const solarScene = getSolarScene(now)

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
        scene={solarScene}
        isSynchronized={isSynchronized}
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
```

- [ ] **Step 4: Xác nhận không vỡ gì**

Run: `yarn lint && yarn test`
Expected: tsc sạch, eslint sạch, toàn bộ test hiện có vẫn PASS. `AuthLayout.tsx` còn ~57 dòng.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/AuthLayout.tsx src/components/layout/components/AuthBrandPanel.tsx src/components/layout/hooks/useAuthIntroAnimation.ts
git commit -m "refactor(auth-panel): tách AuthBrandPanel và useAuthIntroAnimation khỏi AuthLayout"
```

---

### Task 3: Zod schema cho response Open-Meteo

**Files:**
- Create: `src/app/schemas/weather.schema.ts`
- Test: `src/app/schemas/test/weather.schema.test.ts` (create)

**Interfaces:**
- Consumes: không có
- Produces: `weatherResponseSchema`, `type WeatherResponse`, `type WeatherCurrent = WeatherResponse['current']`

- [ ] **Step 1: Viết test thất bại**

```ts
import { describe, expect, it } from 'vitest'
import { weatherResponseSchema } from '../weather.schema'

const VALID = {
  current: {
    time: '2026-07-29T09:30',
    weather_code: 61,
    temperature_2m: 28.4,
    precipitation: 1.2,
    cloud_cover: 87,
    is_day: 1
  }
}

describe('weatherResponseSchema', () => {
  it('chấp nhận response đầy đủ của Open-Meteo', () => {
    const parsed = weatherResponseSchema.safeParse(VALID)

    expect(parsed.success).toBe(true)
  })

  it('bỏ qua field thừa mà Open-Meteo trả kèm', () => {
    const parsed = weatherResponseSchema.safeParse({
      ...VALID,
      latitude: 21.03,
      current_units: { temperature_2m: '°C' }
    })

    expect(parsed.success).toBe(true)
  })

  it('từ chối khi thiếu hẳn khối current', () => {
    expect(weatherResponseSchema.safeParse({}).success).toBe(false)
  })

  it('từ chối khi weather_code sai kiểu', () => {
    const parsed = weatherResponseSchema.safeParse({
      current: { ...VALID.current, weather_code: 'rain' }
    })

    expect(parsed.success).toBe(false)
  })

  it('từ chối cloud_cover ngoài khoảng 0–100', () => {
    expect(
      weatherResponseSchema.safeParse({
        current: { ...VALID.current, cloud_cover: 140 }
      }).success
    ).toBe(false)
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `yarn vitest run src/app/schemas/test/weather.schema.test.ts`
Expected: FAIL — không resolve được `../weather.schema`.

- [ ] **Step 3: Viết schema**

```ts
import { z } from 'zod'

/**
 * Khối `current` của Open-Meteo Forecast API. Chỉ khai báo các field thực sự
 * dùng tới; field thừa trong response được bỏ qua chứ không làm parse thất bại.
 */
export const weatherResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    weather_code: z.number().int(),
    temperature_2m: z.number(),
    precipitation: z.number(),
    cloud_cover: z.number().min(0).max(100),
    is_day: z.number().int()
  })
})

export type WeatherResponse = z.infer<typeof weatherResponseSchema>
export type WeatherCurrent = WeatherResponse['current']
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn vitest run src/app/schemas/test/weather.schema.test.ts`
Expected: PASS — 5 test.

- [ ] **Step 5: Lint và commit**

```bash
yarn lint
git add src/app/schemas/weather.schema.ts src/app/schemas/test/weather.schema.test.ts
git commit -m "feat(weather): thêm Zod schema cho response Open-Meteo"
```

---

### Task 4: Mapping WMO và hàm applyWeather

Trái tim của tính năng, thuần hàm nên test rất chặt.

**Files:**
- Create: `src/components/layout/components/weather-scene.ts`
- Test: `src/components/layout/components/test/weather-scene.test.ts` (create)

**Interfaces:**
- Consumes: `WeatherCurrent` (Task 3), `SolarScene` (Task 1)
- Produces:
  - `RainIntensity` (`'none' | 'light' | 'moderate' | 'heavy'`), `WeatherKind` (`'clear' | 'cloudy' | 'drizzle' | 'rain' | 'storm'`)
  - `RAIN_DROP_COUNT: Record<RainIntensity, number>`
  - `interface WeatherCondition { kind; rain; cloudCover; temperature; label }`
  - `interface AuthScene extends SolarScene { rain: RainIntensity; overcast: number; cloudOpacityScale: number }`
  - `readWeatherCondition(current: WeatherCurrent): WeatherCondition`
  - `applyWeather(scene: SolarScene, condition: WeatherCondition | null): AuthScene`

- [ ] **Step 1: Viết test thất bại**

```ts
import { describe, expect, it } from 'vitest'
import { getSolarScene } from '../solar-scene'
import {
  applyWeather,
  RAIN_DROP_COUNT,
  readWeatherCondition,
  type WeatherCondition
} from '../weather-scene'
import type { WeatherCurrent } from '@/app/schemas/weather.schema'

const current = (patch: Partial<WeatherCurrent> = {}): WeatherCurrent => ({
  time: '2026-07-29T09:30',
  weather_code: 0,
  temperature_2m: 28,
  precipitation: 0,
  cloud_cover: 0,
  is_day: 1,
  ...patch
})

const NOON = new Date('2026-07-29T05:00:00Z')

const condition = (patch: Partial<WeatherCondition> = {}): WeatherCondition => ({
  kind: 'clear',
  rain: 'none',
  cloudCover: 0,
  temperature: 28,
  label: 'Trời quang',
  ...patch
})

describe('readWeatherCondition', () => {
  it.each([
    [0, 'clear', 'none'],
    [1, 'clear', 'none'],
    [2, 'cloudy', 'none'],
    [3, 'cloudy', 'none'],
    [45, 'cloudy', 'none'],
    [48, 'cloudy', 'none'],
    [51, 'drizzle', 'light'],
    [57, 'drizzle', 'light'],
    [61, 'rain', 'moderate'],
    [63, 'rain', 'moderate'],
    [80, 'rain', 'moderate'],
    [81, 'rain', 'moderate'],
    [65, 'storm', 'heavy'],
    [82, 'storm', 'heavy'],
    [95, 'storm', 'heavy'],
    [99, 'storm', 'heavy']
  ] as const)('map mã WMO %i thành %s/%s', (code, kind, rain) => {
    const result = readWeatherCondition(current({ weather_code: code }))

    expect(result.kind).toBe(kind)
    expect(result.rain).toBe(rain)
  })

  it('coi mã lạ ngoài bảng là trời quang', () => {
    const result = readWeatherCondition(current({ weather_code: 123 }))

    expect(result.kind).toBe('clear')
    expect(result.rain).toBe('none')
  })

  it('suy mưa cho mã tuyết theo lượng mưa đo được', () => {
    expect(
      readWeatherCondition(current({ weather_code: 73, precipitation: 0 })).rain
    ).toBe('none')
    expect(
      readWeatherCondition(current({ weather_code: 73, precipitation: 0.6 })).rain
    ).toBe('moderate')
  })

  it('giữ nguyên nhiệt độ và độ phủ mây', () => {
    const result = readWeatherCondition(
      current({ temperature_2m: 31.6, cloud_cover: 72 })
    )

    expect(result.temperature).toBe(31.6)
    expect(result.cloudCover).toBe(72)
  })

  it('gắn nhãn tiếng Việt cho từng kiểu thời tiết', () => {
    expect(readWeatherCondition(current({ weather_code: 0 })).label).toBe(
      'Trời quang'
    )
    expect(readWeatherCondition(current({ weather_code: 61 })).label).toBe(
      'Mưa rào'
    )
  })
})

describe('applyWeather', () => {
  const solar = getSolarScene(NOON)

  it('trả cảnh mặt trời nguyên vẹn khi chưa có dữ liệu thời tiết', () => {
    const scene = applyWeather(solar, null)

    expect(scene.rain).toBe('none')
    expect(scene.overcast).toBe(0)
    expect(scene.cloudOpacityScale).toBe(1)
    expect(scene.sky).toBe(solar.sky)
  })

  it('không làm mất token nào của cảnh mặt trời', () => {
    const scene = applyWeather(solar, condition({ cloudCover: 50 }))

    expect(scene.sunLeft).toBe(solar.sunLeft)
    expect(scene.farMountain).toBe(solar.farMountain)
    expect(scene.timeLabel).toBe(solar.timeLabel)
  })

  it('tăng độ xám theo độ phủ mây', () => {
    expect(applyWeather(solar, condition({ cloudCover: 0 })).overcast).toBe(0)
    expect(
      applyWeather(solar, condition({ cloudCover: 100 })).overcast
    ).toBeCloseTo(0.35)
  })

  it('cộng thêm độ xám khi đang mưa', () => {
    const dry = applyWeather(solar, condition({ cloudCover: 50 })).overcast
    const wet = applyWeather(
      solar,
      condition({ cloudCover: 50, rain: 'heavy' })
    ).overcast

    expect(wet).toBeGreaterThan(dry)
  })

  it('chặn trần độ xám ở 0.5 để cảnh không đen kịt', () => {
    const scene = applyWeather(
      solar,
      condition({ cloudCover: 100, rain: 'heavy' })
    )

    expect(scene.overcast).toBeLessThanOrEqual(0.5)
  })

  it('làm mây mờ đi khi trời quang và đậm lên khi trời phủ kín', () => {
    expect(
      applyWeather(solar, condition({ cloudCover: 0 })).cloudOpacityScale
    ).toBeCloseTo(0.55)
    expect(
      applyWeather(solar, condition({ cloudCover: 100 })).cloudOpacityScale
    ).toBeCloseTo(1)
  })
})

describe('RAIN_DROP_COUNT', () => {
  it('quy định số hạt mưa cho từng cấp độ', () => {
    expect(RAIN_DROP_COUNT).toEqual({
      none: 0,
      light: 28,
      moderate: 60,
      heavy: 110
    })
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `yarn vitest run src/components/layout/components/test/weather-scene.test.ts`
Expected: FAIL — không resolve được `../weather-scene`.

- [ ] **Step 3: Viết `weather-scene.ts`**

```ts
import type { WeatherCurrent } from '@/app/schemas/weather.schema'
import type { SolarScene } from './solar-scene'

export const RainIntensity = {
  NONE: 'none',
  LIGHT: 'light',
  MODERATE: 'moderate',
  HEAVY: 'heavy'
} as const
export type RainIntensity = (typeof RainIntensity)[keyof typeof RainIntensity]

export const WeatherKind = {
  CLEAR: 'clear',
  CLOUDY: 'cloudy',
  DRIZZLE: 'drizzle',
  RAIN: 'rain',
  STORM: 'storm'
} as const
export type WeatherKind = (typeof WeatherKind)[keyof typeof WeatherKind]

export interface WeatherCondition {
  kind: WeatherKind
  rain: RainIntensity
  /** Độ phủ mây 0–100. */
  cloudCover: number
  temperature: number
  /** Nhãn tiếng Việt hiển thị trên badge. */
  label: string
}

/**
 * Cảnh mặt trời đã được thời tiết điều chỉnh. Mọi token của `SolarScene` giữ
 * nguyên; thời tiết chỉ cộng thêm ba trường điều khiển lớp phủ.
 */
export interface AuthScene extends SolarScene {
  rain: RainIntensity
  /** Alpha của lớp xám phủ lên trời, 0–0.5. */
  overcast: number
  /** Hệ số nhân opacity cho dải mây, 0.55–1. */
  cloudOpacityScale: number
}

export const RAIN_DROP_COUNT: Record<RainIntensity, number> = {
  none: 0,
  light: 28,
  moderate: 60,
  heavy: 110
}

const KIND_LABEL: Record<WeatherKind, string> = {
  clear: 'Trời quang',
  cloudy: 'Nhiều mây',
  drizzle: 'Mưa phùn',
  rain: 'Mưa rào',
  storm: 'Mưa to'
}

const KIND_RAIN: Record<WeatherKind, RainIntensity> = {
  clear: 'none',
  cloudy: 'none',
  drizzle: 'light',
  rain: 'moderate',
  storm: 'heavy'
}

/** Mã WMO của Open-Meteo, nhóm theo hiệu ứng cần render. */
const WMO_KIND = new Map<number, WeatherKind>([
  ...([0, 1] as const).map((code) => [code, WeatherKind.CLEAR] as const),
  ...([2, 3, 45, 48] as const).map((code) => [code, WeatherKind.CLOUDY] as const),
  ...([51, 53, 55, 56, 57] as const).map(
    (code) => [code, WeatherKind.DRIZZLE] as const
  ),
  ...([61, 63, 80, 81] as const).map((code) => [code, WeatherKind.RAIN] as const),
  ...([65, 66, 67, 82, 95, 96, 99] as const).map(
    (code) => [code, WeatherKind.STORM] as const
  )
])

/** Mã tuyết 71–86: Việt Nam không dùng tới, suy hiệu ứng theo lượng mưa đo được. */
const isSnowCode = (code: number): boolean => code >= 71 && code <= 86

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum)

const RAIN_DIM: Record<RainIntensity, number> = {
  none: 0,
  light: 0.04,
  moderate: 0.08,
  heavy: 0.14
}

export function readWeatherCondition(current: WeatherCurrent): WeatherCondition {
  const kind = WMO_KIND.get(current.weather_code) ?? WeatherKind.CLEAR
  const rain = isSnowCode(current.weather_code)
    ? current.precipitation > 0
      ? RainIntensity.MODERATE
      : RainIntensity.NONE
    : KIND_RAIN[kind]

  return {
    kind,
    rain,
    cloudCover: current.cloud_cover,
    temperature: current.temperature_2m,
    label: KIND_LABEL[kind]
  }
}

export function applyWeather(
  scene: SolarScene,
  condition: WeatherCondition | null
): AuthScene {
  if (!condition) {
    return { ...scene, rain: RainIntensity.NONE, overcast: 0, cloudOpacityScale: 1 }
  }

  const cloudRatio = condition.cloudCover / 100

  return {
    ...scene,
    rain: condition.rain,
    overcast: clamp(cloudRatio * 0.35 + RAIN_DIM[condition.rain], 0, 0.5),
    cloudOpacityScale: 0.55 + cloudRatio * 0.45
  }
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn vitest run src/components/layout/components/test/weather-scene.test.ts`
Expected: PASS — toàn bộ, gồm 16 case của `it.each`.

- [ ] **Step 5: Lint và commit**

```bash
yarn lint
git add src/components/layout/components/weather-scene.ts src/components/layout/components/test/weather-scene.test.ts
git commit -m "feat(weather): map mã WMO sang hiệu ứng và thêm applyWeather"
```

---

### Task 5: RTK Query slice cô lập + chặn toast lỗi

Đây là task rủi ro cao nhất: nếu làm sai, lỗi thời tiết sẽ bắn toast đỏ lên màn đăng nhập hoặc kích hoạt luồng logout.

**Files:**
- Create: `src/app/services/apiWeather.ts`
- Modify: `src/app/configs/env.ts`
- Modify: `src/app/store.ts:3,10-27`
- Modify: `src/app/middleware/errorMiddleware.ts:26-31`
- Modify: `src/app/middleware/test/errorMiddleware.test.ts` (thêm endpoint vào `it.each`)
- Modify: `src/test/mocks/handlers.ts`
- Modify: `.env`, `.env.example`, `.env.production`
- Test: `src/app/services/test/apiWeather.test.ts` (create)

**Interfaces:**
- Consumes: `weatherResponseSchema`, `WeatherCurrent` (Task 3)
- Produces:
  - `apiWeather` (reducerPath `'weatherApi'`)
  - `useGetCurrentWeatherQuery(arg: WeatherQueryArg)` với `interface WeatherQueryArg { latitude: number; longitude: number }`
  - endpoint trả `WeatherCurrent | null` (null = response không hợp lệ, coi như empty)

- [ ] **Step 1: Thêm biến môi trường**

Thêm vào cả `.env`, `.env.example`, `.env.production`:

```
# === Thời tiết panel đăng nhập (Open-Meteo, không cần API key) ===
VITE_WEATHER_API_URL=https://api.open-meteo.com/v1
```

Khai báo qua `ENV` theo đúng pattern có sẵn — `src/app/configs/env.ts`:

```ts
export const ENV = {
    API_LOGIN: import.meta.env.VITE_API_LOGIN,
    API_FEE: import.meta.env.VITE_FEE_API_URL,
    API_WALLETCORE: import.meta.env.VITE_API_WALLETCORE,
    API_MERCHANT: import.meta.env.VITE_API_MERCHANT,
    // Không phải secret. Có default để panel vẫn chạy khi quên khai báo .env.
    WEATHER: (import.meta.env.VITE_WEATHER_API_URL ||
        'https://api.open-meteo.com/v1') as string
}
```

`as string` ở đây là hợp lệ: `ImportMetaEnv` mặc định của Vite có index signature trả `any`, ép về `string` sau khi đã có toán tử `||` chặn giá trị rỗng là cách duy nhất giữ `WEATHER` khỏi bị suy ra `any` và lan ra toàn bộ base query.

- [ ] **Step 2: Thêm msw handler**

Trong `src/test/mocks/handlers.ts`, thêm vào mảng `handlers`:

```ts
  http.get('*/v1/forecast', () =>
    HttpResponse.json({
      latitude: 21.03,
      longitude: 105.83,
      current: {
        time: '2026-07-29T09:30',
        weather_code: 61,
        temperature_2m: 28.4,
        precipitation: 1.2,
        cloud_cover: 87,
        is_day: 1
      }
    })
  )
```

Và thêm vào object `errorHandlers`:

```ts
  weatherUnavailable: http.get('*/v1/forecast', () =>
    HttpResponse.json({ error: true, reason: 'busy' }, { status: 503 })
  ),
  weatherMalformed: http.get('*/v1/forecast', () =>
    HttpResponse.json({ latitude: 21.03 })
  ),
  weatherOffline: http.get('*/v1/forecast', () => HttpResponse.error())
```

- [ ] **Step 3: Viết test thất bại**

Tạo `src/app/services/test/apiWeather.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/app/store'
import { apiWeather } from '../apiWeather'
import { errorHandlers } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'

const HANOI = { latitude: 21.0278, longitude: 105.8342 }

const fetchWeather = () => {
  const store = createAppStore()
  return store.dispatch(apiWeather.endpoints.getCurrentWeather.initiate(HANOI))
}

describe('apiWeather', () => {
  it('trả khối current đã validate khi Open-Meteo phản hồi hợp lệ', async () => {
    const result = await fetchWeather()

    expect(result.data).toMatchObject({
      weather_code: 61,
      temperature_2m: 28.4,
      cloud_cover: 87
    })
  })

  it('trả null thay vì ném lỗi khi response thiếu khối current', async () => {
    server.use(errorHandlers.weatherMalformed)

    const result = await fetchWeather()

    expect(result.data).toBeNull()
    expect(result.isError).toBe(false)
  })

  it('vào trạng thái lỗi khi Open-Meteo trả 503', async () => {
    server.use(errorHandlers.weatherUnavailable)

    const result = await fetchWeather()

    expect(result.isError).toBe(true)
    expect(result.data).toBeUndefined()
  })

  it('vào trạng thái lỗi khi mất mạng', async () => {
    server.use(errorHandlers.weatherOffline)

    const result = await fetchWeather()

    expect(result.isError).toBe(true)
  })
})
```

- [ ] **Step 4: Chạy test để xác nhận fail**

Run: `yarn vitest run src/app/services/test/apiWeather.test.ts`
Expected: FAIL — không resolve được `../apiWeather`.

- [ ] **Step 5: Viết `apiWeather.ts`**

```ts
import { weatherResponseSchema, type WeatherCurrent } from '@/app/schemas/weather.schema'
import { ENV } from '@configs/env'
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'

export interface WeatherQueryArg {
  latitude: number
  longitude: number
}

const CURRENT_FIELDS =
  'weather_code,temperature_2m,precipitation,cloud_cover,is_day'

/**
 * Base query RIÊNG, cố ý không dùng `fetchBaseQueryCustom`: file đó gắn Bearer
 * token, giữ singleton refresh-token và bắn Swal khi lỗi. Thời tiết chỉ là chi
 * tiết trang trí, một lỗi 503 của Open-Meteo không được phép chạm tới phiên
 * đăng nhập của người dùng.
 */
const weatherBaseQuery = retry(
  fetchBaseQuery({ baseUrl: ENV.WEATHER, timeout: 5_000 }),
  { maxRetries: 1 }
)

export const apiWeather = createApi({
  reducerPath: 'weatherApi',
  baseQuery: weatherBaseQuery,
  endpoints: (build) => ({
    getCurrentWeather: build.query<WeatherCurrent | null, WeatherQueryArg>({
      query: ({ latitude, longitude }) => ({
        url: '/forecast',
        method: 'GET',
        params: {
          latitude,
          longitude,
          current: CURRENT_FIELDS,
          // 'auto' = Open-Meteo suy múi giờ từ chính toạ độ gửi lên. Không
          // hardcode múi giờ VN vì geolocation có thể trả về nơi khác.
          timezone: 'auto'
        }
      }),
      // safeParse chứ không parse: response méo phải rơi vào trạng thái "empty"
      // chứ không được biến thành rejected action đi qua errorMiddleware.
      transformResponse: (response: unknown): WeatherCurrent | null => {
        const parsed = weatherResponseSchema.safeParse(response)
        return parsed.success ? parsed.data.current : null
      }
    })
  })
})

export const { useGetCurrentWeatherQuery } = apiWeather
```

- [ ] **Step 6: Đăng ký vào store**

Trong `src/app/store.ts`, thêm import và hai dòng đăng ký:

```ts
import { apiWeather } from '@services/apiWeather'
```

Trong `reducer`:
```ts
    [apiWeather.reducerPath]: apiWeather.reducer,
```

Trong chuỗi `.concat(...)`, đặt **trước** `errorMiddleware`:
```ts
      apiWeather.middleware,
```

- [ ] **Step 7: Chặn toast lỗi trong errorMiddleware**

Trong `src/app/middleware/errorMiddleware.ts`, thêm vào mảng `SILENT_ENDPOINTS`:

```ts
const SILENT_ENDPOINTS: string[] = [
  'adminChangePassword',
  'adminForgotPassword',
  'validateAdminResetToken',
  'resetAdminPassword',
  // Thời tiết panel đăng nhập chỉ là trang trí — lỗi của nó không được hiện
  // toast lên màn hình người dùng đang đăng nhập.
  'getCurrentWeather'
]
```

Trong `src/app/middleware/test/errorMiddleware.test.ts`, thêm `'getCurrentWeather'` vào mảng của `it.each` đang liệt kê các silent endpoint.

- [ ] **Step 8: Chạy toàn bộ test liên quan**

Run: `yarn vitest run src/app/services/test/apiWeather.test.ts src/app/middleware/test/errorMiddleware.test.ts`
Expected: PASS cả hai file.

- [ ] **Step 9: Lint và commit**

```bash
yarn lint
git add src/app/services/apiWeather.ts src/app/services/test/apiWeather.test.ts src/app/configs/env.ts src/app/store.ts src/app/middleware/errorMiddleware.ts src/app/middleware/test/errorMiddleware.test.ts src/test/mocks/handlers.ts .env .env.example .env.production
git commit -m "feat(weather): thêm RTK Query slice Open-Meteo cô lập khỏi luồng auth"
```

---

### Task 6: Hook lấy toạ độ silent-first

**Files:**
- Create: `src/components/layout/hooks/useWeatherCoords.ts`
- Test: `src/components/layout/hooks/useWeatherCoords.test.ts` (create)

**Interfaces:**
- Consumes: `HANOI_COORDINATES` (Task 1)
- Produces:
  - `interface WeatherCoords { latitude: number; longitude: number; isPrecise: boolean }`
  - `WEATHER_COORDS_CACHE_KEY = 'auth-weather-coords'`
  - `useWeatherCoords(): { coords: WeatherCoords; canRequest: boolean; requestLocation: () => void }`

- [ ] **Step 1: Viết test thất bại**

```ts
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWeatherCoords, WEATHER_COORDS_CACHE_KEY } from './useWeatherCoords'

const PRECISE = { latitude: 16.0544, longitude: 108.2022 }

const mockGeolocation = (
  implementation: (success: PositionCallback, failure: PositionErrorCallback) => void
) => {
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition: vi.fn(implementation) },
    configurable: true
  })
}

const mockPermissions = (state: PermissionState | null) => {
  Object.defineProperty(navigator, 'permissions', {
    value:
      state === null
        ? undefined
        : { query: vi.fn().mockResolvedValue({ state }) },
    configurable: true
  })
}

const resolveWith = (coords: { latitude: number; longitude: number }) =>
  mockGeolocation((success) => {
    success({ coords } as GeolocationPosition)
  })

beforeEach(() => {
  sessionStorage.clear()
  resolveWith(PRECISE)
})

afterEach(() => vi.restoreAllMocks())

describe('useWeatherCoords', () => {
  it('mặc định trả toạ độ Hà Nội và đánh dấu không chính xác', () => {
    mockPermissions('prompt')

    const { result } = renderHook(() => useWeatherCoords())

    expect(result.current.coords).toEqual({
      latitude: 21.0278,
      longitude: 105.8342,
      isPrecise: false
    })
  })

  it('đọc vị trí thật khi quyền đã được cấp từ trước', async () => {
    mockPermissions('granted')

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() =>
      expect(result.current.coords).toEqual({ ...PRECISE, isPrecise: true })
    )
  })

  it('không tự gọi getCurrentPosition khi quyền đang ở trạng thái prompt', async () => {
    mockPermissions('prompt')

    renderHook(() => useWeatherCoords())

    await waitFor(() => expect(navigator.permissions.query).toHaveBeenCalled())
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('cho phép người dùng tự yêu cầu khi quyền ở trạng thái prompt', async () => {
    mockPermissions('prompt')

    const { result } = renderHook(() => useWeatherCoords())
    await waitFor(() => expect(result.current.canRequest).toBe(true))

    act(() => result.current.requestLocation())

    await waitFor(() =>
      expect(result.current.coords).toEqual({ ...PRECISE, isPrecise: true })
    )
  })

  it('không mời gọi lại khi người dùng đã từ chối quyền', async () => {
    mockPermissions('denied')

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() => expect(result.current.canRequest).toBe(false))
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('vẫn cho bấm thủ công khi trình duyệt không có Permissions API', async () => {
    mockPermissions(null)

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() => expect(result.current.canRequest).toBe(true))
    expect(result.current.coords.isPrecise).toBe(false)
  })

  it('giữ Hà Nội khi geolocation báo lỗi', async () => {
    mockPermissions('granted')
    mockGeolocation((_success, failure) => {
      failure({ code: 3, message: 'timeout' } as GeolocationPositionError)
    })

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() => expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled())
    expect(result.current.coords.isPrecise).toBe(false)
  })

  it('dùng lại toạ độ đã cache thay vì hỏi lại trình duyệt', async () => {
    sessionStorage.setItem(
      WEATHER_COORDS_CACHE_KEY,
      JSON.stringify({ ...PRECISE, isPrecise: true })
    )
    mockPermissions('granted')

    const { result } = renderHook(() => useWeatherCoords())

    expect(result.current.coords).toEqual({ ...PRECISE, isPrecise: true })
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('ghi toạ độ vừa lấy được vào cache', async () => {
    mockPermissions('granted')

    renderHook(() => useWeatherCoords())

    await waitFor(() =>
      expect(sessionStorage.getItem(WEATHER_COORDS_CACHE_KEY)).toBe(
        JSON.stringify({ ...PRECISE, isPrecise: true })
      )
    )
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `yarn vitest run src/components/layout/hooks/useWeatherCoords.test.ts`
Expected: FAIL — không resolve được `./useWeatherCoords`.

- [ ] **Step 3: Viết hook**

```ts
import { useCallback, useEffect, useState } from 'react'
import { HANOI_COORDINATES } from '../components/solar-scene'

export interface WeatherCoords {
  latitude: number
  longitude: number
  /** true khi là toạ độ thật của người dùng, false khi đang dùng mặc định Hà Nội. */
  isPrecise: boolean
}

export interface UseWeatherCoordsResult {
  coords: WeatherCoords
  /** true khi còn có thể xin quyền vị trí bằng một hành động chủ đích. */
  canRequest: boolean
  requestLocation: () => void
}

export const WEATHER_COORDS_CACHE_KEY = 'auth-weather-coords'

const FALLBACK: WeatherCoords = { ...HANOI_COORDINATES, isPrecise: false }

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 5_000,
  maximumAge: 10 * 60_000
}

const isCoords = (value: unknown): value is WeatherCoords => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.latitude === 'number' &&
    typeof candidate.longitude === 'number' &&
    typeof candidate.isPrecise === 'boolean'
  )
}

const readCache = (): WeatherCoords | null => {
  try {
    const raw = sessionStorage.getItem(WEATHER_COORDS_CACHE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isCoords(parsed) ? parsed : null
  } catch {
    return null
  }
}

const writeCache = (coords: WeatherCoords): void => {
  try {
    sessionStorage.setItem(WEATHER_COORDS_CACHE_KEY, JSON.stringify(coords))
  } catch {
    // sessionStorage bị chặn (chế độ riêng tư): bỏ qua, chỉ mất cache.
  }
}

/**
 * Toạ độ cho panel thời tiết theo chiến lược silent-first: chỉ đọc geolocation
 * khi quyền đã ở trạng thái `granted`. Ở trạng thái `prompt` hook cố tình KHÔNG
 * gọi, để màn đăng nhập không bật popup xin quyền bất ngờ — người dùng phải tự
 * bấm nút thì mới hỏi.
 */
export function useWeatherCoords(): UseWeatherCoordsResult {
  const [coords, setCoords] = useState<WeatherCoords>(
    () => readCache() ?? FALLBACK
  )
  const [canRequest, setCanRequest] = useState(false)

  const locate = useCallback(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next: WeatherCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isPrecise: true
        }
        setCoords(next)
        setCanRequest(false)
        writeCache(next)
      },
      () => {
        // Giữ nguyên Hà Nội. Không log toạ độ, không báo lỗi cho người dùng.
      },
      GEOLOCATION_OPTIONS
    )
  }, [])

  useEffect(() => {
    if (readCache()?.isPrecise) return

    let disposed = false

    const resolvePermission = async () => {
      if (!navigator.permissions?.query) {
        // Không có Permissions API: không đoán, để người dùng tự bấm.
        if (!disposed) setCanRequest(true)
        return
      }

      try {
        const status = await navigator.permissions.query({ name: 'geolocation' })
        if (disposed) return

        if (status.state === 'granted') {
          locate()
          return
        }
        setCanRequest(status.state === 'prompt')
      } catch {
        if (!disposed) setCanRequest(true)
      }
    }

    void resolvePermission()

    return () => {
      disposed = true
    }
  }, [locate])

  return { coords, canRequest, requestLocation: locate }
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn vitest run src/components/layout/hooks/useWeatherCoords.test.ts`
Expected: PASS — 9 test.

- [ ] **Step 5: Lint và commit**

```bash
yarn lint
git add src/components/layout/hooks/useWeatherCoords.ts src/components/layout/hooks/useWeatherCoords.test.ts
git commit -m "feat(weather): thêm useWeatherCoords theo chiến lược silent-first"
```

---

### Task 7: Hook gộp 4 trạng thái

**Files:**
- Create: `src/components/layout/hooks/useAuthWeather.ts`
- Test: `src/components/layout/hooks/useAuthWeather.test.tsx` (create)

**Interfaces:**
- Consumes: `useWeatherCoords` (Task 6), `useGetCurrentWeatherQuery` (Task 5), `readWeatherCondition`/`WeatherCondition` (Task 4)
- Produces:
  - `WeatherStatus` (`'loading' | 'error' | 'empty' | 'data'`)
  - `useAuthWeather(): { status: WeatherStatus; condition: WeatherCondition | null; canRequest: boolean; requestLocation: () => void }`

- [ ] **Step 1: Viết test thất bại**

```tsx
import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/app/store'
import { errorHandlers } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { useAuthWeather } from './useAuthWeather'

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createAppStore()}>{children}</Provider>
)

beforeEach(() => {
  sessionStorage.clear()
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
    configurable: true
  })
})

describe('useAuthWeather', () => {
  it('bắt đầu ở trạng thái loading và chưa có điều kiện thời tiết', () => {
    const { result } = renderHook(() => useAuthWeather(), { wrapper })

    expect(result.current.status).toBe('loading')
    expect(result.current.condition).toBeNull()
  })

  it('trả điều kiện đã map khi lấy được dữ liệu', async () => {
    const { result } = renderHook(() => useAuthWeather(), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('data'))
    expect(result.current.condition).toMatchObject({
      kind: 'rain',
      rain: 'moderate',
      cloudCover: 87,
      temperature: 28.4
    })
  })

  it('vào trạng thái error và không có điều kiện khi API hỏng', async () => {
    server.use(errorHandlers.weatherUnavailable)

    const { result } = renderHook(() => useAuthWeather(), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.condition).toBeNull()
  })

  it('vào trạng thái empty khi response không hợp lệ', async () => {
    server.use(errorHandlers.weatherMalformed)

    const { result } = renderHook(() => useAuthWeather(), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('empty'))
    expect(result.current.condition).toBeNull()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `yarn vitest run src/components/layout/hooks/useAuthWeather.test.tsx`
Expected: FAIL — không resolve được `./useAuthWeather`.

- [ ] **Step 3: Viết hook**

```ts
import { useGetCurrentWeatherQuery } from '@services/apiWeather'
import {
  readWeatherCondition,
  type WeatherCondition
} from '../components/weather-scene'
import { useWeatherCoords } from './useWeatherCoords'

export const WeatherStatus = {
  LOADING: 'loading',
  ERROR: 'error',
  EMPTY: 'empty',
  DATA: 'data'
} as const
export type WeatherStatus = (typeof WeatherStatus)[keyof typeof WeatherStatus]

export interface AuthWeather {
  status: WeatherStatus
  condition: WeatherCondition | null
  canRequest: boolean
  requestLocation: () => void
}

/** Làm mới cùng nhịp 10 phút với đồng bộ đồng hồ của useVietnamTime. */
const REFRESH_INTERVAL_MS = 10 * 60_000

export function useAuthWeather(): AuthWeather {
  const { coords, canRequest, requestLocation } = useWeatherCoords()
  const { data, isError, isLoading } = useGetCurrentWeatherQuery(
    { latitude: coords.latitude, longitude: coords.longitude },
    {
      pollingInterval: REFRESH_INTERVAL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true
    }
  )

  const status: WeatherStatus = isLoading
    ? WeatherStatus.LOADING
    : isError
      ? WeatherStatus.ERROR
      : data
        ? WeatherStatus.DATA
        : WeatherStatus.EMPTY

  return {
    status,
    condition: data ? readWeatherCondition(data) : null,
    canRequest,
    requestLocation
  }
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn vitest run src/components/layout/hooks/useAuthWeather.test.tsx`
Expected: PASS — 4 test.

- [ ] **Step 5: Lint và commit**

```bash
yarn lint
git add src/components/layout/hooks/useAuthWeather.ts src/components/layout/hooks/useAuthWeather.test.tsx
git commit -m "feat(weather): thêm useAuthWeather gộp toạ độ, query và 4 trạng thái"
```

---

### Task 8: Lớp mưa RainField

**Files:**
- Create: `src/components/layout/components/RainField.tsx`
- Create: `src/components/layout/components/rain-field.css`
- Test: `src/components/layout/components/test/RainField.test.tsx` (create)

**Interfaces:**
- Consumes: `RainIntensity`, `RAIN_DROP_COUNT` (Task 4), `usePageHidden` (đã có)
- Produces: `RainField({ intensity }: RainFieldProps)`

- [ ] **Step 1: Viết test thất bại**

```tsx
import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RainField } from '../RainField'
import { RAIN_DROP_COUNT } from '../weather-scene'

const setVisibility = (state: 'visible' | 'hidden') => {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true
  })
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

describe('RainField', () => {
  it('không render gì khi trời không mưa', () => {
    const { container } = render(<RainField intensity="none" />)

    expect(container.querySelector('.auth-rainfield')).toBeNull()
  })

  it.each(['light', 'moderate', 'heavy'] as const)(
    'render đúng số hạt cho mưa cấp %s',
    (intensity) => {
      const { container } = render(<RainField intensity={intensity} />)

      expect(container.querySelectorAll('.auth-raindrop')).toHaveLength(
        RAIN_DROP_COUNT[intensity]
      )
    }
  )

  it('sinh vị trí hạt mưa ổn định giữa hai lần render', () => {
    const readLefts = () => {
      const { container } = render(<RainField intensity="light" />)
      return [...container.querySelectorAll<HTMLElement>('.auth-raindrop')].map(
        (drop) => drop.style.left
      )
    }

    expect(readLefts()).toEqual(readLefts())
  })

  it('trải hạt mưa ra nhiều vị trí khác nhau', () => {
    const { container } = render(<RainField intensity="moderate" />)
    const lefts = [...container.querySelectorAll<HTMLElement>('.auth-raindrop')].map(
      (drop) => drop.style.left
    )

    expect(new Set(lefts).size).toBeGreaterThan(20)
  })

  it('ẩn khỏi trình đọc màn hình và không nhận tương tác', () => {
    const { container } = render(<RainField intensity="light" />)
    const field = container.querySelector('.auth-rainfield')

    expect(field).toHaveAttribute('aria-hidden', 'true')
    expect(field).toHaveClass('pointer-events-none')
  })

  it('dừng mưa khi người dùng rời tab và chạy lại khi quay về', () => {
    const { container } = render(<RainField intensity="light" />)
    const field = container.querySelector('.auth-rainfield')
    expect(field).toHaveAttribute('data-paused', 'false')

    setVisibility('hidden')
    expect(field).toHaveAttribute('data-paused', 'true')

    setVisibility('visible')
    expect(field).toHaveAttribute('data-paused', 'false')
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `yarn vitest run src/components/layout/components/test/RainField.test.tsx`
Expected: FAIL — không resolve được `../RainField`.

- [ ] **Step 3: Viết `rain-field.css`**

```css
/* Panel cao đúng 100vh (AuthLayout dùng h-screen), nên quãng rơi tính theo vh. */
.auth-raindrop {
  position: absolute;
  top: -12%;
  width: 1.4px;
  border-radius: 1px;
  background: linear-gradient(
    to bottom,
    rgba(226, 245, 255, 0),
    rgba(226, 245, 255, 0.8)
  );
  animation-name: auth-rain-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

@keyframes auth-rain-fall {
  from {
    transform: translate3d(0, 0, 0) rotate(12deg);
  }
  to {
    transform: translate3d(-5vh, 118vh, 0) rotate(12deg);
  }
}

.auth-rainfield[data-paused='true'] .auth-raindrop {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .auth-raindrop {
    animation: none;
    opacity: 0.35;
  }
}
```

- [ ] **Step 4: Viết `RainField.tsx`**

```tsx
import type { CSSProperties } from 'react'
import { usePageHidden } from '../hooks/usePageHidden'
import { RAIN_DROP_COUNT, type RainIntensity } from './weather-scene'
import './rain-field.css'

/**
 * Nhiễu tất định theo index. Cố ý không dùng Math.random: mỗi lần poll thời
 * tiết component re-render, random sẽ khiến toàn bộ hạt mưa nhảy vị trí.
 */
const noise = (seed: number): number => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const dropStyle = (index: number): CSSProperties => ({
  left: `${(noise(index) * 108 - 4).toFixed(2)}%`,
  height: `${(9 + noise(index + 101) * 13).toFixed(1)}px`,
  opacity: 0.35 + noise(index + 211) * 0.45,
  animationDelay: `${(noise(index + 307) * -1.6).toFixed(2)}s`,
  animationDuration: `${(0.62 + noise(index + 419) * 0.5).toFixed(2)}s`
})

export interface RainFieldProps {
  intensity: RainIntensity
}

/** Màn mưa phủ toàn panel, nằm trên dãy núi của cảnh mặt trời. */
export function RainField({ intensity }: RainFieldProps) {
  const isPageHidden = usePageHidden()
  const dropCount = RAIN_DROP_COUNT[intensity]

  if (dropCount === 0) return null

  return (
    <div
      className="auth-rainfield pointer-events-none absolute inset-0 z-20 overflow-hidden"
      data-paused={isPageHidden}
      aria-hidden="true"
    >
      {[...Array(dropCount).keys()].map((index) => (
        <span key={index} className="auth-raindrop" style={dropStyle(index)} />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Chạy test để xác nhận pass**

Run: `yarn vitest run src/components/layout/components/test/RainField.test.tsx`
Expected: PASS — 9 test (gồm 3 case `it.each`).

- [ ] **Step 6: Lint và commit**

```bash
yarn lint
git add src/components/layout/components/RainField.tsx src/components/layout/components/rain-field.css src/components/layout/components/test/RainField.test.tsx
git commit -m "feat(weather): thêm lớp mưa RainField chạy bằng CSS"
```

---

### Task 9: Badge thời tiết

**Files:**
- Create: `src/components/layout/components/WeatherBadge.tsx`
- Test: `src/components/layout/components/test/WeatherBadge.test.tsx` (create)

**Interfaces:**
- Consumes: `WeatherStatus` (Task 7), `WeatherCondition`/`WeatherKind` (Task 4)
- Produces: `WeatherBadge({ status, condition, canRequest, onRequestLocation, usesLightText }: WeatherBadgeProps)`

- [ ] **Step 1: Viết test thất bại**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WeatherBadge } from '../WeatherBadge'
import type { WeatherCondition } from '../weather-scene'

const RAINY: WeatherCondition = {
  kind: 'rain',
  rain: 'moderate',
  cloudCover: 87,
  temperature: 28.4,
  label: 'Mưa rào'
}

const renderBadge = (props: Partial<Parameters<typeof WeatherBadge>[0]> = {}) =>
  render(
    <WeatherBadge
      status="data"
      condition={RAINY}
      canRequest={false}
      usesLightText={false}
      onRequestLocation={vi.fn()}
      {...props}
    />
  )

describe('WeatherBadge', () => {
  it('hiện chỉ báo chờ khi đang tải', () => {
    const { container } = renderBadge({ status: 'loading', condition: null })

    expect(container.querySelector('[data-state="loading"]')).not.toBeNull()
    expect(screen.queryByText(/°C/)).toBeNull()
  })

  it('ẩn hoàn toàn khi lỗi', () => {
    const { container } = renderBadge({ status: 'error', condition: null })

    expect(container).toBeEmptyDOMElement()
  })

  it('ẩn hoàn toàn khi không có dữ liệu', () => {
    const { container } = renderBadge({ status: 'empty', condition: null })

    expect(container).toBeEmptyDOMElement()
  })

  it('hiện nhiệt độ làm tròn và nhãn tiếng Việt khi có dữ liệu', () => {
    renderBadge()

    expect(screen.getByText('28°C · Mưa rào')).toBeInTheDocument()
  })

  it('không hiện nút xin vị trí khi không được phép hỏi', () => {
    renderBadge()

    expect(
      screen.queryByRole('button', { name: 'Dùng vị trí của tôi' })
    ).toBeNull()
  })

  it('gọi callback khi người dùng chủ động bấm xin vị trí', async () => {
    const onRequestLocation = vi.fn()
    renderBadge({ canRequest: true, onRequestLocation })

    await userEvent.click(
      screen.getByRole('button', { name: 'Dùng vị trí của tôi' })
    )

    expect(onRequestLocation).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `yarn vitest run src/components/layout/components/test/WeatherBadge.test.tsx`
Expected: FAIL — không resolve được `../WeatherBadge`.

- [ ] **Step 3: Viết component**

```tsx
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  MapPin,
  Sun,
  type LucideIcon
} from 'lucide-react'
import type { WeatherStatus } from '../hooks/useAuthWeather'
import type { WeatherCondition, WeatherKind } from './weather-scene'

const KIND_ICON: Record<WeatherKind, LucideIcon> = {
  clear: Sun,
  cloudy: Cloud,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  storm: CloudLightning
}

export interface WeatherBadgeProps {
  status: WeatherStatus
  condition: WeatherCondition | null
  canRequest: boolean
  /** Panel đang ở tông tối (đêm/hoàng hôn) nên badge phải dùng chữ sáng. */
  usesLightText: boolean
  onRequestLocation: () => void
}

/** Nhiệt độ và điều kiện thời tiết, đặt ngay dưới badge giờ Việt Nam. */
export function WeatherBadge({
  status,
  condition,
  canRequest,
  usesLightText,
  onRequestLocation
}: WeatherBadgeProps) {
  if (status === 'error' || status === 'empty') return null

  const shellClass = `flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide transition-colors duration-1000 ${
    usesLightText ? 'bg-white/10 text-teal-50' : 'bg-white/45 text-teal-900/70'
  }`

  if (status === 'loading' || !condition) {
    return (
      <div className={shellClass} data-state="loading" aria-hidden="true">
        <span className="size-1.5 animate-pulse rounded-full bg-current opacity-60" />
        <span className="h-2 w-16 animate-pulse rounded-full bg-current opacity-25" />
      </div>
    )
  }

  const Icon = KIND_ICON[condition.kind]
  const summary = `${Math.round(condition.temperature)}°C · ${condition.label}`

  return (
    <div className={shellClass}>
      <Icon className="size-3" aria-hidden="true" />
      <span aria-label={`Thời tiết hiện tại ${summary}`}>{summary}</span>
      {canRequest && (
        <button
          type="button"
          onClick={onRequestLocation}
          aria-label="Dùng vị trí của tôi"
          className="grid size-4 place-items-center rounded-full transition-colors hover:bg-current/15 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
        >
          <MapPin className="size-2.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn vitest run src/components/layout/components/test/WeatherBadge.test.tsx`
Expected: PASS — 6 test.

- [ ] **Step 5: Lint và commit**

```bash
yarn lint
git add src/components/layout/components/WeatherBadge.tsx src/components/layout/components/test/WeatherBadge.test.tsx
git commit -m "feat(weather): thêm WeatherBadge với đủ 4 trạng thái"
```

---

### Task 10: Ghép thời tiết vào panel

**Files:**
- Modify: `src/components/layout/components/CloudField.tsx:120-139`
- Modify: `src/components/layout/components/SolarLandscape.tsx`
- Modify: `src/components/layout/components/AuthBrandPanel.tsx`
- Modify: `src/components/layout/AuthLayout.tsx`
- Test: `src/components/layout/components/test/AuthBrandPanel.test.tsx` (create)

**Interfaces:**
- Consumes: tất cả các task trước
- Produces: panel hoàn chỉnh — không có API mới cho task sau

- [ ] **Step 1: Viết test tích hợp thất bại**

```tsx
import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AuthBrandPanel } from '../AuthBrandPanel'
import { getSolarScene } from '../solar-scene'
import { applyWeather, type WeatherCondition } from '../weather-scene'

const NOON = new Date('2026-07-29T05:00:00Z')

const RAINY: WeatherCondition = {
  kind: 'rain',
  rain: 'moderate',
  cloudCover: 87,
  temperature: 28.4,
  label: 'Mưa rào'
}

const renderPanel = (
  condition: WeatherCondition | null,
  weatherProps: Partial<Parameters<typeof AuthBrandPanel>[0]> = {}
) =>
  render(
    <AuthBrandPanel
      scene={applyWeather(getSolarScene(NOON), condition)}
      isSynchronized
      weatherStatus={condition ? 'data' : 'loading'}
      condition={condition}
      canRequest={false}
      onRequestLocation={vi.fn()}
      brandRef={createRef<HTMLDivElement>()}
      sceneRef={createRef<HTMLDivElement>()}
      mascotRef={createRef<HTMLDivElement>()}
      {...weatherProps}
    />
  )

describe('AuthBrandPanel', () => {
  it('đổ mưa khi thời tiết đang mưa', () => {
    const { container } = renderPanel(RAINY)

    expect(container.querySelectorAll('.auth-raindrop')).toHaveLength(60)
  })

  it('không đổ mưa khi chưa có dữ liệu thời tiết', () => {
    const { container } = renderPanel(null)

    expect(container.querySelector('.auth-rainfield')).toBeNull()
  })

  it('phủ lớp xám lên trời theo độ phủ mây', () => {
    const { container } = renderPanel(RAINY)
    const overcast = container.querySelector<HTMLElement>('.auth-overcast')

    expect(overcast).not.toBeNull()
    expect(Number(overcast?.style.opacity)).toBeGreaterThan(0)
  })

  it('vẫn hiện đồng hồ giờ Việt Nam bên cạnh badge thời tiết', () => {
    renderPanel(RAINY)

    expect(screen.getByText(/· VN$/)).toBeInTheDocument()
    expect(screen.getByText('28°C · Mưa rào')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `yarn vitest run src/components/layout/components/test/AuthBrandPanel.test.tsx`
Expected: FAIL — `AuthBrandPanel` chưa nhận các prop thời tiết.

- [ ] **Step 3: Cho `CloudField` nhận hệ số opacity**

Trong `src/components/layout/components/CloudField.tsx`, sửa `CloudTrackProps`, `CloudFieldProps` và hai component tương ứng:

```tsx
interface CloudTrackProps {
  layer: CloudLayer
  palette: CloudPalette
  opacityScale: number
}

function CloudTrack({ layer, palette, opacityScale }: CloudTrackProps) {
```

Trong `style` của từng đám mây, đổi dòng opacity:

```tsx
          opacity: layer.opacity * opacityScale,
```

Và:

```tsx
export interface CloudFieldProps {
  palette: CloudPalette
  /** Hệ số nhân opacity theo độ phủ mây thực tế. Mặc định 1 = giữ nguyên. */
  opacityScale?: number
}

export function CloudField({ palette, opacityScale = 1 }: CloudFieldProps) {
```

Truyền xuống: `<CloudTrack key={layer.id} layer={layer} palette={palette} opacityScale={opacityScale} />`

- [ ] **Step 4: Cho `SolarLandscape` nhận `AuthScene`**

Trong `src/components/layout/components/SolarLandscape.tsx`, đổi import và props:

```tsx
import { CloudField } from './CloudField'
import { RainField } from './RainField'
import type { AuthScene } from './weather-scene'

export interface SolarLandscapeProps {
  scene: AuthScene
}
```

Đổi lời gọi `CloudField` và bổ sung hai lớp mới ngay sau `<svg>` núi (mưa nằm trên núi, lớp xám nằm dưới mưa):

```tsx
      <CloudField palette={scene.cloud} opacityScale={scene.cloudOpacityScale} />
```

```tsx
      <div
        className="auth-overcast absolute inset-0 bg-slate-700 transition-opacity duration-1000"
        style={{ opacity: scene.overcast }}
      />

      <RainField intensity={scene.rain} />
```

- [ ] **Step 5: Cho `AuthBrandPanel` nhận dữ liệu thời tiết**

Trong `src/components/layout/components/AuthBrandPanel.tsx`, mở rộng props:

```tsx
import type { RefObject } from 'react'
import type { WeatherStatus } from '../hooks/useAuthWeather'
import { SolarLandscape } from './SolarLandscape'
import { WeatherBadge } from './WeatherBadge'
import type { AuthScene, WeatherCondition } from './weather-scene'

export interface AuthBrandPanelProps {
  scene: AuthScene
  isSynchronized: boolean
  weatherStatus: WeatherStatus
  condition: WeatherCondition | null
  canRequest: boolean
  onRequestLocation: () => void
  brandRef: RefObject<HTMLDivElement | null>
  sceneRef: RefObject<HTMLDivElement | null>
  mascotRef: RefObject<HTMLDivElement | null>
}
```

Đổi chữ ký hàm cho khớp, rồi bọc badge giờ hiện có vào một cột dọc để badge thời tiết nằm ngay dưới nó. Thay `<div className="absolute top-9 right-8 ...">` bằng:

```tsx
      <div className="absolute top-9 right-8 z-30 flex flex-col items-end gap-1.5">
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide transition-colors duration-1000 ${
            headerUsesLightText
              ? 'bg-white/10 text-teal-50'
              : 'bg-white/45 text-teal-900/70'
          }`}
          aria-label={`Giờ Việt Nam ${scene.timeLabel}${
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
          {scene.timeLabel} · VN
        </div>

        <WeatherBadge
          status={weatherStatus}
          condition={condition}
          canRequest={canRequest}
          usesLightText={headerUsesLightText}
          onRequestLocation={onRequestLocation}
        />
      </div>
```

- [ ] **Step 6: Nối dây trong `AuthLayout`**

Thêm import và hook, đổi lời gọi `AuthBrandPanel`:

```tsx
import { applyWeather } from './components/weather-scene'
import { useAuthWeather } from './hooks/useAuthWeather'
```

```tsx
  const { status, condition, canRequest, requestLocation } = useAuthWeather()
  const scene = applyWeather(getSolarScene(now), condition)
```

```tsx
      <AuthBrandPanel
        scene={scene}
        isSynchronized={isSynchronized}
        weatherStatus={status}
        condition={condition}
        canRequest={canRequest}
        onRequestLocation={requestLocation}
        brandRef={brandRef}
        sceneRef={sceneRef}
        mascotRef={mascotRef}
      />
```

Xoá biến `solarScene` cũ.

- [ ] **Step 7: Chạy toàn bộ test**

Run: `yarn lint && yarn test`
Expected: tsc sạch, eslint sạch, toàn bộ test PASS gồm `CloudField.test.tsx` cũ (mặc định `opacityScale = 1` nên `layer.opacity * 1` không đổi giá trị).

- [ ] **Step 8: Kiểm tra bằng mắt**

Run: `yarn dev`
Mở màn đăng nhập và xác nhận:
- Không có popup xin quyền vị trí nào tự bật.
- Badge thời tiết hiện nhiệt độ Hà Nội, hoặc biến mất nếu API lỗi.
- Không có toast đỏ nào xuất hiện khi ngắt mạng rồi tải lại trang.
- Cảnh mặt trời vẫn đổi theo giờ như trước.

Kiểm tra thêm nhánh mưa bằng cổng test giờ đã có sẵn kết hợp DevTools: chặn `api.open-meteo.com` trong tab Network để xác nhận nhánh lỗi hạ cánh êm.

- [ ] **Step 9: Commit**

```bash
git add src/components/layout
git commit -m "feat(auth-panel): ghép mưa và độ phủ mây thực tế vào panel đăng nhập"
```

---

## Self-Review

**Spec coverage**

| Mục spec | Task |
| --- | --- |
| §3 Kiến trúc modifier | Task 4, 10 |
| §3.1 File mới | Task 3–9 |
| §3.3 Refactor AuthLayout | Task 2 |
| §4 Toạ độ Hà Nội + giữ timezone | Task 1 |
| §5 Geolocation silent-first | Task 6 |
| §6 API Open-Meteo + polling | Task 5, 7 |
| §6.1 Cô lập 2 lớp | Task 5 (base query riêng + `SILENT_ENDPOINTS` + test) |
| §7 Mapping WMO + cloud_cover | Task 4 |
| §8 RainField CSS tất định | Task 8 |
| §9 Bốn trạng thái | Task 7 (hook), Task 9 (badge) |
| §10 WeatherBadge + nút opt-in | Task 9 |
| §11 Testing | Mỗi task đều có test riêng |
| §12 Rủi ro | Task 5 (toast/logout), Task 8 (performance), Task 6 (privacy) |

Không có mục spec nào thiếu task.

**Ghi chú kỹ thuật đã kiểm chứng trên code thật**

- `setupListeners(store.dispatch)` đã được gọi ở `src/app/store.ts:31` → `refetchOnFocus`/`refetchOnReconnect` hoạt động, không cần thêm gì.
- `errorMiddleware` đọc `action.meta.arg.endpointName`, nên chỉ cần đúng tên `'getCurrentWeather'` là đủ chặn.
- `errorMiddleware.test.ts` đã có sẵn `it.each` liệt kê silent endpoint — chỉ thêm một phần tử.
- `src/test/setup.ts` bật `onUnhandledRequest: 'error'` → handler Open-Meteo ở Task 5 Step 2 là bắt buộc, làm trước khi có test nào chạm tới query.
- `CloudField.test.tsx` hiện có không truyền `opacityScale`; default `1` giữ nguyên hành vi nên test cũ không vỡ.

**Điểm cần chú ý khi thực thi**

- Task 2 là refactor thuần: nếu có bất kỳ test nào đổi kết quả, nghĩa là đã chuyển sai, không được "sửa test cho hợp".
- Task 5 Step 7 là hàng rào an toàn quan trọng nhất của cả plan. Không được bỏ qua.
