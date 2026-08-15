# Xuất CSV cho các tab màn Chi tiết ví — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi tab 2/3/4/5 của màn Chi tiết ví có một nút tải file CSV do backend sinh, dùng chung một lớp tải file duy nhất.

**Architecture:** Bốn lớp tách rời — util thuần (`file-download.ts`) chỉ biết Blob/DOM; service RTK Query (`apiExportCsv.ts`) chỉ biết HTTP và tái dụng base query có sẵn để giữ luồng refresh token 401; hook (`useExportCsv.ts`) ghép hai lớp đó lại và quản lý trạng thái; component (`ExportCsvButton.tsx`) chỉ biết hiển thị. Bốn tab chỉ việc truyền tham số.

**Tech Stack:** React 19 + Vite, TypeScript strict, Redux Toolkit Query, Ant Design 5, Tailwind v4, vitest + @testing-library/react + msw.

**Spec:** `docs/superpowers/specs/2026-08-15-wallet-detail-csv-export-design.md`

## Global Constraints

- **Không dùng `any`.** Dùng `unknown` + narrowing hoặc generic. Không `@ts-ignore`.
- **Named export** cho mọi thứ trừ những file đang theo `export default` sẵn có trong repo (các component cũ trong `src/components/ui/*`).
- Component < 200 dòng, function < 50 dòng, file < 300 dòng.
- Nhãn nút: **"Xuất CSV"** (không phải "Xuất Excel").
- Chỉ làm nhánh `ownerType` = `USER` / `SYSTEM`. Không đụng `components/detail-infor/business/*`.
- Hook export **không tự toast lỗi** — `errorMiddleware` đã làm việc đó.
- Alias import: `@/`, `@components`, `@services`, `@configs`, `@utils`, `@hooks`, `@type`, `@constants` (xem `vitest.config.ts`).
- Chạy test: `npm run test`. Chạy một file: `npx vitest run <path>`.
- Test viết bằng tiếng Việt trong `describe`/`it`, theo đúng các file test đang có.
- Mỗi task kết thúc bằng một commit riêng.

---

### Task 1: Util tải file (`file-download.ts`)

**Files:**
- Create: `src/app/utils/file-download.ts`
- Test: `src/app/utils/test/file-download.test.ts`

**Interfaces:**
- Consumes: `dayjs` (đã là dependency).
- Produces:
  - `parseFilenameFromDisposition(header: string | null): string | null`
  - `buildFallbackFilename(prefix: string): string`
  - `saveBlobAsFile(blob: Blob, filename: string): Promise<void>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src/app/utils/test/file-download.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildFallbackFilename,
  parseFilenameFromDisposition,
  saveBlobAsFile
} from '../file-download'

describe('parseFilenameFromDisposition', () => {
  it('đọc được filename* dạng UTF-8 có dấu tiếng Việt', () => {
    const header =
      "attachment; filename=\"lien-ket.csv\"; filename*=UTF-8''li%C3%AAn-k%E1%BA%BFt.csv"

    expect(parseFilenameFromDisposition(header)).toBe('liên-kết.csv')
  })

  it('đọc được filename thường khi không có filename*', () => {
    expect(
      parseFilenameFromDisposition('attachment; filename="bank-links.csv"')
    ).toBe('bank-links.csv')
  })

  it('trả null khi thiếu header', () => {
    expect(parseFilenameFromDisposition(null)).toBeNull()
  })

  it('trả null khi header không chứa tên file', () => {
    expect(parseFilenameFromDisposition('attachment')).toBeNull()
  })
})

describe('buildFallbackFilename', () => {
  it('nối tiền tố với dấu thời gian và đuôi csv', () => {
    expect(buildFallbackFilename('dong-bang-so-du')).toMatch(
      /^dong-bang-so-du_\d{8}-\d{6}\.csv$/
    )
  })
})

describe('saveBlobAsFile', () => {
  const createObjectURL = vi.fn(() => 'blob:mock')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      writable: true
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      writable: true
    })
  })

  /** Lấy blob thật sự được đưa cho trình duyệt tải xuống. */
  const savedBlob = (): Blob => createObjectURL.mock.calls[0][0] as unknown as Blob

  it('thêm BOM UTF-8 khi backend gửi CSV thiếu BOM', async () => {
    await saveBlobAsFile(new Blob(['ma,ten\n1,Bình'], { type: 'text/csv' }), 'a.csv')

    const bytes = new Uint8Array(await savedBlob().slice(0, 3).arrayBuffer())
    expect(Array.from(bytes)).toEqual([0xef, 0xbb, 0xbf])
  })

  it('không thêm BOM lần hai khi backend đã gửi BOM', async () => {
    const withBom = new Blob(['﻿ma,ten\n1,Bình'], { type: 'text/csv' })

    await saveBlobAsFile(withBom, 'a.csv')

    expect(savedBlob().size).toBe(withBom.size)
  })

  it('không đụng tới nội dung khi file không phải csv', async () => {
    const raw = new Blob(['noi dung'], { type: 'application/pdf' })

    await saveBlobAsFile(raw, 'a.pdf')

    expect(savedBlob().size).toBe(raw.size)
  })

  it('thu hồi object URL sau khi tải', async () => {
    vi.useFakeTimers()

    await saveBlobAsFile(new Blob(['x'], { type: 'text/csv' }), 'a.csv')
    vi.runAllTimers()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Chạy: `npx vitest run src/app/utils/test/file-download.test.ts`
Kỳ vọng: FAIL — `Failed to resolve import "../file-download"`.

- [ ] **Step 3: Viết implementation tối thiểu**

Tạo `src/app/utils/file-download.ts`:

```ts
import dayjs from 'dayjs'

const UTF8_BOM = '﻿'
const BOM_BYTES = [0xef, 0xbb, 0xbf]

/** Đọc tên file backend gửi kèm trong header `Content-Disposition`. */
export const parseFilenameFromDisposition = (
  header: string | null
): string | null => {
  if (!header) return null

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim())
    } catch {
      return null
    }
  }

  const quoted = /filename="?([^";]+)"?/i.exec(header)
  return quoted?.[1]?.trim() ?? null
}

/** Tên file dùng khi backend không gửi (hoặc CORS chặn) `Content-Disposition`. */
export const buildFallbackFilename = (prefix: string): string =>
  `${prefix}_${dayjs().format('YYYYMMDD-HHmmss')}.csv`

/**
 * Excel đọc CSV theo mã trang của hệ điều hành nếu file không có BOM UTF-8 →
 * tiếng Việt ra ký tự lạ. Chỉ thêm khi backend chưa gửi để không nhân đôi BOM.
 */
