import { lazy } from 'react'
import { TabContentMap, TabContentProps } from '../types/Tabs.type'
import CommonInfor from '../components/detail-infor/Personal/CommonInfor'
import AccountBank from '../components/detail-infor/Personal/AccountBank'
import HistoryPayment from '../components/detail-infor/Personal/HistoryPayment'
import FreezeBalance from '../components/detail-infor/Personal/FreezeBalance'
import FeeSetting from '../components/detail-infor/Personal/FeeSetting'
import Security from '../components/detail-infor/Personal/Security'
import CommonInfoBusiness from '../components/detail-infor/business/CommonInfoBusiness'

export const TAB_CONTENT_MAP: TabContentMap = {
  '1': {
    'USER': (props: TabContentProps) => <CommonInfor accountData={props.accountData} />,
    'SYSTEM': (props: TabContentProps) => <CommonInfoBusiness accountData={props.accountData} />
  },
  '2': {
    'USER': <AccountBank />,
    'SYSTEM': '123'
  },
  '3': {
    'USER': (props: TabContentProps) => <HistoryPayment ownerId={props.accountData?.ownerId || ''} />
  },
  '4': {
    'USER': <FreezeBalance />
  },
  '5': {
    'USER': <FeeSetting />
  },
  '6': {
    'USER': <Security />
  }
}
