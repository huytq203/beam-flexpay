# Merchant Gateway Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ba màn UI Key kết nối, Hình thức thanh toán và Thông báo trong phân hệ Merchant bằng dữ liệu fixture cục bộ, đầy đủ phân quyền, trạng thái và form CRUD.

**Architecture:** Mỗi màn là một route và feature folder độc lập, dùng chung ba component bố cục nhỏ trong `merchant-gateway/shared`. Hook của từng feature sở hữu fixture state, filter và phân trang; page chỉ ghép toolbar, table state và dialog để ranh giới dữ liệu có thể thay bằng RTK Query sau này.

**Tech Stack:** React 19, TypeScript 5, React Router 7, Ant Design 5 qua wrapper của project, React Hook Form, Zod 4, Vitest, Testing Library, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-09-21-merchant-gateway-settings-design.md`

## Global Constraints

- Chỉ triển khai frontend với fixture cục bộ; không gọi API và không mô phỏng độ trễ mạng.
- Tái sử dụng `MERCHANT_VIEW`, `MERCHANT_CREATE`, `MERCHANT_UPDATE`, `MERCHANT_DELETE`, `MERCHANT_FULL`; không thêm mã quyền backend.
- Mockup quyết định nội dung, thứ bậc và tác vụ; token và wrapper UI hiện tại quyết định hình thức, trạng thái và hành vi.
- Mỗi danh sách có loading, error, empty và success; search/filter luôn reset về trang đầu.
- Secret và đích nhận nhạy cảm được masked mặc định; không đưa secret fixture thật vào clipboard.
- Không thêm package, gradient, glass, card lồng card hoặc action icon thiếu accessible label.
- Mỗi task tuân theo TDD: test đỏ, code tối thiểu, test xanh, rồi commit.

---

### Task 1: Đăng ký route, screen và sidebar

**Files:**
- Modify: `src/app/permissions/registry.ts`
- Modify: `src/components/layout/components/Navigation.tsx`
- Modify: `src/routes.ts`
- Test: `src/app/permissions/test/registry.test.ts`
- Test: `src/components/layout/components/test/Navigation.test.tsx`

**Interfaces:**
- Produces: screen IDs `MERCHANT_KEY_CONNECTION`, `MERCHANT_PAYMENT_METHOD`, `MERCHANT_NOTIFICATION` trong `SCREENS`.
- Produces: route paths `/merchant/key-connection`, `/merchant/payment-method`, `/merchant/notification`.
- Consumes: `MERCHANT_ACTIONS`, `MERCHANT`, `Can` và cơ chế lọc sidebar hiện tại.

- [ ] **Step 1: Viết test registry và navigation thất bại**

```tsx
expect(SCREENS.MERCHANT_KEY_CONNECTION.path).toBe('/merchant/key-connection')
expect(SCREENS.MERCHANT_PAYMENT_METHOD.path).toBe('/merchant/payment-method')
expect(SCREENS.MERCHANT_NOTIFICATION.path).toBe('/merchant/notification')

expect(findItem(navigationItems, 'key-connection')?.screen)
  .toBe('MERCHANT_KEY_CONNECTION')
expect(findItem(navigationItems, 'payment-method')?.screen)
  .toBe('MERCHANT_PAYMENT_METHOD')
expect(findItem(navigationItems, 'notification')?.screen)
  .toBe('MERCHANT_NOTIFICATION')
