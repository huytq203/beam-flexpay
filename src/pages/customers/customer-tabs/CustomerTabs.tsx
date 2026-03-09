import { SIZE_ICON } from '@constants/appConstant'
import {
  CreditCardIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  ReceiptIcon
} from '@phosphor-icons/react'
import {
  CustomerBalanceDetailDto,
  TransactionFindAllApiArg
} from '@type/application'
import { Tabs } from 'antd'
import { useEffect, useState } from 'react'
import CustomerBankTab from './CustomerBankTab'
import CustomerFreezeBalanceHistoryTab from './CustomerFreezeBalanceHistoryTab'
import CustomerHistoryTab from './CustomerHistoryTab'
import CustomerInfoTab from './CustomerInfoTab'
type CustomerInformationProps = {
  customer?: CustomerBalanceDetailDto
}

const CustomerTabs = (props: CustomerInformationProps) => {
  const [activeTabKey, setActiveTabKey] = useState('1')
  const { customer } = props
  const onTabChange = (key: string) => {
    setActiveTabKey(key)
  }

  const [historySearch, setHistorySearch] = useState<TransactionFindAllApiArg>({
    page: 1,
    take: 10,
    accountNumber: customer?.accountNumber
  })

  useEffect(() => {
    if (customer?.accountNumber) {
      setHistorySearch((prev) => ({
        ...prev,
        accountNumber: customer.accountNumber
      }))
    }
  }, [customer?.accountNumber])

  const tabItems = [
    {
      label: `Thông tin cá nhân`,
      key: '1',
      children: <CustomerInfoTab customerInfo={customer} />,
      icon: <MagnifyingGlassIcon size={SIZE_ICON} />
    },
    {
      label: `Thẻ/tài khoản ngân hàng`,
      key: '2',
      children: <CustomerBankTab customerInfo={customer} />,
      icon: <CreditCardIcon size={SIZE_ICON} />
    },
    {
      label: `Lịch sử giao dịch`,
      key: '3',
      children: <CustomerHistoryTab historySearch={historySearch} setHistorySearch={setHistorySearch} />,
      icon: <ReceiptIcon size={SIZE_ICON} />
    },
    {
      label: `Lịch sử giao dịch đóng băng`,
      key: '4',
      children: <CustomerFreezeBalanceHistoryTab phoneNumber={customer?.phoneNumber || ''} />,
      icon: <LockSimpleIcon size={SIZE_ICON} />
    }  
  ]

  return (
    <Tabs
      key={customer?.accountNumber}
      defaultActiveKey='1'
      activeKey={activeTabKey}
      items={tabItems}
      onChange={onTabChange}
      centered
    />
  )
}

export default CustomerTabs
