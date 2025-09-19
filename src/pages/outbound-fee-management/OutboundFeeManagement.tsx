import { Card, Form } from 'antd'
import { useOutboundFeeFindAllQuery } from '@services/outboundFeeService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OutboundFeeFindAllApiArg } from '@type/outbound-fee'
import { PATHS } from '@constants/pathConstant'
import OutboundFeeManagementSearchBar from './OutboundFeeManagementSearchBar'
import OutboundFeeManagementTable from './OutboundFeeManagementTable'

const OutboundFeeManagement = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [search, setSearch] = useState<OutboundFeeFindAllApiArg>({
    page: 1,
    take: 10,
    method: 'all',
    provider: 'all'
  })
  const { data: outboundFees, refetch } = useOutboundFeeFindAllQuery(search)

  const submit = (value: any) => {
    const searchParams: OutboundFeeFindAllApiArg = {
      ...search,
      method: value.method || 'all',
      provider: value.provider || 'all',
      chargeWithin: value.feeInside === 'inside' ? 'system' : value.feeInside === 'outside' ? 'outside' : undefined,
      applicationType: value.applicableTarget,
      transactionType: value.transactionType,
      bank: value.bank,
      accountGroup: value.accountGroup,
      createdFrom: value.creationTime?.[0]?.toISOString(),
      createdTo: value.creationTime?.[1]?.toISOString(),
      appliedFrom: value.applicableTime?.[0]?.toISOString(),
      appliedTo: value.applicableTime?.[1]?.toISOString(),
      page: 1
    }

    setSearch(searchParams)
  }

  const handleClearFilter = () => {
    form.resetFields()
    setSearch({
      page: 1,
      take: 10,
      method: 'all',
      provider: 'all'
    })
  }

  const handleCreateFee = () => {
    navigate(PATHS.FEE_V2.OUTBOUND_FEE.CREATE)
  }

  console.log('outboundFees', outboundFees)
  return (
    <Card
      title={
        <OutboundFeeManagementSearchBar
          onFinish={submit}
          form={form}
          onClearFilter={handleClearFilter}
          onCreateFee={handleCreateFee}
        />
      }
    >
      <OutboundFeeManagementTable
        outboundFees={outboundFees?.data}
        search={search}
        setSearch={setSearch}
        pagination={outboundFees?.meta}
      />
    </Card>
  )
}

export default OutboundFeeManagement
