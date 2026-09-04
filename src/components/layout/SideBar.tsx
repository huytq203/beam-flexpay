import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
import type { ItemTypeCustom } from './components/Navigation'
import { PATHS } from '@constants/pathConstant'

const buildPath = (parentKey: React.Key, childKey: React.Key) =>
  '/' + String(parentKey) + '/' + String(childKey)

const renderIcon = (icon: React.ReactNode): React.ReactNode =>
  React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
        size: 22
      })
    : icon

interface NavigationSection {
  key: string
  label: React.ReactNode
  items: ItemTypeCustom[]
}

const groupNavigationItems = (
  navigation: ItemTypeCustom[]
): NavigationSection[] =>
  navigation.reduce<NavigationSection[]>((sections, item) => {
    const sectionKey = item.groupLabel
      ? `group:${String(item.groupLabel)}`
      : `item:${String(item.key)}`
    const existingSection = sections.find(
      (section) => section.key === sectionKey
    )

    if (existingSection) {
      existingSection.items.push(item)
      return sections
    }

    sections.push({
      key: sectionKey,
      label: item.groupLabel ?? item.label,
      items: [item]
    })
    return sections
  }, [])

const SideBar = () => {
  const [navigation] = useNavigationEw()
  const { pathname } = useLocation()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const navigationSections = groupNavigationItems(navigation)

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
          <Link
            to={PATHS.HOME}
            aria-label='Về trang khởi động'
            className='rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar'
          >
            <Logo collapsed={!isMobile && isCollapsed} />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className='scroll-custom'>
        {navigationSections.map((section) => (
          <SidebarGroup key={section.key}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((group) => {
                  const groupKey = group.key
                  const label = group.label
                  const childLinks = (group.children ?? []).map((child) => ({
                    to: child.link ?? buildPath(groupKey, child.key),
                    label: child.label,
                    icon: child.icon,
                    key: child.key
                  }))
                  const isChildActive = childLinks.some(
                    (child) =>
                      pathname === child.to ||
                      pathname.startsWith(child.to + '/')
                  )

                  return (
                    <SidebarMenuItem key={String(groupKey)}>
                      <SidebarMenuCollapsible
                        id={String(groupKey)}
                        icon={renderIcon(group.icon)}
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
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarSeparator className='mt-2 opacity-70' />
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

export default SideBar
