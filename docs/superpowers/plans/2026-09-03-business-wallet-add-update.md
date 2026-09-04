# Thêm mới & Cập nhật ví doanh nghiệp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bổ sung hai màn `create` / `edit` cho module ví doanh nghiệp, đầy đủ form + validate Zod + phân quyền + 4 trạng thái, với phần ghi đi qua một lớp adapter duy nhất vì backend chưa có endpoint.

**Architecture:** Một page `BusinessWalletForm.tsx` phục vụ cả hai mode, phân biệt bằng `useParams().id`. Page chỉ dựng khung; toàn bộ logic form nằm trong hook `useBusinessWalletForm`, năm section là component thuần trình bày nhận `control` từ react-hook-form. Nguồn type duy nhất là `businessWalletFormSchema` (Zod). Mọi lời gọi ghi đi qua `apiBusinessWallet.api.ts` — file duy nhất phải sửa khi backend chốt contract.

**Tech Stack:** React 19 + Vite 8 (SPA, không Next.js) · TypeScript strict · react-hook-form + Zod v4 + `@hookform/resolvers` · RTK Query (`injectEndpoints` vào `apiWalletCore`) · Ant Design 5 qua wrapper `src/components/ui/*` · Tailwind v4 · Vitest 3 + Testing Library + MSW · yarn 4.

**Spec:** `docs/superpowers/specs/2026-09-03-business-wallet-add-update-design.md`

## Global Constraints

- Cấm `any`, `@ts-ignore`, `@ts-expect-error`. Dùng `unknown` rồi narrow, hoặc generic.
- Lỗi RTK Query là `FetchBaseQueryError | SerializedError` → phải narrow bằng `'status' in error` trước khi đọc field.
- Component < 200 dòng · function < 50 dòng · file < 300 dòng · hook < 80 dòng.
- Import bằng alias: `@components`, `@services`, `@hooks`, `@utils`, `@type`, `@constants`, `@/...`. Không dùng relative dài `../../../`.
- **Không** import `antd` trực tiếp trong `src/pages/` — dùng wrapper từ `@components/index` và `@components/form`.
- Thiếu quyền = **ẩn hoàn toàn**, không disable.
- Không tự bắt lỗi HTTP để hiện notification — `fetchBaseQueryCustom` đã xử lý tập trung.
- Không hardcode chuỗi `EWALLET:...` ngoài `src/app/permissions/` (ngoại lệ: file test được phép, xem Task 8).
- Không thêm thư viện mới.
- Toàn bộ chuỗi hiển thị viết tiếng Việt trực tiếp, không tạo namespace i18n mới.
- Mỗi commit kết thúc bằng hai dòng:
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
  ```
- Chạy test: `yarn test <đường dẫn file>`. Chạy lint: `yarn lint` (tsc --noEmit + eslint).
- Regex dùng chung, khai một lần trong schema:
  - SĐT: `/^0\d{9,10}$/`
  - CCCD/Hộ chiếu: `/^(\d{9}|\d{12})$/`
  - Mã số thuế: `/^\d{10}(\d{3})?$/`

---

## Cấu trúc file

| File | Trách nhiệm | Task |
|---|---|---|
| `src/pages/.../business-wallet-account/schemas/business-wallet.schema.ts` | **Sửa** — thêm `businessWalletFormSchema`, `BusinessWalletFormValues`, `EMPTY_BUSINESS_WALLET_FORM` | 1 |
| `src/pages/.../business-wallet-account/schemas/test/business-wallet.schema.test.ts` | **Tạo** — test validate | 1 |
| `src/app/services/apiBusinessWallet.api.ts` | **Tạo** — 2 mutation + type payload + hàm map form→payload | 2 |
| `src/app/services/test/apiBusinessWallet.test.ts` | **Tạo** — test hàm map | 2 |
| `src/pages/.../business-wallet-account/components/BusinessWalletFormSection.tsx` | **Tạo** — khung card có số La Mã, tái dùng 5 lần | 3 |
| `src/pages/.../business-wallet-account/components/AccountInfoSection.tsx` | **Tạo** — section II | 4 |
| `src/pages/.../business-wallet-account/components/BusinessIdentitySection.tsx` | **Tạo** — section III | 4 |
| `src/pages/.../business-wallet-account/components/WalletManagerSection.tsx` | **Tạo** — section IV | 4 |
| `src/pages/.../business-wallet-account/components/LegalDocsSection.tsx` | **Tạo** — section V | 5 |
| `src/pages/.../business-wallet-account/components/ClassificationSection.tsx` | **Tạo** — section VI | 5 |
| `src/pages/.../business-wallet-account/hooks/useBusinessWalletForm.ts` | **Tạo** — form + prefill + submit + trạng thái | 6 |
| `src/pages/.../business-wallet-account/pages/BusinessWalletForm.tsx` | **Tạo** — page, guard quyền, 4 trạng thái | 7 |
| `src/pages/.../business-wallet-account/test/BusinessWalletForm.test.tsx` | **Tạo** — test page | 7 |
| `src/pages/.../business-wallet-account/columns/business-wallet.columns.tsx` | **Sửa** — đổi thành factory, thêm cột Thao tác | 8 |
| `src/pages/.../business-wallet-account/components/BusinessWalletTableState.tsx` | **Sửa** — nhận `onEdit`, dùng factory | 8 |
| `src/pages/.../business-wallet-account/pages/BusinessWallet.tsx` | **Sửa** — nút "Thêm mới", điều hướng sửa | 8 |
| `src/pages/.../business-wallet-account/test/BusinessWallet.test.tsx` | **Sửa** — bổ sung ca kiểm quyền | 8 |
| `src/routes.ts` | **Sửa** — 2 route mới | 8 |
| `src/app/languages/vi/headerTitle.json` | **Sửa** — 2 dòng tiêu đề header | 8 |

Đường dẫn viết tắt `src/pages/.../business-wallet-account/` = `src/pages/merchant-management/business-wallet-account/`.

---

## Task 1: Schema Zod cho form ví doanh nghiệp

**Files:**
- Modify: `src/pages/merchant-management/business-wallet-account/schemas/business-wallet.schema.ts`
- Test: `src/pages/merchant-management/business-wallet-account/schemas/test/business-wallet.schema.test.ts`

**Interfaces:**
- Consumes: không có (task đầu tiên).
- Produces:
  - `businessWalletFormSchema` — Zod schema, dùng làm `resolver` ở Task 6.
  - `type BusinessWalletFormValues = z.infer<typeof businessWalletFormSchema>` — type cho `Control<BusinessWalletFormValues>` ở Task 3–5, và cho `toBusinessWalletPayload` ở Task 2.
  - `EMPTY_BUSINESS_WALLET_FORM: BusinessWalletFormValues` — `defaultValues` ở Task 6.

**Ghi chú kỹ thuật quan trọng:** `FormDatePicker` (`src/components/form/FormDatePicker.tsx:160`) ghi vào form một **chuỗi ISO** `YYYY-MM-DDTHH:mm:ss.SSS`, không phải object Dayjs. Vì vậy `managerIdExpiry` là `z.string()`, không phải `z.date()`.

- [ ] **Step 1: Viết test thất bại**

Tạo `src/pages/merchant-management/business-wallet-account/schemas/test/business-wallet.schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'

import {
  businessWalletFormSchema,
  EMPTY_BUSINESS_WALLET_FORM
} from '../business-wallet.schema'

const futureDate = dayjs().add(2, 'year').startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS')
const pastDate = dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS')

const file = { uid: '-1', name: 'tep.pdf', status: 'done' as const }

const validValues = {
  email: 'finance@highlandscoffee.com.vn',
  contactPhone: '0283822456',
  businessName: 'Công ty CP Việt Thái International',
  taxCode: '0301234567',
  headOfficeAddress: '115 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  legalRepName: 'Nguyễn Văn Hải',
  legalRepIdNumber: '079090001234',
  managerName: 'Nguyễn Văn Hải',
  managerPosition: 'Tổng Giám đốc',
  managerIdNumber: '079090001234',
  managerIdExpiry: futureDate,
  otpPhone: '0903221456',
  businessLicense: [file],
  authorizationLetter: [],
  idCardFront: [file],
  idCardBack: [file],
  isInternalWallet: false
}

