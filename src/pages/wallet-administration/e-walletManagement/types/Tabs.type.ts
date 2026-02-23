import { AcountItem } from './ResponseWalletAccount.type'

export interface TabContentProps {
    accountData?: AcountItem
    // Dễ dàng thêm các data sources khác trong tương lai:
    // transactionData?: any
    // bankAccountData?: any
    // historyData?: any
    // settingsData?: any
}

export type TabContentRender = React.ReactNode | ((props: TabContentProps) => React.ReactNode)

export type TabContentMap = Record<string, Record<string, TabContentRender>>