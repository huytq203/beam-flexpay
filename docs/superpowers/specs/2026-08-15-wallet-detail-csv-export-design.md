# Thiết kế: Xuất CSV cho các tab màn Chi tiết ví

> **Trạng thái:** đã hiện thực hoá — xem `docs/superpowers/plans/2026-08-15-wallet-detail-csv-export.md`.

**Ngày:** 2026-08-15
**Phạm vi:** `src/pages/wallet-administration/e-walletManagement/` — tab 2 (Thẻ/TK ngân hàng), 3 (Lịch sử giao dịch), 4 (Đóng băng số dư), 5 (Cấu hình phí) của `DetailUser.tsx`, nhánh `ownerType` = `USER` / `SYSTEM`.
**Mục tiêu:** mỗi tab có một nút tải file CSV do backend sinh, dùng chung một lớp tải file duy nhất.

---

## 1. Bối cảnh

Ba tab đã có sẵn nút `<ButtonComponent content='Xuất Excel' />` **không gắn handler**:

| Tab | File | Dòng |
|---|---|---|
| 2 | `components/detail-infor/Personal/AccountBank.tsx` | 89 |
| 4 | `components/detail-infor/Personal/FreezeBalance.tsx` | 17 |
| 5 | `components/detail-infor/Personal/FeeSetting.tsx` | — (chưa có nút) |
| 3 | `components/detail-infor/Personal/HistoryPayment.tsx` | — (chưa có nút) |

Dự án chưa có bất kỳ luồng tải file nào: `grep` toàn `src/` không tìm thấy chỗ nào xử lý `Blob` / `download` / `Content-Disposition`. Vì vậy đây là lớp hạ tầng mới, không phải sửa cái đang có.

## 2. Đối chiếu OpenAPI (đã fetch từ môi trường dev ngày 2026-08-15)

Nguồn: `https://api.dev.ewallet.flexpay.vn/wallet-core/api-docs` và `/fee/api-docs`.

| Tab | Endpoint | Trạng thái trong spec |
|---|---|---|
| 2 | `GET /wallet/accounts/{id}/bank-links/export` | Có. **Chỉ nhận `id` (uuid, path), không nhận bất kỳ query filter nào** |
| 3 | `GET /wallet/transactions/export` | Có. `ownerId` (uuid, **bắt buộc**) + `type`, `status`, `transactionCode`, `idempotencyKey`, `username`, `fromDate`, `toDate`, `successFrom`, `successTo`, `frozen` |
| 4 | `GET /wallet/freezes/export` | Có. `accountId` (uuid, **bắt buộc**) + `type`, `status`, `displayStatus`, `releaseType`, `username`, `fromDate`, `toDate` |
| 5 | `GET /fee/applicable-rules/export` | **Không có trong spec fee dev** (40 path, chỉ có `/fee/applicable-rules`). Đã fetch lại kèm cache-bust, kết quả không đổi |

Cả 3 endpoint wallet-core khai báo response `content: */*`, `schema: {type: string, format: binary}`, summary ghi rõ *"Export … to CSV"* → file trả về là **CSV**, không phải Excel.

Base URL trong `.env` đã bao gồm `/api/v1/admin`, nên đường dẫn dùng trong code là phần sau tiền tố đó.

## 3. Quyết định đã chốt

| # | Quyết định | Lý do |
|---|---|---|
| 1 | Tab 5 **ghép luôn, nút bật bình thường** | Người dùng xác nhận backend đã deploy dù spec dev chưa cập nhật. Query param giả định giống endpoint list: `merchantId`, `feeDomain`, `customerGroup` |
| 2 | Tab 3 gửi `ownerId` + **các filter trùng nghĩa**, bỏ filter export không hỗ trợ | Bảng đọc `/wallet/journal/unified`, export đọc `/wallet/transactions` — hai tập filter khác nhau, không thể khớp 100% |
| 3 | Nhãn nút đổi thành **"Xuất CSV"** | Đúng định dạng backend trả về, tránh khiếu nại lỗi font/định dạng khi mở bằng Excel |
| 4 | Chỉ làm nhánh `USER` / `SYSTEM` | `BUSINESS` (`AccountBankBusiness`, `FreezeBalanceBusiness`, `FeeSettingBusiness`) để đợt sau; component export viết dùng chung nên ghép thêm rất nhanh |
| 5 | Tải file qua `queryFn` + base query có sẵn, **không dùng `fetch` thuần** | Giữ luồng auto-refresh token 401 trong `createCustomBaseQuery`. Access token sống 300s, người dùng mở trang lâu rồi bấm export gặp 401 là kịch bản thường gặp |
| 6 | Dùng `build.mutation` chứ không `build.query` | File không phải server state để cache/refetch; mutation không tự chạy lại, không giữ Blob trong cache theo `keepUnusedDataFor` |

