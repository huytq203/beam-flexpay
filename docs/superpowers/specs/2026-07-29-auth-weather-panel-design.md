# Thiết kế: Thời tiết realtime cho panel trái AuthLayout

Ngày: 2026-07-29
Trạng thái: Đã duyệt design, chờ implementation plan

## 1. Mục tiêu

Panel thương hiệu bên trái màn đăng nhập hiện đã đổi cảnh theo **giờ** (mặt trời mọc/lặn, sao đêm, hoàng hôn) qua `getSolarScene` + SunCalc. Bổ sung trục dữ liệu thứ hai: **thời tiết thực tế** lấy từ API bên thứ ba, để cảnh có mưa khi ngoài trời đang mưa và mây dày khi trời nhiều mây.

Không nằm trong phạm vi: sương mù, sét, tuyết, gió — để phase sau.

## 2. Quyết định đã chốt

| Hạng mục | Lựa chọn | Lý do |
| --- | --- | --- |
| Nhà cung cấp | Open-Meteo | Miễn phí, không cần API key, CORS mở. Không có secret nào lọt vào bundle client — thoả rule 05-security. |
| Phạm vi hiệu ứng | Mưa (3 mức) + độ dày mây | Đủ cảm giác realtime, chi phí render thấp. |
| Vị trí | Geolocation trình duyệt, silent-first, fallback Hà Nội | Cá nhân hoá khi người dùng đã cấp quyền, nhưng không bao giờ bật popup xin quyền bất ngờ trên màn đăng nhập. |
| Toạ độ mặc định | Hà Nội (21.0278, 105.8342) | Người dùng yêu cầu đổi toàn bộ từ TP.HCM sang Hà Nội. |
| Hiển thị chữ | Badge nhiệt độ + mô tả, cạnh badge giờ VN | Cho người dùng biết hiệu ứng đến từ dữ liệu thật. |
| Cảnh mặt trời | Cũng dùng toạ độ Hà Nội | Nhất quán một nguồn toạ độ duy nhất. |

## 3. Kiến trúc

Thời tiết là **lớp modifier** phủ lên solar-scene, không thay thế nó. Khi API lỗi, cảnh chạy đúng như hiện tại.

```
useVietnamTime ──► getSolarScene(now, coords) ──┐
                                                 ├─► applyWeather(scene, condition)
useWeatherCoords ─► useAuthWeather ─────────────┘            │
                                                             ▼
                                                          AuthScene
                                                             │
                            ┌────────────────────────────────┼────────────────────┐
                            ▼                                ▼                    ▼
                     SolarLandscape                     CloudField            RainField
                                                                                  +
                                                                            WeatherBadge
```

`getSolarScene` giữ nguyên trách nhiệm: từ thời điểm + toạ độ sinh ra token màu trời/núi/mây/mặt trời.
`applyWeather` là hàm thuần, nhận `SolarScene` + `WeatherCondition`, trả `AuthScene` = SolarScene đã điều chỉnh + trường `rain`.

### 3.1 File mới

```
src/app/services/apiWeather.ts                     RTK Query slice, baseQuery riêng (không auth)
src/app/schemas/weather.schema.ts                  Zod schema validate response Open-Meteo
src/components/layout/hooks/useWeatherCoords.ts    Geolocation silent-first + cache sessionStorage
src/components/layout/hooks/useAuthWeather.ts      Gộp coords + query, trả 4 trạng thái
src/components/layout/components/weather-scene.ts  WMO code → WeatherCondition → modifier (pure)
src/components/layout/components/RainField.tsx     Lớp mưa CSS
src/components/layout/components/rain-field.css
src/components/layout/components/WeatherBadge.tsx  Nhiệt độ + icon + nút opt-in vị trí
```

### 3.2 File sửa

| File | Thay đổi |
| --- | --- |
| `src/components/layout/components/solar-scene.ts` | Đổi hằng số toạ độ sang Hà Nội; `getSolarScene(now, coords)` nhận toạ độ làm tham số (mặc định Hà Nội). |
| `src/components/layout/components/SolarLandscape.tsx` | Nhận `AuthScene`, render thêm `RainField`. |
| `src/components/layout/AuthLayout.tsx` | Tách nhỏ (xem §3.3), ghép `useAuthWeather` + `WeatherBadge`. |
| `src/app/store.ts` | Đăng ký `apiWeather.reducer` vào `reducer` và `apiWeather.middleware` vào chuỗi middleware, trong `createAppStore()`. `setupListeners(store.dispatch)` đã được gọi sẵn nên `refetchOnFocus`/`refetchOnReconnect` hoạt động ngay. |
| `src/app/middleware/errorMiddleware.ts` | Thêm `'getCurrentWeather'` vào mảng `SILENT_ENDPOINTS` (xem §6.1). |

