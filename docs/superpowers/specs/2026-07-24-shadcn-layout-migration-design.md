# Thiết kế: Thay layout antd bằng layout shadcn (Header + SideBar)

- **Ngày:** 2026-07-24
- **Trạng thái:** Đã duyệt thiết kế, chờ viết plan
- **Phạm vi:** Thay `AppLayout` dựa trên antd bằng layout dùng bộ `Sidebar` shadcn có sẵn trong `src/components/ui/sidebar/`

## Bối cảnh & Vấn đề

`src/components/layout/AppLayout.tsx` hiện dùng antd (`Layout/Sider/Menu/Drawer/Grid`, `re-resizable`, `@ant-design/icons`) và được gắn làm `element` cho **mọi** route group trong `src/routes.ts`. Ngoài UI, nó còn gánh nhiều logic phi-UI quan trọng.

Người dùng cung cấp hai file `Header.tsx` và `SideBar.tsx` (trong `src/components/layout/`) làm layout mong muốn — nhưng đây là **template Next.js không chạy được** trong project Vite + react-router này:
- Dùng `next/link`, `next/navigation` (`usePathname`), `"use client"`.
- Import `../constants/route.constants` (không tồn tại), `@/components/ui/autocomplete/Autocomplete` (không tồn tại), `@/components/ui/separator/Separator` (không tồn tại dạng đó).

**Tin tốt:** Project đã có sẵn bộ sidebar shadcn adapt cho react-router tại `src/components/ui/sidebar/` (`SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`, `SidebarNavLink`, `SidebarMenuCollapsible`, ...). Các token CSS (`--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`) đã được định nghĩa cho cả light/dark theme trong `src/styles/index.css`.

## Quyết định đã chốt

1. **Xử lý template:** Viết lại `Header.tsx` + `SideBar.tsx` cho chạy được (react-router + bộ sidebar shadcn có sẵn), bỏ các phần không tồn tại (search autocomplete, github/bell/settings). Không cố bám 100% template.
2. **Nguồn dữ liệu menu:** Giữ `navigationItems` + `useNavigationEw()` (đã lọc menu theo permission/RBAC). Map sang shape của sidebar shadcn. Không viết `routesConfig` mới.
3. **Nội dung Header:** Giữ chức năng hiện có — `SidebarTrigger` + tiêu đề trang (i18n) + `Breadcrumb` + `NavProfile`. Bỏ search/github/bell/settings.
4. **Token CSS:** Dùng token sidebar đã có trong `src/styles/index.css`, không định nghĩa thêm.
5. **Dependency của bộ sidebar shadcn:** Tự viết `ui/tooltip/Tooltip.tsx` self-contained và gỡ re-export `SidebarUserMenu` khỏi barrel. **Không** thêm package mới (`@base-ui/react`), **không** đụng antd.

## Điều kiện tiên quyết: vá bộ sidebar shadcn (chưa từng compile)

Bộ `src/components/ui/sidebar/` hiện **chưa nơi nào dùng** và có 2 import gãy chặn build:

1. `SidebarMenu.tsx` import `{ Tooltip, TooltipTrigger, TooltipContent } from '../tooltip/Tooltip'` — **file không tồn tại**.
2. `SidebarUserMenu.tsx` import `@base-ui/react` (Popover) — **package chưa cài**; barrel `Sidebar.tsx` re-export file này nên kéo theo vào graph build.

Xử lý (không thêm dependency):

- **Tạo `src/components/ui/tooltip/Tooltip.tsx`** self-contained, export `Tooltip`, `TooltipTrigger`, `TooltipContent` đúng API đang dùng:
  - `<Tooltip>` bọc context/relative wrapper.
  - `<TooltipTrigger render={element} />` — clone element (`React.cloneElement`) gắn ref + handler hover/focus.
  - `<TooltipContent side="right">` — popup absolute hiện khi hover, hỗ trợ `side`.
  - Thuần React + Tailwind, không lib ngoài, không antd. Chỉ cần đủ dùng cho tooltip label khi sidebar thu gọn.
- **Gỡ dòng re-export `SidebarUserMenu` khỏi barrel `Sidebar.tsx`** (dòng `export { UserMenuPopover, UserMenuItem } from './SidebarUserMenu';`). File `SidebarUserMenu.tsx` giữ nguyên trên đĩa nhưng không vào graph build. Layout mới không dùng nó (dùng `NavProfile`).

## Kiến trúc

Ba file trong `src/components/layout/` được viết lại (giữ nguyên tên):

```
AppLayout.tsx   shell: SidebarProvider > [SideBar] + SidebarInset > [Header] + <Outlet/>
SideBar.tsx     <Sidebar> shadcn, đổ dữ liệu từ useNavigationEw() (đã lọc RBAC)
Header.tsx      SidebarTrigger + title(i18n) + Breadcrumb + NavProfile
```

`src/routes.ts` **không đổi cấu trúc** — vẫn `createElement(AppLayout)` cho mỗi route group. AppLayout mới cùng vai trò nên mọi route tự động dùng layout mới.

`Navigation.tsx` và `useNavigation.ts` **giữ lại** làm nguồn dữ liệu menu, chỉ đổi cách tiêu thụ.

### AppLayout.tsx (viết lại)

