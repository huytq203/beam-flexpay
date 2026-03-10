import { Card, Form } from 'antd'
import { useInboundFeeFindAllQuery } from '@services/inboundFeeService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InboundFeeFindAllApiArg } from '@type/inbound-fee'
import { PATHS } from '@constants/pathConstant'
import { Options } from '@constants/options'
import InboundFeeManagementSearchBar from './InboundFeeManagementSearchBar'
import InboundFeeManagementTable from './InboundFeeManagementTable'

const InboundFeeManagement = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [search, setSearch] = useState<InboundFeeFindAllApiArg>({
    page: 1,
    take: 10
  })
  const { data: inboundFees } = useInboundFeeFindAllQuery(search)

  const submit = (value: any) => {
    const searchParams: InboundFeeFindAllApiArg = {
      page: 1,
      take: search.take,
      applicationType: value.applicableTarget,
      transactionType: value.transactionType,
      customerId: value.customerId,
      accountGroupIds: value.accountGroupIds && value.accountGroupIds.length > 0 ? value.accountGroupIds : undefined,
      bankIds: value.bankIds && value.bankIds.length > 0 ? value.bankIds : undefined,
      methods: value.method && value.method !== Options.ALL ? [value.method] : undefined,
      providers: value.provider && value.provider !== Options.ALL ? [value.provider] : undefined,
      createdFrom: value.creationTime?.[0]?.toISOString(),
      createdTo: value.creationTime?.[1]?.toISOString(),
      appliedFrom: value.applicableTime?.[0]?.toISOString(),
      appliedTo: value.applicableTime?.[1]?.toISOString()
    }

    setSearch(searchParams)
  }

  const handleClearFilter = () => {
    form.resetFields()
    form.setFieldsValue({
      creationTime: undefined,
      applicableTime: undefined,
      status: Options.ALL,
      applicableTarget: Options.ALL,
      transactionType: Options.ALL,
      bankIds: undefined,
      accountGroupIds: undefined,
      customerId: undefined,
      method: Options.ALL,
      provider: Options.ALL
    })
    setSearch({
      page: 1,
      take: 10
    })
  }

  const handleCreateFee = () => {
    navigate(PATHS.FEE_V2.INBOUND_FEE.CREATE)
  }

  return (
    <Card
      title={
        <InboundFeeManagementSearchBar
          onFinish={submit}
          form={form}
          onClearFilter={handleClearFilter}
          onCreateFee={handleCreateFee}
        />
      }
    >
      <InboundFeeManagementTable
        inboundFees={inboundFees?.data}
        search={search}
        setSearch={setSearch}
        pagination={inboundFees?.meta}
      />
    </Card>
  )
}

export default InboundFeeManagement