## 4. Kiến trúc

```
src/app/utils/file-download.ts                  # parse filename + lưu blob (thuần, không React)
src/app/utils/test/file-download.test.ts
src/app/services/apiExportCsv.ts                # 4 endpoint mutation
src/app/hooks/useExportCsv.ts                   # state + notification + gọi util
src/app/hooks/test/useExportCsv.test.tsx
src/components/ui/export-button/ExportCsvButton.tsx
src/components/ui/export-button/test/ExportCsvButton.test.tsx
```

Bốn lớp tách rời: **service** chỉ biết HTTP → **util** chỉ biết Blob/DOM → **hook** ghép hai thứ đó + thông báo → **component** chỉ biết hiển thị. Đổi backend sang trả Excel chỉ chạm service; đổi cách lưu file chỉ chạm util.

### 4.1 `file-download.ts`

```ts
parseFilenameFromDisposition(header: string | null): string | null
buildFallbackFilename(prefix: string): string   // `<prefix>_<yyyyMMDD-HHmmss>.csv`
saveBlobAsFile(blob: Blob, filename: string): void
```

- `parseFilenameFromDisposition` đọc cả `filename*=UTF-8''<pct-encoded>` (ưu tiên) lẫn `filename="..."`; header rỗng/sai định dạng → trả `null` để nơi gọi tự quyết định fallback (service không cần biết tên nghiệp vụ của từng tab).
- `saveBlobAsFile` tạo object URL, gắn `<a download>`, click, rồi `revokeObjectURL` trong `setTimeout(0)`.
- **BOM UTF-8:** với file `.csv`, kiểm tra 3 byte đầu; nếu thiếu `EF BB BF` thì tạo blob mới có BOM trước khi lưu. Không có bước này Excel mở CSV tiếng Việt ra ký tự lỗi. Chỉ thêm khi thiếu nên không nhân đôi BOM nếu backend đã có.

### 4.2 `apiExportCsv.ts`

Theo đúng pattern `apiBankLink.ts:79` — `queryFn` gọi thẳng base query đã bọc:

```ts
async queryFn(params, queryApi, extraOptions) {
  const response = await fetchBaseQueryWalletCore(
    { url, method: 'GET', params, responseHandler: (res) => res.blob() },
    queryApi,
    extraOptions
  )
  if (response.error) return { error: await toApiError(response.error) }
  return {
    data: {
      blob: response.data as Blob,
      filename: parseFilenameFromDisposition(
        (response.meta as FetchBaseQueryMeta)?.response?.headers.get('content-disposition') ?? null
      )   // string | null — hook tự nối tên dự phòng
    }
  }
}
```

`toApiError`: khi lỗi, `responseHandler` cũng áp cho body lỗi nên `error.data` là `Blob` chứa JSON. Helper đọc `blob.text()` → `JSON.parse` → trả `{ status, data: { message } }`. Thiếu bước này thì `createCustomBaseQuery` (dòng 405/417 của `fetchBaseQueryCustom.ts`) đọc `errorData.message` trên một Blob → `undefined` → **lỗi im lặng, không có thông báo nào**.

Vì tầng `createCustomBaseQuery` không hiện được notification cho response binary, **hook là nơi duy nhất hiển thị lỗi export** → không sợ trùng thông báo.

| Endpoint mutation | URL | Tham số |
|---|---|---|
| `exportBankLinks` | `/wallet/accounts/{walletAccountId}/bank-links/export` | `walletAccountId` (path) |
| `exportTransactions` | `/wallet/transactions/export` | `ownerId` (bắt buộc), `type?`, `status?`, `transactionCode?`, `fromDate?`, `toDate?` |
| `exportFreezes` | `/wallet/freezes/export` | `accountId` (bắt buộc), `type?`, `status?`, `fromDate?`, `toDate?` |
| `exportApplicableFeeRules` | `/fee/applicable-rules/export` (base `fetchBaseQueryFee`) | `merchantId?`, `feeDomain?`, `customerGroup?` |

Tham số của tab 5 derive từ schema có sẵn thay vì khai lại:

```ts
export const applicableFeeRuleExportQuerySchema =
  applicableFeeRuleQuerySchema.omit({ page: true, size: true })
```

Ba endpoint wallet-core dùng interface thường (đồng bộ với `apiBankLink.ts`, `apiFreezes.ts` đang làm vậy).

Tất cả mutation đều **không khai `invalidatesTags`** — tải file không đổi dữ liệu server.

### 4.3 `useExportCsv.ts`

```ts
useExportCsv<TArgs>({ trigger, reset, filenamePrefix }): {
  exportFile: (args: TArgs) => Promise<void>
  isExporting: boolean
}
```