```

- [ ] **Step 2: Chạy test để xác nhận đỏ**

Run: `yarn vitest run src/app/permissions/test/registry.test.ts src/components/layout/components/test/Navigation.test.tsx`

Expected: FAIL vì ba screen và ba item chưa tồn tại.

- [ ] **Step 3: Thêm screen và item sidebar**

```ts
MERCHANT_KEY_CONNECTION: {
  path: `${MERCHANT}/key-connection`,
  actions: { ...MERCHANT_ACTIONS }
},
MERCHANT_PAYMENT_METHOD: {
  path: `${MERCHANT}/payment-method`,
  actions: { ...MERCHANT_ACTIONS }
},
MERCHANT_NOTIFICATION: {
  path: `${MERCHANT}/notification`,
  actions: { ...MERCHANT_ACTIONS }
}
```

Thêm ba children vào `merchantManagement`, dùng icon Phosphor đã có (`KeyIcon`, `CreditCardIcon`, `BellIcon`), label lần lượt `Key kết nối`, `Hình thức thanh toán`, `Thông báo` và screen ID tương ứng.

- [ ] **Step 4: Khai báo ba lazy route**

```tsx
{
  path: SCREENS.MERCHANT_KEY_CONNECTION.path,
  element: page(() => import('@/pages/merchant-management/merchant-gateway/key-connection/pages/KeyConnectionPage'))
},
{
  path: SCREENS.MERCHANT_PAYMENT_METHOD.path,
  element: page(() => import('@/pages/merchant-management/merchant-gateway/payment-method/pages/PaymentMethodPage'))
},
{
  path: SCREENS.MERCHANT_NOTIFICATION.path,
  element: page(() => import('@/pages/merchant-management/merchant-gateway/notification/pages/NotificationPage'))
}
```

Tạo ba page module tạm trả về heading đúng tên để route compile; nội dung thật được thay ở Task 3–5.

- [ ] **Step 5: Chạy test và typecheck**

Run: `yarn vitest run src/app/permissions/test/registry.test.ts src/components/layout/components/test/Navigation.test.tsx && yarn typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/permissions/registry.ts src/components/layout/components/Navigation.tsx src/routes.ts src/pages/merchant-management/merchant-gateway src/app/permissions/test/registry.test.ts src/components/layout/components/test/Navigation.test.tsx
git commit -m "feat: register merchant gateway settings routes"
```

### Task 2: Xây component dùng chung và chuẩn hóa trạng thái danh sách

**Files:**
- Create: `src/pages/merchant-management/merchant-gateway/shared/MerchantGatewayPage.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/shared/MerchantGatewayToolbar.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/shared/MerchantGatewayTableState.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/shared/merchantGateway.types.ts`
- Test: `src/pages/merchant-management/merchant-gateway/shared/test/MerchantGatewayTableState.test.tsx`

**Interfaces:**
- Produces: `ListState = 'loading' | 'error' | 'empty' | 'success'`.
- Produces: `MerchantGatewayPageProps { title; description; total; createLabel; screen; onCreate; children }`.
- Produces: `MerchantGatewayToolbarProps { children; search: ReactNode }`.
- Produces: generic `MerchantGatewayTableState<T extends object>` nhận `state`, `rows`, `columns`, `rowKey`, `pagination`, `onRetry`, `emptyKind`.
- Consumes: `CardComponent`, `ButtonComponent`, `Table`, `Can`, Ant Design `Empty` và `Result`.

- [ ] **Step 1: Viết test bốn trạng thái thất bại**

```tsx
it.each([
  ['loading', 'Đang tải dữ liệu'],
  ['error', 'Không thể tải dữ liệu'],
  ['empty', 'Chưa có cấu hình']
] as const)('render %s state', (state, label) => {
  render(<MerchantGatewayTableState state={state} rows={[]} columns={[]} rowKey='id' />)
  expect(screen.getByText(label)).toBeInTheDocument()
})

it('render success rows', () => {
  render(
    <MerchantGatewayTableState
      state='success'
      rows={[{ id: '1', name: 'Highlands Coffee' }]}
      columns={[{ title: 'Merchant', dataIndex: 'name' }]}
      rowKey='id'
    />
  )
  expect(screen.getByText('Highlands Coffee')).toBeInTheDocument()
})
```

- [ ] **Step 2: Chạy test để xác nhận đỏ**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway/shared/test/MerchantGatewayTableState.test.tsx`

Expected: FAIL vì module chưa tồn tại.

- [ ] **Step 3: Cài đặt type và component trạng thái**

