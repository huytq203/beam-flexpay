# Cấu hình phí ĐVCNTT (thu hộ / chi hộ) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm route riêng "Cấu hình phí ĐVCNTT" vào nhóm menu của cổng ĐVCNTT, để cấu hình phí thu
hộ / chi hộ. Route có ba thứ mới:

- Gán đối tượng theo Tất cả merchant / Nhóm merchant / Merchant cụ thể.
- Ô người chịu phí Merchant / Khách hàng / Cả hai. Lúc này chỉ Merchant chọn được.
- Khối quy tắc phí riêng trong màn chi tiết merchant.

**Architecture:**

- Không viết màn mới từ đầu. Dùng lại `FeePolicyListPage` và `FeeConfigPage`, và thay prop
  `policyKind` bằng `screen: FeeScreen`. Đây là khái niệm chỉ có ở FE, gồm ba giá trị:
  `CUSTOMER_FEE`, `INPUT_COST`, `MERCHANT_FEE`.
- Mỗi screen ánh xạ sang `policyKind` gửi API, đường dẫn, mã quyền, bộ lọc `feeDomain` và luật hiện
  loại giao dịch. Tất cả nằm trong một bảng cấu hình duy nhất.
- Phần gán đối tượng và phần người chịu đi theo **loại giao dịch** (`allowsMerchantCriteria`),
  không đi theo screen. Nhờ vậy dữ liệu cũ mở ở màn nào cũng chạy đúng một luật.

