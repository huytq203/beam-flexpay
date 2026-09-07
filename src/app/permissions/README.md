# Phân quyền

Mọi quyền của frontend được khai báo tại thư mục này. Không viết chuỗi mã quyền
ở nơi khác.

## Nguyên tắc gốc: khớp nguyên văn

FE **không ghép chuỗi và không suy diễn tiền tố**. Mã quyền là chuỗi BE cấp
trong claim `permissions` của access token, so khớp đúng từng ký tự.

`PERMISSION_EWALLET:FEE:APPROVE` và `EWALLET:FEE:APPROVE` là **hai quyền khác
nhau**. Có mã này không tự động có mã kia.

Ngoại lệ duy nhất là `SUPER_ADMIN_PERMISSION` — đi qua mọi kiểm tra, và bản thân
nó cũng chỉ là một chuỗi khai trong `permission-codes.ts`.

## Ba file

| File | Trách nhiệm |
| ---- | ----------- |
| `permission-codes.ts` | **Nguồn sự thật duy nhất** — liệt kê nguyên văn mọi mã quyền FE biết. Đổi mã thì sửa ở đây. |
| `registry.ts` | Mỗi màn khai `path` và bảng `actions` trỏ tới mã trong `PERMISSION`. |
| `access.ts` | Luật so khớp: `grants`, `grantsAny`, `grantsScreenAction`, `grantsScreenAccess`. |

Kiểu `PermissionCode` là union của đúng những mã đã khai, nên gõ sai một mã là
lỗi biên dịch chứ không phải lỗi runtime im lặng.

## Thêm màn mới

1. Nếu BE cấp mã chưa có, thêm vào `PERMISSION` trong `permission-codes.ts`.
2. Thêm entry vào `SCREENS` trong `registry.ts`, gồm `path` và `actions`.
3. Dùng `SCREENS.<id>.path` khi khai báo route trong `routes.ts`.
4. Trỏ item sidebar tới `screen: '<id>'` trong `Navigation.tsx`.

## Luật mở màn và mở hành động

Mọi screen luôn có sáu action chuẩn: `view`, `create`, `edit`, `delete`,
`update`, `full`. Action nghiệp vụ riêng như `approve` hoặc `assignRoles` được
khai báo bổ sung trên screen tương ứng.

- **Mở hành động** (`Can`, `useScreenAccess().can`): có đúng mã của hành động đó,
  hoặc có mã mà chính màn khai ở `actions.full`.
- **Mở màn** (sidebar, route, `canView`): có bất kỳ mã nào màn đó khai. Nếu màn
  khai `accessPermission` thì bắt buộc đúng mã ấy — toàn bộ screen dưới
  `transaction-management` khai `accessPermission: PERMISSION.TRANSACTION_FULL`.

`useAccess().has` / `hasAny` / `hasAll` so khớp thuần: `EWALLET:ROLE:FULL`
**không** tự bao trùm `EWALLET:ROLE:DELETE`. Cần bao trùm thì liệt kê rõ:
`hasAny([PERMISSION.ROLE_DELETE, PERMISSION.ROLE_FULL])`.

## Nguyên tắc mặc định

Mọi màn đều bị chặn khi không có quyền tương ứng. Khi thêm mã mới, cần bảo đảm
BE cấp mã đó trước khi đưa màn vào sử dụng. Không thêm cơ chế mặc định cho qua
vì sẽ làm lộ sidebar và route ngoài quyền.

## Dùng trong component

```tsx
const { canView, can } = useScreenAccess('USER_ACCOUNT')

<Can screen='USER_ACCOUNT' action='create'>
  <ButtonComponent aria-label='Thêm tài khoản' />
</Can>
```

Thiếu quyền thì `Can` không render children; giao diện không dùng trạng thái
disabled để biểu diễn thiếu quyền.
