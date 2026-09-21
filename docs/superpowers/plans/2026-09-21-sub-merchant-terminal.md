# Sub-merchant and Terminal UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng đầy đủ UI fixture cho quản lý Sub-merchant và Terminal, gồm điều hướng, danh sách, thêm/sửa, chi tiết và khóa/mở khóa.

**Architecture:** Hai feature được đặt dưới `sub-merchant-management`, mỗi feature sở hữu types, fixture, schema, hook, component và page của mình. Chỉ các primitive trình bày thật sự giống nhau (page header, trạng thái bảng, status tag, lock dialog frame) mới đặt trong `shared`; navigation, registry và routes dùng chung quyền `MERCHANT_*` hiện có.

**Tech Stack:** React 19, TypeScript, React Router, Redux permission store, React Hook Form, Zod, Ant Design qua wrapper nội bộ, Vitest và Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-21-sub-merchant-terminal-design.md`

## Global Constraints

- Giai đoạn này chỉ dùng fixture cục bộ; không thêm API/RTK Query, upload thật hoặc xuất Excel thật.
- Bám pattern Bank Account/Merchant Gateway, dùng component UI và token sẵn có trước khi tạo component mới.
- Action trong bảng là icon-only, bắt buộc có tooltip và `aria-label`.
- Route, sidebar và CTA phải dùng cùng screen registry và quyền `MERCHANT_*`.
- Không hiển thị secret, key hoặc số tài khoản đầy đủ trong fixture/detail.
- Responsive một cột trên mobile, hai cột trên desktop; bảng cuộn ngang và giữ cột thao tác bên phải.
- Giữ nguyên mọi thay đổi ngoài phạm vi đang có trong worktree.

---

### Task 1: Navigation, registry, routes and header titles

**Files:**
- Modify: `src/app/permissions/registry.ts`
- Modify: `src/app/permissions/test/registry.test.ts`
- Modify: `src/components/layout/components/Navigation.tsx`
- Modify: `src/components/layout/components/test/Navigation.test.tsx`
- Modify: `src/routes.ts`
- Modify: `src/app/languages/vi/headerTitle.json`
- Create: `src/test/routes.merchantHierarchy.test.tsx`

**Interfaces:**
- Produces: `SCREENS.MERCHANT_SUB_MERCHANT.path === '/secure-panel/merchant/sub-merchant'`.
- Produces: `SCREENS.MERCHANT_TERMINAL.path === '/secure-panel/merchant/terminal'`.
- Produces: sidebar group `sub-merchant-management` với child `sub-merchant` và `terminal`.
- Consumes: `MERCHANT_ACTIONS`, `Can`, lazy-page helper và icon Phosphor đang dùng trong navigation.

- [ ] **Step 1: Write failing registry/navigation tests**

```tsx
it('đăng ký hai màn Sub-merchant và Terminal bằng quyền merchant', () => {
  expect(SCREENS.MERCHANT_SUB_MERCHANT.path).toBe('/secure-panel/merchant/sub-merchant')
  expect(SCREENS.MERCHANT_TERMINAL.path).toBe('/secure-panel/merchant/terminal')
  expect(SCREENS.MERCHANT_SUB_MERCHANT.actions.view).toBe(PERMISSION.MERCHANT_VIEW)
  expect(SCREENS.MERCHANT_TERMINAL.actions.update).toBe(PERMISSION.MERCHANT_UPDATE)
})

it('hiển thị group quản lý sub-merchant với hai mục con', () => {
  const group = navigationItems.find((item) => item.key === 'sub-merchant-management')
  expect(group?.label).toBe('Quản lý sub-merchant')
  expect(group?.children?.map((item) => item.key)).toEqual(['sub-merchant', 'terminal'])
})