**Tech Stack:** React 19, TypeScript, react-router, RTK Query, react-hook-form + zod, antd (qua
`FormSelect`), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-27-merchant-fee-config-route-design.md`

## Global Constraints

- Chỉ sửa FE `ewallet-cms-web`. Không đổi hợp đồng API. `policyKind` gửi xuống luôn là
  `CUSTOMER_FEE` hoặc `INPUT_COST`.
- Làm trên nhánh `feat/merchant-fee-config-route` (worktree `ewallet-cms-web-merchant-fee`).
- Nhãn hai bên của thu hộ / chi hộ là **"Merchant"** và **"Khách hàng"** ở mọi chỗ. Không hiện
  "Người chuyển" hay "Người nhận" cho hai loại giao dịch này.
- Nhãn khóa: **"Sắp hỗ trợ"**.
- Nhãn phạm vi của merchant: "Tất cả merchant" / "Nhóm merchant" / "Merchant cụ thể".
- Route: `${MERCHANT}/fee-config`, `${MERCHANT}/fee-config/create`,
  `${MERCHANT}/fee-config/edit/:id`. Screen quyền: `MERCHANT_FEE_CONFIG`, dùng
  `actions: { ...FEE_ACTIONS }`.
- Mục menu: "Cấu hình phí ĐVCNTT", trong khối `merchantManagement`, ngay sau "Quản lý danh sách
  merchant".
- Tên file CSV: `cau-hinh-phi-dvcntt`.
- Danh sách merchant luôn gửi `feeDomain=MERCHANT`. Chính sách miền `BANK` cũ không cần hiện.
- Luồng ví không đổi hành vi.
- Comment tiếng Việt ở mức như code xung quanh. Dùng `FormSelect`, `Can` / `useScreenAccess` như code
  hiện có.
- Kiểm tra: `npm run typecheck`, `npm run lint`, `npm test`.

## Review Focus

1. Mở sửa một chính sách merchant cũ chỉ có `merchantId`. Form phải hiện "Merchant cụ thể", và lưu
   phải gửi đủ cặp subject. (Test ở Task 4.)
2. Mở một chính sách merchant cũ có thành phần lưu payer `USER` hoặc `RECEIVER`. Lưu phải báo lỗi
   ở ô người chịu, không được âm thầm đổi về `MERCHANT`. (Test ở Task 5.)
3. Đổi loại giao dịch qua lại giữa thu hộ và chi hộ. Phạm vi gán và merchant đã chọn phải giữ
   nguyên. (Test ở Task 4.)
4. Người không có quyền xem `MERCHANT_FEE_CONFIG` mở chi tiết merchant. Khối quy tắc phí phải bị
   ẩn, không hiện lỗi. (Test ở Task 7.)
5. Gõ tay URL sai màn:
   - `/merchant/fee-config/edit/<id ví>` phải chuyển sang màn chung.
   - `/merchant/fee-config?serviceType=EWALLET_DEPOSIT` vẫn phải gửi `feeDomain=MERCHANT`, và tab
     lọc không hiện nạp ví.
   - (Test ở Task 2 và Task 3.)

---

### Task 1: Bảng cấu hình screen và luật hiện loại giao dịch

**Files:**
- Create: `src/pages/fee-management/fee-config/constants/feeScreen.ts`
- Modify: `src/app/utils/fee-execution.ts` (comment của `TEMPORARILY_HIDDEN_SERVICE_TYPES`: từ nay
  chỉ áp cho màn chung)
- Modify: `src/app/constants/pathConstant.ts` (thêm khối `PATHS.MERCHANT_FEE`)
- Modify: `src/app/permissions/registry.ts` (thêm `MERCHANT_FEE_CONFIG`)
- Test: `src/pages/fee-management/fee-config/test/feeScreen.test.ts`

**Interfaces:**
- Produces:
  - `FEE_SCREEN = { CUSTOMER_FEE: 'CUSTOMER_FEE', INPUT_COST: 'INPUT_COST', MERCHANT_FEE: 'MERCHANT_FEE' } as const`
    và `type FeeScreen`.
  - `interface FeeScreenConfig`:
    - `policyKind: PolicyKind`
    - `permissionScreen: 'FEE_CONFIG' | 'FEE_INPUT_COST' | 'MERCHANT_FEE_CONFIG'`
    - `listPath: string`, `createPath: string`, `editPath: (id: string) => string`
    - `feeDomain?: 'MERCHANT'` (bộ lọc cố định của danh sách)
    - `csvPrefix: string`
    - `title: string`
  - `FEE_SCREEN_CONFIG: Readonly<Record<FeeScreen, FeeScreenConfig>>`
  - `feeScreenOfPolicy(policyKind: PolicyKind, feeDomain: string | null | undefined): FeeScreen`.
    Trả `MERCHANT_FEE` khi `policyKind === CUSTOMER_FEE && feeDomain === 'MERCHANT'`.
  - `visibleServiceTypesFor(screen: FeeScreen, serviceTypes: readonly string[], current?: string | null): readonly string[]`:
    - `MERCHANT_FEE` → chỉ giữ loại có `allowsMerchantCriteria`, cộng thêm `current`.
    - Screen khác → `withoutHiddenServiceTypes(serviceTypes, current, HIDDEN_SERVICE_TYPES_BY_POLICY_KIND[policyKind])`.
  - `PATHS.MERCHANT_FEE = { LIST, CREATE, EDIT(id) }`, theo các đường dẫn ở Global Constraints.
  - Screen `MERCHANT_FEE_CONFIG` trong registry: `path: \`${MERCHANT}/fee-config\``,
    `actions: { ...FEE_ACTIONS }`.

- [ ] **Step 1: Viết test lỗi `feeScreen.test.ts`**
  - `visibleServiceTypesFor('MERCHANT_FEE', PUBLISHABLE_SERVICE_TYPES)` bằng
    `['MERCHANT_VA_BILL_COLLECTION', 'PAYOUT_BANK_TRANSFER']`.
  - `visibleServiceTypesFor('CUSTOMER_FEE', PUBLISHABLE_SERVICE_TYPES)` không chứa hai loại trên và
    không chứa `EWALLET_REFUND`.
  - `visibleServiceTypesFor('CUSTOMER_FEE', PUBLISHABLE_SERVICE_TYPES, 'PAYOUT_BANK_TRANSFER')` có
    chứa `PAYOUT_BANK_TRANSFER`.
  - `visibleServiceTypesFor('MERCHANT_FEE', PUBLISHABLE_SERVICE_TYPES, 'EWALLET_DEPOSIT')` có chứa
    `EWALLET_DEPOSIT`. Giữ loại đang chọn để chính sách lạc màn vẫn hiện đúng nhãn.
  - `feeScreenOfPolicy('CUSTOMER_FEE', 'MERCHANT')` là `'MERCHANT_FEE'`.
    `feeScreenOfPolicy('CUSTOMER_FEE', 'EWALLET')` là `'CUSTOMER_FEE'`.
    `feeScreenOfPolicy('CUSTOMER_FEE', 'BANK')` là `'CUSTOMER_FEE'`.
    `feeScreenOfPolicy('INPUT_COST', 'MERCHANT')` là `'INPUT_COST'`.
  - `FEE_SCREEN_CONFIG.MERCHANT_FEE` khớp
    `{ policyKind: 'CUSTOMER_FEE', permissionScreen: 'MERCHANT_FEE_CONFIG', feeDomain: 'MERCHANT', csvPrefix: 'cau-hinh-phi-dvcntt' }`,
    và `editPath('x')` là `'/secure-panel/merchant/fee-config/edit/x'`.
