import { lazy } from 'react'
import { TabContentMap } from '../types/Tabs.type'

const CommonInfor = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/CommonInfor'))
const CommonInforBusiness = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/business/CommonInfor'))
const AccountBank = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/AccountBank'))
const HistoryPayment = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/HistoryPayment'))
const FreezeBalance = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/FreezeBalance'))
const Security = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/Security'))
const FeeSetting = lazy(() => import('@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/FeeSetting'))

export const TAB_CONTENT_MAP: TabContentMap = {
  '1': {
    '1': <CommonInfor />,
    '2': <CommonInforBusiness />
  },
  '2': {
    '1': <AccountBank />,
    '2': '123'
  },
  '3': {
    '1': <HistoryPayment />
  },
  '4':{
    '1':<FreezeBalance/>
  },
  '5':{
    '1':<FeeSetting/>
  },
  '6':{
    '1':<Security/>
  }
}
