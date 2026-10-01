# Merchant User: Gửi lại liên kết kích hoạt (FE) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm thao tác "Gửi lại liên kết kích hoạt" cho User Merchant `PENDING` trên màn Danh sách User Merchant.

**Architecture:** Thêm một mutation RTK Query vào `merchantAccessApi`, một mục quyền `resendActivation` trong registry, một dialog xác nhận theo mẫu `UserResetPasswordDialog`, một nút trong `merchantUser.columns.tsx` và state/hộp thoại trong `MerchantUserListPage.tsx`.

**Tech Stack:** React, TypeScript, RTK Query, Vitest + Testing Library + MSW, Prettier 3.6.2.

**Spec:** `docs/superpowers/specs/2026-10-01-merchant-user-resend-activation-design.md`

## Global Constraints

- Repo: `/home/huytq/code/beam/fe/ewallet-cms-web`. Chạy lệnh từ thư mục gốc repo.
- **KHÔNG `git commit`, không push, không `git add`, không `git checkout/restore/stash`.** Cây làm việc có sẵn nhiều thay đổi chưa commit của người dùng (ví dụ `src/app/permissions/registry.ts`, `src/app/services/merchantAccessApi.ts`, và các file test). Chỉ **thêm** vào các file đó, tuyệt đối không xoá hay sửa dòng có sẵn.
- Tuân theo `AGENTS.md`: Prettier (`npx -y prettier@3.6.2 --write` rồi `--check` trên đúng các file đã sửa/tạo), mỗi file `.ts/.tsx` của tính năng tối đa 300 dòng sau format, kiểm tra bằng `node scripts/check-feature-lines.mjs src/pages/merchant-management/merchant-access`.
- Dữ liệu qua service/API thật; fixture và MSW chỉ trong test. Dùng component wrapper hiện có (`DialogModal`, `feedback`, `AccessActionButton`, `Can`).
- Văn bản hiển thị cho người dùng bằng tiếng Việt; tên biến, hàm, tên file bằng tiếng Anh theo mẫu sẵn có; mô tả `describe/it` của test bằng tiếng Việt như các test cùng thư mục.
- Baseline đã ghi nhận: `yarn typecheck` sạch; `yarn vitest run src/pages/merchant-management/merchant-access` có 6 file, 21 test, tất cả xanh.

## Review Focus

1. Người dùng **thiếu quyền** `MERCHANT_USER_CREATE` thì không thấy nút, dù User đang `PENDING` (Task 1).
2. User `ACTIVE` và `LOCKED` **không** có nút gửi lại kích hoạt (Task 1).
3. Lỗi "không còn PENDING" giữ hộp thoại mở và báo đúng nguyên nhân; lỗi khác báo chung (Task 1).

---

## Task 1: Nút, hộp thoại và API gửi lại liên kết kích hoạt

**Files:**
- Modify: `src/app/services/merchantAccessApi.ts` (chỉ thêm)
- Modify: `src/app/permissions/registry.ts` (chỉ thêm 1 dòng)
- Create: `src/pages/merchant-management/merchant-access/components/UserResendActivationDialog.tsx`
- Modify: `src/pages/merchant-management/merchant-access/columns/merchantUser.columns.tsx`
- Modify: `src/pages/merchant-management/merchant-access/pages/MerchantUserListPage.tsx`
- Test (create): `src/pages/merchant-management/merchant-access/test/merchantUserResendActivation.test.tsx`

**Interfaces:**
- Consumes: `PERMISSION.MERCHANT_USER_CREATE`, `feedback`, `DialogModal`, `AccessActionButton`, `Can`, `EnvelopeIcon` từ `@components/icons`, `renderPage` từ `./merchantAccess.setup`.
- Produces:
  - `useResendMerchantUserActivationMutation` (arg: `string` là id User; trả `MerchantUserDto`).
  - Hành động quyền `MERCHANT_USER.actions.resendActivation`.
  - Prop `onResendActivation: (user: MerchantUser) => void` của hàm tạo cột trong `merchantUser.columns.tsx`.