- [ ] **Step 2: Chạy test, phải fail**
  - Lệnh: `npx vitest run src/pages/fee-management/fee-config/test/feeScreen.test.ts`
  - Kết quả mong đợi: FAIL, không tìm thấy module `feeScreen`.
- [ ] **Step 3: Cài đặt**
  - Viết `feeScreen.ts`, thêm `PATHS.MERCHANT_FEE` và `MERCHANT_FEE_CONFIG` vào registry.
  - Hai screen cũ lấy path và quyền từ các giá trị đang có (`PATHS.FEE_V4.*`, `FEE_CONFIG`,
    `FEE_INPUT_COST`), csvPrefix `cau-hinh-phi`.
- [ ] **Step 4: Chạy lại test và `npm run typecheck`, phải PASS**
- [ ] **Step 5: Commit**
  - `git commit -m "feat(fee-config): screen config for merchant fee route"`

### Task 2: Danh sách chính sách theo screen

**Files:**
- Modify: `src/pages/fee-management/fee-policy-list/FeePolicyList.tsx` (prop `screen` thay
  `policyKind`, dùng `FEE_SCREEN_CONFIG`)
- Modify: `src/pages/fee-management/fee-policy-list/InputCostPolicyList.tsx`
  (`screen={FEE_SCREEN.INPUT_COST}`)
- Modify: `src/pages/fee-management/fee-policy-list/components/FeePolicyFilterBar.tsx` (nhận prop
  `screen`, tab lọc dùng `visibleServiceTypesFor`)
- Modify: `src/pages/fee-management/fee-policy-list/columns/FeePolicyList.column.tsx` và
  `components/FeePolicyTableActions.tsx` (union `screen` thêm `'MERCHANT_FEE_CONFIG'`, link sửa
  dùng `config.editPath`)
- Create: `src/pages/fee-management/fee-policy-list/MerchantFeePolicyList.tsx` (default export
  `<FeePolicyListPage screen={FEE_SCREEN.MERCHANT_FEE} />`)
- Test: `src/pages/fee-management/fee-policy-list/test/MerchantFeePolicyList.test.tsx`

**Interfaces:**
- Consumes: Task 1 (`FeeScreen`, `FEE_SCREEN_CONFIG`, `visibleServiceTypesFor`).
- Produces:
  - `FeePolicyListPage({ screen }: { screen: FeeScreen })`.
  - Default export của `MerchantFeePolicyList.tsx`.
  - `exportFilters` gửi thêm `feeDomain: config.feeDomain` khi có.
    - Kiểm tra `useFeePolicyList` và `useExportFeePoliciesMutation` đã đưa `feeDomain` vào query
      string chưa. Chưa có thì thêm vào kiểu filter của hai hook đó.

- [ ] **Step 1: Viết test lỗi**
  - Dùng cách mock RTK Query / MSW như các test hiện có của `fee-policy-list`.
  - Render `MerchantFeePolicyList` ở URL `?serviceType=EWALLET_DEPOSIT`.
    - Request `/search` có `feeDomain=MERCHANT` và `policyKind=CUSTOMER_FEE`.
    - Tab lọc chỉ có "Thu hộ VA" và "Chi hộ chuyển khoản", cộng tab "Tất cả" nếu thanh lọc có sẵn
      tab này.
  - Bấm "Tạo" chuyển tới `/secure-panel/merchant/fee-config/create`.
  - Xuất CSV gửi `feeDomain=MERCHANT`, tên file bắt đầu bằng `cau-hinh-phi-dvcntt`.
  - Thêm một assert vào test sẵn có của màn chung: request **không** có `feeDomain`, và tab lọc
    không có thu hộ / chi hộ.
