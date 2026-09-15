# Plan: Họ tên chủ thể + ô tìm "Chủ thể áp dụng" (danh sách chính sách phí)

Ngày: 2026-09-15. Phạm vi: bounded — tiếp nối `2026-09-15-applied-target-subjects.md` (đã xong,
chưa commit). Chỉ đụng `src/pages/fee-management/fee-policy-list/` và `src/app/types/fee.type.ts`.

## BE (fee) đang làm song song — code theo đúng hợp đồng này, KHÔNG chờ

- `AppliedSubject` thêm `fullName: string | null` (họ tên từ eKYC; user chưa eKYC → null).
  `displayName` vẫn là SĐT/username, có thể null.
- Search thêm query param `subjectKeyword` (string, optional, ≤100 ký tự): lọc chính sách có bản gán
  **ví riêng (ACCOUNT)** trỏ tới user có **SĐT** khớp keyword (chốt 2026-09-15: không khớp họ tên). Không xét thành viên phân khúc.

## Quyết định

1. Nhãn chủ thể (dùng chung cho tag và tooltip):
   - có `fullName` và `displayName` → `Nguyễn Văn A · 0912345678`
   - chỉ `fullName` → `Nguyễn Văn A`
   - chỉ `displayName` → `0912345678`
   - cả hai null → `subjectId`
   - `MERCHANT` → tiền tố `Merchant · ` như hiện tại.
2. Tag ACCOUNT có đúng 1 chủ thể → `Ví riêng · <nhãn trên>` (mở rộng nhánh hiện có: trước chỉ
   xét `displayName`, giờ xét nhãn ghép; cả hai null thì giữ `1 ví riêng`).
3. Ô tìm mới trong `FeePolicyFilterBar`: `FormInput name='subjectKeyword'`, label
   **"SĐT ví riêng"**, placeholder "Nhập số điện thoại", `inputMode='tel'`, đặt sau ô "Tên chính sách". Lưới
   hiện 4 cột md:col-span-3 → đổi các ô thành `md:col-span-3` với 5 phần tử sẽ tràn; dùng
   `md:col-span-4` cho 2 ô input, `md:col-span-2` cho 2 select, còn `md:col-span-2` cho cụm nút
   (hoặc cách chia khác gọn hơn nếu lưới hiện có convention — giữ responsive 1 cột ở mobile).
4. `subjectKeyword` đi qua URL query như `keyword`/`appliedTarget` (xem `FeePolicyList.tsx` — mảng
   key ở ~dòng 25 và các chỗ map filters ~dòng 53/66/92/99/111), vào `FeePolicyListFilters`,
   `useFeePolicyList` gửi `subjectKeyword: filters.subjectKeyword || undefined`. Reset bộ lọc cũng
   xoá nó.

## Các bước

1. `fee.type.ts`: `AppliedSubject.fullName: string | null`.
2. `utils/appliedTarget.ts`: thêm `getAppliedSubjectName(subject): string` theo quyết định 1; dùng nó
   trong `getAppliedSubjectLines` và trong nhánh ACCOUNT-1-chủ-thể của `getAppliedTargetLabel`.
3. `FeePolicyFilterBar.tsx`: `FeePolicyFilterValues.subjectKeyword`, `syncedValues`, `reset`, ô input.
4. `FeePolicyList.tsx` + `hooks/useFeePolicyList.ts`: nối `subjectKeyword` URL → filters → params.
5. Test (vitest, viết trước):
   - `test/appliedTarget.util.test.ts`: 4 tổ hợp nhãn ở quyết định 1; tag `Ví riêng · Nguyễn Văn A ·
     0912345678`; tag khi cả hai null → `1 ví riêng`.
   - `test/FeePolicyAppliedTarget.test.tsx`: thêm case gõ "0912" vào ô "SĐT ví riêng", bấm Tìm →
     request cuối có `subjectKeyword=0912`; bấm "Đặt lại" (nút reset hiện có) → request không còn
     `subjectKeyword`. Các test cũ giữ nguyên xanh.
6. Xác minh
   ```bash
   npm run lint
   npm run test -- fee-policy-list
   ```
   Xanh cả hai. **Không commit.** Không đụng file ngoài phạm vi (đặc biệt `fee-config/`,
   `fee-management-v4/` đang có thay đổi dở của người khác).

## Cập nhật 2026-09-15 (sau khi code xong lượt 1)
- Đổi nhãn ô lọc từ "Chủ thể áp dụng" → **"SĐT ví riêng"**, placeholder "Nhập số điện thoại",
  `inputMode='tel'`. Cập nhật test đang dùng nhãn/keyword cũ. Nhãn hiển thị `fullName · SĐT` giữ nguyên.

## Cập nhật 2026-09-15 (lượt 2)
BE giờ khớp `subjectKeyword` cả với thành viên phân khúc (không thêm param). FE chỉ đổi chữ:
label **"SĐT người dùng"**, placeholder "Nhập số điện thoại", thêm `tooltip`/helper text ngắn nếu
`FormInput` hỗ trợ: "Khớp ví riêng hoặc phân khúc người đó thuộc về". Cập nhật test dùng nhãn cũ.
