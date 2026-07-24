# Shadcn Layout Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay `AppLayout` dựa trên antd bằng layout dùng bộ `Sidebar` shadcn có sẵn (`src/components/ui/sidebar/`), viết lại `Header.tsx` + `SideBar.tsx`, giữ nguyên toàn bộ guards/RBAC/modals.

**Architecture:** `AppLayout` bọc `SidebarProvider > SideBar + SidebarInset(Header + Outlet)`. `SideBar` đổ dữ liệu từ `useNavigationEw()` (đã lọc permission) map sang component shadcn. `routes.ts` không đổi cấu trúc — vẫn gắn `AppLayout` cho mỗi route group. Trước tiên phải vá 2 import gãy trong bộ sidebar (chưa từng compile).

**Tech Stack:** React 18, react-router-dom, TypeScript, Tailwind (token trong `src/styles/index.css`), tailwind-variants, lucide-react, phosphor-icons. Verify bằng `npm run typecheck` (`tsc --noEmit`).

## Global Constraints

- **Không thêm dependency mới** (không cài `@base-ui/react`).
- **Không dùng antd cho cấu trúc layout** (`Layout/Sider/Menu/Drawer/Grid`, `re-resizable`, `@ant-design/icons`). Leaf component `NavProfile`, `Breadcrumb`, `Logo` giữ nguyên dù bên trong có antd.
- **Giữ nguyên logic phi-UI**: auth guard, `initInactivityTracker`, permission guard (redirect `FORBIDDENERROR`), modal profile/password qua `window.events`, i18n header title.
- **Nguồn menu**: `useNavigationEw()` + `navigationItems` (đã lọc RBAC). Không viết `routesConfig` mới, không sửa `Navigation.tsx`.
- **Path build cho link menu**: `to = '/' + String(parentKey) + '/' + String(childKey)` (ví dụ `/secure-panel/transaction-management/transaction-wallet`, khớp `routes.ts`).
- **Token CSS**: dùng token có sẵn (`bg-sidebar`, `text-sidebar-foreground`, `bg-popover`, `border-border`...). Không định nghĩa thêm.
- **Gate hoàn thành**: `npm run typecheck` → **0 lỗi** (baseline hiện tại: 17 lỗi, toàn bộ trong 4 file thuộc phạm vi).

---

### Task 1: Vá bộ sidebar shadcn (tooltip + width desktop + dọn barrel)

**Files:**
- Create: `src/components/ui/tooltip/Tooltip.tsx`
- Modify: `src/components/ui/sidebar/Sidebar.tsx` (gỡ dòng re-export `SidebarUserMenu`)
- Modify: `src/components/ui/sidebar/SidebarLayout.tsx` (thêm width cho `<aside>` desktop — hiện đang thiếu)
- Delete: `src/components/ui/sidebar/SidebarUserMenu.tsx`

**Bối cảnh lỗi width:** Nhánh desktop của `Sidebar` (trong `SidebarLayout.tsx`) render `<aside className="... w-full shrink-0 ...">` nhưng **không set width** (chỉ nhánh mobile mới có `style={{ width: sidebarWidth }}`), và không có CSS nào bù. Kết quả: sidebar chiếm full width, đẩy `SidebarInset` mất chỗ. Phải sửa để aside dùng `sidebarWidth` khi mở và `SIDEBAR_WIDTH_ICON` khi thu gọn.

**Interfaces:**
- Produces: `Tooltip`, `TooltipTrigger` (prop `render: React.ReactElement`), `TooltipContent` (prop `side?: 'top'|'right'|'bottom'|'left'`) từ `@/components/ui/tooltip/Tooltip`. API này khớp cách `SidebarMenu.tsx` đang dùng (`<TooltipTrigger render={el} />`, `<TooltipContent side="right">`).

- [ ] **Step 1: Xác nhận `SidebarUserMenu` không được dùng ở đâu ngoài thư mục sidebar**

Run:
```bash
grep -rn "UserMenuPopover\|UserMenuItem\|SidebarProvider" src --include=*.tsx | grep -v "components/ui/sidebar/"
```
Expected: không có dòng nào (an toàn để xóa/gỡ). Nếu có kết quả, DỪNG và báo lại.