- [ ] **Step 2: Chạy test, phải FAIL**
  - Lệnh: `npx vitest run src/pages/fee-management/fee-policy-list`
- [ ] **Step 3: Cài đặt**
  - Thay mọi nhánh `isInputCost ? ... : ...` về path, quyền và csv bằng đọc từ `config`.
  - `isInputCost` vẫn suy từ `config.policyKind` cho các nhánh nghiệp vụ còn lại.
  - Tiêu đề và breadcrumb của màn merchant: `config.title` = "Cấu hình phí ĐVCNTT".
- [ ] **Step 4: Chạy lại test, phải PASS. Chạy cả `npx vitest run src/pages/fee-management`**
- [ ] **Step 5: Commit**
  - `git commit -m "feat(fee-policy-list): merchant fee list filtered by MERCHANT domain"`

### Task 3: Màn tạo / sửa theo screen, kèm chuyển hướng

**Files:**
- Modify: `src/pages/fee-management/fee-config/FeeConfig.tsx`:
  - `FeeConfigPage({ screen })`.
  - Bỏ `editPathOf` / `listPathOf`, dùng `FEE_SCREEN_CONFIG`.
  - Chuyển hướng theo `feeScreenOfPolicy(savedKind, values?.feeDomain)`.
- Modify: `src/pages/fee-management/fee-config/InputCostConfig.tsx`
- Modify: `src/pages/fee-management/fee-config/components/PolicyGeneralSection.tsx`:
  - Prop `screen: FeeScreen` thay `policyKind`.
  - `serviceTypeOptions` dùng `visibleServiceTypesFor(screen, ..., currentServiceType)`.
- Create: `src/pages/fee-management/fee-config/MerchantFeeConfig.tsx` (default export
  `<FeeConfigPage screen={FEE_SCREEN.MERCHANT_FEE} />`)
- Test: `src/pages/fee-management/fee-config/test/MerchantFeeConfigRouting.test.tsx`

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - `FeeConfigPage({ screen }: { screen: FeeScreen })`.
  - `FeeConfigForm` nhận `screen` và tự suy `policyKind` từ đó.
  - Default export của `MerchantFeeConfig.tsx`.

- [ ] **Step 1: Viết test lỗi**
  - Mock `useFeeConfigDetail` hoặc API detail, theo cách `FeeConfigReadOnly.test.tsx` đang làm.
  - Chính sách `feeDomain=MERCHANT` mở qua `FeeConfig` (`/fee-policy/edit/p1`) phải chuyển tới
    `/secure-panel/merchant/fee-config/edit/p1`.
  - Chính sách `feeDomain=EWALLET` mở qua `MerchantFeeConfig` phải chuyển tới `PATHS.FEE_V4.POLICY_EDIT('p1')`.
  - Chính sách `INPUT_COST` mở qua `MerchantFeeConfig` phải chuyển tới `INPUT_COST_EDIT('p1')`.
  - Màn tạo của `MerchantFeeConfig`: ô "Loại giao dịch" chỉ có Thu hộ VA và Chi hộ chuyển khoản.
  - Màn tạo của `FeeConfig`: ô "Loại giao dịch" không có hai loại đó.
  - Nút quay lại của màn merchant về `/secure-panel/merchant/fee-config`.
- [ ] **Step 2: Chạy test, phải FAIL**
  - Lệnh: `npx vitest run src/pages/fee-management/fee-config/test/MerchantFeeConfigRouting.test.tsx`
- [ ] **Step 3: Cài đặt theo Interfaces**
  - `useFeeConfigDetail` hiện đã trả `values.feeDomain`. Nếu chưa có thì lấy từ `policy.feeDomain`.
- [ ] **Step 4: Chạy lại test, phải PASS. Chạy cả `npx vitest run src/pages/fee-management/fee-config`**
- [ ] **Step 5: Commit**
  - `git commit -m "feat(fee-config): merchant fee create/edit screen with cross-screen redirect"`