```ts
export type ListState = 'loading' | 'error' | 'empty' | 'success'

export interface MerchantGatewayTableStateProps<T extends object> {
  state: ListState
  rows: readonly T[]
  columns: TableColumnsType<T>
  rowKey: keyof T | ((row: T) => React.Key)
  pagination?: false | TablePaginationConfig
  onRetry?: () => void
  emptyKind?: 'initial' | 'filtered'
}
```

`loading` dùng `Table loading` với mảng rỗng và text `Đang tải dữ liệu`; `error` dùng `Result` + nút `Thử lại`; `empty` dùng `Empty` với copy khác nhau cho initial/filtered; `success` dùng `Table` và `scroll={{ x: 'max-content' }}`.

- [ ] **Step 4: Cài đặt page shell và toolbar**

`MerchantGatewayPage` render một `<main>` chứa Card toolbar từ children và Card danh sách; header có title, description, badge tổng bản ghi, và CTA được bọc `Can screen={screen} action='create'`. `MerchantGatewayToolbar` dùng `<section role='search'>` với layout `flex flex-wrap gap-2`.

- [ ] **Step 5: Chạy test và typecheck**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway/shared/test/MerchantGatewayTableState.test.tsx && yarn typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/merchant-management/merchant-gateway/shared
git commit -m "feat: add merchant gateway shared UI"
```

### Task 3: Xây màn Key kết nối

**Files:**
- Create: `src/pages/merchant-management/merchant-gateway/key-connection/types/keyConnection.type.ts`
- Create: `src/pages/merchant-management/merchant-gateway/key-connection/constants/keyConnection.fixture.ts`
- Create: `src/pages/merchant-management/merchant-gateway/key-connection/schemas/keyConnection.schema.ts`
- Create: `src/pages/merchant-management/merchant-gateway/key-connection/hooks/useKeyConnections.ts`
- Create: `src/pages/merchant-management/merchant-gateway/key-connection/components/KeyConnectionToolbar.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/key-connection/components/KeyConnectionTable.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/key-connection/components/KeyConnectionDialog.tsx`
- Modify: `src/pages/merchant-management/merchant-gateway/key-connection/pages/KeyConnectionPage.tsx`
- Test: `src/pages/merchant-management/merchant-gateway/key-connection/test/keyConnection.schema.test.ts`
- Test: `src/pages/merchant-management/merchant-gateway/key-connection/test/KeyConnectionPage.test.tsx`

**Interfaces:**
- Produces: `KeyConnectionRow { id; scope; merchantName; merchantCode; clientId; maskedSecret; ipWhitelist; webhookUrl; status; updatedAt }`.
- Produces: `useKeyConnections()` trả `rows`, `total`, `page`, `pageSize`, `filters`, `listState`, `setFilters`, `setPage`, `save`, `toggleStatus`, `retry`.
- Consumes: shared components từ Task 2 và `SCREENS.MERCHANT_KEY_CONNECTION`.

- [ ] **Step 1: Viết schema và test lọc/permission thất bại**

```ts
expect(keyConnectionSchema.safeParse({
  scope: 'MASTER',
  merchantCode: 'MC000142',
  clientId: 'hlc-production',
  maskedSecret: '••••••••••••4F2A',
  ipWhitelist: ['203.113.1.10'],
  webhookUrl: 'https://merchant.example.vn/ipn',
  status: 'ACTIVE'
}).success).toBe(true)

expect(keyConnectionSchema.safeParse({
  scope: 'MASTER', merchantCode: '', clientId: '', maskedSecret: '',
  ipWhitelist: ['invalid-ip'], webhookUrl: 'http://insecure.test', status: 'ACTIVE'
}).success).toBe(false)
```

Page test render fixture, nhập `SUB-0142-01`, xác nhận chỉ dòng Sub xuất hiện; render quyền chỉ-view và xác nhận không có `Thêm mới Key` hoặc `Sửa key`.

- [ ] **Step 2: Chạy test để xác nhận đỏ**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway/key-connection/test`

Expected: FAIL vì schema/page chưa tồn tại.

- [ ] **Step 3: Tạo type, schema và fixture**