- [ ] **Step 2: Tạo `src/components/ui/tooltip/Tooltip.tsx`**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type Side = 'top' | 'right' | 'bottom' | 'left';

interface TooltipCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = React.createContext<TooltipCtx | null>(null);

/** Root — cung cấp state hover cho trigger/content, bọc trong wrapper relative */
export const Tooltip: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Ctx.Provider value={{ open, setOpen }}>
      <span className={cn('relative inline-flex w-full', className)}>{children}</span>
    </Ctx.Provider>
  );
};

/** Trigger — clone element được truyền qua `render`, gắn handler hover/focus */
export const TooltipTrigger: React.FC<{ render: React.ReactElement }> = ({ render }) => {
  const ctx = React.useContext(Ctx);
  const show = () => ctx?.setOpen(true);
  const hide = () => ctx?.setOpen(false);
  return React.cloneElement(render as React.ReactElement<any>, {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });
};

const sideClasses: Record<Side, string> = {
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
};

/** Content — popup hiện khi open, định vị theo `side` */
export const TooltipContent: React.FC<{
  side?: Side;
  className?: string;
  children: React.ReactNode;
}> = ({ side = 'top', className, children }) => {
  const ctx = React.useContext(Ctx);
  if (!ctx?.open) return null;
  return (
    <span
      role="tooltip"
      className={cn(
        'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md',
        sideClasses[side],
        className
      )}
    >
      {children}
    </span>
  );
};
```

- [ ] **Step 3: Vá width cho `<aside>` desktop trong `SidebarLayout.tsx`**

Trong `src/components/ui/sidebar/SidebarLayout.tsx`:

a) Thêm `SIDEBAR_WIDTH_ICON` vào import từ `./SidebarContext`:
```tsx
import { useSidebar, SIDEBAR_WIDTH_DEFAULT, SIDEBAR_WIDTH_ICON } from './SidebarContext';
```

b) Thay khối `return (<aside ...>)` ở **nhánh desktop** (khối cuối của component `Sidebar`, có `data-state={state}`) bằng:
```tsx
    return (
      <aside
        ref={ref}
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
        {...props}
        style={{
          width: state === 'collapsed' ? SIDEBAR_WIDTH_ICON : sidebarWidth,
          ...(props.style as React.CSSProperties),
        }}
        className={cn(
          'group relative flex h-full flex-col bg-sidebar text-sidebar-foreground',
          'overflow-hidden shrink-0 motion-safe:transition-[width] motion-safe:duration-200',
          className
        )}
      >
        {children}
      </aside>
    );
```
(Khác biệt: bỏ `w-full`, đặt `{...props}` TRƯỚC `style`/`className` để width thắng, thêm `style` width theo state và transition. `sidebarWidth` và `state` đã có sẵn từ `useSidebar()` ở đầu component.)

- [ ] **Step 4: Xóa file `SidebarUserMenu.tsx`**

Run:
```bash
git rm src/components/ui/sidebar/SidebarUserMenu.tsx
```

- [ ] **Step 5: Gỡ re-export `SidebarUserMenu` khỏi barrel**

Trong `src/components/ui/sidebar/Sidebar.tsx`, xóa dòng cuối:
```tsx
export { UserMenuPopover, UserMenuItem } from './SidebarUserMenu';
```
(Xóa cả dòng trống thừa nếu có, để file kết thúc gọn.)

- [ ] **Step 6: Typecheck — xác nhận các lỗi sidebar biến mất**

Run:
```bash
npx tsc --noEmit 2>&1 | grep -E "sidebar/Sidebar|tooltip/Tooltip|@base-ui" | head
```
Expected: không còn dòng nào liên quan `SidebarMenu`/`SidebarUserMenu`/`@base-ui`/`../tooltip/Tooltip`. (Header.tsx và SideBar.tsx vẫn còn lỗi — sẽ xử lý ở Task 2, 3.)

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/tooltip/Tooltip.tsx src/components/ui/sidebar/Sidebar.tsx src/components/ui/sidebar/SidebarLayout.tsx
git commit -m "fix: add Tooltip, apply desktop sidebar width, drop broken SidebarUserMenu"
```

---

### Task 2: Viết lại `SideBar.tsx`

**Files:**
- Modify (ghi đè toàn bộ): `src/components/layout/SideBar.tsx`

