# Phân quyền

Mọi quyền của frontend được khai báo tại thư mục này. Không viết chuỗi
`EWALLET:...` ở nơi khác.

## Thêm màn mới

1. Thêm entry vào `SCREENS` trong `registry.ts`, gồm `path`, `module` và
   `actions`.
2. Dùng `SCREENS.<id>.path` khi khai báo route trong `routes.ts`.
3. Trỏ item sidebar tới `screen: '<id>'` trong `Navigation.tsx`.

## Đổi quyền của một hành động

Sửa action tương ứng trong `SCREENS`. Route, sidebar và component sẽ tiếp tục
dùng chung quyết định từ registry.

Mọi screen luôn có sáu action chuẩn: `view`, `create`, `edit`, `delete`,
`update`, `full`. Action nghiệp vụ riêng như `approve` hoặc `assignRoles` được
khai báo bổ sung trên screen tương ứng.

Sidebar và route được mở khi tài khoản có ít nhất một action chuẩn của đúng
module. Quyền hành động trong màn vẫn được kiểm tra riêng bằng `Can`.

Nếu một screen khai báo `accessAction`, sidebar và route chỉ mở khi tài khoản
có action đó (hoặc `EWALLET:ADMIN:FULL`). Toàn bộ screen dưới
`transaction-management` khai báo `accessAction: ACTION.FULL`, vì vậy bắt buộc
`EWALLET:TRANSACTION:FULL` mới được truy cập.

## Nguyên tắc mặc định

Mọi module đều bị chặn khi không có quyền tương ứng. Khi thêm module mới vào
`MODULE` và `SCREENS`, cần bảo đảm BE cấp mã quyền trước khi đưa màn vào sử dụng.
Không thêm cơ chế mặc định cho qua vì sẽ làm lộ sidebar và route ngoài quyền.

## Dùng trong component

```tsx
const { canView, can } = useScreenAccess('USER_ACCOUNT')

<Can screen='USER_ACCOUNT' action='create'>
  <ButtonComponent aria-label='Thêm tài khoản' />
</Can>
```

Thiếu quyền thì `Can` không render children; giao diện không dùng trạng thái
disabled để biểu diễn thiếu quyền.