Fixture có ít nhất bốn dòng: Master Highlands, hai Sub Highlands và một merchant khác; bao phủ ACTIVE/INACTIVE, có/không có whitelist. Secret lưu dưới dạng masked string duy nhất, ví dụ `••••••••••••4F2A`.

Schema dùng `z.enum(['MASTER', 'SUB'])`, `z.string().min(1)`, danh sách IPv4 kiểm bằng regex có chặn octet >255, và `z.url()` kết hợp refine `url.startsWith('https://')`.

- [ ] **Step 4: Cài đặt hook fixture state**

```ts
export interface KeyConnectionFilters {
  query: string
  scope: 'ALL' | KeyConnectionScope
  status: 'ALL' | KeyConnectionStatus
}

const save = (record: KeyConnectionFormValues & { id?: string }): void => {
  setRecords((current) => upsertKeyConnection(current, record))
}
```

`useMemo` lọc case-insensitive theo merchantName, merchantCode và clientId; paginate 10 dòng/trang; mọi `setFilters` đặt page về 1.

- [ ] **Step 5: Xây toolbar, bảng và dialog**

Bảng có các cột theo spec. Client ID dùng `CopyableText`; masked secret chỉ render text; URL có ellipsis + title. Action `Sửa key` bọc `Can action='edit'`; Switch/bút trạng thái bọc `Can action='update'` và mở `DialogModal` xác nhận.

Dialog dùng React Hook Form + `zodResolver`, responsive width `{ xs: 'calc(100vw - 24px)', md: 640 }`, labels đầy đủ, `destroyOnHidden`, submit qua `form` attribute và reset khi đóng.

- [ ] **Step 6: Ghép page và chạy test**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway/key-connection/test && yarn typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/merchant-management/merchant-gateway/key-connection
git commit -m "feat: add merchant connection keys UI"
```

### Task 4: Xây màn Hình thức thanh toán

**Files:**
- Create: `src/pages/merchant-management/merchant-gateway/payment-method/types/paymentMethod.type.ts`
- Create: `src/pages/merchant-management/merchant-gateway/payment-method/constants/paymentMethod.fixture.ts`
- Create: `src/pages/merchant-management/merchant-gateway/payment-method/schemas/paymentMethod.schema.ts`
- Create: `src/pages/merchant-management/merchant-gateway/payment-method/hooks/usePaymentMethods.ts`
- Create: `src/pages/merchant-management/merchant-gateway/payment-method/components/PaymentMethodToolbar.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/payment-method/components/PaymentMethodTable.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/payment-method/components/PaymentMethodDialog.tsx`
- Modify: `src/pages/merchant-management/merchant-gateway/payment-method/pages/PaymentMethodPage.tsx`
- Test: `src/pages/merchant-management/merchant-gateway/payment-method/test/paymentMethod.schema.test.ts`
- Test: `src/pages/merchant-management/merchant-gateway/payment-method/test/PaymentMethodPage.test.tsx`

**Interfaces:**
- Produces: `PaymentMethodRow { id; scope; merchantName; merchantCode; method; channel; minAmount; maxAmount; feeLabel; status; updatedAt }`.
- Produces: `usePaymentMethods()` cùng shape CRUD/filter/pagination của Task 3 nhưng dùng `PaymentMethodFilters`.
- Consumes: shared components Task 2 và `formatCurrency`/number helper hiện có.

- [ ] **Step 1: Viết schema và page test thất bại**

```ts
const valid = paymentMethodSchema.safeParse({
  scope: 'MASTER', merchantCode: 'MC000142', method: 'VI_DIEN_TU',
  channel: 'WEB', minAmount: 10000, maxAmount: 50000000,
  feeLabel: '0,8% / giao dịch', status: 'ACTIVE'
})
expect(valid.success).toBe(true)

const invalid = paymentMethodSchema.safeParse({
  scope: 'MASTER', merchantCode: 'MC000142', method: 'VI_DIEN_TU',
  channel: 'WEB', minAmount: 50000000, maxAmount: 10000,
  feeLabel: '', status: 'ACTIVE'
})
expect(invalid.success).toBe(false)
```

Page test lọc `QR động`, xác nhận dòng ví điện tử bị loại; click `Thêm hình thức`, submit rỗng và xác nhận error cho merchant/phương thức/hạn mức.

- [ ] **Step 2: Chạy test để xác nhận đỏ**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway/payment-method/test`