Giữ **toàn bộ logic phi-UI** đang có:
- Auth guard: redirect `PATHS.AUTH.LOGIN` khi mất **cả** access token và refresh token.
- `initInactivityTracker()` trong `useEffect` (mount một lần).
- Permission guard: redirect `FORBIDDENERROR` khi `!isAccess` (từ `usePermission()`), trừ khi đang ở `FORBIDDENERROR`.
- i18n header title qua `getHeaderTitleKey(location.pathname)` (giữ nguyên logic wildcard).
- Modal `EmployeeProfile` / `EmployeePassword` + lắng nghe `window.events.on('show-profile' | 'show-password')`.

Thay phần JSX antd bằng:
```tsx
<SidebarProvider>
  <SideBar />
  <SidebarInset>
    <Header title={title} />
    <main className="app-content flex-1 overflow-auto">
      <Suspense fallback={<ScreenLoading/>}><Outlet/></Suspense>
    </main>
  </SidebarInset>
</SidebarProvider>
```

Bỏ được: state `collapsed`, `isMobile`, `openKeys`, `hasInitOpenKeys`, `handleOpenChange`, `handleSelectMenu`, `useBreakpoint`, `Resizable`, `Drawer` — vì `SidebarProvider`/`Sidebar` shadcn tự lo collapse + mobile offcanvas.

### SideBar.tsx (viết lại)

- Gọi `useNavigationEw()` (menu đã lọc theo permission) + `useLocation()` + `useSidebar()` (để đóng mobile khi điều hướng).
- Render `<Sidebar collapsible="icon">` với `SidebarHeader` chứa `<Logo/>`.
- **Adapter** map `ItemTypeCustom` → component shadcn:
  - Item cha (có `children`) → `<SidebarMenuCollapsible id icon label defaultOpen isChildActive>`; `isChildActive` tính bằng cách so `location.pathname` với các link con.
  - Item con → `<SidebarNavLink to={buildPath(parentKey, childKey)} icon label/>`.
- **Path builder:** `to = '/' + String(parentKey) + '/' + String(childKey)`. Ví dụ parentKey `secure-panel/transaction-management` + childKey `transaction-wallet` → `/secure-panel/transaction-management/transaction-wallet` (khớp `routes.ts`).
- Active state: dùng `NavLink` sẵn trong `SidebarNavLink` (bỏ logic `selectedKeys`/`currentKey`/`openKeys` thủ công của antd).
- Mobile: `onClick` link gọi `setOpenMobile(false)` để đóng drawer.
- Icon: đổi màu hardcode `rgb(43,217,208)` trong `Navigation.tsx` sang `currentColor`/token để đồng bộ accent tím của sidebar; chỉnh kích thước cho vừa container `h-4 w-4`.

### Header.tsx (viết lại)

Nhận prop `title: string`. Cấu trúc:
```tsx
<header className="... sticky top-0 border-b ...">
  <SidebarTrigger />
  <Separator .../>            // dùng separator có sẵn trong project, không phải @/components/ui/separator template
  <div className="flex flex-col">
     <b>{t(`header-title.${title}`)}</b>
     <Breadcrumb />
  </div>
  <NavProfile />              // đẩy sang phải bằng ml-auto
</header>
```
Đổi `next/link`→bỏ, `next/navigation`→`react-router`, bỏ `Autocomplete`/`Code`/github/bell/settings. Giữ style sticky/border/backdrop theo template, dùng token màu hiện có.

## Những gì bị loại bỏ

- antd `Layout, Sider, Menu, Drawer, Grid`, `re-resizable`, `@ant-design/icons` trong tầng layout.
- Logic `openKeys`/`handleOpenChange`/`handleSelectMenu`/breakpoint trong AppLayout.
- Các import Next.js và component không tồn tại trong hai template.

## Thành phần & Ranh giới

| Đơn vị | Nhiệm vụ | Phụ thuộc |
|---|---|---|
| `AppLayout` | Shell + guards (auth/permission/inactivity) + modals + title | `SidebarProvider`, `SideBar`, `Header`, `usePermission`, `useAppSelector`, `window.events` |
| `SideBar` | Render menu điều hướng từ navigation đã lọc RBAC | `useNavigationEw`, `useLocation`, `useSidebar`, bộ `ui/sidebar`, `Logo` |
| `Header` | Thanh trên: trigger + title + breadcrumb + profile | `SidebarTrigger`, `Breadcrumb`, `NavProfile`, `useTranslation` |
| adapter (trong SideBar) | Map `ItemTypeCustom` → props shadcn + build path | `Navigation.tsx` types |

## Rủi ro & Xử lý

- **Bộ sidebar chưa từng compile:** vá 2 import gãy trước (xem "Điều kiện tiên quyết") rồi mới lắp layout.
- **Sót tham chiếu antd sau khi bỏ:** verify bằng `tsc`/build vite sau khi sửa; grep import antd trong 3 file layout.
- **Icon teal vs accent tím:** chuyển icon sang `currentColor`/token khi map trong SideBar.
- **Đóng mobile khi điều hướng:** gọi `setOpenMobile(false)` trong onClick link.
- **`title` khi ở FORBIDDEN/route lạ:** `getHeaderTitleKey` fallback về pathname như hiện tại — giữ nguyên hành vi.

## Tiêu chí hoàn thành

- Build/`tsc` không lỗi; không còn import antd `Layout/Menu/Drawer` trong tầng layout.
- Mọi route bảo vệ render qua layout mới; điều hướng menu hoạt động, active state đúng.
- Auth guard, permission guard, inactivity tracker, modal profile/password, i18n title, breadcrumb hoạt động như cũ.
- Sidebar collapse (desktop) và offcanvas (mobile) hoạt động; menu lọc theo permission đúng.
```