### Task 4: Gán đối tượng cho thu hộ / chi hộ

**Files:**
- Modify: `src/pages/fee-management/fee-config/constants/feeConfigFields.ts`:
  - `getFormFieldRules`: luồng merchant trả `showMerchant: true, showSegment: true, showSubject: false`.
  - Thêm `MERCHANT_SUBJECT_TYPE = 'MERCHANT'`.
  - Sửa comment cũ của `WALLET_SUBJECT_TYPE`.
- Modify: `src/pages/fee-management/fee-config/constants/feeAssignment.ts` (thêm
  `getAssignmentScopeOptions(serviceType)`)
- Modify: `src/pages/fee-management/fee-config/components/AssignmentSection.tsx`:
  - Luồng merchant dùng nhãn merchant cho ô phạm vi.
  - Ô nhóm có nhãn "Nhóm merchant".
  - `MerchantPickerField` chỉ hiện khi `scope === 'SUBJECT'`.
  - Thêm dòng gợi ý ưu tiên.
- Modify: `src/pages/fee-management/fee-config/hooks/useFeeConfigDetail.ts`
  (`assignmentScope` đọc cả `merchantId`)
- Modify: `src/pages/fee-management/fee-config/hooks/useFeeConfigForm.ts`:
  - Đổi miền hoặc loại giao dịch thì giữ `assignmentScope` và `merchantId` khi luật mới còn cho.
- Modify: `src/pages/fee-management/fee-config/utils/feeConfigPayload.ts` (payload theo phạm vi)
- Modify: `src/pages/fee-management/fee-config/schemas/feeConfig.schema.ts`:
  - Luồng merchant với `SUBJECT` mà thiếu `merchantId` → lỗi ở `merchantId`, thông điệp
    "Chọn merchant được áp dụng".
- Test: `src/pages/fee-management/fee-config/test/merchantAssignmentScope.test.ts`; cập nhật
  `feeDomainRules.test.ts` nếu nó đang khẳng định `showSegment: false` cho luồng merchant.

**Interfaces:**
- Produces:
  - `getAssignmentScopeOptions(serviceType: string | null | undefined): readonly { value: AssignmentScope; label: string }[]`.
    - Luồng merchant: `ALL` → "Tất cả merchant", `SEGMENT` → "Nhóm merchant", `SUBJECT` →
      "Merchant cụ thể".
    - Luồng khác: giữ nguyên `ASSIGNMENT_SCOPE_OPTIONS`.
  - `MERCHANT_SUBJECT_TYPE`.
- Giá trị payload chốt, áp cho luồng merchant (`allowsMerchantCriteria(serviceType)`):

| `assignmentScope` | merchantId | subjectType | subjectId | customerGroup |
|---|---|---|---|---|
| `ALL` | — | — | — | — |
| `SEGMENT` | — | — | — | form.customerGroup |
| `SUBJECT` | form.merchantId | `'MERCHANT'` | form.merchantId | — |

- Đọc bản gán vào form ở luồng merchant:
  - `subjectId` hoặc `merchantId` có giá trị → `SUBJECT`, với `merchantId = assignment.merchantId ?? assignment.subjectId`.
  - Nếu không, `customerGroup` có giá trị → `SEGMENT`.
  - Còn lại → `ALL`.

- [ ] **Step 1: Viết test lỗi `merchantAssignmentScope.test.ts`**
  - Dùng `feeConfigPayload.fixtures.ts`.
  - Thu hộ, `SUBJECT`, merchantId `m1`: payload gán có
    `{ merchantId: 'm1', subjectType: 'MERCHANT', subjectId: 'm1', customerGroup: undefined }`.
  - Thu hộ, `SEGMENT`, `MC_STRATEGIC`: payload có
    `{ customerGroup: 'MC_STRATEGIC', merchantId: undefined, subjectType: undefined, subjectId: undefined }`.
  - Chi hộ, `ALL`, nhưng form còn sót merchantId `m1`: payload không có `merchantId`.
  - Nạp ví, `SUBJECT`, subjectId `u1`: vẫn ra `subjectType: 'USER'`, không đổi.
  - Map chi tiết một bản gán `{ merchantId: 'm1' }` (không có subject) của thu hộ: `assignmentScope`
    là `'SUBJECT'`, `merchantId` là `'m1'`.
  - Schema: thu hộ, `SUBJECT`, merchantId rỗng → có issue ở path `['merchantId']`.
  - Form: đổi `serviceType` từ thu hộ sang chi hộ, với `assignmentScope: 'SUBJECT'` và
    `merchantId: 'm1'` → giữ nguyên cả hai.
  - `getAssignmentScopeOptions('PAYOUT_BANK_TRANSFER')` trả đúng ba nhãn merchant.