const errorFor = (values: unknown, field: string): string | undefined => {
  const result = businessWalletFormSchema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('businessWalletFormSchema', () => {
  it('chấp nhận bộ giá trị hợp lệ', () => {
    expect(businessWalletFormSchema.safeParse(validValues).success).toBe(true)
  })

  it('mã số thuế nhận 10 và 13 số, từ chối 11 số', () => {
    expect(errorFor({ ...validValues, taxCode: '0301234567' }, 'taxCode')).toBeUndefined()
    expect(errorFor({ ...validValues, taxCode: '0301234567001' }, 'taxCode')).toBeUndefined()
    expect(errorFor({ ...validValues, taxCode: '03012345670' }, 'taxCode')).toBe(
      'Mã số thuế gồm 10 hoặc 13 số'
    )
  })

  it('CCCD nhận 9 và 12 số, từ chối độ dài khác', () => {
    expect(errorFor({ ...validValues, legalRepIdNumber: '079090001' }, 'legalRepIdNumber')).toBeUndefined()
    expect(errorFor({ ...validValues, legalRepIdNumber: '079090001234' }, 'legalRepIdNumber')).toBeUndefined()
    expect(errorFor({ ...validValues, legalRepIdNumber: '07909000123' }, 'legalRepIdNumber')).toBe(
      'Số CCCD/Hộ chiếu gồm 9 hoặc 12 số'
    )
  })

  it('số điện thoại phải bắt đầu bằng 0 và có 10–11 số', () => {
    expect(errorFor({ ...validValues, contactPhone: '02838224567' }, 'contactPhone')).toBeUndefined()
    expect(errorFor({ ...validValues, contactPhone: '2838224567' }, 'contactPhone')).toBe(
      'Số điện thoại gồm 10–11 số và bắt đầu bằng 0'
    )
    expect(errorFor({ ...validValues, otpPhone: '090322145' }, 'otpPhone')).toBe(
      'Số điện thoại gồm 10–11 số và bắt đầu bằng 0'
    )
  })

  it('từ chối ngày hết hạn CCCD trong quá khứ', () => {
    expect(errorFor({ ...validValues, managerIdExpiry: pastDate }, 'managerIdExpiry')).toBe(
      'Ngày hết hạn CCCD phải sau hôm nay'
    )
  })

  it('bắt buộc ba tệp hồ sơ pháp lý', () => {
    expect(errorFor({ ...validValues, businessLicense: [] }, 'businessLicense')).toBe(
      'Vui lòng tải lên Giấy phép ĐKKD'
    )
    expect(errorFor({ ...validValues, idCardFront: [] }, 'idCardFront')).toBe(
      'Vui lòng tải lên ảnh CCCD mặt trước'
    )
    expect(errorFor({ ...validValues, idCardBack: [] }, 'idCardBack')).toBe(
      'Vui lòng tải lên ảnh CCCD mặt sau'
    )
  })

  it('bắt buộc giấy ủy quyền khi người quản lý ví khác người đại diện', () => {
    const values = { ...validValues, managerIdNumber: '079090009999', authorizationLetter: [] }
    expect(errorFor(values, 'authorizationLetter')).toBe(
      'Người quản lý ví khác người đại diện pháp luật — bắt buộc có giấy ủy quyền'
    )
  })

  it('không bắt buộc giấy ủy quyền khi người quản lý ví là người đại diện', () => {
    expect(errorFor({ ...validValues, authorizationLetter: [] }, 'authorizationLetter')).toBeUndefined()
  })

  it('EMPTY_BUSINESS_WALLET_FORM không hợp lệ và không có tệp nào', () => {
    expect(businessWalletFormSchema.safeParse(EMPTY_BUSINESS_WALLET_FORM).success).toBe(false)
    expect(EMPTY_BUSINESS_WALLET_FORM.businessLicense).toEqual([])
    expect(EMPTY_BUSINESS_WALLET_FORM.isInternalWallet).toBe(false)
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `yarn test src/pages/merchant-management/business-wallet-account/schemas/test/business-wallet.schema.test.ts`
Expected: FAIL — `businessWalletFormSchema` và `EMPTY_BUSINESS_WALLET_FORM` chưa được export.

- [ ] **Step 3: Viết schema**

Thêm vào cuối `src/pages/merchant-management/business-wallet-account/schemas/business-wallet.schema.ts` (giữ nguyên `businessWalletSearchSchema` đang có), và bổ sung hai dòng import ở đầu file:

```ts
import dayjs from 'dayjs'
import type { UploadFile } from 'antd'
```

```ts
const PHONE_REGEX = /^0\d{9,10}$/
const ID_NUMBER_REGEX = /^(\d{9}|\d{12})$/
const TAX_CODE_REGEX = /^\d{10}(\d{3})?$/

const PHONE_MESSAGE = 'Số điện thoại gồm 10–11 số và bắt đầu bằng 0'
const ID_NUMBER_MESSAGE = 'Số CCCD/Hộ chiếu gồm 9 hoặc 12 số'

const uploadFileSchema = z.custom<UploadFile>()

export const businessWalletFormSchema = z
  .object({
    email: z.email('Email đăng ký không đúng định dạng').max(255, 'Email tối đa 255 ký tự'),
    contactPhone: z.string().regex(PHONE_REGEX, PHONE_MESSAGE),

    businessName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên doanh nghiệp')
      .max(255, 'Tên doanh nghiệp tối đa 255 ký tự'),
    taxCode: z.string().regex(TAX_CODE_REGEX, 'Mã số thuế gồm 10 hoặc 13 số'),
    headOfficeAddress: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập địa chỉ trụ sở')
      .max(500, 'Địa chỉ trụ sở tối đa 500 ký tự'),
    legalRepName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên người đại diện pháp luật')
      .max(255, 'Tên người đại diện tối đa 255 ký tự'),
    legalRepIdNumber: z.string().regex(ID_NUMBER_REGEX, ID_NUMBER_MESSAGE),

    managerName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập họ tên người quản lý ví')
      .max(255, 'Họ tên người quản lý ví tối đa 255 ký tự'),
    managerPosition: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập chức vụ')
      .max(255, 'Chức vụ tối đa 255 ký tự'),
    managerIdNumber: z.string().regex(ID_NUMBER_REGEX, ID_NUMBER_MESSAGE),
    managerIdExpiry: z
      .string()
      .min(1, 'Vui lòng chọn ngày hết hạn CCCD')
      .refine(
        (value) => dayjs(value).isValid() && dayjs(value).isAfter(dayjs(), 'day'),
        'Ngày hết hạn CCCD phải sau hôm nay'
      ),
    otpPhone: z.string().regex(PHONE_REGEX, PHONE_MESSAGE),

    businessLicense: z.array(uploadFileSchema).min(1, 'Vui lòng tải lên Giấy phép ĐKKD'),
    authorizationLetter: z.array(uploadFileSchema),
    idCardFront: z.array(uploadFileSchema).min(1, 'Vui lòng tải lên ảnh CCCD mặt trước'),
    idCardBack: z.array(uploadFileSchema).min(1, 'Vui lòng tải lên ảnh CCCD mặt sau'),

    isInternalWallet: z.boolean()
  })
  .superRefine((values, context) => {
    // Quản lý ví khác người đại diện pháp luật thì hồ sơ phải có giấy ủy quyền.
    if (
      values.managerIdNumber !== values.legalRepIdNumber &&
      values.authorizationLetter.length === 0
    ) {
      context.addIssue({
        code: 'custom',
        path: ['authorizationLetter'],
        message:
          'Người quản lý ví khác người đại diện pháp luật — bắt buộc có giấy ủy quyền'
      })
    }
  })

export type BusinessWalletFormValues = z.infer<typeof businessWalletFormSchema>

export const EMPTY_BUSINESS_WALLET_FORM: BusinessWalletFormValues = {
  email: '',
  contactPhone: '',
  businessName: '',
  taxCode: '',
  headOfficeAddress: '',
  legalRepName: '',
  legalRepIdNumber: '',
  managerName: '',
  managerPosition: '',
  managerIdNumber: '',
  managerIdExpiry: '',
  otpPhone: '',
  businessLicense: [],
  authorizationLetter: [],
  idCardFront: [],
  idCardBack: [],
  isInternalWallet: false
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn test src/pages/merchant-management/business-wallet-account/schemas/test/business-wallet.schema.test.ts`
Expected: PASS — 9 test.

- [ ] **Step 5: Chạy lint**

Run: `yarn lint`
Expected: không lỗi.

- [ ] **Step 6: Commit**

```bash
git add src/pages/merchant-management/business-wallet-account/schemas/
git commit -m "$(cat <<'EOF'
feat(business-wallet): thêm schema Zod cho form ví doanh nghiệp

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
EOF
)"
```

---

## Task 2: Lớp API tạm thời + hàm map payload

**Files:**
- Create: `src/app/services/apiBusinessWallet.api.ts`
- Test: `src/app/services/test/apiBusinessWallet.test.ts`

**Interfaces:**
- Consumes: `BusinessWalletFormValues` từ Task 1.
- Produces:
  - `interface BusinessWalletPayload` — body gửi lên BE.
  - `toBusinessWalletPayload(values: BusinessWalletFormValues): BusinessWalletPayload` — dùng ở Task 6.
  - `usePostBusinessWalletMutation()` → `[trigger: (body: BusinessWalletPayload) => ..., { isLoading: boolean }]`
  - `usePutBusinessWalletMutation()` → `[trigger: (arg: { id: string; body: BusinessWalletPayload }) => ..., { isLoading: boolean }]`

**Bối cảnh:** wallet-core hiện **không có** `POST` / `PUT /wallet/accounts` (đã đối chiếu OpenAPI ngày 2026-09-03, xem mục 2 của spec). File này là điểm tạm duy nhất; khi BE chốt contract chỉ sửa ở đây.

- [ ] **Step 1: Viết test thất bại**

Tạo `src/app/services/test/apiBusinessWallet.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { toBusinessWalletPayload } from '../apiBusinessWallet.api'
import type { BusinessWalletFormValues } from '@pages/merchant-management/business-wallet-account/schemas/business-wallet.schema'

const file = (name: string): BusinessWalletFormValues['businessLicense'][number] => ({
  uid: `uid-${name}`,
  name,
  status: 'done'
})

const values: BusinessWalletFormValues = {
  email: 'finance@highlandscoffee.com.vn',
  contactPhone: '0283822456',
  businessName: '  Công ty CP Việt Thái International  ',
  taxCode: '0301234567',
  headOfficeAddress: '115 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  legalRepName: 'Nguyễn Văn Hải',
  legalRepIdNumber: '079090001234',
  managerName: 'Nguyễn Văn Hải',
  managerPosition: 'Tổng Giám đốc',
  managerIdNumber: '079090001234',
  managerIdExpiry: '2030-12-12T00:00:00.000',
  otpPhone: '0903221456',
  businessLicense: [file('GiayPhep_DKKD.pdf')],
  authorizationLetter: [],
  idCardFront: [file('CCCD_MatTruoc.jpg')],
  idCardBack: [file('CCCD_MatSau.jpg')],
  isInternalWallet: true
}

describe('toBusinessWalletPayload', () => {
  it('cắt khoảng trắng và giữ nguyên các trường định danh', () => {
    const payload = toBusinessWalletPayload(values)

    expect(payload.businessName).toBe('Công ty CP Việt Thái International')
    expect(payload.email).toBe('finance@highlandscoffee.com.vn')
    expect(payload.taxCode).toBe('0301234567')
    expect(payload.isInternalWallet).toBe(true)
  })

  it('chuẩn hoá ngày hết hạn CCCD về YYYY-MM-DD', () => {
    expect(toBusinessWalletPayload(values).managerIdExpiry).toBe('2030-12-12')
  })

  it('quy đổi danh sách tệp thành tên tệp, tệp trống thành mảng rỗng', () => {
    const payload = toBusinessWalletPayload(values)

    expect(payload.attachments.businessLicense).toEqual(['GiayPhep_DKKD.pdf'])
    expect(payload.attachments.authorizationLetter).toEqual([])
    expect(payload.attachments.idCardFront).toEqual(['CCCD_MatTruoc.jpg'])
    expect(payload.attachments.idCardBack).toEqual(['CCCD_MatSau.jpg'])
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `yarn test src/app/services/test/apiBusinessWallet.test.ts`
Expected: FAIL — module `../apiBusinessWallet.api` chưa tồn tại.

- [ ] **Step 3: Viết endpoint + hàm map**

Tạo `src/app/services/apiBusinessWallet.api.ts`:

```ts
import dayjs from 'dayjs'
import type { UploadFile } from 'antd'

import { apiWalletCore } from '@services/apiService'
import type { BusinessWalletFormValues } from '@pages/merchant-management/business-wallet-account/schemas/business-wallet.schema'

export interface BusinessWalletAttachments {
  businessLicense: string[]
  authorizationLetter: string[]
  idCardFront: string[]
  idCardBack: string[]
}

export interface BusinessWalletPayload {
  email: string
  contactPhone: string
  businessName: string
  taxCode: string
  headOfficeAddress: string
  legalRepName: string
  legalRepIdNumber: string
  managerName: string
  managerPosition: string
  managerIdNumber: string
  /** Định dạng YYYY-MM-DD. */
  managerIdExpiry: string
  otpPhone: string
  attachments: BusinessWalletAttachments
  isInternalWallet: boolean
}

const toFileNames = (files: UploadFile[]): string[] =>
  files.map((file) => file.name)

/**
 * Quy đổi giá trị form sang body gửi backend.
 * TODO(BE): backend chưa chốt cách nhận tệp đính kèm. Tạm gửi tên tệp; đổi sang
 * id tệp sau khi có endpoint upload.
 */
export const toBusinessWalletPayload = (
  values: BusinessWalletFormValues
): BusinessWalletPayload => ({
  email: values.email.trim(),
  contactPhone: values.contactPhone.trim(),
  businessName: values.businessName.trim(),
  taxCode: values.taxCode.trim(),
  headOfficeAddress: values.headOfficeAddress.trim(),
  legalRepName: values.legalRepName.trim(),
  legalRepIdNumber: values.legalRepIdNumber.trim(),
  managerName: values.managerName.trim(),
  managerPosition: values.managerPosition.trim(),
  managerIdNumber: values.managerIdNumber.trim(),
  managerIdExpiry: dayjs(values.managerIdExpiry).format('YYYY-MM-DD'),
  otpPhone: values.otpPhone.trim(),
  attachments: {
    businessLicense: toFileNames(values.businessLicense),
    authorizationLetter: toFileNames(values.authorizationLetter),
    idCardFront: toFileNames(values.idCardFront),
    idCardBack: toFileNames(values.idCardBack)
  },
  isInternalWallet: values.isInternalWallet
})

/**
 * TODO(BE): hai endpoint dưới đây CHƯA TỒN TẠI trên wallet-core.
 * Đối chiếu OpenAPI ngày 2026-09-03: /wallet/accounts chỉ có GET; các POST hiện
 * có đều là thao tác trạng thái (lock/unlock/freeze/unfreeze) trên ví đã tồn tại.
 * Gọi thật sẽ nhận 404 và fetchBaseQueryCustom hiển thị notification lỗi.
 * Khi backend chốt contract, chỉ cần sửa url/body trong file này.
 */
const businessWalletApi = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    postBusinessWallet: build.mutation<unknown, BusinessWalletPayload>({
      query: (body) => ({
        url: '/wallet/accounts',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Wallet']
    }),
    putBusinessWallet: build.mutation<
      unknown,
      { id: string; body: BusinessWalletPayload }
    >({
      query: ({ id, body }) => ({
        url: `/wallet/accounts/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Wallet']
    })
  })
})

export const {
  usePostBusinessWalletMutation,
  usePutBusinessWalletMutation
} = businessWalletApi
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn test src/app/services/test/apiBusinessWallet.test.ts`
Expected: PASS — 3 test.

- [ ] **Step 5: Chạy lint**

Run: `yarn lint`
Expected: không lỗi. Nếu `tagTypes` của `apiWalletCore` chưa khai `'Wallet'`, tsc sẽ báo — kiểm tra `src/app/services/apiService.ts` và bổ sung vào `tagTypes` (endpoint `getAccount` hiện đã dùng `providesTags: ['Wallet']` nên tag này phải có sẵn).

- [ ] **Step 6: Commit**

```bash
git add src/app/services/apiBusinessWallet.api.ts src/app/services/test/apiBusinessWallet.test.ts
git commit -m "$(cat <<'EOF'
feat(business-wallet): thêm lớp API tạm thời cho tạo/cập nhật ví doanh nghiệp

Endpoint chưa tồn tại trên wallet-core, gom toàn bộ phần tạm vào một file
kèm TODO(BE) để khi có contract chỉ sửa một điểm.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
EOF
)"
```

---

## Task 3: Khung card section dùng chung

**Files:**
- Create: `src/pages/merchant-management/business-wallet-account/components/BusinessWalletFormSection.tsx`

**Interfaces:**
- Consumes: `CardComponent` từ `@components/index`.
- Produces: `BusinessWalletFormSection` với props `{ id: string; step: string; title: string; children: ReactNode }`. Task 4, 5 và 7 bọc nội dung bằng component này. `id` được gắn vào `<h2>` và `aria-labelledby` của `<section>`, nên test tìm section bằng `screen.getByRole('region', { name: <title> })`.

- [ ] **Step 1: Viết component**

Tạo `src/pages/merchant-management/business-wallet-account/components/BusinessWalletFormSection.tsx`:

```tsx
import type { ReactNode } from 'react'

import { CardComponent } from '@components/index'

interface BusinessWalletFormSectionProps {
  id: string
  step: string
  title: string
  children: ReactNode
}

export function BusinessWalletFormSection({
  id,
  step,
  title,
  children
}: BusinessWalletFormSectionProps) {
  return (
    <CardComponent
      className='overflow-hidden border-border bg-background! shadow-none'
      styles={{ body: { padding: 0 } }}
    >
      <section aria-labelledby={id}>
        <div className='flex items-center gap-3 border-b border-border bg-muted/60! px-4 py-3 sm:px-5'>
          <span
            aria-hidden='true'
            className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary! text-xs font-semibold text-primary-foreground'
          >
            {step}
          </span>
          <h2 id={id} className='text-sm font-semibold text-foreground sm:text-base'>
            {title}
          </h2>
        </div>
        <div className='grid grid-cols-12 gap-4 p-4 sm:p-5'>{children}</div>
      </section>
    </CardComponent>
  )
}
```

- [ ] **Step 2: Chạy lint để xác nhận biên dịch được**

Run: `yarn lint`
Expected: không lỗi.

- [ ] **Step 3: Commit**

```bash
git add src/pages/merchant-management/business-wallet-account/components/BusinessWalletFormSection.tsx
git commit -m "$(cat <<'EOF'
feat(business-wallet): thêm khung card section cho form ví doanh nghiệp

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
EOF
)"
```

---

## Task 4: Ba section nhập liệu (II · III · IV)

**Files:**
- Create: `src/pages/merchant-management/business-wallet-account/components/AccountInfoSection.tsx`
- Create: `src/pages/merchant-management/business-wallet-account/components/BusinessIdentitySection.tsx`
- Create: `src/pages/merchant-management/business-wallet-account/components/WalletManagerSection.tsx`

**Interfaces:**
- Consumes: `BusinessWalletFormValues` (Task 1), `BusinessWalletFormSection` (Task 3), `FormInput` / `FormTextArea` / `FormDatePicker` từ `@components/form`, `ButtonComponent` từ `@components/index`.
- Produces:
  - `AccountInfoSection({ control, isEditMode }: { control: Control<BusinessWalletFormValues>; isEditMode: boolean })`
  - `BusinessIdentitySection({ control }: { control: Control<BusinessWalletFormValues> })`
  - `WalletManagerSection({ control, onCopyContactPhone }: { control: Control<BusinessWalletFormValues>; onCopyContactPhone: () => void })`

`FormField` (`src/components/form/FormField.tsx:38`) tự render dấu `*` khi truyền `required`, và tự render thông báo lỗi — không cần tự viết label bắt buộc hay chỗ hiện lỗi. `label` được gắn `htmlFor={name}` nên test tìm field bằng `screen.getByLabelText(...)`.

- [ ] **Step 1: Viết section II — Thông tin tài khoản**

Tạo `src/pages/merchant-management/business-wallet-account/components/AccountInfoSection.tsx`:

```tsx
import type { Control } from 'react-hook-form'

import { FormInput } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface AccountInfoSectionProps {
  control: Control<BusinessWalletFormValues>
  isEditMode: boolean
}

const fieldClassName = 'col-span-12 flex flex-col md:col-span-6'

export function AccountInfoSection({ control, isEditMode }: AccountInfoSectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-account-info'
      step='II'
      title='Thông tin tài khoản'
    >
      <div className={fieldClassName}>
        <FormInput
          name='email'
          control={control}
          required
          label='Email đăng ký (Username)'
          placeholder='abc@domain.com'
          disabled={isEditMode}
          className='flex flex-col'
        />
        <span className='mt-1 text-xs text-muted-foreground'>
          {isEditMode
            ? 'Không cho phép sửa — định danh đăng nhập'
            : 'Dùng làm Username của tài khoản Master'}
        </span>
      </div>

      <FormInput
        name='contactPhone'
        control={control}
        required
        label='SĐT liên hệ'
        placeholder='Chỉ nhập số, 10–11 số'
        className={fieldClassName}
      />
    </BusinessWalletFormSection>
  )
}
```

- [ ] **Step 2: Viết section III — Định danh doanh nghiệp**

Tạo `src/pages/merchant-management/business-wallet-account/components/BusinessIdentitySection.tsx`:

```tsx
import type { Control } from 'react-hook-form'

import { FormInput, FormTextArea } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface BusinessIdentitySectionProps {
  control: Control<BusinessWalletFormValues>
}

const fieldClassName = 'col-span-12 flex flex-col md:col-span-6'

export function BusinessIdentitySection({ control }: BusinessIdentitySectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-identity'
      step='III'
      title='Định danh doanh nghiệp'
    >
      <FormInput
        name='businessName'
        control={control}
        required
        label='Tên doanh nghiệp'
        placeholder='Tên pháp lý theo Giấy chứng nhận ĐKKD'
        className={fieldClassName}
      />

      <div className={fieldClassName}>
        <FormInput
          name='taxCode'
          control={control}
          required
          label='Mã số thuế'
          placeholder='10 hoặc 13 ký tự'
          className='flex flex-col'
        />
        <span className='mt-1 text-xs text-muted-foreground'>
          Thay đổi mã số thuế sẽ kích hoạt lại KYB
        </span>
      </div>

      <FormTextArea
        name='headOfficeAddress'
        control={control}
        label='Địa chỉ trụ sở'
        rows={2}
        placeholder='Tỉnh/TP · Quận/Huyện · Phường/Xã · Số nhà/Tên đường'
        className='col-span-12 flex flex-col'
      />

      <FormInput
        name='legalRepName'
        control={control}
        required
        label='Người đại diện pháp luật'
        placeholder='Họ tên theo Giấy chứng nhận ĐKKD'
        className={fieldClassName}
      />

      <FormInput
        name='legalRepIdNumber'
        control={control}
        required
        label='Số CCCD / Hộ chiếu (ĐDPL)'
        placeholder='Số định danh người đại diện'
        className={fieldClassName}
      />
    </BusinessWalletFormSection>
  )
}
```

> `FormTextArea` không nhận prop `required` (xem `src/components/form/FormTextArea.tsx:6`), nên dấu `*` của trường địa chỉ không hiển thị. Đây là hạn chế của wrapper hiện tại, validate vẫn chạy đủ. Không sửa wrapper trong task này.

- [ ] **Step 3: Viết section IV — Người quản lý tài khoản ví**

Tạo `src/pages/merchant-management/business-wallet-account/components/WalletManagerSection.tsx`:

```tsx
import type { Control } from 'react-hook-form'

import { FormDatePicker, FormInput } from '@components/form'
import { ButtonComponent } from '@components/index'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface WalletManagerSectionProps {
  control: Control<BusinessWalletFormValues>
  onCopyContactPhone: () => void
}

const fieldClassName = 'col-span-12 flex flex-col md:col-span-6'

export function WalletManagerSection({
  control,
  onCopyContactPhone
}: WalletManagerSectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-manager'
      step='IV'
      title='Người quản lý tài khoản ví'
    >
      <FormInput
        name='managerName'
        control={control}
        required
        label='Họ và tên người quản lý ví'
        placeholder='ĐDPL hoặc người được ủy quyền'
        className={fieldClassName}
      />

      <FormInput
        name='managerPosition'
        control={control}
        required
        label='Chức vụ'
        placeholder='VD: Giám đốc / Kế toán trưởng'
        className={fieldClassName}
      />

      <FormInput
        name='managerIdNumber'
        control={control}
        required
        label='Số CCCD / Hộ chiếu'
        placeholder='9 hoặc 12 ký tự'
        className={fieldClassName}
      />

      <FormDatePicker
        name='managerIdExpiry'
        control={control}
        label='Ngày hết hạn CCCD'
        placeholder='DD/MM/YYYY'
        className={fieldClassName}
      />

      <div className='col-span-12 flex flex-col'>
        <div className='flex items-end gap-2'>
          <FormInput
            name='otpPhone'
            control={control}
            required
            label='SĐT nhận OTP'
            placeholder='SĐT nhận OTP của tài khoản Master'
            className='flex flex-1 flex-col'
          />
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Sao chép'
            className='mb-1'
            onClick={onCopyContactPhone}
          />
        </div>
        <span className='mt-1 text-xs text-muted-foreground'>
          Đồng thời là SĐT nhận OTP của tài khoản Master (Người đại diện)
        </span>
      </div>
    </BusinessWalletFormSection>
  )
}
```

- [ ] **Step 4: Chạy lint**

Run: `yarn lint`
Expected: không lỗi.

- [ ] **Step 5: Commit**

```bash
git add src/pages/merchant-management/business-wallet-account/components/AccountInfoSection.tsx src/pages/merchant-management/business-wallet-account/components/BusinessIdentitySection.tsx src/pages/merchant-management/business-wallet-account/components/WalletManagerSection.tsx
git commit -m "$(cat <<'EOF'
feat(business-wallet): thêm ba section nhập liệu của form ví doanh nghiệp

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
EOF
)"
```

---

## Task 5: Section hồ sơ pháp lý và phân loại (V · VI)

**Files:**
- Create: `src/pages/merchant-management/business-wallet-account/components/LegalDocsSection.tsx`
- Create: `src/pages/merchant-management/business-wallet-account/components/ClassificationSection.tsx`

**Interfaces:**
- Consumes: `BusinessWalletFormValues` (Task 1), `BusinessWalletFormSection` (Task 3), `FormUploadCombined` và `FormSwitch` từ `@components/form`.
- Produces:
  - `LegalDocsSection({ control }: { control: Control<BusinessWalletFormValues> })`
  - `ClassificationSection({ control }: { control: Control<BusinessWalletFormValues> })`

`FormUploadCombined` là **default export** của `src/components/form/FormUploadCombined.tsx` nhưng barrel `@components/form` re-export nó dưới tên `FormUploadCombined` (`src/components/form/index.ts:10`) — import theo tên từ barrel.

- [ ] **Step 1: Viết section V — Hồ sơ pháp lý**

Tạo `src/pages/merchant-management/business-wallet-account/components/LegalDocsSection.tsx`:

```tsx
import type { Control } from 'react-hook-form'

import { FormUploadCombined } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface LegalDocsSectionProps {
  control: Control<BusinessWalletFormValues>
}

const uploadClassName = 'col-span-12 flex flex-col md:col-span-6'

export function LegalDocsSection({ control }: LegalDocsSectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-legal-docs'
      step='V'
      title='Hồ sơ pháp lý (đính kèm)'
    >
      <FormUploadCombined
        name='businessLicense'
        control={control}
        label='Giấy phép ĐKKD'
        multiple={false}
        maxCount={1}
        accept='.pdf,.jpg,.jpeg,.png'
        dragText='Tải lên tệp · PDF / JPG / PNG · tối đa 5MB'
        className={uploadClassName}
      />

      <FormUploadCombined
        name='authorizationLetter'
        control={control}
        label='Giấy ủy quyền'
        multiple={false}
        maxCount={1}
        accept='.pdf,.jpg,.jpeg,.png'
        dragText='Tải lên tệp · Bắt buộc nếu quản lý ví khác ĐDPL'
        className={uploadClassName}
      />

      <FormUploadCombined
        name='idCardFront'
        control={control}
        label='CCCD — Mặt trước'
        multiple={false}
        maxCount={1}
        accept='.jpg,.jpeg,.png'
        dragText='Tải lên tệp · JPG / PNG · tối đa 5MB'
        className={uploadClassName}
      />

      <FormUploadCombined
        name='idCardBack'
        control={control}
        label='CCCD — Mặt sau'
        multiple={false}
        maxCount={1}
        accept='.jpg,.jpeg,.png'
        dragText='Tải lên tệp · JPG / PNG · tối đa 5MB'
        className={uploadClassName}
      />
    </BusinessWalletFormSection>
  )
}
```

- [ ] **Step 2: Viết section VI — Phân loại tài khoản**

Tạo `src/pages/merchant-management/business-wallet-account/components/ClassificationSection.tsx`:

```tsx
import type { Control } from 'react-hook-form'

import { FormSwitch } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface ClassificationSectionProps {
  control: Control<BusinessWalletFormValues>
}

export function ClassificationSection({ control }: ClassificationSectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-classification'
      step='VI'
      title='Phân loại tài khoản'
    >
      <FormSwitch
        name='isInternalWallet'
        control={control}
        label='Đánh dấu Ví nội bộ'
        description='Nhãn phân loại nội bộ để lọc và tra cứu — không thay đổi phí, KYB hay báo cáo doanh thu.'
        className='col-span-12 flex flex-col'
      />
    </BusinessWalletFormSection>
  )
}
```

- [ ] **Step 3: Chạy lint**

Run: `yarn lint`
Expected: không lỗi.

- [ ] **Step 4: Commit**

```bash
git add src/pages/merchant-management/business-wallet-account/components/LegalDocsSection.tsx src/pages/merchant-management/business-wallet-account/components/ClassificationSection.tsx
git commit -m "$(cat <<'EOF'
feat(business-wallet): thêm section hồ sơ pháp lý và phân loại tài khoản

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
EOF
)"
```

---

## Task 6: Hook `useBusinessWalletForm`

**Files:**
- Create: `src/pages/merchant-management/business-wallet-account/hooks/useBusinessWalletForm.ts`

**Interfaces:**
- Consumes: `businessWalletFormSchema`, `BusinessWalletFormValues`, `EMPTY_BUSINESS_WALLET_FORM` (Task 1); `toBusinessWalletPayload`, `usePostBusinessWalletMutation`, `usePutBusinessWalletMutation` (Task 2); `useGetAccountByIdQuery` từ `@services/apiWalletAccount.api`; `useMessage` từ `@hooks/useMessage`.
- Produces: `useBusinessWalletForm()` trả về đúng object sau — Task 7 dùng nguyên tên này:

```ts
{
  control: Control<BusinessWalletFormValues>
  handleSubmit: UseFormHandleSubmit<BusinessWalletFormValues>
  onSubmit: (values: BusinessWalletFormValues) => Promise<void>
  handleCopyContactPhone: () => void
  handleCancel: () => void
  isEditMode: boolean
  isSubmitting: boolean
  isLoadingDetail: boolean
  isDetailError: boolean
  isNotFound: boolean
  refetchDetail: () => void
}
```

**Ghi chú:** `GET /wallet/accounts/{id}` trả `ContentAccountWallet` **không chứa** mã số thuế, địa chỉ, người đại diện hay hồ sơ (xem mục 2 và 7 của spec). Vì vậy prefill chỉ map được `ownerUsername` → `businessName`. Đây là hành vi đúng theo thiết kế, không phải thiếu sót cần "sửa".

- [ ] **Step 1: Viết hook**

Tạo `src/pages/merchant-management/business-wallet-account/hooks/useBusinessWalletForm.ts`:

```ts
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { useMessage } from '@hooks/useMessage'
import { useGetAccountByIdQuery } from '@services/apiWalletAccount.api'
import {
  toBusinessWalletPayload,
  usePostBusinessWalletMutation,
  usePutBusinessWalletMutation
} from '@services/apiBusinessWallet.api'

import {
  businessWalletFormSchema,
  EMPTY_BUSINESS_WALLET_FORM,
  type BusinessWalletFormValues
} from '../schemas/business-wallet.schema'

export function useBusinessWalletForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const { successMess } = useMessage()

  const detail = useGetAccountByIdQuery(id ?? '', { skip: !id })
  const [postBusinessWallet, postState] = usePostBusinessWalletMutation()
  const [putBusinessWallet, putState] = usePutBusinessWalletMutation()

  const { control, handleSubmit, reset, getValues, setValue } =
    useForm<BusinessWalletFormValues>({
      resolver: zodResolver(businessWalletFormSchema),
      defaultValues: EMPTY_BUSINESS_WALLET_FORM
    })

  useEffect(() => {
    if (!isEditMode || !detail.data) return

    // Response ví chỉ có tên chủ ví; các trường hồ sơ còn lại chờ API hồ sơ doanh nghiệp.
    reset({
      ...EMPTY_BUSINESS_WALLET_FORM,
      businessName: detail.data.ownerUsername ?? ''
    })
  }, [detail.data, isEditMode, reset])

  const handleCopyContactPhone = (): void => {
    setValue('otpPhone', getValues('contactPhone'), { shouldValidate: true })
  }

  const handleCancel = (): void => {
    navigate(-1)
  }

  const onSubmit = async (values: BusinessWalletFormValues): Promise<void> => {
    const body = toBusinessWalletPayload(values)

    // Lỗi HTTP đã được fetchBaseQueryCustom xử lý tập trung; ở đây chỉ nuốt để
    // không hiện notification trùng.
    try {
      if (isEditMode && id) {
        await putBusinessWallet({ id, body }).unwrap()
        successMess('Cập nhật ví doanh nghiệp thành công')
      } else {
        await postBusinessWallet(body).unwrap()
        successMess('Thêm mới ví doanh nghiệp thành công')
      }
      navigate(-1)
    } catch {
      // Không xử lý thêm.
    }
  }

  const isNotFound =
    detail.isError &&
    detail.error !== undefined &&
    'status' in detail.error &&
    detail.error.status === 404

  return {
    control,
    handleSubmit,
    onSubmit,
    handleCopyContactPhone,
    handleCancel,
    isEditMode,
    isSubmitting: postState.isLoading || putState.isLoading,
    isLoadingDetail: detail.isLoading,
    isDetailError: detail.isError && !isNotFound,
    isNotFound,
    refetchDetail: () => {
      void detail.refetch()
    }
  }
}
```

- [ ] **Step 2: Chạy lint**

Run: `yarn lint`
Expected: không lỗi. Nếu tsc báo `successMess` không tồn tại, mở `src/app/hooks/useMessage.tsx` và dùng đúng tên hàm mà hook đó export.

- [ ] **Step 3: Commit**

```bash
git add src/pages/merchant-management/business-wallet-account/hooks/useBusinessWalletForm.ts
git commit -m "$(cat <<'EOF'
feat(business-wallet): thêm hook quản lý form thêm mới và cập nhật ví

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
EOF
)"
```

---

## Task 7: Page `BusinessWalletForm` + test

**Files:**
- Create: `src/pages/merchant-management/business-wallet-account/pages/BusinessWalletForm.tsx`
- Test: `src/pages/merchant-management/business-wallet-account/test/BusinessWalletForm.test.tsx`

**Interfaces:**
- Consumes: `useBusinessWalletForm` (Task 6); năm section (Task 4, 5); `useScreenAccess` từ `@/app/permissions`; `FORBIDDENERROR` từ `@constants/routersConstant`.
- Produces: `BusinessWalletForm` — **default export** (bắt buộc, vì `routes.ts` lazy-import ở Task 8).

- [ ] **Step 1: Viết test thất bại**

Tạo `src/pages/merchant-management/business-wallet-account/test/BusinessWalletForm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import type { ContentAccountWallet } from '@type/responseAccountWallet'

import BusinessWalletForm from '../pages/BusinessWalletForm'

const walletDetail: ContentAccountWallet = {
  id: 'wallet-business-1',
  ownerId: 'merchant-001',
  ownerType: 'MERCHANT',
  ownerUsername: 'Công ty TNHH Sao Việt',
  glCode: 'MERCHANT_WALLET_VND',
  currency: 'VND',
  totalDebit: 0,
  totalCredit: 0,
  balance: 0,
  holdBalance: 0,
  availableBalance: 0,
  version: 1,
  status: 'ACTIVE',
  enabled: true,
  checksum: 'checksum',
  lockedReason: '',
  lockedAt: '',
  lockedBy: '',
  createdAt: '2026-09-01T08:30:00',
  updatedAt: '2026-09-02T09:30:00',
  createdBy: 'admin.cms',
  updatedBy: 'admin.cms',
  linkedBanks: []
}

const renderForm = (permissions: string[], route: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path='/business-wallet-account/create' element={<BusinessWalletForm />} />
          <Route path='/business-wallet-account/edit/:id' element={<BusinessWalletForm />} />
          <Route path='/secure-panel/forbidden' element={<p>Không có quyền truy cập</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('BusinessWalletForm', () => {
  it('mode thêm mới hiển thị đủ năm section', () => {
    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')

    expect(
      screen.getByRole('heading', { name: 'Thêm mới ví doanh nghiệp' })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Thông tin tài khoản' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Định danh doanh nghiệp' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Người quản lý tài khoản ví' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Hồ sơ pháp lý (đính kèm)' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Phân loại tài khoản' })).toBeInTheDocument()
  })

  it('không render nút Lưu nháp', () => {
    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')

    expect(screen.queryByRole('button', { name: /Lưu nháp/ })).toBeNull()
  })

  it('submit form rỗng thì hiện lỗi bắt buộc và không gọi API', async () => {
    let requestCount = 0
    server.use(
      http.post('*/wallet/accounts', () => {
        requestCount += 1
        return HttpResponse.json({ data: null, message: 'ok', success: true, status: '1000' })
      })
    )
    const user = userEvent.setup()

    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')
    await user.click(screen.getByRole('button', { name: /Hoàn tất & Tạo/ }))

    expect(await screen.findByText('Vui lòng nhập tên doanh nghiệp')).toBeInTheDocument()
    expect(screen.getByText('Mã số thuế gồm 10 hoặc 13 số')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng tải lên Giấy phép ĐKKD')).toBeInTheDocument()
    expect(requestCount).toBe(0)
  })

  it('nút Sao chép điền SĐT liên hệ sang SĐT nhận OTP', async () => {
    const user = userEvent.setup()
    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')

    await user.type(screen.getByLabelText(/SĐT liên hệ/), '0283822456')
    await user.click(screen.getByRole('button', { name: 'Sao chép' }))

    expect(screen.getByLabelText(/SĐT nhận OTP/)).toHaveValue('0283822456')
  })

  it('mode cập nhật prefill tên doanh nghiệp và khoá email', async () => {
    server.use(
      http.get('*/wallet/accounts/wallet-business-1', () =>
        HttpResponse.json({
          data: walletDetail,
          message: 'success',
          success: true,
          status: '1000'
        })
      )
    )

    renderForm(['EWALLET:MERCHANT:UPDATE'], '/business-wallet-account/edit/wallet-business-1')

    expect(
      await screen.findByDisplayValue('Công ty TNHH Sao Việt')
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Email đăng ký/)).toBeDisabled()
    expect(
      screen.getByRole('heading', { name: 'Cập nhật ví doanh nghiệp' })
    ).toBeInTheDocument()
  })

  it('mode cập nhật gặp lỗi API thì hiện thông báo và cho thử lại', async () => {
    let requestCount = 0
    server.use(
      http.get('*/wallet/accounts/wallet-business-1', () => {
        requestCount += 1
        if (requestCount === 1) {
          return HttpResponse.json({ message: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
        }
        return HttpResponse.json({
          data: walletDetail,
          message: 'success',
          success: true,
          status: '1000'
        })
      })
    )
    const user = userEvent.setup()

    renderForm(['EWALLET:MERCHANT:UPDATE'], '/business-wallet-account/edit/wallet-business-1')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không tải được hồ sơ ví doanh nghiệp'
    )
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(await screen.findByDisplayValue('Công ty TNHH Sao Việt')).toBeInTheDocument()
  })

  it('thiếu quyền tạo thì chuyển sang trang không có quyền', () => {
    renderForm(['EWALLET:MERCHANT:VIEW'], '/business-wallet-account/create')

    expect(screen.getByText('Không có quyền truy cập')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Thông tin tài khoản' })).toBeNull()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `yarn test src/pages/merchant-management/business-wallet-account/test/BusinessWalletForm.test.tsx`
Expected: FAIL — module `../pages/BusinessWalletForm` chưa tồn tại.

- [ ] **Step 3: Viết page**

Tạo `src/pages/merchant-management/business-wallet-account/pages/BusinessWalletForm.tsx`:

```tsx
import { Navigate } from 'react-router-dom'

import { ArrowLeftOutlined, ArrowsCounterClockwiseIcon, SaveOutlined, WarningIcon } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { useScreenAccess } from '@/app/permissions'

import { AccountInfoSection } from '../components/AccountInfoSection'
import { BusinessIdentitySection } from '../components/BusinessIdentitySection'
import { ClassificationSection } from '../components/ClassificationSection'
import { LegalDocsSection } from '../components/LegalDocsSection'
import { WalletManagerSection } from '../components/WalletManagerSection'
import { useBusinessWalletForm } from '../hooks/useBusinessWalletForm'

const BusinessWalletForm = () => {
  const {
    control,
    handleSubmit,
    onSubmit,
    handleCopyContactPhone,
    handleCancel,
    isEditMode,
    isSubmitting,
    isLoadingDetail,
    isDetailError,
    isNotFound,
    refetchDetail
  } = useBusinessWalletForm()

  const { can } = useScreenAccess('BUSINESS_WALLET_ACCOUNT')

  if (!can(isEditMode ? 'edit' : 'create')) {
    return <Navigate to={FORBIDDENERROR} replace />
  }

  const title = isEditMode ? 'Cập nhật ví doanh nghiệp' : 'Thêm mới ví doanh nghiệp'
  const description = isEditMode
    ? 'Điều chỉnh hồ sơ pháp lý, liên hệ và người đại diện của ví doanh nghiệp.'
    : 'Luồng hỗ trợ — luồng chính là doanh nghiệp tự đăng ký và KYB trên Merchant Portal.'

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex min-w-0 items-center gap-3'>
            <ButtonComponent
              htmlType='button'
              type='default'
              aria-label='Quay lại danh sách ví doanh nghiệp'
              icon={<ArrowLeftOutlined aria-hidden />}
              onClick={handleCancel}
            />
            <div className='min-w-0'>
              <h1 className='font-display text-lg font-semibold text-foreground'>{title}</h1>
              <p className='text-sm text-muted-foreground'>{description}</p>
            </div>
          </div>
          <ButtonComponent
            htmlType='submit'
            form='business-wallet-form'
            loading={isSubmitting}
            icon={<SaveOutlined aria-hidden />}
            content={isEditMode ? 'Lưu thay đổi' : 'Hoàn tất & Tạo'}
          />
        </header>
      </CardComponent>

      {isEditMode && isLoadingDetail ? (
        <CardComponent className='border border-border bg-background shadow-none'>
          <div role='status' aria-label='Đang tải hồ sơ ví doanh nghiệp'>
            <SkeletonTable rows={6} columns={2} noContainer />
          </div>
        </CardComponent>
      ) : null}

      {isEditMode && isNotFound ? (
        <CardComponent className='border border-border bg-background shadow-none'>
          <div role='alert' className='flex flex-col items-center gap-3 py-10 text-center'>
            <h2 className='font-display text-base font-semibold text-foreground'>
              Không tìm thấy ví doanh nghiệp
            </h2>
            <p className='text-sm text-muted-foreground'>
              Ví này có thể đã bị xoá hoặc bạn truy cập nhầm đường dẫn.
            </p>
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Về danh sách ví doanh nghiệp'
              onClick={handleCancel}
            />
          </div>
        </CardComponent>
      ) : null}

      {isEditMode && isDetailError ? (
        <CardComponent className='border border-border bg-background shadow-none'>
          <div role='alert' className='flex flex-col items-center gap-3 py-10 text-center'>
            <span className='flex size-10 items-center justify-center rounded-lg bg-danger/10 text-danger'>
              <WarningIcon aria-hidden size={22} />
            </span>
            <h2 className='font-display text-base font-semibold text-foreground'>
              Không tải được hồ sơ ví doanh nghiệp
            </h2>
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Thử lại'
              icon={<ArrowsCounterClockwiseIcon aria-hidden size={18} />}
              onClick={refetchDetail}
            />
          </div>
        </CardComponent>
      ) : null}

      {isEditMode && (isLoadingDetail || isDetailError || isNotFound) ? null : (
        <form
          id='business-wallet-form'
          noValidate
          className='flex flex-col gap-3'
          onSubmit={handleSubmit(onSubmit)}
        >
          <AccountInfoSection control={control} isEditMode={isEditMode} />
          <BusinessIdentitySection control={control} />
          <WalletManagerSection
            control={control}
            onCopyContactPhone={handleCopyContactPhone}
          />
          <LegalDocsSection control={control} />
          <ClassificationSection control={control} />
        </form>
      )}
    </main>
  )
}

export default BusinessWalletForm
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `yarn test src/pages/merchant-management/business-wallet-account/test/BusinessWalletForm.test.tsx`
Expected: PASS — 7 test.

**Nếu test "submit form rỗng" thất bại vì không có gì xảy ra khi bấm nút:** nguyên nhân là nút Submit nằm **ngoài** `<form>` và liên kết bằng thuộc tính `form='business-wallet-form'`. jsdom hỗ trợ liên kết này không đồng đều. Xử lý bằng cách chuyển nút vào trong form: bọc toàn bộ `<main>` bằng `<form id='business-wallet-form' noValidate onSubmit={handleSubmit(onSubmit)}>` và bỏ thuộc tính `form` trên `ButtonComponent`. Giữ nguyên `id` để không phải sửa test.

- [ ] **Step 5: Chạy lint**

Run: `yarn lint`
Expected: không lỗi. Kiểm tra `BusinessWalletForm.tsx` dưới 200 dòng; nếu vượt, tách khối trạng thái lỗi/rỗng ra `components/BusinessWalletFormState.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/merchant-management/business-wallet-account/pages/BusinessWalletForm.tsx src/pages/merchant-management/business-wallet-account/test/BusinessWalletForm.test.tsx
git commit -m "$(cat <<'EOF'
feat(business-wallet): thêm màn thêm mới và cập nhật ví doanh nghiệp

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
EOF
)"
```

---

## Task 8: Nối route, tiêu đề header và điểm vào từ màn danh sách

**Files:**
- Modify: `src/routes.ts`
- Modify: `src/app/languages/vi/headerTitle.json:112`
- Modify: `src/pages/merchant-management/business-wallet-account/columns/business-wallet.columns.tsx`
- Modify: `src/pages/merchant-management/business-wallet-account/components/BusinessWalletTableState.tsx`
- Modify: `src/pages/merchant-management/business-wallet-account/pages/BusinessWallet.tsx`
- Test: `src/pages/merchant-management/business-wallet-account/test/BusinessWallet.test.tsx`

**Interfaces:**
- Consumes: `BusinessWalletForm` default export (Task 7).
- Produces: `createBusinessWalletColumns({ onEdit }: { onEdit: (row: BusinessWalletRow) => void }): ColumnType<BusinessWalletRow>[]` — thay cho hằng `businessWalletColumns` đang export.

**Cảnh báo:** `businessWalletColumns` đang được `BusinessWalletTableState.tsx` dùng ở hai chỗ (`columns={businessWalletColumns}` và `columns={businessWalletColumns.length}` cho skeleton). Đổi sang factory phải sửa cả hai.

- [ ] **Step 1: Viết test thất bại cho điểm vào**

Thêm vào cuối `describe('BusinessWallet', ...)` trong `src/pages/merchant-management/business-wallet-account/test/BusinessWallet.test.tsx`, và bổ sung import ở đầu file:

```tsx
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
```

```tsx
  const renderWithPermissions = (permissions: string[]) => {
    const store = createAppStore()
    store.dispatch(savePermissions(permissions))

    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <BusinessWallet />
        </MemoryRouter>
      </Provider>
    )
  }

  it('hiện nút Thêm mới khi có quyền tạo', async () => {
    server.use(http.get('*/wallet/accounts', () => respondWithAccounts()))

    renderWithPermissions(['EWALLET:MERCHANT:CREATE'])

    expect(
      await screen.findByRole('button', { name: /Thêm mới ví doanh nghiệp/ })
    ).toBeInTheDocument()
  })

  it('ẩn nút Thêm mới khi thiếu quyền tạo', async () => {
    server.use(http.get('*/wallet/accounts', () => respondWithAccounts()))

    renderWithPermissions(['EWALLET:MERCHANT:VIEW'])
    await screen.findByText('Công ty TNHH Sao Việt')

    expect(screen.queryByRole('button', { name: /Thêm mới ví doanh nghiệp/ })).toBeNull()
  })

  it('ẩn nút Sửa trên hàng khi thiếu quyền cập nhật', async () => {
    server.use(http.get('*/wallet/accounts', () => respondWithAccounts()))

    renderWithPermissions(['EWALLET:MERCHANT:VIEW'])
    await screen.findByText('Công ty TNHH Sao Việt')

    expect(screen.queryByRole('button', { name: 'Sửa hồ sơ ví doanh nghiệp' })).toBeNull()
  })

  it('hiện nút Sửa trên hàng khi có quyền cập nhật', async () => {
    server.use(http.get('*/wallet/accounts', () => respondWithAccounts()))

    renderWithPermissions(['EWALLET:MERCHANT:UPDATE'])

    expect(
      await screen.findByRole('button', { name: 'Sửa hồ sơ ví doanh nghiệp' })
    ).toBeInTheDocument()
  })
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `yarn test src/pages/merchant-management/business-wallet-account/test/BusinessWallet.test.tsx`
Expected: FAIL — 4 test mới không tìm thấy nút "Thêm mới ví doanh nghiệp" và "Sửa hồ sơ ví doanh nghiệp".

- [ ] **Step 3: Đổi columns thành factory và thêm cột Thao tác**

Trong `src/pages/merchant-management/business-wallet-account/columns/business-wallet.columns.tsx`, thêm import:

```tsx
import { EditOutlined } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { Can } from '@/app/permissions'
```

Thay dòng `export const businessWalletColumns: ColumnType<BusinessWalletRow>[] = [` bằng:

```tsx
interface CreateBusinessWalletColumnsOptions {
  onEdit: (row: BusinessWalletRow) => void
}

export const createBusinessWalletColumns = ({
  onEdit
}: CreateBusinessWalletColumnsOptions): ColumnType<BusinessWalletRow>[] => [
```

Giữ nguyên toàn bộ các cột hiện có. Cột cuối hiện tại là `'Thời gian tạo'` và kết thúc bằng `}` rồi `]`. Đổi `}` đóng của cột đó thành `},` rồi chèn cột mới trước dấu `]`:

```tsx
  {
    title: 'Thao tác',
    align: 'center',
    width: 90,
    render: (_, record) => (
      <Can screen='BUSINESS_WALLET_ACCOUNT' action='edit'>
        <ButtonComponent
          htmlType='button'
          type='text'
          aria-label='Sửa hồ sơ ví doanh nghiệp'
          icon={<EditOutlined aria-hidden />}
          onClick={() => onEdit(record)}
        />
      </Can>
    )
  }
]
```

- [ ] **Step 4: Cho `BusinessWalletTableState` nhận `onEdit`**

Trong `src/pages/merchant-management/business-wallet-account/components/BusinessWalletTableState.tsx`:

Đổi import:
```tsx
import { createBusinessWalletColumns } from '../columns/business-wallet.columns'
```

Thêm vào `BusinessWalletTableStateProps`:
```tsx
  onEdit: (row: BusinessWalletRow) => void
```

Thêm `onEdit` vào danh sách tham số destructuring của component, rồi thêm ngay trên `const handleRefresh`:
```tsx
  const columns = createBusinessWalletColumns({ onEdit })
```

Đổi `columns={businessWalletColumns.length}` (trong nhánh `isLoading`) thành `columns={columns.length}`, và `columns={businessWalletColumns}` (trong `<Table>`) thành `columns={columns}`.

- [ ] **Step 5: Thêm nút "Thêm mới" và điều hướng vào màn danh sách**

Trong `src/pages/merchant-management/business-wallet-account/pages/BusinessWallet.tsx`, thêm import:

```tsx
import { useNavigate } from 'react-router-dom'
import { PlusOutlined, WalletIcon } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'
import { Can, SCREENS } from '@/app/permissions'
import type { BusinessWalletRow } from '../types/business-wallet.type'
```

Gộp `PlusOutlined` vào dòng import icons đang có và `ButtonComponent` vào dòng import `@components/index` đang có — không tạo dòng import trùng module, eslint sẽ báo lỗi.

Thêm ngay dưới lời gọi `useBusinessWallet()`:

```tsx
  const navigate = useNavigate()

  const handleCreate = (): void => {
    navigate(`${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/create`)
  }

  const handleEdit = (row: BusinessWalletRow): void => {
    navigate(`${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/edit/${row.id}`)
  }
```

Trong `<header>` của card danh sách, thêm nút vào cụm bên phải — thay khối `{!isLoading && !isError && (...)}` bằng:

```tsx
            <div className='flex items-center gap-2'>
              {!isLoading && !isError && (
                <span
                  aria-live='polite'
                  className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums'
                >
                  {totalElements} bản ghi
                </span>
              )}
              <Can screen='BUSINESS_WALLET_ACCOUNT' action='create'>
                <ButtonComponent
                  htmlType='button'
                  icon={<PlusOutlined aria-hidden />}
                  content='Thêm mới ví doanh nghiệp'
                  onClick={handleCreate}
                />
              </Can>
            </div>
```

Truyền thêm prop vào `<BusinessWalletTableState ... onEdit={handleEdit} />`.

- [ ] **Step 6: Chạy test màn danh sách để xác nhận pass**

Run: `yarn test src/pages/merchant-management/business-wallet-account/test/BusinessWallet.test.tsx`
Expected: PASS — 6 test cũ + 4 test mới = 10 test.

- [ ] **Step 7: Khai hai route mới**

Trong `src/routes.ts`, trong mảng `children` của `merchantManagement`, ngay sau entry `SCREENS.BUSINESS_WALLET_ACCOUNT.path` đang có, thêm:

```ts
        {
          path: `${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/create`,
          element: page(
            () =>
              import('@pages/merchant-management/business-wallet-account/pages/BusinessWalletForm')
          )
        },
        {
          path: `${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/edit/:id`,
          element: page(
            () =>
              import('@pages/merchant-management/business-wallet-account/pages/BusinessWalletForm')
          )
        }
```

- [ ] **Step 8: Thêm tiêu đề header**

Trong `src/app/languages/vi/headerTitle.json`, ngay sau dòng 112 (`"/secure-panel/merchant/business-wallet-account"`), thêm:

```json
    "/secure-panel/merchant/business-wallet-account/create":"Thêm mới ví doanh nghiệp",
    "/secure-panel/merchant/business-wallet-account/edit/*":"Cập nhật ví doanh nghiệp",
```

`getHeaderTitleKey` (`src/components/layout/AppLayout.tsx:44`) thay **segment cuối** bằng `*`, nên `.../edit/<id>` khớp `.../edit/*`. Thiếu hai dòng này thì header hiển thị chuỗi thô `header-title./secure-panel/...`.

- [ ] **Step 9: Chạy toàn bộ test và lint**

Run: `yarn test src/pages/merchant-management/business-wallet-account && yarn lint`
Expected: toàn bộ PASS, không lỗi lint.

- [ ] **Step 10: Kiểm tra thủ công trên trình duyệt**

Run: `yarn dev`
Kiểm:
1. Vào `/secure-panel/merchant/business-wallet-account` — header hiển thị "Quản lý ví doanh nghiệp", có nút "Thêm mới ví doanh nghiệp" (nếu tài khoản có quyền `EWALLET:MERCHANT:CREATE`).
2. Bấm nút → sang `/create`, header hiển thị "Thêm mới ví doanh nghiệp" (không phải chuỗi `header-title.…`), đủ 5 section, **không có** nút "Lưu nháp".
3. Bấm "Hoàn tất & Tạo" khi form rỗng → hiện lỗi bắt buộc, không gửi request.
4. Điền đủ và bấm gửi → nhận lỗi từ backend (endpoint chưa tồn tại) và chỉ hiện **một** notification lỗi.
5. Bấm icon Sửa trên một hàng → sang `/edit/<id>`, header hiển thị "Cập nhật ví doanh nghiệp", ô Email bị khoá, tên doanh nghiệp đã điền sẵn.

- [ ] **Step 11: Commit**

```bash
git add src/routes.ts src/app/languages/vi/headerTitle.json src/pages/merchant-management/business-wallet-account/
git commit -m "$(cat <<'EOF'
feat(business-wallet): nối route, tiêu đề header và điểm vào thêm/sửa ví

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GBhQ9vTZ7wkTZ87RTJM8P6
EOF
)"
```

---

## Đối chiếu plan với spec

| Mục spec | Task hiện thực |
|---|---|
| 3 · Quyết định #1 (adapter tạm) | Task 2 |
| 3 · Quyết định #2 (full page) | Task 7 |
| 3 · Quyết định #3 (bỏ Lưu nháp) | Task 7 — có test khẳng định nút không tồn tại |
| 3 · Quyết định #4 (`/edit/:id`) | Task 8 Step 7 + Step 8 |
| 3 · Quyết định #5 (không sửa registry) | Task 8 — dùng `create`/`edit` có sẵn |
| 4 · Route | Task 8 Step 7 |
| 5 · Cấu trúc file | Task 1–8, bảng "Cấu trúc file" ở đầu plan |
| 6 · Schema Zod, 17 field | Task 1 |
| 7 · Lớp API tạm + 2 hạn chế | Task 2 (TODO(BE)) + Task 6 (prefill chỉ `businessName`) |
| 8 · Phân quyền | Task 7 (guard route) + Task 8 (Can cho nút Thêm mới và Sửa) |
| 9 · Bốn trạng thái | Task 7 — loading / error / notFound / data |
| 10 · Tiêu đề header | Task 8 Step 8 |
| 11 · Kiểm thử | Task 1 (schema), 2 (map), 7 (page), 8 (danh sách) |
| 12 · Ngoài phạm vi | Không có task — đúng chủ ý |