Expected: FAIL vì schema/page chưa tồn tại.

- [ ] **Step 3: Tạo type, fixture và schema**

Fixture bao phủ `QR_DONG`, `VI_DIEN_TU`, `THE_NOI_DIA`, channel `WEB`, `APP`, `POS` và ACTIVE/INACTIVE. Schema dùng `superRefine` để gắn lỗi `maxAmount` khi `maxAmount < minAmount`; cả hai là số nguyên không âm.

- [ ] **Step 4: Cài đặt hook và UI**

Toolbar lọc query, method và status. Table format hạn mức bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`, status dùng `TagComponent`, action sửa/bật-tắt có label và permission.

Dialog dùng `SelectInput`, `InputNumber`, `Input`, validation inline và submit bằng `ButtonComponent`. `save` upsert theo id; toggle chỉ đổi status và updatedAt.

- [ ] **Step 5: Chạy test và typecheck**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway/payment-method/test && yarn typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/merchant-management/merchant-gateway/payment-method
git commit -m "feat: add merchant payment methods UI"
```

### Task 5: Xây màn Thông báo

**Files:**
- Create: `src/pages/merchant-management/merchant-gateway/notification/types/notification.type.ts`
- Create: `src/pages/merchant-management/merchant-gateway/notification/constants/notification.fixture.ts`
- Create: `src/pages/merchant-management/merchant-gateway/notification/schemas/notification.schema.ts`
- Create: `src/pages/merchant-management/merchant-gateway/notification/hooks/useNotifications.ts`
- Create: `src/pages/merchant-management/merchant-gateway/notification/components/NotificationToolbar.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/notification/components/NotificationTable.tsx`
- Create: `src/pages/merchant-management/merchant-gateway/notification/components/NotificationDialog.tsx`
- Modify: `src/pages/merchant-management/merchant-gateway/notification/pages/NotificationPage.tsx`
- Test: `src/pages/merchant-management/merchant-gateway/notification/test/notification.schema.test.ts`
- Test: `src/pages/merchant-management/merchant-gateway/notification/test/NotificationPage.test.tsx`

**Interfaces:**
- Produces: `NotificationRow { id; scope; merchantName; merchantCode; event; channel; maskedDestination; destination; status; updatedAt }`.
- Produces: `notificationSchema` với validation đích nhận phụ thuộc `channel`.
- Produces: `useNotifications()` cùng shape CRUD/filter/pagination, cộng hàm `maskDestination(channel, value)`.
- Consumes: shared components Task 2 và screen `MERCHANT_NOTIFICATION`.

- [ ] **Step 1: Viết test validation theo kênh và page filter thất bại**

```ts
const values = (channel: NotificationChannel, destination: string) => ({
  scope: 'MASTER' as const,
  merchantCode: 'MC000142',
  event: 'PAYMENT_SUCCESS' as const,
  channel,
  destination,
  status: 'ACTIVE' as const
})

expect(notificationSchema.safeParse(values('EMAIL', 'ops@highlands.vn')).success).toBe(true)
expect(notificationSchema.safeParse(values('EMAIL', '0909123456')).success).toBe(false)
expect(notificationSchema.safeParse(values('SMS', '0909123456')).success).toBe(true)
expect(notificationSchema.safeParse(values('WEBHOOK', 'https://merchant.example.vn/events')).success).toBe(true)
expect(notificationSchema.safeParse(values('WEBHOOK', 'http://merchant.example.vn/events')).success).toBe(false)
```

Page test chọn channel `Email`, xác nhận chỉ email row còn lại; test danh sách chỉ hiển thị `o***@highlands.vn`, không hiển thị email đầy đủ.

