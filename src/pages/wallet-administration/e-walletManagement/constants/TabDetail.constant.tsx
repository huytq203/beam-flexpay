import { TabContentMap, TabContentProps } from '../types/Tabs.type'
import CommonInfor from '../components/detail-infor/Personal/CommonInfor'
import AccountBank from '../components/detail-infor/Personal/AccountBank'
import HistoryPayment from '../components/detail-infor/Personal/HistoryPayment'
import FreezeBalance from '../components/detail-infor/Personal/FreezeBalance'
import { FeeSetting } from '../components/detail-infor/Personal/FeeSetting'
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
    'SYSTEM': (props: TabContentProps) => <CommonInfor accountData={props.accountData} ekycData={props.ekycData} />,
    'BUSINESS': (props: TabContentProps) => <CommonInfoBusiness accountData={props.accountData} />
  },
  '2': {
    'USER': (props: TabContentProps) => <AccountBank linkedBanks={props.linkedBanks} />,
    'SYSTEM': (props: TabContentProps) => <AccountBank linkedBanks={props.linkedBanks} />,
    'BUSINESS': (props: TabContentProps) => <AccountBankBusiness linkedBanks={props.linkedBanks} />
  },
  '3': {
    'USER': (props: TabContentProps) => <HistoryPayment ownerId={props.accountData?.ownerId || ''}  initiatorUsername={props.accountData?.ownerUsername || ''}/>,
    'SYSTEM': (props: TabContentProps) => <HistoryPayment ownerId={props.accountData?.ownerId || ''}  initiatorUsername={props.accountData?.ownerUsername || ''}/>,
    'BUSINESS': (props: TabContentProps) => <HistoryPaymentBusiness ownerId={props.accountData?.ownerId || ''} />
  },
  '4': {
    'USER': <FreezeBalance />,
    'SYSTEM': <FreezeBalance />,
    'BUSINESS': <FreezeBalanceBusiness />
  },
  '5': {
    'USER': (props: TabContentProps) => (
      <FeeSetting
        walletId={props.accountData?.id ?? ''}
        walletLabel={props.accountData?.ownerUsername ?? 'Ví đang xem'}
      />
    ),
    'SYSTEM': (props: TabContentProps) => (
      <FeeSetting
        walletId={props.accountData?.id ?? ''}
        walletLabel={props.accountData?.ownerUsername ?? 'Ví hệ thống'}
      />
    ),
    'BUSINESS': <FeeSettingBusiness />
  },
  '6': {
    'USER': <Security />,
    'SYSTEM': <Security />,
    'BUSINESS': <SecurityBusiness />
  }
}
