import { TransactionItem } from '@type/transaction.type'
import { AcountItem } from './ResponseWalletAccount.type'
import { ContentEKYC } from '@type/apiResponseEKYC'
import { LinkedBank } from '@type/responseAccountWallet'

export interface TabContentProps {
    accountData?: AcountItem
    ekycData?: ContentEKYC
    // Dễ dàng thêm các data sources khác trong tương lai:
    ownerId?: string
    linkedBanks?:LinkedBank[]
    // bankAccountData?: any
    // historyData?: any
    // settingsData?: any
}

export type TabContentRender = React.ReactNode | ((props: TabContentProps) => React.ReactNode)

export type TabContentMap = Record<string, Record<string, TabContentRender>>