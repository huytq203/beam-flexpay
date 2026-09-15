# Plan: Hiện chủ thể được áp dụng trong cột "Đối tượng áp dụng" (danh sách chính sách phí)

Ngày: 2026-09-15. Phạm vi: bounded — chỉ cột "Đối tượng áp dụng" ở
`src/pages/fee-management/fee-policy-list/`. Ghép với BE fee đã xong
(`flexpay.fee/docs/superpowers/plans/2026-09-15-applied-target-subjects.md`).

## BE đã trả (không đổi param search)

```json
{ "type": "ACCOUNT", "code": null, "count": 1, "subjectCount": 1,
  "subjects": [ { "subjectType": "USER", "subjectId": "u-1", "displayName": "0912345678" } ] }
{ "type": "CUSTOMER_GROUP", "code": "VIP", "count": 2, "subjectCount": 1340,
  "subjects": [ /* ≤5 thành viên */ ] }
{ "type": "ALL", "code": null, "count": 1, "subjectCount": 0, "subjects": [] }
```
- `subjects` tối đa **5** phần tử; `subjectCount` là tổng thật.
- `displayName` là SĐT/username, chỉ có cho `subjectType = USER`; `MERCHANT` luôn `null`.
  Có thể `null` cả với USER khi user-wallet lỗi → fallback `subjectId`.
- BE cũ (chưa deploy) có thể thiếu 2 trường này → FE phải chịu `undefined`.

## Quyết định

1. Tag giữ nguyên nhãn hiện tại (`Tất cả` / `<tên phân khúc>` / `N ví riêng`) để không vỡ
   test và thói quen người dùng. Thông tin chủ thể đưa vào **tooltip** khi hover tag
   (dùng `TooltipComponent` sẵn có), chỉ khi `subjects.length > 0`.
2. Nội dung tooltip: mỗi dòng một chủ thể = `displayName ?? subjectId`; với `MERCHANT`
   thêm tiền tố `Merchant · `. Nếu `subjectCount > subjects.length` thêm dòng cuối
   `… và {subjectCount - subjects.length} chủ thể khác`.
3. Riêng `ACCOUNT` có **đúng 1** chủ thể có `displayName`: hiện thẳng trong tag
   `Ví riêng · 0912345678` (không cần hover). Nhiều hơn 1 → giữ `N ví riêng` + tooltip.
4. `ALL` không có tooltip.

## Các bước

### 1. Type — `src/app/types/fee.type.ts`
```ts
export interface AppliedSubject {
  subjectType: 'USER' | 'MERCHANT'
  subjectId: string
  displayName: string | null
}
export interface AppliedTarget {
  type: 'ALL' | 'CUSTOMER_GROUP' | 'ACCOUNT'
  code: string | null
  count: number
  /** Tổng chủ thể thật; BE cũ có thể chưa trả. */
  subjectCount?: number
  /** Tối đa 5 chủ thể để xem nhanh; BE cũ có thể chưa trả. */
  subjects?: AppliedSubject[]
}
```

### 2. Helper thuần — `src/pages/fee-management/fee-policy-list/utils/appliedTarget.ts` (mới)
- `getAppliedTargetLabel(target, customerSegmentNames)` — chuyển từ column file sang, bổ sung
  nhánh quyết định 3.
- `getAppliedSubjectLines(target): string[]` — dựng mảng dòng cho tooltip theo quyết định 2;
  trả `[]` khi `ALL`, khi `subjects` rỗng/undefined.
- Không phụ thuộc React để test đơn vị nhanh.

### 3. Column — `FeePolicyList.column.tsx`
- Import helper; bỏ `getAppliedTargetLabel` nội bộ.
- Render mỗi tag: nếu `lines.length > 0` bọc `<TooltipComponent title={<div>…mỗi dòng…</div>}>`;
  tag thêm `cursor-help`. Ngược lại giữ như cũ.

### 4. Test (vitest, viết trước)
- `test/appliedTarget.util.test.ts` (mới): label ACCOUNT 1 chủ thể có tên → `Ví riêng · 0912…`;
  1 chủ thể không tên → `1 ví riêng`; nhiều → `N ví riêng`; lines: USER dùng displayName,
  fallback subjectId, MERCHANT có tiền tố, dòng "… và N chủ thể khác" đúng số, ALL → `[]`,
  `subjects` undefined → `[]`.
- Bổ sung vào `test/FeePolicyAppliedTarget.test.tsx`: thêm 1 policy ACCOUNT có 1 subject
  với `displayName`, assert tag `Ví riêng · 0912345678`; hover tag phân khúc `Khách hàng VIP`
  (có `subjects` + `subjectCount: 7`) → thấy tên thành viên và dòng `… và 2 chủ thể khác`.
  Giữ nguyên các assert cũ (`2 ví riêng` v.v.) — policy `policy-account` hiện có **không**
  thêm `subjects`, để cover nhánh BE cũ.

### 5. Xác minh
```bash
npm run lint
npm run test -- fee-policy-list
```
Cả hai xanh. **Không commit.** Không đụng các file đang sửa dở ở `fee-management-v4/`.