### 3.3 Refactor kèm theo (bắt buộc)

`AuthLayout.tsx` hiện **258 dòng**, đã vượt ngưỡng 200 dòng của rule 02-components. Thêm weather vào sẽ càng phình. Tách:

- `src/components/layout/components/AuthBrandPanel.tsx` — toàn bộ panel trái (logo, badge, scene, brand copy).
- `src/components/layout/hooks/useAuthIntroAnimation.ts` — gsap timeline intro + parallax pointer.

Kết quả: `AuthLayout.tsx` còn khoảng 55 dòng, chỉ lo redirect + layout khung + `<Outlet />`.

## 4. Toạ độ: TP.HCM → Hà Nội

- `HO_CHI_MINH_COORDINATES` → `HANOI_COORDINATES = { latitude: 21.0278, longitude: 105.8342 }`.
- **Giữ nguyên `timeZone: 'Asia/Ho_Chi_Minh'`** tại cả hai chỗ format giờ trong `solar-scene.ts`. Đây là tên IANA của múi giờ **toàn Việt Nam**, bao gồm Hà Nội; không tồn tại zone `Asia/Hanoi`. Phải ghi comment tại chỗ để lần sau không ai sửa nhầm theo tên thành phố.
- Hệ quả thị giác: mặt trời mọc/lặn sớm hơn TP.HCM khoảng 15–20 phút; mùa đông ngày ngắn hơn rõ rệt. Đây là thay đổi mong muốn.
- `getSolarScene` hiện chưa có test → rủi ro hồi quy thấp. Sẽ bổ sung test cho hàm này trong lần thay đổi này.

## 5. Lấy toạ độ — chiến lược silent-first

```
navigator.permissions.query({ name: 'geolocation' })
  ├─ 'granted'                       → getCurrentPosition (timeout 5s) → toạ độ người dùng
  ├─ 'prompt'                        → HANOI_COORDINATES, canRequest = true
  ├─ 'denied'                        → HANOI_COORDINATES, canRequest = false
  └─ Permissions API không hỗ trợ    → HANOI_COORDINATES, canRequest = true
```

Hook không bao giờ tự gọi `getCurrentPosition` khi quyền đang ở trạng thái `prompt`. Người dùng chủ động bấm nút nhỏ trên `WeatherBadge` thì mới gọi — popup xin quyền chỉ xuất hiện sau một hành động có chủ đích.

Toạ độ lấy được cache vào `sessionStorage` (key `auth-weather-coords`) để việc chuyển route trong nhóm auth (login → forgot-password → reset-password) không gọi lại geolocation.

Interface:

```ts
export interface WeatherCoords {
  latitude: number
  longitude: number
  /** true khi là toạ độ thật của người dùng, false khi đang dùng mặc định Hà Nội. */
  isPrecise: boolean
}

export interface UseWeatherCoordsResult {
  coords: WeatherCoords
  canRequest: boolean
  requestLocation: () => void
}
```

## 6. API Open-Meteo

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=<lat>
  &longitude=<lon>
  &current=weather_code,temperature_2m,precipitation,cloud_cover,is_day
  &timezone=auto
```

Dùng `timezone=auto` để Open-Meteo tự suy múi giờ từ chính toạ độ gửi lên. Không hardcode múi giờ Việt Nam vào request, vì đã bật geolocation thì người dùng có thể không ở Việt Nam. Tham số này chỉ ảnh hưởng tới cách format field `current.time` — field mà panel không dùng tới — nên đây thuần tuý là chuyện đúng đắn về mặt ngữ nghĩa.

Không nhầm lẫn với `timeZone: 'Asia/Ho_Chi_Minh'` trong `solar-scene.ts` (§4): chỗ đó là đồng hồ hiển thị, gắn nhãn "· VN", cố ý luôn hiện giờ Việt Nam bất kể người dùng ngồi ở đâu, và phải giữ nguyên.

Không cần API key cho mục đích phi thương mại. Base URL đưa vào `.env` dưới biến `VITE_WEATHER_API_URL` (mặc định `https://api.open-meteo.com/v1`, đường dẫn endpoint là `/forecast`) để sau này đổi sang self-host/proxy mà không phải sửa code. Đây không phải secret.

Cấu hình query:

- `pollingInterval: 10 * 60_000` — trùng nhịp resync 10 phút của `useVietnamTime`.
- `refetchOnFocus: true`, `refetchOnReconnect: true`.
- Timeout 5s, `retry: 1`.
- `skip` khi chưa có coords.

Response được `safeParse` bằng Zod. Type `WeatherResponse` suy ra từ schema (`z.infer`), không viết type tay.

### 6.1 Cô lập khỏi luồng auth — điểm quan trọng nhất

Thời tiết là chi tiết trang trí. Nó không được phép bắn `notification`/`Swal`, không được chặn hay làm chậm việc đăng nhập, và không được ghi log toạ độ người dùng (PII).

Có **hai** lớp phải cô lập, thiếu một lớp là vẫn lọt:

**Lớp 1 — base query.** `apiWeather` phải tạo `fetchBaseQuery` riêng. Tuyệt đối không dùng `fetchBaseQueryCustom`: file đó gắn Bearer token, chứa singleton refresh-token và bắn popup Swal khi gặp lỗi. Một lỗi 429/503 từ Open-Meteo đi qua đường đó có thể kích hoạt luồng refresh token hoặc đăng xuất người dùng.

**Lớp 2 — errorMiddleware.** `errorMiddleware` được `concat` ở cấp store trong `createAppStore()`, nên nó bắt **mọi** action `isRejectedWithValue` bất kể api slice nào sinh ra. Base query riêng không thoát được nó. Nếu không xử lý, Open-Meteo trả 503 sẽ hiện toast đỏ "Dịch vụ tạm thời không khả dụng" ngay trên màn đăng nhập; trả 404 sẽ hiện toast vàng.

Cách xử lý: thêm `'getCurrentWeather'` vào mảng `SILENT_ENDPOINTS` trong `src/app/middleware/errorMiddleware.ts`. Tên phải khớp chính xác tên endpoint khai báo trong `apiWeather.injectEndpoints`/`endpoints`.

Phải có test khẳng định điều này: dispatch một rejected action của endpoint thời tiết và assert `globalMessage.error` không được gọi.

## 7. Mapping WMO code → hiệu ứng

| WMO code | Kind | Rain intensity | Số hạt |
| --- | --- | --- | --- |
| 0, 1 | `clear` | `none` | 0 |
| 2, 3, 45, 48 | `cloudy` | `none` | 0 |
| 51, 53, 55, 56, 57 | `drizzle` | `light` | 28 |
| 61, 63, 80, 81 | `rain` | `moderate` | 60 |
| 65, 66, 67, 82, 95, 96, 99 | `storm` | `heavy` | 110 |
| 71–86 (tuyết) | suy theo `precipitation` | `none` nếu `precipitation === 0`, ngược lại `moderate` | — |
| Code lạ / ngoài bảng | `clear` | `none` | 0 |

Fog (45, 48) trong phạm vi này chỉ được xử lý như mây dày, không render lớp sương riêng.

`cloud_cover` (0–100) tác động độc lập với mưa:

- Overlay xám phủ lên `scene.sky` với `alpha = cloud_cover / 100 * 0.35`.
- `CloudField` tăng `opacity` các lớp mây theo `cloud_cover`.

Kiểu dữ liệu dùng `as const` object + union type, không dùng `enum`:

```ts
export const RainIntensity = {
  NONE: 'none',
  LIGHT: 'light',
  MODERATE: 'moderate',
  HEAVY: 'heavy'
} as const
export type RainIntensity = (typeof RainIntensity)[keyof typeof RainIntensity]
```

## 8. RainField — render bằng CSS thuần

Tái dùng đúng pattern của `CloudField`, không dùng canvas hay animation loop bằng JS:

- Mỗi hạt mưa là một `<span>` chạy `animation: rain-fall linear infinite`, dịch chuyển bằng `translate3d` + `will-change: transform`.
- Vị trí `left`, `animation-delay`, `animation-duration` sinh **deterministic từ index** (hàm băm nhỏ trên index, không dùng `Math.random()` trong render). Nếu dùng random, mỗi lần re-query thời tiết component re-render sẽ khiến mưa nhảy loạn.
- Tạm dừng qua `data-paused` + hook `usePageHidden` đã có.
- `@media (prefers-reduced-motion: reduce)` → tắt animation, chỉ giữ overlay tối.
- Không render gì khi `intensity === 'none'` (early return).

## 9. Bốn trạng thái UI