- [ ] **Step 2: Chạy test, phải FAIL**
  - Lệnh: `npx vitest run src/pages/fee-management/fee-config/test/merchantAssignmentScope.test.ts`
- [ ] **Step 3: Cài đặt theo bảng trên**
  - Tìm mọi chỗ đang dùng `canScope` / `rules.showSubject` để không làm vỡ luồng ví.
- [ ] **Step 4: Chạy lại test, phải PASS. Chạy cả `npx vitest run src/pages/fee-management/fee-config`**
- [ ] **Step 5: Commit**
  - `git commit -m "feat(fee-config): merchant assignment scope with merchant groups"`

### Task 5: Người chịu phí Merchant / Khách hàng, khóa "Sắp hỗ trợ"

**Files:**
- Modify: `src/components/form/FormSelect.tsx` (`SelectOption` thêm `disabled?: boolean`, truyền
  xuống component con qua `data`. Kiểm tra component con có nhận `disabled` theo kiểu antd không.)
- Modify: `src/pages/fee-management/fee-config/constants/feeComponentParties.ts`:
  - Thêm bảng nhãn merchant vào `payerLabelsFor`.
  - `getOutputPayerOptions` trả danh sách merchant cho thu hộ / chi hộ.
  - `getBearerSideTitles` trả "Merchant chịu" / "Khách hàng chịu" cho luồng merchant.
- Modify: `src/pages/fee-management/fee-config/utils/payerSelectOptions.ts` (`PayerOption` thêm
  `disabled?: boolean`. `buildPayerSelectOptions` không thêm `BOTH_BEARERS_OPTION` thường cho luồng
  merchant, vì danh sách đã có sẵn bản bị khóa.)
- Modify: `src/pages/fee-management/fee-config/utils/feeComponentParties.ts` (`getComponentPartyOptions`)
- Modify: `src/pages/fee-management/fee-config/schemas/feeComponent.schema.ts` hoặc
  `feeConfig.schema.ts`, chỗ nào đang kiểm tra payer.
- Modify: `src/pages/fee-management/fee-config/utils/feeConfigPayload.ts`:
  - Bỏ việc âm thầm đổi payer về `MERCHANT` cho luồng merchant. Schema đã chặn từ trước.
- Test: `src/pages/fee-management/fee-config/test/merchantPayerOptions.test.ts(x)`

**Interfaces:**
- Produces:
  - `MERCHANT_CUSTOMER_PAYER = 'MERCHANT_CUSTOMER'`. Đây là giá trị chỉ để hiển thị, không bao giờ
    được gửi đi.
  - `getOutputPayerOptions('MERCHANT_VA_BILL_COLLECTION' | 'PAYOUT_BANK_TRANSFER')` trả:
    - `{ value: 'MERCHANT', label: 'Merchant' }`
    - `{ value: 'MERCHANT_CUSTOMER', label: 'Khách hàng · Sắp hỗ trợ', disabled: true }`
    - `{ value: 'BOTH', label: 'Cả hai bên cùng chịu · Sắp hỗ trợ', disabled: true }`
  - `getPayerLabel(payer, serviceType)` với luồng merchant:
    - `MERCHANT` → "Merchant".
    - `USER` / `SENDER` / `RECEIVER` → "Khách hàng", để dữ liệu cũ hiện đúng nhãn.
- Luật schema: với thu hộ / chi hộ, mọi thành phần `OUTPUT_FEE` phải có `payerType === 'MERCHANT'`.
  Nếu sai, báo issue ở `components[i].payerType` với thông điệp "Thu hộ / chi hộ hiện chỉ hỗ trợ
  Merchant chịu phí".

