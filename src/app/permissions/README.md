# Phân quyền

Mọi quyền của frontend được khai báo tại thư mục này. Không viết chuỗi
`EWALLET:...` ở nơi khác.

## Thêm màn mới

1. Thêm entry vào `SCREENS` trong `registry.ts`, gồm `path`, `module`, `view`
   và `actions`.
2. Dùng `SCREENS.<id>.path` khi khai báo route trong `routes.ts`.
3. Trỏ item sidebar tới `screen: '<id>'` trong `Navigation.tsx`.

## Đổi quyền của một hành động

Sửa action tương ứng trong `SCREENS`. Route, sidebar và component sẽ tiếp tục
dùng chung quyết định từ registry.

## Khi BE phát hành quyền cho module mới

Thêm module vào `RELEASED_MODULES` trong `modules.ts`. Trước thời điểm đó module
được cho qua; sau khi thêm, toàn bộ màn và hành động của module được kiểm tra
theo registry.

## Dùng trong component

```tsx
const { canView, can } = useScreenAccess('USER_ACCOUNT')

<Can screen='USER_ACCOUNT' action='create'>
  <ButtonComponent aria-label='Thêm tài khoản' />
</Can>
```

Thiếu quyền thì `Can` không render children; giao diện không dùng trạng thái
disabled để biểu diễn thiếu quyền.