it('registers list, create, edit and detail routes for both entities', () => {
  const paths = flattenRoutePaths(WalletRoutes.routes)
  expect(paths).toEqual(expect.arrayContaining([
    '/secure-panel/merchant/sub-merchant',
    '/secure-panel/merchant/sub-merchant/create',
    '/secure-panel/merchant/sub-merchant/edit/:id',
    '/secure-panel/merchant/sub-merchant/detail/:id',
    '/secure-panel/merchant/terminal',
    '/secure-panel/merchant/terminal/create',
    '/secure-panel/merchant/terminal/edit/:id',
    '/secure-panel/merchant/terminal/detail/:id'
  ]))
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/permissions/test/registry.test.ts src/components/layout/components/test/Navigation.test.tsx src/test/routes.merchantHierarchy.test.tsx`

Expected: FAIL vì hai screen/group chưa tồn tại.

- [ ] **Step 3: Add registry entries, sidebar group, routes and titles**

```ts
MERCHANT_SUB_MERCHANT: {
  path: `${MERCHANT}/sub-merchant`,
  actions: { ...MERCHANT_ACTIONS, viewDetail: PERMISSION.MERCHANT_VIEW,
    lock: PERMISSION.MERCHANT_UPDATE, unlock: PERMISSION.MERCHANT_UPDATE }
},
MERCHANT_TERMINAL: {
  path: `${MERCHANT}/terminal`,
  actions: { ...MERCHANT_ACTIONS, viewDetail: PERMISSION.MERCHANT_VIEW,
    lock: PERMISSION.MERCHANT_UPDATE, unlock: PERMISSION.MERCHANT_UPDATE }
}
```

Add list/create/edit/detail lazy routes for both screens. Add exact title keys for all eight paths; dynamic edit/detail pages may set their visible H1 locally while `headerTitle.json` supplies the stable shell title.

- [ ] **Step 4: Run focused tests and JSON parse**

Run: `npx vitest run src/app/permissions/test/registry.test.ts src/components/layout/components/test/Navigation.test.tsx src/test/routes.merchantHierarchy.test.tsx && node -e "JSON.parse(require('fs').readFileSync('src/app/languages/vi/headerTitle.json','utf8'))"`

Expected: PASS and JSON parses without output.

- [ ] **Step 5: Commit navigation slice**

```bash
git add src/app/permissions/registry.ts src/app/permissions/test/registry.test.ts src/components/layout/components/Navigation.tsx src/components/layout/components/test/Navigation.test.tsx src/routes.ts src/test/routes.merchantHierarchy.test.tsx src/app/languages/vi/headerTitle.json
git commit -m "feat: add sub-merchant navigation routes"
```

### Task 2: Shared presentation primitives and domain fixtures

**Files:**
- Create: `src/pages/merchant-management/sub-merchant-management/shared/ManagementPageHeader.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/shared/ManagementTableState.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/shared/ManagementStatusTag.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/shared/EntityLockDialog.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/shared/management.types.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/shared/test/managementShared.test.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/types/subMerchant.type.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/constants/subMerchant.fixture.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/types/terminal.type.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/constants/terminal.fixture.ts`

**Interfaces:**
- Produces: `ManagementListState = 'loading' | 'error' | 'empty' | 'success'`.
- Produces: `EntityStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED_BY_PARENT' | 'SUSPENDED_BY_SUB'`.
- Produces: `EntityLockDialogProps` with `open`, `mode`, `entityLabel`, `blockedMessage?`, `previousReason?`, `onCancel`, `onConfirm(reason)`.
- Produces: `SUB_MERCHANT_FIXTURES`, `TERMINAL_FIXTURES` as immutable arrays.

- [ ] **Step 1: Write failing shared-component tests**

```tsx
it.each(['loading', 'error', 'empty'] as const)('renders %s state with accessible copy', (state) => {
  render(<ManagementTableState state={state} entityName="Sub-merchant" onRetry={vi.fn()} />)
  expect(screen.getByRole('status')).toBeInTheDocument()
})

it('blocks unlock when parent state controls the entity', async () => {
  render(<EntityLockDialog open mode="unlock" entityLabel="SUB-001" blockedMessage="Mở Merchant cha trước" onCancel={vi.fn()} onConfirm={vi.fn()} />)
  expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/shared/test/managementShared.test.tsx`

Expected: FAIL vì shared components chưa tồn tại.

- [ ] **Step 3: Implement focused shared primitives**

```ts
export type ManagementListState = 'loading' | 'error' | 'empty' | 'success'
export type EntityStatus =
  | 'ACTIVE'
  | 'LOCKED'
  | 'SUSPENDED_BY_PARENT'
  | 'SUSPENDED_BY_SUB'
```

`EntityLockDialog` owns only reason validation (trimmed length >= 10) and presentation. Domain-specific cascade rules stay in each feature and are passed via `blockedMessage`.

- [ ] **Step 4: Add typed fixtures covering every state**

```ts
export const SUB_MERCHANT_FIXTURES: readonly SubMerchantRow[] = [
  // default active, active override, manually locked, suspended by parent
]
export const TERMINAL_FIXTURES: readonly TerminalRow[] = [
  // STATIC_QR, DYNAMIC_QR, POS, SOFTPOS; active, locked, suspended by sub
]
```

Use realistic Vietnamese labels but masked integration/bank values. Freeze only the exported arrays; hooks clone rows before mutation.

- [ ] **Step 5: Run focused tests**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/shared/test/managementShared.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit shared slice**

```bash
git add src/pages/merchant-management/sub-merchant-management/shared src/pages/merchant-management/sub-merchant-management/sub-merchant/types src/pages/merchant-management/sub-merchant-management/sub-merchant/constants src/pages/merchant-management/sub-merchant-management/terminal/types src/pages/merchant-management/sub-merchant-management/terminal/constants
git commit -m "feat: add merchant hierarchy fixtures and UI primitives"
```

### Task 3: Sub-merchant list, filters and status actions

**Files:**
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/hooks/useSubMerchants.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/utils/subMerchant.utils.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/SubMerchantFilters.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/SubMerchantTable.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/columns/subMerchant.columns.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/pages/SubMerchantListPage.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantListPage.test.tsx`

**Interfaces:**
- Produces: `SubMerchantFiltersValue { query: string; parentMerchantId?: string; status?: SubMerchantStatus; createdRange?: [Dayjs, Dayjs] }`.
- Produces: `useSubMerchants({ initialListState? })` returning `rows`, `total`, `filters`, `setFilters`, `resetFilters`, `page`, `setPage`, `toggleStatus`, `retry`.
- Consumes: shared header/state/tag/dialog and `SCREENS.MERCHANT_SUB_MERCHANT` permissions.

- [ ] **Step 1: Write failing list behavior tests**

```tsx
it('filters by code and resets pagination', async () => {
  renderList([PERMISSION.MERCHANT_VIEW])
  await userEvent.type(screen.getByRole('textbox', { name: 'Từ khóa' }), 'SUB-0142-01')
  await userEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
  expect(screen.getByText('SUB-0142-01')).toBeInTheDocument()
  expect(screen.queryByText('SUB-0220-02')).not.toBeInTheDocument()
})

it('uses icon actions and hides mutation controls for view-only users', async () => {
  renderList([PERMISSION.MERCHANT_VIEW])
  expect(await screen.findByRole('button', { name: /Xem Sub-merchant/ })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Sửa Sub-merchant/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Khóa Sub-merchant/ })).not.toBeInTheDocument()
})
```

Also cover loading/error/retry/empty, disabled export on empty, `SUSPENDED_BY_PARENT` unlock blocked, and create navigation.

- [ ] **Step 2: Run list tests to verify failure**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantListPage.test.tsx`