`trigger` và `reset` lấy từ mutation hook do nơi gọi truyền vào (`const [trigger, { reset }] = useExportFreezesMutation()`), nhờ vậy `useExportCsv` không phụ thuộc endpoint cụ thể. `filenamePrefix` là tiền tố tên file dự phòng, phần thời gian do hook tự nối.

- Chặn double-click bằng chính `isExporting` (không cần ref riêng vì nút cũng bị `disabled`).
- Thành công → `saveBlobAsFile` → `globalMessage.success('Đã tải file …')`.
- Lỗi → **không tự hiện thông báo**. `errorMiddleware` (`src/app/middleware/errorMiddleware.ts:118`) đã toast mọi action RTK Query bị `rejectedWithValue`; hook toast thêm sẽ ra hai thông báo chồng nhau. Hook chỉ nuốt lỗi (`try/catch`, không throw ra cây React) và tắt `isExporting`.
- Đây chính là lý do `toApiError` ở §4.2 bắt buộc phải có: `errorMiddleware.getErrorMessage` đọc `error.data.detail` / `.message`; nếu `error.data` còn là `Blob` thì nó rơi về câu mặc định *"Có lỗi xảy ra, vui lòng thử lại"*, mất hẳn message backend.
- Gọi `reset()` của mutation sau khi xong để Blob không nằm lại trong store.

### 4.4 `ExportCsvButton.tsx`

```tsx
interface ExportCsvButtonProps {
  onExport: () => void
  loading?: boolean
  disabled?: boolean
  label?: string      // mặc định 'Xuất CSV'
  tooltip?: string    // bọc TooltipComponent khi có
}
```

Bọc `ButtonComponent` (`type='default'`, icon `DownloadOutlined`) — không tự viết Button mới. Export thêm vào barrel `src/components/index.ts`.

## 5. Ghép vào từng tab

| Tab | File sửa | Nội dung |
|---|---|---|
| 2 | `AccountBank.tsx`, `constants/TabDetail.constant.tsx` | Thêm prop `walletAccountId: string`; `TAB_CONTENT_MAP['2']` truyền `props.accountData?.id` (hiện chỉ truyền `ownerId`). Thay nút dòng 89. Tooltip: *"File xuất toàn bộ liên kết của ví, không áp dụng bộ lọc đang chọn"*. `disabled` khi thiếu `walletAccountId` |
| 3 | `HistoryPayment.tsx` | Thêm hàng tiêu đề + nút phía trên `Table`. Map filter: `transactionCode→transactionCode`, `status→status`, `transactionType→type`, `fromDate/toDate` giữ nguyên, cộng `ownerId` (prop sẵn có). **Bỏ** `sourceDomain`, `paymentMethod`, `counterpartyUsername` — `/wallet/transactions/export` không có ba tham số này. Tooltip khi người dùng đang lọc bằng ba trường đó: *"File xuất không áp dụng bộ lọc Nguồn / Phương thức / Người nhận"* |
| 4 | `FreezeBalance.tsx` | Thay nút dòng 17; `accountId = useParams().id` (giống `hooks/useFetchFreeze.tsx:8`). Tab chưa có form lọc nên chỉ gửi `accountId` |
| 5 | `FeeSetting.tsx` | Thêm nút vào header của `FeeSettingCard` (cạnh dòng "N dòng quy tắc"); tham số `{ merchantId: walletId, feeDomain: 'EWALLET' }`. Nút chỉ render ở nhánh có dữ liệu; nhánh `isLoading` / `isError` / mã ví không hợp lệ không render nút, nhánh rỗng render nhưng `disabled` |

**Tên file dự phòng** khi không đọc được `Content-Disposition`: `<tiền-tố>_<yyyyMMDD-HHmmss>.csv` với tiền tố `lien-ket-ngan-hang`, `lich-su-giao-dich`, `dong-bang-so-du`, `cau-hinh-phi`. Dùng `dayjs` (đã là dependency).

## 6. Trạng thái & lỗi

Bảng dữ liệu của bốn tab **giữ nguyên** 4 trạng thái đang có, thiết kế này không đụng vào.

Riêng nút export có ba trạng thái:

| Trạng thái | Biểu hiện |
|---|---|
| Idle | Nút bình thường |
| Đang tải | `loading` + `disabled`, không có overlay toàn màn (xem §7) |
| Lỗi | Toast đỏ do `errorMiddleware` bắn ra với `message`/`detail` từ backend, nút trở lại idle. 403 vẫn đi theo luồng redirect sang màn `forbidden` sẵn có |

Không làm optimistic UI, không thanh phần trăm — backend trả một lượt, không có progress.

## 7. Loading overlay

