import { Card, Form } from 'antd'
import { useOutboundFeeFindAllQuery } from '@services/outboundFeeService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OutboundFeeFindAllApiArg } from '@type/outbound-fee'
import { PATHS } from '@constants/pathConstant'
import { Options } from '@constants/options'
import OutboundFeeManagementSearchBar from './OutboundFeeManagementSearchBar'
import OutboundFeeManagementTable from './OutboundFeeManagementTable'

const OutboundFeeManagement = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [search, setSearch] = useState<OutboundFeeFindAllApiArg>({
    page: 1,
    take: 10
  })
  const { data: outboundFees } = useOutboundFeeFindAllQuery(search)

  const submit = (value: any) => {
    const searchParams: OutboundFeeFindAllApiArg = {
      // Required pagination
      page: 1,
      take: search.take,

      // Optional sorting
      order: 'DESC',
      orderBy: 'createdAt',

      // Date range filters
      createdFrom: value.creationTime?.[0]?.toISOString(),
      createdTo: value.creationTime?.[1]?.toISOString(),
      appliedFrom: value.applicableTime?.[0]?.toISOString(),
      appliedTo: value.applicableTime?.[1]?.toISOString(),

      // Single-select filters
      applicationType: value.applicationType && value.applicationType !== Options.ALL
        ? value.applicationType
        : undefined,
      transactionType: value.transactionType && value.transactionType !== Options.ALL
        ? value.transactionType
        : undefined,
      customerId: value.customerId,
      status: value.status && value.status !== '' ? value.status : undefined,

      // Boolean chargeWithin filter
      chargeWithin: value.chargeWithin && value.chargeWithin !== Options.ALL
        ? value.chargeWithin === 'true'
        : undefined,

      // Multi-select array filters
      accountGroupIds: value.accountGroupIds?.length > 0 ? value.accountGroupIds : undefined,
      bankIds: value.bankIds?.length > 0 ? value.bankIds : undefined,
      methods: value.methods?.length > 0 ? value.methods : undefined,
      providers: value.providers?.length > 0 ? value.providers : undefined
    }

    setSearch(searchParams)
  }

  const handleClearFilter = () => {
    form.resetFields()
    form.setFieldsValue({
      creationTime: undefined,
      applicableTime: undefined,
      applicationType: Options.ALL,
      transactionType: Options.ALL,
      bankIds: undefined,
      chargeWithin: Options.ALL,
      accountGroupIds: undefined,
      customerId: undefined,
      methods: undefined,
      providers: undefined,
      status: ''
    })
    setSearch({
      page: 1,
      take: 10,
      order: 'DESC',
      orderBy: 'createdAt'
    })
  }

  const handleCreateFee = () => {
    navigate(PATHS.FEE_V2.OUTBOUND_FEE.CREATE)
  }

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
