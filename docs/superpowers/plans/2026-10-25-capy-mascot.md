# Linh vật Capy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gắn linh vật Capy 2D (hoạt cảnh theo khung hình) chạy trên các màn cho phép của CMS, bật/tắt được, kéo thả được, chào kèm tên người đăng nhập.

**Architecture:** Một lớp phủ cố định gắn trong `AppLayout`, vẽ khung hình lên canvas 2D. Phần logic thuần (chọn nền đứng, vùng cấm, câu chào, bảng hoạt cảnh) tách khỏi phần chạy thời gian thực (`CapyEngine`) và khỏi giao diện React để kiểm thử được. Tuỳ chọn người dùng lưu `localStorage`.

**Tech Stack:** React 19, TypeScript strict, Vite, Vitest + Testing Library, i18next, wrapper `components/ui` (Popover, Switch). Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-10-25-capy-mascot-design.md`

## Global Constraints

- Chỉ làm việc trên `main`: trước khi sửa mã chạy `git fetch`, kéo `main` mới nhất; có thay đổi chưa commit thì `git stash` rồi `git stash pop`, không để pull đè.
- Không thêm thư viện mới. Vẽ bằng canvas 2D thuần.
- Không `any`, không `@ts-ignore`. Chỉ đọc `import.meta.env` trong `src/app/configs/env.ts`.
- Mọi file `.ts`/`.tsx` tối đa **300 dòng** sau Prettier; component dưới 200 dòng, hàm dưới 50 dòng.
- Import qua alias (`@components`, `@/app/...`), không import `antd` trực tiếp, dùng wrapper trong `src/components/ui`.
- Chuỗi hiển thị đi qua i18n `vi` và `en` (`src/app/languages/`).
- Không dùng `localStorage` cho token; chỉ lưu tuỳ chọn giao diện.
- Không commit trừ khi người dùng yêu cầu. Cuối mỗi task chỉ cần test của task đó xanh.
- Sau khi sửa xong: `npx -y prettier@3.6.2 --write <file đã sửa>` rồi `--check`, `yarn lint`, test liên quan, `node scripts/check-feature-lines.mjs src/components/capy`.
- Phản hồi, ghi chú, i18n `vi` bằng tiếng Việt.

## Review Focus

- Người dùng bật "giảm chuyển động" của hệ điều hành: Capy không khởi động, không có vòng vẽ nào chạy.
- Có hộp thoại (`[role="dialog"]` hoặc `.ant-modal`) mở khi Capy đang đi: Capy dừng và ngồi ở góc dưới, không băng qua hộp thoại.
- Rê chuột vào Capy đúng lúc Capy đang nhảy, rơi, bị nắm hoặc choáng: không chào, không ngắt hoạt cảnh.
- Mép đang đứng bị cuộn khuất: Capy rơi xuống nền bên dưới, không treo lơ lửng và không toạ độ NaN.
- `profile.fullName` trống hoặc `localStorage` ném lỗi (chế độ riêng tư): không crash, câu chào dùng `profile.email` hoặc câu chào không tên, tuỳ chọn mặc định vẫn dùng được.

---

### Task 1: Khung hình và bảng hoạt cảnh

**Files:**
- Create: `public/images/capy/<tên-khung>.webp` (khoảng 55 khung, bỏ nhóm `fall`, `step`, `munch`, `cheer1-3`)
- Create: `src/components/capy/frames/types.ts`, `src/components/capy/frames/manifest.ts`, `src/components/capy/frames/animations.ts`
- Create: `scripts/capy/README.md` và hai tập lệnh cắt ảnh (`frames.py`, `scales.py`) chép từ thư mục làm việc của phiên này
- Test: `src/components/capy/test/animations.test.ts`

**Interfaces:**
- Produces: `type FrameName` (union tên khung trong `manifest.ts`), `type AnimationName`,
  `interface FrameMeta { w: number; h: number; ax: number; s: number; bar?: [number, number, number, number] }`,
  `const FRAME_META: Readonly<Record<FrameName, FrameMeta>>`,
  `const ANIMATIONS: Readonly<Record<AnimationName, { frames: readonly FrameName[]; fps: number }>>`,
  `frameUrl(name: FrameName): string` (trả `/images/capy/<name>.webp`).
- Hoạt cảnh bắt buộc có: `idle, walk, run, turnIn, turnOut, phoneOut, phoneIn, phoneLook, takeoff, air, held, dizzy, sit, standUp, push, selfie, bye, nod, doze, wave`. Danh sách khung và fps copy từ bản mẫu đã duyệt (xem mục Hình ảnh của spec).

- [ ] **Step 1: Write the failing test** `animations.test.ts`: mọi khung trong `ANIMATIONS` có trong `FRAME_META`; mọi `FRAME_META` có `s > 0`, `w > 0`, `h > 0`; mọi `fps > 0`; `ANIMATIONS.walk.frames.length === 8`, `ANIMATIONS.run.frames.length === 5`; không khung nào có tên bắt đầu bằng `fall`.
- [ ] **Step 2: Run** `yarn vitest run src/components/capy/test/animations.test.ts`. Expected: FAIL (module chưa có).
- [ ] **Step 3:** Chuyển các khung đã xử lý (PNG nền trong) sang WebP, đặt vào `public/images/capy/`. Sinh `manifest.ts` từ `frames.json` của thư mục làm việc (`w,h,ax,bar`) và hệ số tỉ lệ `s` từ `scales.json`. Viết `animations.ts` theo chuỗi khung của bản mẫu.
- [ ] **Step 4: Run** lại test. Expected: PASS.

### Task 2: Cấu hình, tuỳ chọn và điều kiện chạy

**Files:**
- Modify: `src/app/configs/env.ts` (thêm `CAPY_ENABLED: import.meta.env.VITE_CAPY_ENABLED === 'true'`); thêm `VITE_CAPY_ENABLED` vào file `.env.example` nếu repo có
- Create: `src/components/capy/capyRoutes.ts`, `src/components/capy/hooks/useCapySettings.ts`
- Test: `src/components/capy/test/useCapySettings.test.tsx`

**Interfaces:**
- Produces: `CAPY_SCREENS` (mảng `ScreenAccess` lấy từ `SCREENS` trong registry: `ROLE_MANAGEMENT`, `PERMISSION_MANAGEMENT`, `USER_ACCOUNT`, `FEE_CONFIG`), `isCapyRoute(pathname: string): boolean` (khớp đầu đường dẫn màn hoặc alias),
  `useCapySettings(): { available: boolean; enabled: boolean; idleOnly: boolean; setEnabled(v: boolean): void; setIdleOnly(v: boolean): void }`.
- `available` chỉ đúng khi: `ENV.CAPY_ENABLED`, `isCapyRoute(pathname)`, rộng màn hình từ 768px, và không bật `prefers-reduced-motion`.
- Khóa lưu `capy:<username>` với `username` từ `useAppSelector((s) => s.auth.profile.username)`, giá trị JSON `{ enabled, idleOnly }`, mặc định `{ enabled: true, idleOnly: false }`; đọc/ghi bọc `try/catch`.

- [ ] **Step 1: Write the failing tests:** `available` là false khi env tắt; false ở route ngoài allowlist; false khi `matchMedia('(prefers-reduced-motion: reduce)').matches`; hai username có hai khóa lưu độc lập; `setEnabled(false)` rồi render lại vẫn giữ; `localStorage.getItem` ném lỗi thì hook vẫn trả mặc định.
- [ ] **Step 2: Run** test, expected FAIL.
- [ ] **Step 3: Implement** `capyRoutes.ts` và `useCapySettings.ts` theo Interfaces; đọc env qua `ENV`.
- [ ] **Step 4: Run** test, expected PASS.

### Task 3: Logic thuần: câu chào, nền đứng, vùng cấm

**Files:**
- Create: `src/components/capy/engine/greeting.ts`, `src/components/capy/engine/platforms.ts`, `src/components/capy/engine/zones.ts`
- Test: `src/components/capy/test/greeting.test.ts`, `platforms.test.ts`, `zones.test.ts`

**Interfaces:**
- Produces: `givenName(fullName: string): string` (chữ cuối của họ tên, chuỗi rỗng nếu trống),
  `buildGreeting(name: string, hour: number, random: () => number): string`,
  `interface Platform { y: number; lo: number; hi: number; only?: readonly [number, number] }`,
  `pickPlatformBelow(platforms: readonly Platform[], feetY: number, x: number): number` (chỉ số nền gần nhất bên dưới, nền cuối cùng nếu không có),
  `FORBIDDEN_SELECTOR: string` (gồm `[data-capy="no"]`, `[role="dialog"]`, `.ant-modal`, `input:focus`, `textarea:focus`, `select:focus`, `[contenteditable="true"]`),
  `intersectsForbidden(rect: DOMRect, zones: readonly DOMRect[], pad?: number): boolean`,
  `pushOutOfZones(x: number, width: number, zones: readonly DOMRect[]): number`.
- Buổi trong ngày: giờ < 11 "buổi sáng", < 14 "buổi trưa", < 18 "buổi chiều", còn lại "buổi tối". Ba mẫu câu của spec.

- [ ] **Step 1: Write the failing tests:** `givenName('Trần Huy') === 'Huy'`, `givenName('Admin') === 'Admin'`, `givenName('  ') === ''`; `buildGreeting('Huy', 9, () => 0)` chứa "buổi sáng" và "Huy", giờ 10/11/13/14/17/18 rơi vào đúng buổi; `buildGreeting('', 9, () => 0)` không chứa dấu phẩy thừa hay "undefined"; `pickPlatformBelow` bỏ qua nền ở trên chân, bỏ qua nền `only` khi x ngoài khoảng, trả nền cuối khi không còn nền bên dưới; `pushOutOfZones` đưa x ra ngoài vùng cấm.
- [ ] **Step 2: Run** tests, expected FAIL.
- [ ] **Step 3: Implement** các hàm theo Interfaces; hàm thuần, không đụng DOM ngoài kiểu `DOMRect`.
- [ ] **Step 4: Run** tests, expected PASS.

### Task 4: Bộ máy chạy thời gian thực

**Files:**
- Create: `src/components/capy/engine/player.ts` (phát khung hình, vẽ vào ngữ cảnh canvas được tiêm vào), `engine/world.ts` (đo nền và vùng cấm từ DOM, nghe cuộn), `engine/actions.ts` (các hành động `roam`, `run`, `climb`, `rest`, `sleep`, `selfie`, `wave`, rơi), `engine/CapyEngine.ts` (vòng lặp, huỷ, kéo thả)
- Test: `src/components/capy/test/CapyEngine.test.ts`

**Interfaces:**
- Consumes: `ANIMATIONS`, `FRAME_META`, `pickPlatformBelow`, `FORBIDDEN_SELECTOR`, `buildGreeting`, `givenName`.
- Produces: `class CapyEngine { constructor(opts: { ctx: Canvas2dLike; images: ReadonlyMap<FrameName, CanvasImageSource>; root: HTMLElement; getName: () => string; onBubble: (text: string | null) => void; onPose: (pose: string) => void }); start(): void; stop(): void; setIdleOnly(v: boolean): void; greet(): void; pointerDown(clientX: number, clientY: number): void; pointerMove(clientX: number, clientY: number): void; pointerUp(): void }` với `Canvas2dLike` là kiểu hẹp chỉ gồm các phương thức vẽ dùng đến, để test tiêm bản giả.
- Hành vi theo spec: đi/chạy quay ngang và cất điện thoại, rút ra khi dừng; nhảy bậc từng nền; thả kéo thì rơi, lộn nhào khi cao hơn 90px, choáng rồi đứng dậy; có hộp thoại mở thì ngồi ở góc dưới; cuộn làm mất nền thì rơi xuống nền bên dưới; `stop()` huỷ mọi bộ đếm giờ và vòng `requestAnimationFrame`.

- [ ] **Step 1: Write the failing tests** (jsdom, canvas giả): `stop()` thì không còn callback `requestAnimationFrame` nào được lên lịch; sau `greet()` khi pose là `air` thì `onBubble` không được gọi; sau `greet()` ở trạng thái đứng thì `onBubble` nhận chuỗi chứa tên; khi `root` có `[role="dialog"]`, hành động kế tiếp là `rest` ở góc dưới; khi nền Capy đang đứng bị gỡ khỏi DOM rồi phát sự kiện `scroll`, toạ độ Capy là số hữu hạn và hạ xuống nền thấp hơn; với `setIdleOnly(true)` Capy không đổi vị trí ngang sau 10 giây giả lập.
- [ ] **Step 2: Run** `yarn vitest run src/components/capy/test/CapyEngine.test.ts`, expected FAIL.
- [ ] **Step 3: Implement** theo Interfaces. Chuyển bản mẫu đã duyệt (trình phát, đo nền, các hành động, kéo thả) sang các file nhỏ, mỗi file dưới 300 dòng; tách `actions.ts` và `world.ts` nếu `CapyEngine.ts` vượt giới hạn. Nghe `scroll` ở pha bắt (`capture: true`) trên `document` vì nội dung cuộn trong `<main>`, không phải `window`.
- [ ] **Step 4: Run** test, expected PASS.

### Task 5: Component Capy và gắn vào AppLayout

**Files:**
- Create: `src/components/capy/Capy.tsx`, `src/components/capy/hooks/useCapyFrames.ts`
- Modify: `src/components/layout/AppLayout.tsx` (render `<Capy />` một lần trong `LayoutBody`, ngoài `<main>`)
- Test: `src/components/capy/test/Capy.test.tsx`

**Interfaces:**
- Consumes: `useCapySettings`, `CapyEngine`, `frameUrl`, `FRAME_META`.
- Produces: `Capy(): ReactElement | null` trả `null` khi `!available || !enabled`; ngược lại là lớp phủ `position: fixed; inset: 0; pointer-events: none; z-index: 900` chứa hộp Capy 54x78px `pointer-events: auto`, `aria-hidden`, một `<canvas>` 170x170 và bong bóng thoại. `useCapyFrames(enabled: boolean): ReadonlyMap<FrameName, HTMLImageElement> | null` chỉ tải ảnh khi `enabled` đúng.

- [ ] **Step 1: Write the failing tests:** không render canvas khi env tắt; không render ngoài route allowlist; không render khi `enabled` là false; render đúng một canvas khi bật; không tải ảnh khi tắt; `pointerenter` kiểu chuột gọi chào và bong bóng chứa tên từ `profile.fullName`; `pointerenter` kiểu cảm ứng thì không chào; `profile.fullName` trống thì bong bóng không chứa "undefined"; gỡ component thì `engine.stop()` được gọi.
- [ ] **Step 2: Run** test, expected FAIL.
- [ ] **Step 3: Implement** `Capy.tsx` (nối chuột sang `CapyEngine`, giữ dưới 200 dòng) và `useCapyFrames.ts`; thêm `<Capy />` vào `AppLayout.tsx`.
- [ ] **Step 4: Run** test và `yarn vitest run src/components/layout`, expected PASS.

### Task 6: Nút bật/tắt ở header và menu trên Capy

**Files:**
- Create: `src/components/capy/CapyToggle.tsx`, `src/components/capy/CapyMenu.tsx`
- Modify: `src/components/layout/Header.tsx` (thêm `<CapyToggle />` cạnh `<NavProfile />`); `src/app/languages/vi/translation.json`, `src/app/languages/en/translation.json` (nhãn: bật/tắt linh vật, chỉ đứng yên, chào, ngủ, ẩn)
- Test: `src/components/capy/test/CapyToggle.test.tsx`

**Interfaces:**
- Consumes: `useCapySettings`, `PopoverComponent`, `Switch` từ `@components/index`.
- Produces: `CapyToggle(): ReactElement | null` (null khi `!available`), `CapyMenu(props: { onGreet(): void; onSleep(): void; onHide(): void }): ReactElement`.

- [ ] **Step 1: Write the failing tests:** `CapyToggle` không hiện khi `available` false; bấm nút mở menu có công tắc Bật/Tắt và "Chỉ đứng yên"; tắt công tắc thì `enabled` false và được lưu; `CapyMenu`: bấm "Ẩn" giống hệt tắt (cùng giá trị lưu); nút icon có `aria-label` tiếng Việt.
- [ ] **Step 2: Run** test, expected FAIL.
- [ ] **Step 3: Implement** hai component bằng wrapper `components/ui`, chuỗi qua `t()`; thêm khoá i18n `vi` và `en`.
- [ ] **Step 4: Run** test, expected PASS. Chạy thêm test header hiện có nếu có.

### Task 7: Đánh dấu vùng cấm trên các màn trong allowlist

**Files:**
- Modify: các cột/nút nhạy cảm trong các màn của `CAPY_SCREENS` (xác định ở bước 1); `src/components/ui/mask-text-component` (thêm `data-capy="no"` vào phần tử gốc)
- Test: `src/components/capy/test/capyZonesCoverage.test.ts`, cộng test của `mask-text-component` nếu đã có

**Interfaces:**
- Consumes: `FORBIDDEN_SELECTOR`, `CAPY_SCREENS`.
- Produces: quy ước: cột số tiền, số tài khoản, số điện thoại, cột thao tác và nút hành động tiền (hoàn tiền, đóng băng, duyệt) có thuộc tính `data-capy="no"`.

- [ ] **Step 1:** Duyệt từng màn trong `CAPY_SCREENS`, liệt kê (vào mô tả công việc) cột/nút nhạy cảm; **màn nào chứa số tiền hoặc thao tác tiền mà không đánh dấu được trong task này thì gỡ màn đó khỏi `CAPY_SCREENS`**, không phát hành chỉ dựa vào heuristic.
- [ ] **Step 2: Write the failing test** `capyZonesCoverage.test.ts`: `MaskText` render ra phần tử khớp `FORBIDDEN_SELECTOR`; mỗi màn còn lại trong `CAPY_SCREENS` có tối thiểu một test render xác nhận cột thao tác khớp `FORBIDDEN_SELECTOR` (dùng fixture của test màn đó nếu đã có).
- [ ] **Step 3: Run** test, expected FAIL.
- [ ] **Step 4: Implement** đánh dấu `data-capy="no"` theo danh sách bước 1.
- [ ] **Step 5: Run** test và test của các màn đã sửa, expected PASS.

### Task 8: Kiểm tra tổng và dọn dẹp

**Files:**
- Modify: `docs/superpowers/specs/2026-10-25-capy-mascot-design.md` (ghi danh sách màn đợt đầu thực tế)

- [ ] **Step 1:** `npx -y prettier@3.6.2 --write` rồi `--check` cho mọi file đã tạo/sửa; `yarn lint`; `yarn test` chạy đủ; `node scripts/check-feature-lines.mjs src/components/capy`. Expected: tất cả xanh. Nếu `tsc` báo lỗi cũ không liên quan thì ghi rõ lỗi đó.
- [ ] **Step 2:** `yarn dev` với `VITE_CAPY_ENABLED=true`, mở một màn trong allowlist: Capy xuất hiện, nút ở header bật/tắt được, kéo thả được, rê chuột chào đúng tên, mở một hộp thoại thì Capy ngồi góc, đổi sang màn ngoài allowlist thì Capy biến mất, bật "giảm chuyển động" của hệ điều hành thì Capy không chạy. Ghi lại những gì đã kiểm tra thật và những gì chưa.
- [ ] **Step 3:** `yarn deadcode` (knip) không báo file mới nào mồ côi.