`createCustomBaseQuery` gọi `showLoading()` cho mọi request không nằm trong `WHITE_LIST` → overlay toàn màn sẽ che luôn spinner của nút.

`WHITE_LIST` hiện chỉ so khớp URL bằng **tiền tố** (`cleanUrl.startsWith(item.requestUrl)`). Cách đó không dùng được ở đây: URL export của tab 2 là `/wallet/accounts/{id}/bank-links/export`, muốn phủ nó bằng tiền tố thì phải khai `/wallet/accounts`, mà tiền tố này **cũng phủ luôn `/wallet/accounts/{id}`** — chính là request tải dữ liệu ví của cả màn chi tiết (`apiWalletAccount.api.ts:18`). Làm vậy là xoá luôn overlay lúc mở màn.

Vì vậy `WhiteListItem` được bổ sung một cách so khớp thứ hai:

```ts
export interface WhiteListItem {
  pathname: string
  /** So khớp tiền tố URL. */
  requestUrl?: string
  /** So khớp hậu tố URL — dùng khi id nằm giữa đường dẫn. */
  requestUrlEndsWith?: string
  includeNestedPaths?: boolean
}
```

Cả 4 endpoint export đều kết thúc bằng `/export` nên chỉ cần **một** mục mới:

```ts
{
  pathname: WALLETADMINISTRATION + '/e-walletManagement',
  requestUrlEndsWith: '/export',
  includeNestedPaths: true
}
```

`isInWhiteList` nhận URL không kèm query string (`requestArgs.url`) nên `endsWith` an toàn.

Chọn cách này thay vì mẹo `params: { isLoading: false }` (đang dùng ở `apiFeePolicy.api.ts:39`) vì mẹo đó **gửi thừa query param `isLoading=false` lên backend**.

## 8. Kiểm thử (vitest)

| File | Case |
|---|---|
| `utils/test/file-download.test.ts` | `filename*=UTF-8''` có ký tự tiếng Việt; `filename="..."` thường; header `null` → trả `null`; `buildFallbackFilename` đúng định dạng; blob thiếu BOM → được thêm; blob có sẵn BOM → không thêm lần hai |
| `hooks/test/useExportCsv.test.tsx` | Thành công → gọi `saveBlobAsFile` đúng 1 lần + `globalMessage.success`; lỗi → **không** gọi `saveBlobAsFile`, **không** gọi `globalMessage.error` (để `errorMiddleware` lo), không throw; `isExporting` bật/tắt đúng |
| `services/test/apiExportCsv.test.ts` | Response CSV + `Content-Disposition` → trả đúng `{ blob, filename }`; response 400 kèm JSON lỗi → `error.data.message` là **object** đã parse chứ không phải `Blob` |
| `components/ui/export-button/test/ExportCsvButton.test.tsx` | Render nhãn mặc định "Xuất CSV"; `loading` → `disabled`; click gọi `onExport` đúng 1 lần |
| `configs/test/loadingWhitelist.test.ts` (mở rộng file có sẵn) | URL export ở màn chi tiết ví → whitelist; URL export ở màn khác → không; **`/wallet/accounts/{id}` vẫn KHÔNG bị whitelist** (chống hồi quy overlay lúc mở màn) |

Mock `URL.createObjectURL` / `revokeObjectURL` trong setup vì jsdom không có sẵn.

## 9. Rủi ro

| Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|
| `/fee/applicable-rules/export` chưa có trong spec dev | Tab 5 có thể trả 404, hoặc tên query param khác giả định | Nút vẫn bật theo yêu cầu; nếu dev trả 404/400 thì hỏi lại backend tên tham số. Lớp service tách riêng nên sửa một chỗ |
| `Content-Disposition` không nằm trong `Access-Control-Expose-Headers` | Request là cross-origin (base URL tuyệt đối) → `headers.get()` trả `null`, mất tên file backend đặt | Đã có fallback tên file phía client; nếu muốn tên chuẩn thì yêu cầu backend expose header |
| File rất lớn | Trình duyệt giữ toàn bộ trong RAM | Chấp nhận ở đợt này. Nếu backend hỗ trợ giới hạn khoảng thời gian thì bổ sung sau |
| File tab 3 rộng hơn bảng đang hiển thị | Người dùng nhầm | Tooltip cảnh báo khi đang bật ba filter không được hỗ trợ |

## 10. Ngoài phạm vi

- Nhánh `ownerType = BUSINESS` (3 nút "Xuất Excel" rỗng còn lại).
- Tab 1 (Thông tin chung) và tab 6 (Bảo mật) — không có endpoint export.
- Export phía client từ dữ liệu đang có trên bảng.
- Phân quyền cho nút export — dự án hiện chưa có cơ chế kiểm tra quyền ở tầng nút.