- [ ] **Step 1: Viết test lỗi**
  - `getOutputPayerOptions` của cả hai loại trả đúng ba option như trên.
  - `getOutputPayerOptions('EWALLET_DEPOSIT')` không đổi so với hiện nay. Chụp lại giá trị cũ trước
    khi sửa để so.
  - `getBearerSideTitles('PAYOUT_BANK_TRANSFER')` là `{ sender: 'Merchant chịu', receiver: 'Khách hàng chịu' }`.
  - `getPayerLabel('RECEIVER', 'MERCHANT_VA_BILL_COLLECTION')` là `'Khách hàng'`.
  - Schema: chính sách thu hộ có một thành phần `payerType: 'RECEIVER'` → có issue ở `payerType` của
    thành phần đó.
  - Payload: không còn đổi `RECEIVER` thành `MERCHANT` cho luồng merchant. Sửa test
    `feeConfigPayerPayload.test.ts` nếu nó đang khẳng định việc đổi đó.
  - Render `FeeComponentDialog` với thu hộ:
    - Mở ô "Người chịu" thì thấy "Khách hàng · Sắp hỗ trợ" có `aria-disabled="true"`.
    - Bấm vào thì giá trị vẫn là Merchant.
    - Toàn dialog không có chữ "Người chuyển" hay "Người nhận".
  - VAT của thu hộ khóa theo Merchant (`dependentPayerFor`).
- [ ] **Step 2: Chạy test, phải FAIL**
  - Lệnh: `npx vitest run src/pages/fee-management/fee-config/test/merchantPayerOptions.test.ts`
- [ ] **Step 3: Cài đặt theo Interfaces**
- [ ] **Step 4: Chạy lại test, phải PASS. Chạy cả `npx vitest run src/pages/fee-management`**
  - Danh sách chính sách hiển thị nhãn payer qua `getPayerLabel`, nên tự đúng.
- [ ] **Step 5: Commit**
  - `git commit -m "feat(fee-config): merchant/customer payer options, non-merchant locked as coming soon"`

### Task 6: Route và menu

**Files:**
- Modify: `src/routes.ts` (ba route trong khối route merchant, cạnh `MERCHANT_PAYMENT_METHOD`, dùng
  `page(() => import(...))`)
- Modify: `src/components/layout/components/Navigation.tsx` (mục con `fee-config` trong
  `merchantManagement`, ngay sau `merchant-management`, với `screen: 'MERCHANT_FEE_CONFIG'`,
  `link: \`${MERCHANT}/fee-config\``, `label: 'Cấu hình phí ĐVCNTT'`, icon `ReceiptIcon`)
- Test: mở rộng test điều hướng hoặc registry sẵn có. Nếu không có thì tạo
  `src/components/layout/test/merchantFeeNav.test.tsx`.

**Interfaces:**
- Consumes: Task 2 (`MerchantFeePolicyList`), Task 3 (`MerchantFeeConfig`), Task 1 (registry).

- [ ] **Step 1: Viết test lỗi**
  - Người có quyền FEE view: sidebar có mục "Cấu hình phí ĐVCNTT" dưới "Quản lý ĐVCNTT", trỏ tới
    `/secure-panel/merchant/fee-config`.
  - Người không có quyền FEE: không thấy mục này.
  - Router: ba path trên render đúng page (assert bằng tiêu đề "Cấu hình phí ĐVCNTT").
- [ ] **Step 2: Chạy test, phải FAIL**
- [ ] **Step 3: Cài đặt**
- [ ] **Step 4: Chạy lại test, phải PASS**
- [ ] **Step 5: Commit**
  - `git commit -m "feat(merchant): add merchant fee config route and menu entry"`

### Task 7: Khối quy tắc phí trong chi tiết merchant

**Files:**
- Modify: `src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/hooks/useFeeSettingRules.ts`:
  - Tham số mới `subjectType`, `feeDomain`, `merchantId?`, `accountLabel`. Đổi tên `walletLabel`
    thành `accountLabel` và cập nhật nơi gọi.
