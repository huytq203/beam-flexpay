import { useState } from 'react'
import { ButtonComponent, TabComponent } from '@components/index'
import { SkeletonText } from '@components/ui/skeletons/Skeleton'
import { businessInfo } from '@pages/wallet-administration/e-walletManagement/constants/TabBusiness.config'
import type { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { useEnterpriseWalletDetail } from '../hooks/useEnterpriseWalletDetail'
import LegalRecords from './LegalRecords'
import Representative from './Representative'

interface EnterpriseProfileProps {
  account?: AcountItem
}

const ProfileBody = ({ account }: EnterpriseProfileProps) => {
  const [activeKey, setActiveKey] = useState('1')
  const { wallet, isEnterprise, isLoading, isError, refetch, resolveFileUrl } =
    useEnterpriseWalletDetail(account)

  if (!isEnterprise) {
    return (
      <p className='py-6 text-center text-muted-foreground'>
        Ví này không có hồ sơ doanh nghiệp.
      </p>
    )
  }
  if (isLoading)
    return (
      <SkeletonText
        lines={6}
        className='py-4'
      />
    )
  if (isError) {
    return (
      <div
        role='alert'
        className='flex flex-col items-center gap-3 py-6 text-center'
      >
        <p className='text-muted-foreground'>
          Không tải được hồ sơ doanh nghiệp.
        </p>
        <ButtonComponent
          type='default'
          content='Thử lại'
          onClick={refetch}
        />
      </div>
    )
  }
  if (!wallet) {
    return (
      <p className='py-6 text-center text-muted-foreground'>
        Chưa có hồ sơ doanh nghiệp.
      </p>
    )
  }

  return (
    <>
      <TabComponent
        activeKey={activeKey}
        items={businessInfo}
        onChange={setActiveKey}
        className='w-full!'
      />
      {activeKey === '1' && (
        <LegalRecords
          wallet={wallet}
          resolveFileUrl={resolveFileUrl}
        />
      )}
      {activeKey === '2' && (
        <Representative
          wallet={wallet}
          resolveFileUrl={resolveFileUrl}
        />
      )}
    </>
  )
}

export const EnterpriseProfile = ({ account }: EnterpriseProfileProps) => (
  <div className='flex flex-col'>
    <ProfileBody account={account} />
  </div>
)