const ensureUtf8Bom = async (blob: Blob): Promise<Blob> => {
  const head = new Uint8Array(await blob.slice(0, 3).arrayBuffer())
  const hasBom = BOM_BYTES.every((byte, index) => head[index] === byte)
  if (hasBom) return blob

  return new Blob([UTF8_BOM, blob], {
    type: blob.type || 'text/csv;charset=utf-8'
  })
}

/** Đưa blob cho trình duyệt tải xuống dưới tên `filename`. */
export const saveBlobAsFile = async (
  blob: Blob,
  filename: string
): Promise<void> => {
  const fileBlob = filename.toLowerCase().endsWith('.csv')
    ? await ensureUtf8Bom(blob)
    : blob

  const url = URL.createObjectURL(fileBlob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'

  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  setTimeout(() => URL.revokeObjectURL(url), 0)
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Chạy: `npx vitest run src/app/utils/test/file-download.test.ts`
Kỳ vọng: PASS — 8 test.

- [ ] **Step 5: Commit**

```bash
git add src/app/utils/file-download.ts src/app/utils/test/file-download.test.ts
git commit -m "feat(utils): them util tai file blob va parse ten file tu Content-Disposition"
```

---

### Task 2: Bỏ global overlay cho request export

**Files:**
- Modify: `src/app/configs/fetchBaseQuery.types.ts` (interface `WhiteListItem` ~dòng 161, mảng `WHITE_LIST` ~dòng 205, hàm `isInWhiteList` ~dòng 318)
- Test: `src/app/configs/test/loadingWhitelist.test.ts` (mở rộng file có sẵn)

**Interfaces:**
- Consumes: không.
- Produces: `WhiteListItem` có thêm field tuỳ chọn `requestUrlEndsWith?: string`; `requestUrl` trở thành tuỳ chọn.

**Vì sao không dùng tiền tố:** URL export tab 2 là `/wallet/accounts/{id}/bank-links/export`. Whitelist bằng tiền tố `/wallet/accounts` sẽ phủ luôn `/wallet/accounts/{id}` — request tải dữ liệu ví của cả màn chi tiết (`src/app/services/apiWalletAccount.api.ts:18`) — làm mất overlay lúc mở màn.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `describe` trong `src/app/configs/test/loadingWhitelist.test.ts`:

```ts
  it('bỏ global loader cho export lịch sử giao dịch ở màn chi tiết ví', () => {
    expect(
      isInWhiteList(
        '/wallet/transactions/export',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeDefined()
  })

  it('bỏ global loader cho export liên kết ngân hàng có id nằm giữa URL', () => {
    expect(
      isInWhiteList(
        '/wallet/accounts/bc948626-2c8f-4f41-a866-7540d59a7e07/bank-links/export',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeDefined()
  })

  it('bỏ global loader cho export quy tắc phí ở màn chi tiết ví', () => {
    expect(
      isInWhiteList(
        '/fee/applicable-rules/export',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeDefined()
  })

  it('không whitelist URL export ngoài màn quản lý ví', () => {
    expect(
      isInWhiteList('/wallet/freezes/export', '/secure-panel/transaction-management')
    ).toBeUndefined()
  })

  it('vẫn giữ global loader cho request tải chi tiết ví', () => {
    expect(
      isInWhiteList(
        '/wallet/accounts/bc948626-2c8f-4f41-a866-7540d59a7e07',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeUndefined()
  })
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Chạy: `npx vitest run src/app/configs/test/loadingWhitelist.test.ts`
Kỳ vọng: FAIL — 4 test export trả `undefined` (test cuối cùng đã pass sẵn, giữ nó để chống hồi quy).

- [ ] **Step 3: Viết implementation tối thiểu**

Sửa interface trong `src/app/configs/fetchBaseQuery.types.ts`:

```ts
export interface WhiteListItem {
    pathname: string
    /** So khớp theo tiền tố URL. */
    requestUrl?: string
    /** So khớp theo hậu tố URL — dùng khi id nằm giữa đường dẫn. */
    requestUrlEndsWith?: string
    includeNestedPaths?: boolean
}
```

Thêm mục cuối mảng `WHITE_LIST` (ngay trước dấu `]` đóng mảng):

```ts
    // Bốn endpoint export của màn chi tiết ví đều kết thúc bằng `/export`.
    // Nút export tự hiển thị spinner nên overlay toàn màn chỉ gây nhấp nháy.
    {
      pathname: WALLETADMINISTRATION + '/e-walletManagement',
      requestUrlEndsWith: '/export',
      includeNestedPaths: true
    },
```

Thay hàm `isInWhiteList`:

```ts
const matchesRequestUrl = (item: WhiteListItem, cleanUrl: string): boolean => {
  if (item.requestUrl && cleanUrl.startsWith(item.requestUrl)) return true
  if (item.requestUrlEndsWith && cleanUrl.endsWith(item.requestUrlEndsWith)) return true
  return false
}

export const isInWhiteList = (
  url?: string,
  pathname?: string
): WhiteListItem | undefined => {
  const cleanUrl = normalizeUrl(url)

  return WHITE_LIST.find(
    (item) =>
      (
        item.pathname === pathname ||
        (
          item.includeNestedPaths &&
          pathname?.startsWith(`${item.pathname}/`)
        )
      ) &&
      matchesRequestUrl(item, cleanUrl)
  )
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Chạy: `npx vitest run src/app/configs/test/loadingWhitelist.test.ts`
Kỳ vọng: PASS — 9 test.

- [ ] **Step 5: Chạy toàn bộ test để chắc chắn không vỡ chỗ khác**

Chạy: `npm run test`
Kỳ vọng: PASS toàn bộ (`WHITE_LIST` được nhiều luồng dùng chung).

- [ ] **Step 6: Commit**

```bash
git add src/app/configs/fetchBaseQuery.types.ts src/app/configs/test/loadingWhitelist.test.ts
git commit -m "feat(configs): whitelist request export khoi global loading overlay"
```

---

### Task 3: Service export (`apiExportCsv.ts`)

**Files:**
- Create: `src/app/services/apiExportCsv.ts`
- Modify: `src/app/schemas/applicable-fee-rule.schema.ts` (thêm schema + type cho tham số export, sau `applicableFeeRuleQuerySchema` dòng 80-86)
- Test: `src/app/services/test/apiExportCsv.test.ts`

Mỗi test tự đăng ký handler msw riêng bằng `server.use(...)` — không thêm handler chung vào `src/test/mocks/handlers.ts`, để một request export gọi sai đường dẫn vẫn bị `onUnhandledRequest: 'error'` bắt lỗi thay vì lọt qua.

**Interfaces:**
- Consumes: `parseFilenameFromDisposition` (Task 1); `fetchBaseQueryWalletCore`, `fetchBaseQueryFee` từ `@configs/fetchBaseQueryCustom`; `apiWalletCore`, `apiFeeService` từ `@services/apiService`.
- Produces:
  - `interface ExportedFile { blob: Blob; filename: string | null }`
  - `interface ExportTransactionsQuery { ownerId: string; type?: string; status?: string; transactionCode?: string; fromDate?: string; toDate?: string }`
  - `interface ExportFreezesQuery { accountId: string; type?: string; status?: string; fromDate?: string; toDate?: string }`
  - `type ApplicableFeeRuleExportQuery = { merchantId?: string; customerGroup?: string; feeDomain?: 'BANK' | 'EWALLET' | 'MERCHANT' }`
  - Hook: `useExportBankLinksMutation`, `useExportTransactionsMutation`, `useExportFreezesMutation`, `useExportApplicableFeeRulesMutation`
  - Endpoint object để test: `apiExportWalletCsv.endpoints.*`, `apiExportFeeCsv.endpoints.*`

- [ ] **Step 1: Thêm schema tham số export cho tab 5**

Thêm vào cuối `src/app/schemas/applicable-fee-rule.schema.ts`:

```ts
/** Endpoint export không phân trang — bỏ `page`/`size` khỏi bộ lọc của bảng. */
export const applicableFeeRuleExportQuerySchema =
  applicableFeeRuleQuerySchema.omit({ page: true, size: true })

export type ApplicableFeeRuleExportQuery = z.infer<
  typeof applicableFeeRuleExportQuerySchema
>
```

- [ ] **Step 2: Viết test thất bại**

Tạo `src/app/services/test/apiExportCsv.test.ts`:

```ts
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { apiExportFeeCsv, apiExportWalletCsv } from '../apiExportCsv'

const ACCOUNT_ID = 'bc948626-2c8f-4f41-a866-7540d59a7e07'

describe('apiExportCsv', () => {
  it('trả blob và tên file lấy từ Content-Disposition', async () => {
    server.use(
      http.get('*/wallet/freezes/export', () =>
        HttpResponse.text('ma,so_tien\nFRZ1,1000', {
          headers: {
            'content-type': 'text/csv',
            'content-disposition': 'attachment; filename="dong-bang.csv"'
          }
        })
      )
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportWalletCsv.endpoints.exportFreezes.initiate({ accountId: ACCOUNT_ID })
    )

    expect(result.data?.filename).toBe('dong-bang.csv')
    expect(await result.data?.blob.text()).toBe('ma,so_tien\nFRZ1,1000')
  })

  it('trả filename null khi backend không gửi Content-Disposition', async () => {
    server.use(
      http.get('*/wallet/transactions/export', () =>
        HttpResponse.text('ma\nTX1', { headers: { 'content-type': 'text/csv' } })
      )
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportWalletCsv.endpoints.exportTransactions.initiate({ ownerId: ACCOUNT_ID })
    )

    expect(result.data?.filename).toBeNull()
  })

  it('gắn id ví vào đường dẫn export liên kết ngân hàng', async () => {
    let calledUrl = ''
    server.use(
      http.get('*/wallet/accounts/:id/bank-links/export', ({ request }) => {
        calledUrl = new URL(request.url).pathname
        return HttpResponse.text('ma\nBL1', {
          headers: { 'content-type': 'text/csv' }
        })
      })
    )
    const store = createAppStore()

    await store.dispatch(
      apiExportWalletCsv.endpoints.exportBankLinks.initiate({
        walletAccountId: ACCOUNT_ID
      })
    )

    expect(calledUrl).toContain(`/wallet/accounts/${ACCOUNT_ID}/bank-links/export`)
  })

  it('parse body lỗi JSON thay vì để nguyên Blob cho errorMiddleware', async () => {
    server.use(
      http.get('*/fee/applicable-rules/export', () =>
        HttpResponse.json({ message: 'Ví không tồn tại' }, { status: 400 })
      )
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportFeeCsv.endpoints.exportApplicableFeeRules.initiate({
        merchantId: ACCOUNT_ID,
        feeDomain: 'EWALLET'
      })
    )

    expect(result.error).toMatchObject({
      status: 400,
      data: { message: 'Ví không tồn tại' }
    })
  })
})
```

- [ ] **Step 3: Chạy test để chắc chắn nó fail**

Chạy: `npx vitest run src/app/services/test/apiExportCsv.test.ts`
Kỳ vọng: FAIL — `Failed to resolve import "../apiExportCsv"`.

- [ ] **Step 4: Viết implementation tối thiểu**

Tạo `src/app/services/apiExportCsv.ts`:

```ts
import type { ApplicableFeeRuleExportQuery } from '@/app/schemas/applicable-fee-rule.schema'
import {
  fetchBaseQueryFee,
  fetchBaseQueryWalletCore
} from '@configs/fetchBaseQueryCustom'
import type {
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query'
import { apiFeeService, apiWalletCore } from '@services/apiService'
import { parseFilenameFromDisposition } from '@utils/file-download'

export interface ExportedFile {
  blob: Blob
  /** Tên backend đặt; `null` khi header không có hoặc bị CORS chặn. */
  filename: string | null
}

export interface ExportBankLinksQuery {
  walletAccountId: string
}

export interface ExportTransactionsQuery {
  ownerId: string
  type?: string
  status?: string
  transactionCode?: string
  fromDate?: string
  toDate?: string
}

export interface ExportFreezesQuery {
  accountId: string
  type?: string
  status?: string
  fromDate?: string
  toDate?: string
}

type ExportBaseQuery = typeof fetchBaseQueryWalletCore
type ExportQueryApi = Parameters<ExportBaseQuery>[1]
type ExportExtraOptions = Parameters<ExportBaseQuery>[2]

/**
 * `responseHandler` áp cho cả body lỗi nên `error.data` là Blob chứa JSON.
 * `errorMiddleware` đọc `data.detail`/`data.message` để hiện toast — không parse
 * lại ở đây thì người dùng chỉ thấy câu lỗi chung chung.
 */
const toApiError = async (
  error: FetchBaseQueryError
): Promise<FetchBaseQueryError> => {
  if (typeof error.status !== 'number') return error
  if (!(error.data instanceof Blob)) return error

  try {
    return { status: error.status, data: JSON.parse(await error.data.text()) }
  } catch {
    return { status: error.status, data: undefined }
  }
}

const runExport = async (
  baseQuery: ExportBaseQuery,
  args: { url: string; params?: Record<string, unknown> },
  queryApi: ExportQueryApi,
  extraOptions: ExportExtraOptions
): Promise<{ data: ExportedFile } | { error: FetchBaseQueryError }> => {
  const response = await baseQuery(
    { ...args, method: 'GET', responseHandler: (res) => res.blob() },
    queryApi,
    extraOptions
  )

  if (response.error) return { error: await toApiError(response.error) }

  const meta = response.meta as FetchBaseQueryMeta | undefined

  return {
    data: {
      blob: response.data as Blob,
      filename: parseFilenameFromDisposition(
        meta?.response?.headers.get('content-disposition') ?? null
      )
    }
  }
}

export const apiExportWalletCsv = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    exportBankLinks: build.mutation<ExportedFile, ExportBankLinksQuery>({
      queryFn: ({ walletAccountId }, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryWalletCore,
          { url: `/wallet/accounts/${walletAccountId}/bank-links/export` },
          queryApi,
          extraOptions
        )
    }),
    exportTransactions: build.mutation<ExportedFile, ExportTransactionsQuery>({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryWalletCore,
          { url: '/wallet/transactions/export', params },
          queryApi,
          extraOptions
        )
    }),
    exportFreezes: build.mutation<ExportedFile, ExportFreezesQuery>({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryWalletCore,
          { url: '/wallet/freezes/export', params },
          queryApi,
          extraOptions
        )
    })
  })
})

export const apiExportFeeCsv = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    exportApplicableFeeRules: build.mutation<
      ExportedFile,
      ApplicableFeeRuleExportQuery
    >({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryFee,
          { url: '/fee/applicable-rules/export', params },
          queryApi,
          extraOptions
        )
    })
  })
})

export const {
  useExportBankLinksMutation,
  useExportTransactionsMutation,
  useExportFreezesMutation
} = apiExportWalletCsv

export const { useExportApplicableFeeRulesMutation } = apiExportFeeCsv
```

Ghi chú: các mutation này **không khai `invalidatesTags`** — tải file không làm đổi dữ liệu server.

- [ ] **Step 5: Chạy test để chắc chắn nó pass**

Chạy: `npx vitest run src/app/services/test/apiExportCsv.test.ts`
Kỳ vọng: PASS — 4 test.

- [ ] **Step 6: Kiểm tra TypeScript**

Chạy: `npx tsc --noEmit`
Kỳ vọng: không lỗi ở các file vừa tạo.

- [ ] **Step 7: Commit**

```bash
git add src/app/services/apiExportCsv.ts src/app/services/test/apiExportCsv.test.ts \
        src/app/schemas/applicable-fee-rule.schema.ts
git commit -m "feat(services): them 4 endpoint export CSV cho man chi tiet vi"
```

---

### Task 4: Hook `useExportCsv`

**Files:**
- Create: `src/app/hooks/useExportCsv.ts`
- Test: `src/app/hooks/test/useExportCsv.test.tsx`

**Interfaces:**
- Consumes: `ExportedFile` (Task 3); `buildFallbackFilename`, `saveBlobAsFile` (Task 1); `globalMessage` từ `@hooks/useMessage`.
- Produces:
  ```ts
  useExportCsv<TArgs>(params: {
    trigger: (args: TArgs) => { unwrap: () => Promise<ExportedFile> }
    reset: () => void
    filenamePrefix: string
    successMessage?: string
  }): { exportFile: (args: TArgs) => Promise<void>; isExporting: boolean }
  ```

- [ ] **Step 1: Viết test thất bại**

Tạo `src/app/hooks/test/useExportCsv.test.tsx`:

```tsx
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExportCsv } from '../useExportCsv'

const saveBlobAsFile = vi.fn()
const successMessage = vi.fn()
const errorMessage = vi.fn()

vi.mock('@utils/file-download', async () => {
  const actual = await vi.importActual<typeof import('@utils/file-download')>(
    '@utils/file-download'
  )
  return { ...actual, saveBlobAsFile: (...args: unknown[]) => saveBlobAsFile(...args) }
})

vi.mock('@hooks/useMessage', () => ({
  globalMessage: {
    success: (content: string) => successMessage(content),
    error: (content: string) => errorMessage(content),
    info: vi.fn(),
    warning: vi.fn()
  }
}))

const setup = (unwrap: () => Promise<{ blob: Blob; filename: string | null }>) => {
  const reset = vi.fn()
  const trigger = vi.fn(() => ({ unwrap }))
  const view = renderHook(() =>
    useExportCsv({ trigger, reset, filenamePrefix: 'dong-bang-so-du' })
  )
  return { ...view, reset, trigger }
}

describe('useExportCsv', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lưu file với tên backend gửi và báo thành công', async () => {
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    const { result, reset } = setup(async () => ({ blob, filename: 'be-dat-ten.csv' }))

    await act(async () => {
      await result.current.exportFile({ accountId: 'a' })
    })

    expect(saveBlobAsFile).toHaveBeenCalledWith(blob, 'be-dat-ten.csv')
    expect(successMessage).toHaveBeenCalledTimes(1)
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('dùng tên dự phòng khi backend không gửi tên file', async () => {
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    const { result } = setup(async () => ({ blob, filename: null }))

    await act(async () => {
      await result.current.exportFile({ accountId: 'a' })
    })

    expect(saveBlobAsFile).toHaveBeenCalledWith(
      blob,
      expect.stringMatching(/^dong-bang-so-du_\d{8}-\d{6}\.csv$/)
    )
  })

  it('không lưu file và không tự toast lỗi khi request hỏng', async () => {
    const { result } = setup(async () => {
      throw { status: 400, data: { message: 'Lỗi' } }
    })

    await act(async () => {
      await result.current.exportFile({ accountId: 'a' })
    })

    expect(saveBlobAsFile).not.toHaveBeenCalled()
    // errorMiddleware đã toast; hook toast thêm sẽ ra hai thông báo chồng nhau.
    expect(errorMessage).not.toHaveBeenCalled()
    expect(successMessage).not.toHaveBeenCalled()
  })

  it('bật isExporting trong lúc tải rồi tắt khi xong', async () => {
    let release: (() => void) | undefined
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    const { result } = setup(
      () =>
        new Promise((resolve) => {
          release = () => resolve({ blob, filename: 'a.csv' })
        })
    )

    act(() => {
      void result.current.exportFile({ accountId: 'a' })
    })
    await waitFor(() => expect(result.current.isExporting).toBe(true))

    await act(async () => {
      release?.()
    })
    await waitFor(() => expect(result.current.isExporting).toBe(false))
  })

  it('bỏ qua lần bấm thứ hai khi đang tải', async () => {
    let release: (() => void) | undefined
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    const { result, trigger } = setup(
      () =>
        new Promise((resolve) => {
          release = () => resolve({ blob, filename: 'a.csv' })
        })
    )

    act(() => {
      void result.current.exportFile({ accountId: 'a' })
    })
    await waitFor(() => expect(result.current.isExporting).toBe(true))
    await act(async () => {
      void result.current.exportFile({ accountId: 'a' })
      release?.()
    })

    expect(trigger).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Chạy: `npx vitest run src/app/hooks/test/useExportCsv.test.tsx`
Kỳ vọng: FAIL — `Failed to resolve import "../useExportCsv"`.

- [ ] **Step 3: Viết implementation tối thiểu**

Tạo `src/app/hooks/useExportCsv.ts`:

```ts
import { globalMessage } from '@hooks/useMessage'
import type { ExportedFile } from '@services/apiExportCsv'
import { buildFallbackFilename, saveBlobAsFile } from '@utils/file-download'
import { useCallback, useState } from 'react'

interface UseExportCsvParams<TArgs> {
  /** `trigger` của mutation export, ví dụ `useExportFreezesMutation()[0]`. */
  trigger: (args: TArgs) => { unwrap: () => Promise<ExportedFile> }
  /** `reset` của cùng mutation — dọn Blob khỏi store sau khi tải xong. */
  reset: () => void
  /** Tiền tố tên file khi backend không gửi `Content-Disposition`. */
  filenamePrefix: string
  successMessage?: string
}

interface UseExportCsvResult<TArgs> {
  exportFile: (args: TArgs) => Promise<void>
  isExporting: boolean
}

export const useExportCsv = <TArgs,>({
  trigger,
  reset,
  filenamePrefix,
  successMessage = 'Đã tải file CSV'
}: UseExportCsvParams<TArgs>): UseExportCsvResult<TArgs> => {
  const [isExporting, setIsExporting] = useState(false)

  const exportFile = useCallback(
    async (args: TArgs): Promise<void> => {
      if (isExporting) return

      setIsExporting(true)
      try {
        const file = await trigger(args).unwrap()
        await saveBlobAsFile(
          file.blob,
          file.filename ?? buildFallbackFilename(filenamePrefix)
        )
        globalMessage.success(successMessage)
      } catch {
        // errorMiddleware đã hiện toast từ `error.data.message`; ở đây chỉ chặn
        // lỗi lọt ra cây React.
      } finally {
        setIsExporting(false)
        reset()
      }
    },
    [filenamePrefix, isExporting, reset, successMessage, trigger]
  )

  return { exportFile, isExporting }
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Chạy: `npx vitest run src/app/hooks/test/useExportCsv.test.tsx`
Kỳ vọng: PASS — 5 test.

- [ ] **Step 5: Commit**

```bash
git add src/app/hooks/useExportCsv.ts src/app/hooks/test/useExportCsv.test.tsx
git commit -m "feat(hooks): them useExportCsv quan ly trang thai tai file"
```

---

### Task 5: Component `ExportCsvButton`

**Files:**
- Create: `src/components/ui/export-button/ExportCsvButton.tsx`
- Modify: `src/components/icons/index.ts` (thêm `DownloadOutlined` vào khối export từ `@ant-design/icons`, dòng 1-38)
- Modify: `src/components/index.ts` (thêm dòng export cuối file)
- Test: `src/components/ui/export-button/test/ExportCsvButton.test.tsx`

**Interfaces:**
- Consumes: `ButtonComponent` (`@components/ui/button-component`), `TooltipComponent` (`@components/ui/tooltip-component`), `DownloadOutlined` (`@components/icons`).
- Produces:
  ```ts
  interface ExportCsvButtonProps {
    onExport: () => void
    loading?: boolean
    disabled?: boolean
    label?: string    // mặc định 'Xuất CSV'
    tooltip?: string
  }
  export const ExportCsvButton: (props: ExportCsvButtonProps) => JSX.Element
  ```

**Lưu ý:** import trực tiếp từ đường dẫn component, **không** import từ `@components/index` — file này nằm trong chính barrel đó, import ngược sẽ tạo vòng lặp.

- [ ] **Step 1: Viết test thất bại**

Tạo `src/components/ui/export-button/test/ExportCsvButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ExportCsvButton } from '../ExportCsvButton'

describe('ExportCsvButton', () => {
  it('hiển thị nhãn mặc định Xuất CSV', () => {
    render(<ExportCsvButton onExport={vi.fn()} />)

    expect(screen.getByRole('button', { name: /Xuất CSV/ })).toBeInTheDocument()
  })

  it('gọi onExport đúng một lần khi bấm', async () => {
    const onExport = vi.fn()
    render(<ExportCsvButton onExport={onExport} />)

    await userEvent.click(screen.getByRole('button', { name: /Xuất CSV/ }))

    expect(onExport).toHaveBeenCalledTimes(1)
  })

  it('khoá nút khi đang tải', () => {
    render(<ExportCsvButton onExport={vi.fn()} loading />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('khoá nút khi disabled', () => {
    render(<ExportCsvButton onExport={vi.fn()} disabled />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('cho phép đổi nhãn', () => {
    render(<ExportCsvButton onExport={vi.fn()} label='Tải danh sách' />)

    expect(screen.getByRole('button', { name: /Tải danh sách/ })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Chạy: `npx vitest run src/components/ui/export-button/test/ExportCsvButton.test.tsx`
Kỳ vọng: FAIL — `Failed to resolve import "../ExportCsvButton"`.

- [ ] **Step 3: Thêm icon còn thiếu**

Trong `src/components/icons/index.ts`, thêm `DownloadOutlined,` vào khối `export { ... } from '@ant-design/icons'` (ngay sau `SearchOutlined ,`).

- [ ] **Step 4: Viết implementation tối thiểu**

Tạo `src/components/ui/export-button/ExportCsvButton.tsx`:

```tsx
import ButtonComponent from '@components/ui/button-component'
import TooltipComponent from '@components/ui/tooltip-component'
import { DownloadOutlined } from '@components/icons'

export interface ExportCsvButtonProps {
  onExport: () => void
  loading?: boolean
  disabled?: boolean
  /** Mặc định 'Xuất CSV' — backend trả CSV chứ không phải Excel. */
  label?: string
  /** Giải thích khác biệt giữa file tải về và bảng đang hiển thị (nếu có). */
  tooltip?: string
}

export const ExportCsvButton = ({
  onExport,
  loading = false,
  disabled = false,
  label = 'Xuất CSV',
  tooltip
}: ExportCsvButtonProps) => {
  const button = (
    <ButtonComponent
      type='default'
      icon={<DownloadOutlined />}
      loading={loading}
      disabled={disabled || loading}
      onClick={onExport}
      content={label}
    />
  )

  if (!tooltip) return button

  return <TooltipComponent title={tooltip}>{button}</TooltipComponent>
}
```

- [ ] **Step 5: Thêm vào barrel**

Thêm dòng cuối `src/components/index.ts`:

```ts
export { ExportCsvButton } from './ui/export-button/ExportCsvButton'
```

- [ ] **Step 6: Chạy test để chắc chắn nó pass**

Chạy: `npx vitest run src/components/ui/export-button/test/ExportCsvButton.test.tsx`
Kỳ vọng: PASS — 5 test.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/export-button src/components/index.ts src/components/icons/index.ts
git commit -m "feat(components): them ExportCsvButton dung chung"
```

---

### Task 6: Tab 4 — Đóng băng số dư

**Files:**
- Modify: `src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/hooks/useFetchFreeze.tsx` (trả thêm `accountId`)
- Modify: `src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/FreezeBalance.tsx:17` (thay nút rỗng)

**Interfaces:**
- Consumes: `ExportCsvButton` (Task 5), `useExportCsv` (Task 4), `useExportFreezesMutation` + `ExportFreezesQuery` (Task 3).
- Produces: không có gì cho task sau.

Tab này làm trước vì đơn giản nhất (chỉ một tham số bắt buộc, chưa có form lọc) — dùng để kiểm chứng cả chuỗi service → hook → UI chạy thật.

- [ ] **Step 1: Trả `accountId` ra khỏi hook**

Trong `useFetchFreeze.tsx`, thêm `accountId: id` vào object `return` (hook đã có `const { id } = useParams()` ở dòng 8, không thêm `useParams` lần hai trong component):

```ts
    return {
        accountId: id,
        dataFreeze,
        isLoadingGetFreeze,
        // ... giữ nguyên phần còn lại
```

- [ ] **Step 2: Gắn nút export vào `FreezeBalance.tsx`**

Thêm import:

```tsx
import { ButtonComponent, CardComponent, DialogModal, ExportCsvButton, Table } from '@components/index'
import { useExportCsv } from '@hooks/useExportCsv'
import { useExportFreezesMutation } from '@services/apiExportCsv'
```

(`ButtonComponent` chỉ giữ lại nếu còn chỗ khác dùng; nếu sau khi sửa không còn dùng thì bỏ khỏi import để không vướng lint.)

Thêm `accountId` vào **dòng destructure đã có** ở dòng 9 (không gọi `useFetchFreeze()` lần thứ hai):

```tsx
    const { accountId, dataFreeze, isLoadingGetFreeze, dataSource, page, setPage, setPageSize, size, isUnfreezeModalOpen, selectedFreezeItem, handleOpenUnfreezeModal, handleCloseUnfreezeModal } = useFetchFreeze()
```

Ngay dưới đó, thêm hook export:

```tsx
    const [triggerExport, { reset: resetExport }] = useExportFreezesMutation()
    const { exportFile, isExporting } = useExportCsv({
        trigger: triggerExport,
        reset: resetExport,
        filenamePrefix: 'dong-bang-so-du'
    })
```

Thay dòng 17:

```tsx
                        <ExportCsvButton
                            onExport={() => exportFile({ accountId: accountId ?? '' })}
                            loading={isExporting}
                            disabled={!accountId}
                        />
```

- [ ] **Step 3: Kiểm tra TypeScript + test hồi quy**

Chạy: `npx tsc --noEmit && npm run test`
Kỳ vọng: không lỗi type, toàn bộ test pass.

- [ ] **Step 4: Kiểm tra bằng mắt trên app đang chạy**

Chạy: `npm run dev`, mở màn Chi tiết ví → tab **Đóng băng số dư**, bấm **Xuất CSV**.
Kỳ vọng: nút hiện spinner (KHÔNG có overlay xám toàn màn), file `.csv` được tải về, toast xanh "Đã tải file CSV". Mở file bằng Excel: tiếng Việt hiển thị đúng dấu.

- [ ] **Step 5: Commit**

```bash
git add src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/FreezeBalance.tsx \
        src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/hooks/useFetchFreeze.tsx
git commit -m "feat(wallet-detail): xuat CSV cho tab dong bang so du"
```

---

### Task 7: Tab 2 — Thẻ/TK ngân hàng

**Files:**
- Modify: `src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/AccountBank.tsx` (interface `Props` dòng 13-18, thân component, nút dòng 89)
- Modify: `src/pages/wallet-administration/e-walletManagement/constants/TabDetail.constant.tsx:22-23` (truyền `walletAccountId`)

**Interfaces:**
- Consumes: `ExportCsvButton` (Task 5), `useExportCsv` (Task 4), `useExportBankLinksMutation` (Task 3).
- Produces: `AccountBank` có thêm prop bắt buộc `walletAccountId: string`.

**Bối cảnh quan trọng:** endpoint export là `/wallet/accounts/{id}/bank-links/export` với `id` = **id của ví** (`accountData.id`), khác với `userId` (= `accountData.ownerId`) mà bảng đang dùng để tra danh sách. Endpoint export **không nhận filter** → file luôn là toàn bộ liên kết của ví, cần tooltip nói rõ.

- [ ] **Step 1: Thêm prop `walletAccountId`**

Trong `AccountBank.tsx`, sửa interface và tham số:

```tsx
interface Props {
  userId: string
  /** Id của ví — endpoint export lấy theo ví, không phải theo user. */
  walletAccountId: string
  onUpdateBankLink?: (bankLink: BankLink) => void
  onUnlinkBankLink?: (bankLink: BankLink) => void
  onApproveBankLink?: (bankLink: BankLink) => void
}

const AccountBank = ({
  userId,
  walletAccountId,
  onUpdateBankLink,
  onUnlinkBankLink,
  onApproveBankLink
}: Props) => {
```

- [ ] **Step 2: Gắn hook export**

Thêm import:

```tsx
import { ButtonComponent, CardComponent, ExportCsvButton, Table } from '@components/index'
import { useExportCsv } from '@hooks/useExportCsv'
import { useExportBankLinksMutation } from '@services/apiExportCsv'
```

(Bỏ `ButtonComponent` khỏi import nếu sau khi thay nút không còn chỗ nào dùng.)

Sau khối `usePagination`, thêm:

```tsx
  const [triggerExport, { reset: resetExport }] = useExportBankLinksMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'lien-ket-ngan-hang'
  })
```

- [ ] **Step 3: Thay nút ở dòng 89**

```tsx
            <ExportCsvButton
              onExport={() => exportFile({ walletAccountId })}
              loading={isExporting}
              disabled={!walletAccountId}
              tooltip='File xuất toàn bộ liên kết của ví, không áp dụng bộ lọc đang chọn'
            />
```

- [ ] **Step 4: Truyền `walletAccountId` từ map tab**

Trong `src/pages/wallet-administration/e-walletManagement/constants/TabDetail.constant.tsx`, sửa hai dòng của tab `'2'`:

```tsx
  '2': {
    'USER': (props: TabContentProps) => (
      <AccountBank
        userId={props.accountData?.ownerId ?? ''}
        walletAccountId={props.accountData?.id ?? ''}
      />
    ),
    'SYSTEM': (props: TabContentProps) => (
      <AccountBank
        userId={props.accountData?.ownerId ?? ''}
        walletAccountId={props.accountData?.id ?? ''}
      />
    ),
    'BUSINESS': (props: TabContentProps) => <AccountBankBusiness linkedBanks={props.linkedBanks} />
  },
```

- [ ] **Step 5: Kiểm tra TypeScript + test hồi quy**

Chạy: `npx tsc --noEmit && npm run test`
Kỳ vọng: không lỗi type (nếu còn chỗ nào render `<AccountBank>` mà thiếu prop mới, TS sẽ báo — sửa luôn), toàn bộ test pass.

- [ ] **Step 6: Kiểm tra bằng mắt**

Mở tab **Thẻ/TK Ngân hàng** → rê chuột vào nút thấy tooltip → bấm → file tải về, không có overlay toàn màn.

- [ ] **Step 7: Commit**

```bash
git add src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/AccountBank.tsx \
        src/pages/wallet-administration/e-walletManagement/constants/TabDetail.constant.tsx
git commit -m "feat(wallet-detail): xuat CSV cho tab the/tk ngan hang"
```

---

### Task 8: Tab 3 — Lịch sử giao dịch

**Files:**
- Modify: `src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/HistoryPayment.tsx`

**Interfaces:**
- Consumes: `ExportCsvButton` (Task 5), `useExportCsv` (Task 4), `useExportTransactionsMutation` + `ExportTransactionsQuery` (Task 3).
- Produces: không có gì cho task sau.

**Bối cảnh quan trọng:** bảng đọc `/wallet/journal/unified` (filter: `sourceDomain`, `paymentMethod`, `counterpartyUsername`, `transactionType`…), còn export đọc `/wallet/transactions` (filter: `type`, `status`, `transactionCode`, `username`, `fromDate`, `toDate`). Ba filter `sourceDomain` / `paymentMethod` / `counterpartyUsername` **không tồn tại** ở endpoint export → khi người dùng đang bật một trong ba, file sẽ rộng hơn bảng, phải cảnh báo bằng tooltip.

- [ ] **Step 1: Thêm import và hook**

Thêm vào đầu file:

```tsx
import { CardComponent, ExportCsvButton, Table } from '@components/index'
import { useExportCsv } from '@hooks/useExportCsv'
import {
  useExportTransactionsMutation,
  type ExportTransactionsQuery
} from '@services/apiExportCsv'
import { useMemo, useState } from 'react'
```

(Thay dòng `import React, { useState } from 'react'` hiện có.)

- [ ] **Step 2: Dựng tham số export từ bộ lọc đang chọn**

Thêm vào thân component, ngay sau `const { page, size, ... } = useFetchData(...)`:

```tsx
  const [triggerExport, { reset: resetExport }] = useExportTransactionsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'lich-su-giao-dich'
  })

  /** `/wallet/transactions/export` chỉ nhận các filter dưới đây. */
  const exportParams = useMemo<ExportTransactionsQuery>(() => ({
    ownerId,
    transactionCode: searchParams.transactionCode,
    status: searchParams.status,
    type: searchParams.transactionType,
    fromDate: searchParams.fromDate,
    toDate: searchParams.toDate
  }), [ownerId, searchParams])

  const hasUnsupportedFilter = Boolean(
    searchParams.sourceDomain ||
    searchParams.paymentMethod ||
    searchParams.counterpartyUsername
  )
```

- [ ] **Step 3: Thêm hàng tiêu đề chứa nút**

Đổi `CardComponent` thứ hai (đang bọc bảng) thành:

```tsx
      <CardComponent content={
        <>
          <div className='flex justify-between items-center mb-3'>
            <span className='font-medium text-gray-600 text-lg'>Lịch sử giao dịch</span>
            <ExportCsvButton
              onExport={() => exportFile(exportParams)}
              loading={isExporting}
              disabled={!ownerId}
              tooltip={
                hasUnsupportedFilter
                  ? 'File xuất không áp dụng bộ lọc Nguồn / Phương thức thanh toán / Người nhận'
                  : undefined
              }
            />
          </div>
          {isLoadingGetUnified ? (
            <SkeletonTable columns={column?.length || 5} rows={size || 5} />
          ) : (
            <Table
              scroll={{ x: 'max-content' }} size='small'
              bordered columns={column}
              dataSource={dataSourceUnified}
              pagination={{
                current: page,
                showSizeChanger: true,
                pageSize: size,
                total: dataUnified?.totalElements,
                onChange: (page, pageSize) => {
                  setPage(page)
                  setPageSize(pageSize)
                },
                showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
              }}
            />
          )}
        </>
      } />
```

- [ ] **Step 4: Kiểm tra TypeScript + test hồi quy**

Chạy: `npx tsc --noEmit && npm run test`
Kỳ vọng: không lỗi, toàn bộ test pass.

- [ ] **Step 5: Kiểm tra bằng mắt**

Mở tab **Lịch sử giao dịch** → lọc theo "Nguồn" → rê chuột vào nút thấy tooltip cảnh báo → bấm → file tải về.

- [ ] **Step 6: Commit**

```bash
git add src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/HistoryPayment.tsx
git commit -m "feat(wallet-detail): xuat CSV cho tab lich su giao dich"
```

---

### Task 9: Tab 5 — Cấu hình phí

**Files:**
- Create: `src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/components/FeeSettingCard.tsx`
- Modify: `src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/FeeSetting.tsx`

**Interfaces:**
- Consumes: `ExportCsvButton` (Task 5), `useExportCsv` (Task 4), `useExportApplicableFeeRulesMutation` (Task 3), `ApplicableFeeRuleExportQuery` (Task 3).
- Produces:
  ```ts
  // FeeSettingCard.tsx
  interface FeeSettingCardProps {
    children: ReactNode
    totalRows?: number
    action?: ReactNode      // chỗ đặt nút export ở góc phải tiêu đề
  }
  export const FeeSettingCard: (props: FeeSettingCardProps) => JSX.Element
  export const FeeRulesEmptyState: () => JSX.Element
  ```

`FeeSetting.tsx` đang 179 dòng; thêm phần export sẽ vượt ngưỡng 200 dòng/component nên tách hai component trình bày ra file riêng cùng lúc.

- [ ] **Step 1: Tách `FeeSettingCard` và `FeeRulesEmptyState` sang file riêng**

Tạo `.../Personal/components/FeeSettingCard.tsx` — chuyển nguyên văn hai component từ `FeeSetting.tsx:27-66`, đổi sang named export và thêm prop `action`:

```tsx
import { CardComponent } from '@components/index'
import type { ReactNode } from 'react'

interface FeeSettingCardProps {
  children: ReactNode
  totalRows?: number
  /** Hành động ở góc phải tiêu đề (nút xuất CSV). */
  action?: ReactNode
}

export const FeeSettingCard = ({
  children,
  totalRows,
  action
}: FeeSettingCardProps) => (
  <CardComponent
    className='mt-3'
    content={
      <section aria-labelledby='applicable-fee-rules-title'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
          <h2
            id='applicable-fee-rules-title'
            className='text-base font-semibold text-foreground'
          >
            Quy tắc phí đang áp dụng
          </h2>
          <div className='flex items-center gap-3'>
            {totalRows !== undefined ? (
              <span className='text-xs text-muted-foreground'>
                {totalRows} dòng quy tắc
              </span>
            ) : null}
            {action}
          </div>
        </div>
        {children}
      </section>
    }
  />
)

export const FeeRulesEmptyState = () => (
  <div
    role='status'
    className='flex min-h-44 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-muted/30 px-4 text-center'
  >
    <p className='font-medium text-foreground'>
      Chưa có quy tắc phí đang áp dụng
    </p>
    <p className='text-sm text-muted-foreground'>
      Ví này chưa có quy tắc riêng hoặc quy tắc áp dụng chung phù hợp.
    </p>
  </div>
)
```

- [ ] **Step 2: Xoá hai component đó khỏi `FeeSetting.tsx` và import lại**

Xoá phần định nghĩa `FeeSettingCardProps`, `FeeSettingCard`, `FeeRulesEmptyState` (dòng 22-66 của bản gốc), thêm import:

```tsx
import { FeeRulesEmptyState, FeeSettingCard } from './components/FeeSettingCard'
```

- [ ] **Step 3: Gắn hook export và nút**

Thêm import:

```tsx
import { ExportCsvButton } from '@components/index'
import { useExportCsv } from '@hooks/useExportCsv'
import {
  useExportApplicableFeeRulesMutation
} from '@/app/services/apiExportCsv'
import type { ApplicableFeeRuleExportQuery } from '@/app/schemas/applicable-fee-rule.schema'
```

Trong `FeeSetting`, sau khối `useGetApplicableFeeRulesQuery`:

```tsx
  const [triggerExport, { reset: resetExport }] = useExportApplicableFeeRulesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'cau-hinh-phi'
  })

  const exportParams: ApplicableFeeRuleExportQuery = {
    merchantId: walletId,
    feeDomain: 'EWALLET'
  }

  const exportButton = (
    <ExportCsvButton
      onExport={() => exportFile(exportParams)}
      loading={isExporting}
      disabled={!walletId || (data?.totalElements ?? 0) === 0}
    />
  )
```

- [ ] **Step 4: Đưa nút vào đúng nhánh trạng thái**

Giữ nguyên bốn nhánh sớm hiện có. Chỉ hai nhánh cuối nhận `action`:

```tsx
  if (dataSource.length === 0) {
    return (
      <FeeSettingCard totalRows={data?.totalElements ?? 0} action={exportButton}>
        <FeeRulesEmptyState />
      </FeeSettingCard>
    )
  }

  return (
    <FeeSettingCard totalRows={data?.totalElements} action={exportButton}>
      {/* giữ nguyên phần <Table ...> */}
    </FeeSettingCard>
  )
```

Nhánh `!parsedQuery.success`, `isLoading`, `isError` **không** truyền `action` — chưa có gì để xuất.

- [ ] **Step 5: Kiểm tra TypeScript + test hồi quy**

Chạy: `npx tsc --noEmit && npm run test`
Kỳ vọng: không lỗi, toàn bộ test pass.

- [ ] **Step 6: Kiểm tra bằng mắt — chú ý riêng tab này**

Mở tab **Cấu hình phí** → bấm **Xuất CSV**.
- Nếu file tải về: xong.
- Nếu toast báo lỗi 404/400: endpoint `/fee/applicable-rules/export` chưa có trên môi trường đang chạy hoặc tên query param khác giả định (spec OpenAPI dev ngày 2026-08-15 chưa khai endpoint này). **Dừng lại, báo người dùng, không tự đoán tên tham số khác.** Mở DevTools → tab Network, chụp lại URL và response để hỏi backend.

- [ ] **Step 7: Commit**

```bash
git add src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/FeeSetting.tsx \
        src/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/components/FeeSettingCard.tsx
git commit -m "feat(wallet-detail): xuat CSV cho tab cau hinh phi"
```

---

### Task 10: Rà soát cuối

**Files:** không tạo mới.

- [ ] **Step 1: Chạy toàn bộ kiểm tra**

Chạy: `npx tsc --noEmit && npm run lint && npm run test && npm run build`
Kỳ vọng: cả bốn lệnh pass. (Nếu `npm run lint` chưa có trong `package.json` thì bỏ qua lệnh đó.)

- [ ] **Step 2: Rà lại bốn tab trên trình duyệt một lượt**

Với mỗi tab 2/3/4/5: bấm export → nút spinner, không overlay toàn màn → file `.csv` tải về → mở bằng Excel thấy tiếng Việt đúng dấu.

- [ ] **Step 3: Kiểm tra không lọt phạm vi**

Chạy: `git diff main --stat`
Kỳ vọng: **không** có file nào trong `components/detail-infor/business/` (nhánh BUSINESS ngoài phạm vi đợt này).

- [ ] **Step 4: Đánh dấu spec đã hiện thực hoá**

Thêm dòng ngay dưới tiêu đề `docs/superpowers/specs/2026-08-15-wallet-detail-csv-export-design.md`:

```markdown
> **Trạng thái:** đã hiện thực hoá — xem `docs/superpowers/plans/2026-08-15-wallet-detail-csv-export.md`.
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-08-15-wallet-detail-csv-export-design.md
git commit -m "docs: danh dau spec xuat CSV da hien thuc hoa"
```