- [ ] **Step 1: Viết test thất bại**

Tạo `test/merchantUserResendActivation.test.tsx`:

```tsx
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { feedback } from '@components/index'
import { renderPage } from './merchantAccess.setup'

const permissions = [
  PERMISSION.MERCHANT_USER_VIEW,
  PERMISSION.MERCHANT_USER_CREATE
]

const usersResponse = () =>
  HttpResponse.json({
    data: {
      content: [
        {
          id: 'pending',
          fullName: 'User Pending',
          email: 'pending@example.com',
          status: 'PENDING',
          merchantIds: []
        },
        {
          id: 'active',
          fullName: 'User Active',
          email: 'active@example.com',
          status: 'ACTIVE',
          merchantIds: []
        },
        {
          id: 'locked',
          fullName: 'User Locked',
          email: 'locked@example.com',
          status: 'LOCKED',
          merchantIds: []
        }
      ],
      totalElements: 3,
      number: 0,
      size: 20
    }
  })

const resendLabel = (name: string) =>
  `Gửi lại liên kết kích hoạt User ${name}`

describe('gửi lại liên kết kích hoạt Merchant User', () => {
  it('chỉ hiện thao tác cho User đang chờ kích hoạt khi có quyền tạo', async () => {
    server.use(http.get('*/merchant-users', usersResponse))
    renderPage('/secure-panel/merchant/user', permissions)
    expect(await screen.findByText('User Pending')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: resendLabel('User Pending') })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: resendLabel('User Active') })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: resendLabel('User Locked') })
    ).not.toBeInTheDocument()
  })

  it('không hiện thao tác khi thiếu quyền tạo', async () => {
    server.use(http.get('*/merchant-users', usersResponse))
    renderPage('/secure-panel/merchant/user', [PERMISSION.MERCHANT_USER_VIEW])
    expect(await screen.findByText('User Pending')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: resendLabel('User Pending') })
    ).not.toBeInTheDocument()
  })

  it('xác nhận gọi đúng API và báo đã tiếp nhận', async () => {
    const successSpy = vi
      .spyOn(feedback, 'success')
      .mockImplementation(() => {})
    const resendCalled = vi.fn()
    server.use(
      http.get('*/merchant-users', usersResponse),
      http.post('*/merchant-users/pending/resend-activation', () => {
        resendCalled()
        return HttpResponse.json({
          data: {
            id: 'pending',
            fullName: 'User Pending',
            email: 'pending@example.com',
            status: 'PENDING'
          }
        })
      })
    )
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', permissions)
    await user.click(
      await screen.findByRole('button', { name: resendLabel('User Pending') })
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Xác nhận gửi lại liên kết kích hoạt'
    })
    await user.click(within(dialog).getByRole('button', { name: 'Gửi liên kết' }))
    await waitFor(() => expect(resendCalled).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(successSpy).toHaveBeenCalledWith(
        expect.stringContaining('Đã tiếp nhận yêu cầu gửi lại liên kết')
      )
    )
    successSpy.mockRestore()
  })

  it('báo đúng nguyên nhân khi User không còn chờ kích hoạt', async () => {
    const errorSpy = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    server.use(
      http.get('*/merchant-users', usersResponse),
      http.post('*/merchant-users/pending/resend-activation', () =>
        HttpResponse.json(
          {
            message: 'DUPLICATE_FIELD_VALUE',
            detail: 'Activation can only be resent for a pending user',
            success: false,
            status: '3006'
          },
          { status: 400 }
        )
      )
    )
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', permissions)
    await user.click(
      await screen.findByRole('button', { name: resendLabel('User Pending') })
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Xác nhận gửi lại liên kết kích hoạt'
    })
    await user.click(within(dialog).getByRole('button', { name: 'Gửi liên kết' }))
    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'chỉ có thể gửi lại liên kết kích hoạt cho User đang chờ kích hoạt'
        )
      )
    )
    expect(dialog).toBeInTheDocument()
    errorSpy.mockRestore()
  })
})
```

