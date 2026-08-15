import { CardComponent } from '@components/index'
import { TabContentProps } from '../../../types/Tabs.type'
import CustomerInfoCard from './components/CustomerInfoCard'
import WalletInfoCard from './components/WalletInfoCard'

const CommonInfor = ({ accountData, ekycData }: TabContentProps) => {
  return (
    <div className='mt-3 flex flex-col gap-2 lg:flex-row'>
      <CardComponent className='flex-1' content={<CustomerInfoCard ekyc={ekycData} />} />
      <CardComponent
        className='flex-1'
        content={<WalletInfoCard data={accountData} ekyc={ekycData} />}
      />
    </div>
  )
}

export default CommonInfor
