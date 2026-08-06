import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuCollapsible,
  SidebarMenuSubItem,
  SidebarNavLink,
  SidebarSeparator,
  useSidebar
} from '@/components/ui/sidebar/Sidebar'
import useNavigationEw from '@hooks/useNavigation'
import { Logo } from '@components/logo/Logo'

const buildPath = (parentKey: React.Key, childKey: React.Key) =>
  '/' + String(parentKey) + '/' + String(childKey)

const renderIcon = (icon: React.ReactNode): React.ReactNode =>
  React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
        size: 22
      })
    : icon

const SideBar = () => {
  const [navigation] = useNavigationEw()
  const { pathname } = useLocation()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'

  useEffect(() => {
    if (isMobile) setOpenMobile(false)
  }, [pathname, isMobile, setOpenMobile])

  return (
    <Sidebar
      collapsible='icon'
      variant='sidebar'
      side='left'
      className='h-full bg-sidebar'
    >
      <SidebarHeader className='border-b border-sidebar-border'>
        <div className='flex items-center justify-center '>
          <Logo collapsed={!isMobile && isCollapsed} />
        </div>
      </SidebarHeader>

      <SidebarContent className='scroll-custom'>
        {navigation.map((group) => {
          const groupKey = group.key
          const label = group.label
          const children = group.children ?? []

          const childLinks = children.map((child) => ({
            to: buildPath(groupKey, child.key),
            label: child.label,
            icon: child.icon,
            key: child.key
          }))

          const isChildActive = childLinks.some(
            (child) =>
              pathname === child.to || pathname.startsWith(child.to + '/')
          )

          return (
            <SidebarGroup key={String(groupKey)}>
              <SidebarGroupLabel>{label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuCollapsible
                      id={String(groupKey)}
                      icon={renderIcon(
                        group.icon
                      )}
                      label={String(label ?? '')}
                      defaultOpen
                      isChildActive={isChildActive}
                    >
                      {childLinks.map((child) => (
                        <SidebarMenuSubItem key={String(child.key)}>
                          <SidebarNavLink
                            to={child.to}
                            icon={renderIcon(child.icon)}
                            label={String(child.label ?? '')}
                            size='sm'
                          />
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuCollapsible>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
              <SidebarSeparator className='mt-2 opacity-70' />
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}

export default SideBar
