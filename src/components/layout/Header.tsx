import React from 'react'
import { useTranslation } from 'react-i18next'
import { SidebarTrigger } from '@/components/ui/sidebar/Sidebar'
import Breadcrumb from '@components/ui/breadcrumb-component'
import NavProfile from '@components/layout/components/NavProfile'

interface HeaderProps {
  titleKey: string
}

const Header = ({ titleKey }: HeaderProps) => {
  const { t } = useTranslation()

  return (
    <header className='sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 py-2 backdrop-blur-md'>
      <SidebarTrigger />
      <div className='h-4 w-px bg-border' />

      <div className='flex min-w-0 flex-1 flex-col'>
        <b className='truncate text-[18px] leading-tight text-foreground'>
          {t(`header-title.${titleKey}`)}
        </b>
        <Breadcrumb className='mt-0.5' />
      </div>

      <div className='ml-auto flex shrink-0 items-center gap-3'>
        <NavProfile />
      </div>
    </header>
  )
}

export default Header
