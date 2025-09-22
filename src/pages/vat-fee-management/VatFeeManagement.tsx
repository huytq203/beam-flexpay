import { Card, Form } from 'antd'
import { useVatFeeFindAllQuery } from '@services/vatFeeService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VatFeeFindAllApiArg, VatFeeApplicationType } from '@type/vat-fee'
import { PATHS } from '@constants/pathConstant'
import VatFeeManagementSearchBar from './VatFeeManagementSearchBar'
import VatFeeManagementTable from './VatFeeManagementTable'

const VatFeeManagement = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [search, setSearch] = useState<VatFeeFindAllApiArg>({
    page: 1,
    take: 10,
    order: 'DESC',
    orderBy: 'createdAt'
  })

  const { data: vatFees, refetch } = useVatFeeFindAllQuery(search)

  const submit = (value: any) => {
    const searchParams: VatFeeFindAllApiArg = {
      ...search,
      // Nếu chọn "Tất cả" (empty string) thì truyền undefined cho BE
      applicationType: value.applicationType && value.applicationType !== '' ? value.applicationType : undefined,
      accountGroup: value.accountGroup || undefined,
      accountNumber: value.accountNumber || undefined,
      status: value.status !== '' ? value.status : undefined,
      createdFrom: value.createdTime?.[0]?.toISOString(),
      createdTo: value.createdTime?.[1]?.toISOString(),
      appliedFrom: value.appliedTime?.[0]?.toISOString(),
      appliedTo: value.appliedTime?.[1]?.toISOString(),
      page: 1
    }

    console.log('Search params:', searchParams)
    setSearch(searchParams)
  }

  const handleClearFilter = () => {
    form.resetFields()
    setSearch({
      page: 1,
      take: 10,
      order: 'DESC',
      orderBy: 'createdAt'
    })
  }

  const handleCreateFee = () => {
    navigate(PATHS.FEE_V2.VAT_FEE.CREATE)
  }

  console.log('vatFees response:', vatFees)

  return (
    <Card
      title={
        <VatFeeManagementSearchBar
          onFinish={submit}
          form={form}
          onClearFilter={handleClearFilter}
          onCreateFee={handleCreateFee}
        />
      }
    >
      <VatFeeManagementTable
        vatFees={vatFees?.data}
        search={search}
        setSearch={setSearch}
        pagination={vatFees?.meta}
      />
    </Card>
  )
}

export default VatFeeManagement