**Interfaces:**
- Consumes: bộ `@/components/ui/sidebar` (`Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuCollapsible`, `SidebarMenuSubItem`, `SidebarNavLink`, `useSidebar`), `useNavigationEw` từ `@hooks/useNavigation`, `ItemTypeCustom` từ `@components/layout/components/Navigation`, `Logo` từ `@components/logo/Logo`.
- Produces: `export default SideBar` — component không nhận prop, tự lấy dữ liệu điều hướng.

- [ ] **Step 1: Ghi đè `src/components/layout/SideBar.tsx`**

```tsx
// SideBar.tsx — sidebar điều hướng dùng bộ shadcn, dữ liệu từ navigation đã lọc RBAC
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuCollapsible,
  SidebarMenuSubItem,
  SidebarNavLink,
  useSidebar,
} from '@/components/ui/sidebar/Sidebar'
import useNavigationEw from '@hooks/useNavigation'
import type { ItemTypeCustom } from '@components/layout/components/Navigation'
import { Logo } from '@components/logo/Logo'

/** Build path điều hướng từ key cha + key con (khớp routes.ts) */
const buildPath = (parentKey: React.Key, childKey: React.Key) =>
  '/' + String(parentKey) + '/' + String(childKey)

/** Chuẩn hóa icon phosphor (size 20) về size vừa container 16px của sidebar */
const renderIcon = (icon: React.ReactNode): React.ReactNode =>
  React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 18 })
    : icon

const SideBar = () => {
  const [navigation] = useNavigationEw() as [ItemTypeCustom[], unknown]
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  // Đóng drawer mobile mỗi khi điều hướng
  useEffect(() => {
    if (isMobile) setOpenMobile(false)
  }, [pathname, isMobile, setOpenMobile])

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader>
        <div className="flex items-center justify-center py-2">
          <Logo collapsed={false} />
        </div>
      </SidebarHeader>

      <SidebarContent className="scroll-custom">
        {navigation.map((group) => {
          const groupKey = group.key as React.Key
          const label = (group as ItemTypeCustom & { label?: React.ReactNode }).label
          const children = (group.children ?? []) as ItemTypeCustom[]

          const childLinks = children.map((child) => ({
            to: buildPath(groupKey, child.key as React.Key),
            label: (child as ItemTypeCustom & { label?: React.ReactNode }).label,
            icon: (child as ItemTypeCustom & { icon?: React.ReactNode }).icon,
            key: child.key as React.Key,
          }))

          const isChildActive = childLinks.some(
            (c) => pathname === c.to || pathname.startsWith(c.to + '/')
          )

          return (
            <SidebarGroup key={String(groupKey)}>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuCollapsible
                      id={String(groupKey)}
                      icon={renderIcon((group as ItemTypeCustom & { icon?: React.ReactNode }).icon)}
                      label={String(label ?? '')}
                      defaultOpen={isChildActive}
                      isChildActive={isChildActive}
                    >
                      {childLinks.map((c) => (
                        <SidebarMenuSubItem key={String(c.key)}>
                          <SidebarNavLink
                            to={c.to}
                            icon={renderIcon(c.icon)}
                            label={String(c.label ?? '')}
                            size="sm"
                          />
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuCollapsible>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}

export default SideBar
```

- [ ] **Step 2: Typecheck file SideBar**

Run:
```bash
npx tsc --noEmit 2>&1 | grep "layout/SideBar"
```
Expected: không còn lỗi ở `layout/SideBar.tsx`. Nếu còn lỗi về `label`/`icon` không có trên `ItemType`, giữ đúng các phép ép kiểu `as ItemTypeCustom & { ... }` như trên (antd `ItemType` là union nên phải ép).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/SideBar.tsx
git commit -m "feat: rewrite SideBar with shadcn sidebar fed by permission-filtered navigation"
```

---

### Task 3: Viết lại `Header.tsx`

**Files:**
- Modify (ghi đè toàn bộ): `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `SidebarTrigger` từ `@/components/ui/sidebar/Sidebar`, `Breadcrumb` từ `@components/index`, `NavProfile` từ `@components/layout/components/NavProfile`, `useTranslation` từ `react-i18next`.
- Produces: `export default Header` — nhận prop `{ titleKey: string }` và tự dịch qua `header-title.${titleKey}`.