- [ ] **Step 2: Chạy test cho FAIL**

Run: `yarn vitest run src/pages/merchant-management/merchant-access/test/merchantUserResendActivation.test.tsx --maxWorkers=2`
Expected: FAIL (không thấy nút "Gửi lại liên kết kích hoạt ...").

- [ ] **Step 3: Thêm mutation**

Trong `src/app/services/merchantAccessApi.ts`, ngay sau khối `resetMerchantUserPassword` thêm (không sửa gì có sẵn):

```ts
    resendMerchantUserActivation: builder.mutation<MerchantUserDto, string>({
      query: (id) => ({
        url: `/merchant-users/${id}/resend-activation`,
        method: 'POST'
      }),
      extraOptions: { suppressErrorNotification: true },
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
```

và thêm `useResendMerchantUserActivationMutation,` vào danh sách export cuối file, ngay sau `useResetMerchantUserPasswordMutation,`.

- [ ] **Step 4: Thêm quyền**

Trong `src/app/permissions/registry.ts`, trong `MERCHANT_USER.actions`, thêm ngay sau dòng `resetPassword: PERMISSION.MERCHANT_USER_RESET_PASSWORD,`:

```ts
      // Backend yêu cầu quyền tạo cho thao tác gửi lại liên kết kích hoạt.
      resendActivation: PERMISSION.MERCHANT_USER_CREATE,
```

- [ ] **Step 5: Tạo dialog**

Tạo `components/UserResendActivationDialog.tsx`:

```tsx
import { useResendMerchantUserActivationMutation } from '@/app/services/merchantAccessApi'
import { DialogModal, feedback } from '@components/index'
import type { MerchantUser } from '../types/merchantAccess.types'

interface Props {
  user: MerchantUser
  onClose: () => void
}

const isNotPendingError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object' || !('data' in error)) return false
  const data = error.data
  return Boolean(
    data &&
      typeof data === 'object' &&
      'detail' in data &&
      data.detail === 'Activation can only be resent for a pending user'
  )
}

export function UserResendActivationDialog({ user, onClose }: Props) {
  const [resendActivation, { isLoading }] =
    useResendMerchantUserActivationMutation()
  const confirmResend = async (): Promise<void> => {
    try {
      await resendActivation(user.id).unwrap()
      feedback.success(
        'Đã tiếp nhận yêu cầu gửi lại liên kết kích hoạt. Liên kết cũ sẽ hết hiệu lực khi liên kết mới được gửi.'
      )
      onClose()
    } catch (error) {
      feedback.error(
        isNotPendingError(error)
          ? 'Trạng thái User đã thay đổi: chỉ có thể gửi lại liên kết kích hoạt cho User đang chờ kích hoạt. Hãy làm mới danh sách.'
          : 'Không thể gửi lại liên kết kích hoạt. Vui lòng thử lại.'
      )
    }
  }
  return (
    <DialogModal
      open
      title='Xác nhận gửi lại liên kết kích hoạt'
      okText='Gửi liên kết'
      okButtonProps={{ loading: isLoading }}
      onCancel={() => onClose()}
      onOk={() => void confirmResend()}
    >
      <div className='space-y-3 text-sm text-foreground'>
        <p>
          Gửi lại liên kết kích hoạt tài khoản cho <strong>{user.name}</strong> (
          {user.email})?
        </p>
        <p className='text-muted-foreground'>
          Liên kết cũ sẽ không còn dùng được khi liên kết mới được gửi.
        </p>
      </div>
    </DialogModal>
  )
}
```

- [ ] **Step 6: Thêm nút vào cột**

