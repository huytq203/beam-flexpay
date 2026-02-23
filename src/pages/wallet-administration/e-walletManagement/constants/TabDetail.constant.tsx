import { lazy } from 'react'
import { TabContentMap, TabContentProps } from '../types/Tabs.type'

const CommonInfor = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/CommonInfor'))
const CommonInforBusiness = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/business/CommonInfor'))
const AccountBank = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/AccountBank'))
const HistoryPayment = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/HistoryPayment'))
const FreezeBalance = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/FreezeBalance'))
const Security = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/Security'))
const FeeSetting = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/FeeSetting'))

export const TAB_CONTENT_MAP: TabContentMap = {
  '1': {
    'USER': (props: TabContentProps) => <CommonInfor accountData={props.accountData} />,
    'SYSTEM': (props: TabContentProps) => <CommonInforBusiness accountData={props.accountData} />
  },
  '2': {
    'USER': <AccountBank />,
    'SYSTEM': '123'
  },
  '3': {
    'USER': <HistoryPayment />
  },
  '4':{
    'USER':<FreezeBalance/>
  },
  '5':{
    'USER':<FeeSetting/>
  },
  '6':{
    'USER':<Security/>
  }
}