- [ ] **Step 1: Ghi đè `src/components/layout/Header.tsx`**

```tsx
// Header.tsx — thanh trên: trigger sidebar + tiêu đề trang + breadcrumb + menu user
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SidebarTrigger } from '@/components/ui/sidebar/Sidebar'
import { Breadcrumb } from '@components/index'
import NavProfile from '@components/layout/components/NavProfile'

interface HeaderProps {
  /** Key i18n cho tiêu đề trang, tra qua `header-title.${titleKey}` */
  titleKey: string
}

const Header = ({ titleKey }: HeaderProps) => {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 py-2 backdrop-blur-md">
      <SidebarTrigger />
      <div className="h-4 w-px bg-border" />

      <div className="flex min-w-0 flex-1 flex-col">
        <b className="truncate text-[18px] leading-tight text-foreground">
          {t(`header-title.${titleKey}`)}
        </b>
        <Breadcrumb className="mt-0.5" />
      </div>

      <div className="ml-auto shrink-0">
        <NavProfile />
      </div>
    </header>
  )
}

export default Header
```

- [ ] **Step 2: Typecheck file Header**

Run:
```bash
npx tsc --noEmit 2>&1 | grep "layout/Header"
```
Expected: không còn lỗi ở `layout/Header.tsx`. (Nếu `Breadcrumb` không nhận prop `className`, bỏ prop đó đi — kiểm tra `src/components/ui/breadcrumb-component`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: rewrite Header for shadcn layout (trigger + title + breadcrumb + profile)"
```

---

### Task 4: Viết lại `AppLayout.tsx`

**Files:**
- Modify (ghi đè toàn bộ): `src/components/layout/AppLayout.tsx`

**Interfaces:**
- Consumes: `SidebarProvider`, `SidebarInset` từ `@/components/ui/sidebar/Sidebar`; `SideBar` (default) từ `./SideBar`; `Header` (default) từ `./Header`; `usePermission` (default) từ `@hooks/usePermission`; `useNavigationEw` KHÔNG còn dùng ở đây (đã chuyển sang SideBar); giữ `EmployeePassword`, `EmployeeProfile`, `ScreenLoading`, `initInactivityTracker`, `PATHS`, `FORBIDDENERROR`, `appName`, `Cookies`, `CookieKey`, `useBoolean`.
- Produces: `export default AppLayout` — shell cho mọi route bảo vệ (không đổi vai trò trong `routes.ts`).

- [ ] **Step 1: Ghi đè `src/components/layout/AppLayout.tsx`**

```tsx
// AppLayout.tsx — shell layout dùng bộ sidebar shadcn
import React, { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'ahooks'
import Cookies from 'js-cookie'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar/Sidebar'
import SideBar from './SideBar'
import Header from './Header'
import EmployeePassword from './components/EmployeePassword'
import EmployeeProfile from './components/EmployeeProfile'
import ScreenLoading from '@components/screen-loading/ScreenLoading'

import { useAppSelector } from '@hooks/hook'
import usePermission from '@hooks/usePermission'
import { initInactivityTracker } from '@configs/fetchBaseQueryCustom'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { PATHS } from '@constants/pathConstant'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { appName } from '@constants/appConstant'
import './style.css'

function AppLayout() {
  const { accessToken } = useAppSelector((state) => state.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isAccess = usePermission()

  const [title, setTitle] = useState<string>(appName)
  const [modalProfile, { setTrue: showProfile, setFalse: hideProfile }] = useBoolean(false)
  const [modalPassword, { setTrue: showPassword, setFalse: hidePassword }] = useBoolean(false)

  useEffect(() => {
    initInactivityTracker()
  }, [])

  // Redirect login khi mất CẢ access + refresh token
  useEffect(() => {
    const refreshToken = Cookies.get(CookieKey.REFRESH_TOKEN)
    if (!accessToken && !refreshToken) {
      navigate(PATHS.AUTH.LOGIN)
    }
  }, [accessToken, navigate])

  // i18n header title với wildcard matching
  const getHeaderTitleKey = (pathname: string): string => {
    if (t(`header-title.${pathname}`) !== `header-title.${pathname}`) {
      return pathname
    }
    const wildcardPath = pathname.replace(/\/[^/]+$/, '/*')
    if (
      wildcardPath !== pathname &&
      t(`header-title.${wildcardPath}`) !== `header-title.${wildcardPath}`
    ) {
      return wildcardPath
    }
    return pathname
  }

  useEffect(() => {
    setTitle(getHeaderTitleKey(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    if (accessToken) {
      window.events.on('show-profile', () => showProfile())
      window.events.on('show-password', () => showPassword())
    }
  }, [accessToken])

  // Permission guard
  useEffect(() => {
    if (!isAccess && location.pathname !== FORBIDDENERROR) {
      navigate(FORBIDDENERROR)
    }
  }, [isAccess, location.pathname])

  return (
    <React.Fragment>
      <SidebarProvider>
        <SideBar />
        <SidebarInset>
          <Header titleKey={title} />
          <main className="app-content flex-1 overflow-auto">
            <Suspense fallback={<ScreenLoading />}>
              <Outlet />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
      <EmployeePassword open={modalPassword} onClose={hidePassword} />
      <EmployeeProfile open={modalProfile} onClose={hideProfile} />
    </React.Fragment>
  )
}

export default AppLayout
```

- [ ] **Step 2: Typecheck toàn dự án — kỳ vọng 0 lỗi**

Run:
```bash
npm run typecheck
```
Expected: PASS, không còn lỗi nào (baseline 17 lỗi → 0). Nếu còn lỗi ở `AppLayout.tsx`, sửa theo thông báo (ví dụ `window.events` cần khai báo global — vốn đã có sẵn trong dự án).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppLayout.tsx
git commit -m "feat: rewrite AppLayout on shadcn SidebarProvider, drop antd layout"
```

---

### Task 5: Verify build + smoke test trên trình duyệt

**Files:** (không sửa; chỉ kiểm chứng)

- [ ] **Step 1: Grep xác nhận không còn antd layout trong tầng layout**

Run:
```bash
grep -rnE "from 'antd'|re-resizable|@ant-design/icons" src/components/layout/AppLayout.tsx src/components/layout/Header.tsx src/components/layout/SideBar.tsx
```
Expected: không có kết quả (leaf `NavProfile`/`Breadcrumb`/`Logo` vẫn có antd bên trong — chấp nhận theo Global Constraints).

- [ ] **Step 2: Build production**

Run:
```bash
npm run build
```
Expected: build thành công, không lỗi resolve module.

- [ ] **Step 3: Smoke test trên trình duyệt**

Dùng skill `run` (hoặc `npm run dev`) mở app và kiểm bằng mắt:
- Đăng nhập → vào một trang bảo vệ (ví dụ `/secure-panel/transaction-management/transaction-wallet`).
- Sidebar hiển thị các nhóm menu đã lọc theo quyền; nhóm chứa route hiện tại tự mở; item active đúng.
- Nút `SidebarTrigger` (hoặc ⌘/Ctrl+B) thu gọn sidebar (desktop) → icon mode + tooltip label khi hover.
- Thu nhỏ cửa sổ < 768px → sidebar chuyển offcanvas; mở/đóng qua trigger; click 1 item → drawer tự đóng.
- Header: tiêu đề trang (i18n) + breadcrumb + menu user (`NavProfile`): mở được "Đổi mật khẩu"/"Hồ sơ"/"Đăng xuất".
- Điều hướng qua nhiều trang → tiêu đề đổi đúng; không văng ra login.

- [ ] **Step 4: Commit (nếu có chỉnh sửa nhỏ khi smoke test)**

```bash
git add -A
git commit -m "chore: polish shadcn layout after smoke test"
```
(Bỏ qua nếu không có thay đổi.)

---

## Ghi chú triển khai

- **Icon màu teal vs accent tím:** giữ nguyên màu icon hiện tại (brand teal) — KHÔNG đổi `COlOR` trong `Navigation.tsx` để tránh ảnh hưởng `NavProfile`. Đây là quyết định có chủ đích (YAGNI); tinh chỉnh màu để lại cho sau nếu cần.
- **`routes.ts` không thay đổi.** Nếu sau này muốn, có thể xem lại nhưng ngoài phạm vi plan này.
- **File template Next.js gốc** của `Header.tsx`/`SideBar.tsx` bị ghi đè hoàn toàn ở Task 2, 3.