Trong `columns/merchantUser.columns.tsx`:
- thêm `EnvelopeIcon` vào danh sách import từ `@components/icons` (giữ thứ tự hiện có, thêm vào cuối);
- thêm vào interface props của hàm tạo cột, cạnh `onResetPassword: (user: MerchantUser) => void`:

```ts
  onResendActivation: (user: MerchantUser) => void
```

- thêm `onResendActivation,` vào danh sách tham số destructure, cạnh `onResetPassword,`;
- ngay **trước** khối `{user.status !== 'PENDING' && (` (khoá/mở khoá) thêm:

```tsx
        {user.status === 'PENDING' && (
          <Can
            screen='MERCHANT_USER'
            action='resendActivation'
          >
            <AccessActionButton
              icon={
                <EnvelopeIcon
                  aria-hidden
                  size={15}
                />
              }
              label={`Gửi lại liên kết kích hoạt User ${user.name}`}
              onClick={() => onResendActivation(user)}
            />
          </Can>
        )}
```

Nếu `EnvelopeIcon` không nhận prop `size` như `KeyIcon` thì dùng prop mà `KeyIcon` đang dùng; nếu `EnvelopeIcon` chưa được export từ `@components/icons`, dùng `MailOutlined` (đã có trong `index.ts`) và bỏ `size`.

- [ ] **Step 7: Nối vào trang**

Trong `pages/MerchantUserListPage.tsx`:
- import `UserResendActivationDialog` cạnh `UserResetPasswordDialog`;
- thêm state cạnh `resetUser`: `const [resendUser, setResendUser] = useState<MerchantUser | null>(null)`;
- thêm `onResendActivation: setResendUser,` vào object truyền cho hàm tạo cột (cạnh `onResetPassword: setResetUser,`);
- ngay sau khối render `UserResetPasswordDialog` thêm:

```tsx
      {resendUser && (
        <UserResendActivationDialog
          user={resendUser}
          onClose={() => setResendUser(null)}
        />
      )}
```

Nếu có file khác (test hoặc component) cũng gọi hàm tạo cột này, thêm `onResendActivation: () => {}` hoặc truyền đúng handler theo nơi đó để `yarn typecheck` xanh.

- [ ] **Step 8: Format và kiểm tra**

Chạy trên đúng các file đã sửa/tạo:

```bash
FILES="src/app/services/merchantAccessApi.ts src/app/permissions/registry.ts \
  src/pages/merchant-management/merchant-access/components/UserResendActivationDialog.tsx \
  src/pages/merchant-management/merchant-access/columns/merchantUser.columns.tsx \
  src/pages/merchant-management/merchant-access/pages/MerchantUserListPage.tsx \
  src/pages/merchant-management/merchant-access/test/merchantUserResendActivation.test.tsx"
npx -y prettier@3.6.2 --write $FILES && npx -y prettier@3.6.2 --check $FILES
yarn eslint $FILES
node scripts/check-feature-lines.mjs src/pages/merchant-management/merchant-access
yarn typecheck
yarn vitest run src/pages/merchant-management/merchant-access src/app --maxWorkers=2
```

Expected: Prettier `--check` xanh; ESLint không lỗi; kiểm tra số dòng thành công; `yarn typecheck` sạch; mọi test xanh, gồm 4 test mới (tổng tối thiểu 25 test ở thư mục merchant-access). Nếu `prettier --write` đổi các dòng có sẵn của file có thay đổi chưa commit của người dùng (`registry.ts`, `merchantAccessApi.ts`), kiểm bằng `git diff` rằng chỉ có phần thêm của task này bị đổi; nếu Prettier định dạng lại các dòng cũ, hoàn tác riêng phần định dạng đó (không chạy `git checkout` cả file) và báo lại.

- [ ] **Step 9: Dừng — không commit.** Báo cáo danh sách file, kết quả từng lệnh ở Step 8.