Expected: FAIL because page does not exist.

- [ ] **Step 3: Implement pure filter/format utilities and state hook**

```ts
export const filterSubMerchants = (
  rows: readonly SubMerchantRow[],
  filters: SubMerchantFiltersValue
): SubMerchantRow[] => rows.filter(/* normalized query, parent, status, date */)

export const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
```

Clone fixture input in state, set page to 1 whenever submitted filters change, and keep explicit `initialListState` override for tests.

- [ ] **Step 4: Implement list UI with existing wrappers**

```tsx
<ManagementPageHeader
  title="Danh sách sub-merchant"
  total={total}
  primaryAction={<Can screen="MERCHANT_SUB_MERCHANT" action="create">...</Can>}
/>
<SubMerchantFilters value={draftFilters} onSearch={applyFilters} onReset={resetFilters} />
<SubMerchantTable rows={pageRows} columns={columns} pagination={pagination} />
```

Columns use `EyeIcon`, `PencilSimpleIcon`, `LockIcon`/`LockOpenIcon` inside the existing tooltip wrapper; each button has an entity-specific `aria-label`.

- [ ] **Step 5: Run list tests and targeted lint**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantListPage.test.tsx && npx eslint src/pages/merchant-management/sub-merchant-management/sub-merchant`

Expected: PASS.

- [ ] **Step 6: Commit Sub-merchant list slice**

```bash
git add src/pages/merchant-management/sub-merchant-management/sub-merchant
git commit -m "feat: add sub-merchant list UI"
```

### Task 4: Sub-merchant create and edit form

**Files:**
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/schemas/subMerchant.schema.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/schemas/test/subMerchant.schema.test.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/SubMerchantForm.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/ParentMerchantSection.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/SubMerchantProfileSection.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/InheritedLegalSection.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/OperatingConfigurationSection.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/pages/SubMerchantFormPage.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantFormPage.test.tsx`

