import { lazy } from 'react'
import { TabContentMap, TabContentProps } from '../types/Tabs.type'
import CommonInfor from '../components/detail-infor/Personal/CommonInfor'
import AccountBank from '../components/detail-infor/Personal/AccountBank'
import HistoryPayment from '../components/detail-infor/Personal/HistoryPayment'
import FreezeBalance from '../components/detail-infor/Personal/FreezeBalance'
import FeeSetting from '../components/detail-infor/Personal/FeeSetting'
import Security from '../components/detail-infor/Personal/Security'
import CommonInfoBusiness from '../components/detail-infor/business/CommonInfoBusiness'
import AccountBankBusiness from '../components/detail-infor/business/AccountBankBusiness'
import HistoryPaymentBusiness from '../components/detail-infor/business/HistoryPaymentBusiness'
import FreezeBalanceBusiness from '../components/detail-infor/business/FreezeBalanceBusiness'
import FeeSettingBusiness from '../components/detail-infor/business/FeeSettingBusiness'
import SecurityBusiness from '../components/detail-infor/business/SecurityBusiness'

export const TAB_CONTENT_MAP: TabContentMap = {
  '1': {
    'USER': (props: TabContentProps) => <CommonInfor accountData={props.accountData} ekycData={props.ekycData} />,
    'SYSTEM': (props: TabContentProps) => <CommonInfoBusiness accountData={props.accountData} />
  },
  '2': {
    'USER': <AccountBank />,
    'SYSTEM': <AccountBankBusiness />
  },
  '3': {
    'USER': (props: TabContentProps) => <HistoryPayment ownerId={props.accountData?.ownerId || ''} />,
    'SYSTEM': (props: TabContentProps) => <HistoryPaymentBusiness ownerId={props.accountData?.ownerId || ''} />
  },
  '4': {
    'USER': <FreezeBalance />,
    'SYSTEM': <FreezeBalanceBusiness />
  },
  '5': {
    'USER': <FeeSetting />,
    'SYSTEM': <FeeSettingBusiness />
  },
  '6': {
    'USER': <Security />,
    'SYSTEM': <SecurityBusiness />
  }
}
