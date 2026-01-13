import BusinessPesonal from '@pages/wallet-administration/confirm-ekyc/components/BusinessPesonal'
import BusinessRecord from '@pages/wallet-administration/confirm-ekyc/components/BusinessRecord'
export type TabContentMap = Record<string, React.ReactNode>
export const TAB_CONTENT_MAP: TabContentMap = {
  '1': <BusinessPesonal/>,
  '2': <BusinessRecord />
}