- [ ] **Step 2: Chạy test để xác nhận đỏ**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway/notification/test`

Expected: FAIL vì schema/page chưa tồn tại.

- [ ] **Step 3: Tạo type, fixture, mask helper và schema**

Fixture bao phủ sự kiện `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `REFUND`, `SETTLEMENT`; channel `EMAIL`, `SMS`, `WEBHOOK`. `maskDestination` trả email dạng `o***@domain`, SMS `******1234`, webhook chỉ giữ origin + pathname rút gọn.

Schema dùng `superRefine`: `z.email()` cho EMAIL, regex `^(0|\+84)[0-9]{9,10}$` cho SMS, URL HTTPS cho WEBHOOK.

- [ ] **Step 4: Cài đặt hook và UI**

Toolbar lọc query, event, channel và status. Table không render `destination` thô; chỉ render `maskedDestination`. Dialog đổi placeholder và input mode theo channel, reset error `destination` khi channel đổi, action sửa/bật-tắt theo permission.

- [ ] **Step 5: Chạy test và typecheck**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway/notification/test && yarn typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/merchant-management/merchant-gateway/notification
git commit -m "feat: add merchant notifications UI"
```

### Task 6: Kiểm thử tích hợp, harden responsive và kiểm tra hình ảnh

**Files:**
- Modify: các file thuộc `src/pages/merchant-management/merchant-gateway/**` khi test hoặc kiểm tra hình ảnh phát hiện lỗi.
- Create: `.impeccable/review/desktop.png`
- Create: `.impeccable/review/mobile.png`

**Interfaces:**
- Consumes: toàn bộ route, shared UI và ba feature ở Task 1–5.
- Produces: build sạch, evidence desktop/mobile và kết quả detector để finish reviewer đánh giá.

- [ ] **Step 1: Chạy toàn bộ test feature**

Run: `yarn vitest run src/app/permissions/test src/components/layout/components/test/Navigation.test.tsx src/pages/merchant-management/merchant-gateway`

Expected: PASS, không test flaky.

- [ ] **Step 2: Chạy static verification**

Run: `yarn typecheck && yarn eslint src && yarn build`

Expected: ba lệnh exit 0; build sinh ba lazy chunks mới và không có import cycle.

- [ ] **Step 3: Chạy app và chụp một batch desktop/mobile**

Run: `yarn dev`

Đăng nhập bằng fixture/test session hiện có, mở lần lượt ba route. Chụp viewport desktop 1440×900 và mobile 390×844 vào `.impeccable/review/desktop.png` và `.impeccable/review/mobile.png`; xác nhận title đúng, toolbar wrap, bảng cuộn ngang, dialog không tràn viewport, focus ring và empty/error state đọc được.

- [ ] **Step 4: Chạy detector một lần và sửa một batch**

Run: `node .agents/skills/impeccable/scripts/detect.mjs --json`

Sửa cùng một batch mọi lỗi cơ học trên changed targets: hard-coded màu không có lý do, radius ngoài hệ thống, icon thiếu label, nội dung bị cắt, overflow hoặc typography lệch token.

- [ ] **Step 5: Xác nhận sau batch sửa**

Run: `yarn vitest run src/pages/merchant-management/merchant-gateway && yarn typecheck && yarn build`

Chụp lại đúng hai viewport tối đa một lần nếu Step 4 thay đổi layout. Expected: test/build pass và evidence hợp lệ, không blank/half-loaded/wrong route.

- [ ] **Step 6: Review chất lượng và tài liệu hóa**

Gửi original request, spec, changed paths, hai screenshot, detector findings và craft-floor path cho `impeccable-finish-reviewer`. Xử lý disposition theo workflow Impeccable; sau verdict cuối, chạy `impeccable-documenter` để cập nhật design artifact nếu reviewer xác nhận có quyết định hệ thống mới.

- [ ] **Step 7: Commit verification fixes**

```bash
git add src/pages/merchant-management/merchant-gateway src/routes.ts src/app/permissions/registry.ts src/components/layout/components/Navigation.tsx .impeccable/review
git commit -m "test: verify merchant gateway settings UI"
```