- Modify: `.../Personal/configs/FeeSetting.column.tsx`:
  - `getApplicableFeeRuleColumns(customerSegmentNames, subjectType = 'USER')`.
  - Với `MERCHANT`, nhãn `ACCOUNT` → "Merchant cụ thể", `CUSTOMER_GROUP` → "Nhóm merchant".
- Modify: `.../Personal/FeeSetting.tsx` (truyền `subjectType: 'USER'`, `feeDomain: 'EWALLET'`, hành vi
  không đổi)
- Create: `src/pages/merchant-management/merchant-management/merchant/components/MerchantFeeRulesCard.tsx`
- Modify: `src/pages/merchant-management/merchant-management/merchant/pages/MerchantDetail.tsx`
  (đặt sau `SubjectSegmentCard`, bọc trong `<Can screen='MERCHANT_FEE_CONFIG' action='view'>`)
- Test: `src/pages/merchant-management/merchant-management/merchant/test/MerchantFeeRulesCard.test.tsx`,
  và giữ nguyên `Personal/test/FeeSetting.test.tsx` ở trạng thái pass.

**Interfaces:**
- Produces:
  - `MerchantFeeRulesCard({ merchantId, merchantLabel }: { merchantId: string; merchantLabel: string })`.
  - `useFeeSettingRules({ accountLabel, subjectId, subjectType, feeDomain, merchantId })`. Query
    subject scope gồm
    `{ subjectType, subjectId, appliedObjectTypes: 'ACCOUNT,CUSTOMER_GROUP', feeDomain, merchantId }`,
    bỏ `merchantId` khi không có giá trị. Đường xuất CSV dùng cùng bộ tham số.
- Chuỗi chốt:
  - Tiêu đề: "Quy tắc phí thu hộ / chi hộ dành riêng cho merchant này".
  - Empty state: "Merchant này chưa có quy tắc phí riêng — đang áp dụng biểu phí chung."

- [ ] **Step 1: Viết test lỗi `MerchantFeeRulesCard.test.tsx`**
  - Request `/applicable-rules` có
    `subjectType=MERCHANT&subjectId=m1&merchantId=m1&appliedObjectTypes=ACCOUNT,CUSTOMER_GROUP&feeDomain=MERCHANT`.
  - API trả rỗng → hiện đúng empty state.
  - Một dòng `appliedObjectType: 'ACCOUNT'` → cột hiện "Merchant cụ thể" và dòng phụ là tên merchant.
  - Một dòng `CUSTOMER_GROUP` → hiện "Nhóm merchant".
  - Xuất CSV gửi cùng bộ tham số.
  - `MerchantDetail` của người không có quyền `MERCHANT_FEE_CONFIG` view → không có tiêu đề khối,
    không có thông báo lỗi.
- [ ] **Step 2: Chạy test, phải FAIL**
  - Lệnh: `npx vitest run src/pages/merchant-management/merchant-management/merchant/test/MerchantFeeRulesCard.test.tsx`
- [ ] **Step 3: Cài đặt theo Interfaces**
  - Dùng lại `FeeSettingCard`, `FeeRulesEmptyState` (cho phép truyền chuỗi empty state),
    `ExportCsvButton` và `SkeletonTable`.
- [ ] **Step 4: Chạy lại test, phải PASS. Chạy cả `npx vitest run src/pages/wallet-administration src/pages/merchant-management`**
- [ ] **Step 5: Commit**
  - `git commit -m "feat(merchant): merchant-specific fee rules card on merchant detail"`

### Task 8: Kiểm tra toàn nhánh

- [ ] **Step 1:** `npm run typecheck`. Mong đợi: không có lỗi.
- [ ] **Step 2:** `npm run lint`. Mong đợi: không có lỗi mới.
- [ ] **Step 3:** `npm test`. Mong đợi: toàn bộ pass.
- [ ] **Step 4:** Chạy app (`npm run dev`) và đi tay qua các bước sau. Ghi lại bước nào chưa kiểm
  được.
  - Menu ĐVCNTT → danh sách → tạo thu hộ.
  - Phạm vi Nhóm merchant, rồi Merchant cụ thể.
  - Mở ô người chịu, thấy hai lựa chọn bị khóa.
  - Mở chi tiết merchant, thấy khối quy tắc.