**Interfaces:**
- Produces: `subMerchantFormSchema` and `SubMerchantFormValue`.
- Produces: one page handling `mode: 'create' | 'edit'` derived from route and `id`.
- Consumes: fixtures and existing `FormInput`, `FormSelect`, `FormCheckbox`, `FormTextArea`, button/card wrappers.

- [ ] **Step 1: Write schema and page tests first**

```ts
it('requires address only when inheritance is disabled', () => {
  expect(subMerchantFormSchema.safeParse({ ...validValue, addressInherited: false, address: '' }).success).toBe(false)
  expect(subMerchantFormSchema.safeParse({ ...validValue, addressInherited: true, address: '' }).success).toBe(true)
})
```

```tsx
it('locks parent and inherited legal fields in edit mode', async () => {
  renderForm('/secure-panel/merchant/sub-merchant/edit/sub-001')
  expect(await screen.findByLabelText('Merchant cha')).toBeDisabled()
  expect(screen.getByLabelText('Mã số thuế')).toHaveAttribute('readonly')
})
```

- [ ] **Step 2: Run schema/page tests and confirm failure**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/sub-merchant/schemas/test/subMerchant.schema.test.ts src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantFormPage.test.tsx`

Expected: FAIL because schema and page are missing.

- [ ] **Step 3: Implement Zod schema and grouped form**

```ts
export const subMerchantFormSchema = z.object({
  parentMerchantId: z.string().min(1, 'Vui lòng chọn Merchant cha'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên Sub-merchant').max(255),
  phoneInherited: z.boolean(),
  phone: z.string(),
  addressInherited: z.boolean(),
  address: z.string(),
  businessField: z.string().min(1, 'Vui lòng chọn lĩnh vực kinh doanh')
}).superRefine((value, ctx) => { /* phone and conditional address */ })
```

Use read-only text blocks for legal fields, not disabled editable-looking inputs. Configuration cards link to Bank/Key/Payment/Notification modules without embedding their forms.

- [ ] **Step 4: Implement local create/edit submit behavior**

```ts
const handleSubmit = (value: SubMerchantFormValue) => {
  const next = mode === 'create' ? createFixtureSubMerchant(value) : updateFixtureSubMerchant(record, value)
  message.success(mode === 'create' ? 'Thêm Sub-merchant thành công' : 'Cập nhật Sub-merchant thành công')
  navigate(`${SCREENS.MERCHANT_SUB_MERCHANT.path}/detail/${next.id}`)
}
```

No persistence across hard refresh is required; the route demonstrates the completed UI state with fixtures.

- [ ] **Step 5: Run focused tests and lint**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/sub-merchant/schemas/test/subMerchant.schema.test.ts src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantFormPage.test.tsx && npx eslint src/pages/merchant-management/sub-merchant-management/sub-merchant`

Expected: PASS.

- [ ] **Step 6: Commit Sub-merchant form slice**

```bash
git add src/pages/merchant-management/sub-merchant-management/sub-merchant
git commit -m "feat: add sub-merchant form UI"
```

### Task 5: Sub-merchant detail and lock flow

**Files:**
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/SubMerchantMetrics.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/SubMerchantOverview.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/components/SubMerchantConfigurationSummary.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/pages/SubMerchantDetailPage.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantDetailPage.test.tsx`

**Interfaces:**
- Produces: detail route rendering metrics, inherited legal data, masked integration/bank data and settlement configuration.
- Consumes: `EntityLockDialog`; passes `blockedMessage` for `SUSPENDED_BY_PARENT`.

- [ ] **Step 1: Write detail security and cascade tests**

```tsx
it('masks bank and integration values', async () => {
  renderDetail('sub-001', [PERMISSION.MERCHANT_VIEW])
  expect(await screen.findByText(/••••/)).toBeInTheDocument()
  expect(screen.queryByText('9704361234567890')).not.toBeInTheDocument()
})

it('does not unlock a sub suspended by parent', async () => {
  renderDetail('sub-suspended', [PERMISSION.MERCHANT_UPDATE])
  await userEvent.click(await screen.findByRole('button', { name: 'Mở khóa Sub-merchant' }))
  expect(screen.getByText('Cần mở khóa Merchant cha trước')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
})
```

Also test not-found return action and view-only action visibility.

- [ ] **Step 2: Run detail tests and verify failure**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantDetailPage.test.tsx`

Expected: FAIL because detail page is missing.

- [ ] **Step 3: Implement detail sections and lock dialog integration**

```tsx
<SubMerchantMetrics record={record} />
<SubMerchantOverview record={record} />
<SubMerchantConfigurationSummary record={record} masked />
<EntityLockDialog
  open={lockOpen}
  mode={record.status === 'LOCKED' ? 'unlock' : 'lock'}
  entityLabel={`${record.name} (${record.code})`}
  blockedMessage={record.status === 'SUSPENDED_BY_PARENT' ? 'Cần mở khóa Merchant cha trước' : undefined}
  onConfirm={handleStatusChange}
/>
```

- [ ] **Step 4: Run detail tests and lint**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/sub-merchant/test/SubMerchantDetailPage.test.tsx && npx eslint src/pages/merchant-management/sub-merchant-management/sub-merchant`

Expected: PASS.

- [ ] **Step 5: Commit Sub-merchant detail slice**

```bash
git add src/pages/merchant-management/sub-merchant-management/sub-merchant
git commit -m "feat: add sub-merchant detail and status flow"
```

### Task 6: Terminal list, filters and status actions

**Files:**
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/hooks/useTerminals.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/utils/terminal.utils.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/components/TerminalFilters.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/components/TerminalTable.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/columns/terminal.columns.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/pages/TerminalListPage.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/test/TerminalListPage.test.tsx`

**Interfaces:**
- Produces: `TerminalFiltersValue { query; parentMerchantId?; subMerchantId?; type?; status? }`.
- Produces: `useTerminals({ initialListState? })` parallel to the Sub hook without sharing business state.
- Consumes: shared UI primitives and `SCREENS.MERCHANT_TERMINAL`.

- [ ] **Step 1: Write Terminal list tests**

```tsx
it('filters terminals by type and sub-merchant', async () => {
  renderTerminalList([PERMISSION.MERCHANT_VIEW])
  await userEvent.selectOptions(screen.getByLabelText('Loại Terminal'), 'POS')
  await userEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
  expect(await screen.findByText('POS Nguyễn Huệ 01')).toBeInTheDocument()
  expect(screen.queryByText('QR Quầy 02')).not.toBeInTheDocument()
})
```

Cover loading/error/retry/empty, icon actions, permissions, pagination, create navigation, and cascade-blocked unlock.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/terminal/test/TerminalListPage.test.tsx`

Expected: FAIL because Terminal list is missing.

- [ ] **Step 3: Implement hook, filters, columns and page**

```tsx
<TerminalFilters
  merchants={merchantOptions}
  subMerchants={subMerchantOptionsForSelectedMerchant}
  value={draftFilters}
  onSearch={applyFilters}
  onReset={resetFilters}
/>
<TerminalTable rows={pageRows} columns={columns} pagination={pagination} />
```

Use icon-only view/edit/lock actions with accessible names. Render type and status through concise tags, and show Master → Sub context without repeating long text in every cell.

- [ ] **Step 4: Run focused tests and lint**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/terminal/test/TerminalListPage.test.tsx && npx eslint src/pages/merchant-management/sub-merchant-management/terminal`

Expected: PASS.

- [ ] **Step 5: Commit Terminal list slice**

```bash
git add src/pages/merchant-management/sub-merchant-management/terminal
git commit -m "feat: add terminal list UI"
```

### Task 7: Terminal create/edit form and detail flow

**Files:**
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/schemas/terminal.schema.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/schemas/test/terminal.schema.test.ts`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/components/TerminalForm.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/components/TerminalParentSection.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/components/InheritedPaymentSummary.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/components/TerminalOverview.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/pages/TerminalFormPage.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/pages/TerminalDetailPage.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/test/TerminalFormPage.test.tsx`
- Create: `src/pages/merchant-management/sub-merchant-management/terminal/test/TerminalDetailPage.test.tsx`

**Interfaces:**
- Produces: `terminalFormSchema`, `TerminalFormValue`, route-aware create/edit page and detail page.
- Consumes: active Sub fixtures filtered by selected Merchant; `SUSPENDED_BY_SUB` blocks edit/unlock.

- [ ] **Step 1: Write schema, dependent-select and cascade tests**

```ts
it('requires parent merchant, active sub, name and type', () => {
  expect(terminalFormSchema.safeParse({ ...validTerminal, subMerchantId: '' }).success).toBe(false)
})
```

```tsx
it('filters Sub-merchant options by Merchant cha', async () => {
  renderTerminalForm('/secure-panel/merchant/terminal/create')
  await selectMerchant('merchant-0142')
  expect(screen.getByRole('option', { name: /HLC Nguyễn Huệ/ })).toBeInTheDocument()
  expect(screen.queryByRole('option', { name: /GS25/ })).not.toBeInTheDocument()
})

it('blocks editing and unlocking a terminal suspended by sub', async () => {
  renderTerminalDetail('terminal-suspended', [PERMISSION.MERCHANT_UPDATE])
  expect(await screen.findByText('Terminal đang tạm ngưng theo Sub-merchant')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Sửa Terminal' })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/terminal/schemas/test/terminal.schema.test.ts src/pages/merchant-management/sub-merchant-management/terminal/test/TerminalFormPage.test.tsx src/pages/merchant-management/sub-merchant-management/terminal/test/TerminalDetailPage.test.tsx`

Expected: FAIL because schema/pages do not exist.

- [ ] **Step 3: Implement schema and dependent parent form**

```ts
export const terminalFormSchema = z.object({
  parentMerchantId: z.string().min(1, 'Vui lòng chọn Merchant cha'),
  subMerchantId: z.string().min(1, 'Vui lòng chọn Sub-merchant'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên Terminal').max(255),
  type: z.enum(['STATIC_QR', 'DYNAMIC_QR', 'POS', 'SOFTPOS']),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ'),
  phone: z.string(),
  note: z.string().max(500)
})
```

Reset `subMerchantId` when Merchant changes. Edit mode locks TID, Merchant and Sub; suspended records display a blocking callout instead of editable controls.

- [ ] **Step 4: Implement detail, inherited summary and lock flow**

```tsx
<TerminalOverview record={record} />
<InheritedPaymentSummary methods={record.inheritedPaymentMethods} limit={record.inheritedLimitLabel} />
<EntityLockDialog
  open={lockOpen}
  mode={record.status === 'LOCKED' ? 'unlock' : 'lock'}
  entityLabel={`${record.name} (${record.tid})`}
  blockedMessage={record.status === 'SUSPENDED_BY_SUB' ? 'Cần mở khóa Sub-merchant cha trước' : undefined}
  onConfirm={handleStatusChange}
/>
```

Include a fixture update timeline and a link back to the parent Sub detail.

- [ ] **Step 5: Run focused tests and lint**

Run: `npx vitest run src/pages/merchant-management/sub-merchant-management/terminal && npx eslint src/pages/merchant-management/sub-merchant-management/terminal`

Expected: PASS.

- [ ] **Step 6: Commit Terminal form/detail slice**

```bash
git add src/pages/merchant-management/sub-merchant-management/terminal
git commit -m "feat: add terminal form and detail UI"
```

### Task 8: Integration, responsive polish and final verification

**Files:**
- Modify: feature files from Tasks 1–7 only where verification identifies a concrete issue.
- Test: all tests under `src/pages/merchant-management/sub-merchant-management/**/test` and related registry/navigation tests.

**Interfaces:**
- Consumes: all routes/pages and shared components from prior tasks.
- Produces: a verified, accessible UI slice with no unrelated file changes.

- [ ] **Step 1: Run the complete focused suite**

Run: `npx vitest run src/app/permissions/test/registry.test.ts src/components/layout/components/test/Navigation.test.tsx src/pages/merchant-management/sub-merchant-management`

Expected: all tests PASS.

- [ ] **Step 2: Run targeted lint and typecheck**

Run: `npx eslint src/app/permissions/registry.ts src/components/layout/components/Navigation.tsx src/routes.ts src/pages/merchant-management/sub-merchant-management && npm run typecheck`

Expected: targeted ESLint PASS. Typecheck PASS, or only the already-known unrelated `FeeDomainTabs.tsx` `hint` error remains and is recorded without modifying fee files.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: build PASS. If an unrelated pre-existing error blocks it, capture the exact file/error and keep the feature diff scoped.

- [ ] **Step 4: Perform visual and accessibility review**

Start: `npm run dev -- --port 4173`

Review all eight routes at desktop and mobile widths. Verify filter alignment, horizontal table scroll, sticky actions, read-only styling, modal focus/labels, tooltip copy and hierarchy. Use authenticated browser state when available; do not add an auth bypass.

- [ ] **Step 5: Inspect scope and secrets**

Run: `git status --short && git diff --check && rg -n "9704361234567890|secret|private[_-]?key" src/pages/merchant-management/sub-merchant-management || true`

Expected: no whitespace errors; no full sensitive fixture values; unrelated dirty files remain untouched.

- [ ] **Step 6: Commit final polish only if files changed**

```bash
git add src/app/permissions/registry.ts src/app/permissions/test/registry.test.ts src/components/layout/components/Navigation.tsx src/components/layout/components/test/Navigation.test.tsx src/routes.ts src/app/languages/vi/headerTitle.json src/pages/merchant-management/sub-merchant-management
git commit -m "test: verify sub-merchant terminal UI"
```
