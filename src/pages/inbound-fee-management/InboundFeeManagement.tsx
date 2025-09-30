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
    take: 10,
    method: Options.ALL,
    provider: Options.ALL
  })
  const { data: inboundFees, refetch } = useInboundFeeFindAllQuery(search)

  const submit = (value: any) => {
    const searchParams: InboundFeeFindAllApiArg = {
      ...search,
      method: value.method || Options.ALL,
      provider: value.provider || Options.ALL,
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
    // Set lại giá trị mặc định cho các field sau khi reset
    form.setFieldsValue({
      method: Options.ALL,
      provider: Options.ALL,
      applicableTarget: Options.ALL
    })
    setSearch({
      page: 1,
      take: 10,
      method: Options.ALL,
      provider: Options.ALL
    })
  }

  const handleCreateFee = () => {
    navigate(PATHS.FEE_V2.INBOUND_FEE.CREATE)
  }

  console.log('inboundFees', inboundFees)
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