| Trạng thái | Cảnh | Badge |
| --- | --- | --- |
| loading | Giữ nguyên cảnh solar, không mưa, không flash | Dot pulse nhỏ |
| error | Cảnh solar nguyên bản, không mưa | Ẩn hoàn toàn |
| empty (Zod fail hoặc thiếu `current`) | Xử lý y hệt error | Ẩn hoàn toàn |
| data | Áp modifier + `RainField` | Icon + nhiệt độ + mô tả ngắn |

Không hiển thị thông báo lỗi dưới bất kỳ hình thức nào. Người dùng đến màn này để đăng nhập.

## 10. WeatherBadge

Đặt cạnh badge giờ VN hiện có ở góc phải trên, cùng ngôn ngữ thị giác (bo tròn, nền `bg-white/45` hoặc `bg-white/10` tuỳ `headerUsesLightText`).

Nội dung: icon điều kiện + `28°C · Mưa rào`. Mô tả tiếng Việt map từ `kind` bằng một hằng số trong `weather-scene.ts`, **không** đưa vào `src/app/languages`. Lý do: toàn bộ nội dung chữ của panel trái hiện đang hard-code tiếng Việt (`"Vận hành FlexPay trong một nhịp"`, `"Hệ thống quản trị ví điện tử..."`), không đi qua i18n. Thêm i18n cho riêng badge thời tiết sẽ lệch với hàng xóm của nó. Khi nào panel được i18n hoá đồng bộ thì chuyển cả cụm một lần.

Khi `canRequest === true`, badge hiện thêm một nút icon nhỏ (`aria-label="Dùng vị trí của tôi"`) gọi `requestLocation()`.

## 11. Testing

Vitest + Testing Library + msw đã có sẵn trong dự án.

| File test | Nội dung |
| --- | --- |
| `weather-scene.test.ts` | Mapping WMO tại biên: 0, 1, 3, 45, 48, 55, 61, 65, 82, 95, 99, code lạ. `cloud_cover` 0/50/100 → alpha overlay. Tuyết + `precipitation` 0 và > 0. |
| `weather.schema.test.ts` | Response hợp lệ; thiếu `current`; sai kiểu `weather_code`; `cloud_cover` ngoài 0–100. |
| `useWeatherCoords.test.ts` | Mock `navigator.permissions` cho `granted` / `prompt` / `denied`; trường hợp Permissions API không tồn tại; đọc/ghi cache `sessionStorage`; `getCurrentPosition` timeout. |
| `RainField.test.tsx` | Số hạt theo từng intensity; không render khi `none`; `data-paused` khi tab ẩn. |
| `WeatherBadge.test.tsx` | Đủ 4 trạng thái; nút opt-in chỉ hiện khi `canRequest`. |
| `solar-scene.test.ts` (mới) | Toạ độ mặc định là Hà Nội; `timeLabel` vẫn format theo `Asia/Ho_Chi_Minh`; `isNight` tại các mốc giờ. |
| `errorMiddleware.test.ts` (bổ sung case) | Rejected action của endpoint `getCurrentWeather` không gọi `globalMessage.error`/`warning` với các status 404, 429, 503. |

## 12. Rủi ro và cách xử lý

| Rủi ro | Xử lý |
| --- | --- |
| Open-Meteo rate-limit hoặc downtime | 4 trạng thái đã bao phủ: rơi về cảnh solar, badge ẩn. Không có tác động tới đăng nhập. |
| Lỗi thời tiết kích hoạt luồng logout | Dùng `fetchBaseQuery` riêng, cô lập khỏi `fetchBaseQueryCustom` (§6.1 lớp 1). |
| Lỗi thời tiết bắn toast đỏ lên màn đăng nhập | `errorMiddleware` là middleware cấp store, bắt mọi rejected action. Phải thêm endpoint vào `SILENT_ENDPOINTS` (§6.1 lớp 2) và có test khẳng định. |
| Mưa dày làm tụt FPS trên máy yếu | CSS transform + `will-change`, tối đa 110 hạt, pause khi tab ẩn, tắt khi `prefers-reduced-motion`. |
| CSP chặn domain ngoài khi lên production | `nginx.conf` hiện chưa cấu hình CSP → không có blocker. Nếu sau này thêm CSP, phải bổ sung `api.open-meteo.com` vào `connect-src`. |
| Popup xin quyền vị trí làm mất tin cậy màn login | Chiến lược silent-first (§5), chỉ hỏi sau hành động chủ đích của người dùng. |
| Gửi toạ độ người dùng ra bên thứ ba | Chỉ xảy ra khi người dùng đã cấp quyền. Không log toạ độ. Fallback Hà Nội là mặc định. |
