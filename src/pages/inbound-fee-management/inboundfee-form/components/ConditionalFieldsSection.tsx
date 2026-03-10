import { Form, Select } from 'antd'
import { InboundFeeApplicationType } from '@type/inbound-fee'

interface AccountGroup {
  id: number
  name: string
}

interface Customer {
  id: number
  phoneNumber: string
  fullName: string
}

interface ConditionalFieldsSectionProps {
  applicationType: string
  isEdit: boolean
  accountGroupsData?: AccountGroup[]
  customersData?: { data: Customer[] }
  isCustomersFetching: boolean
  initialValues?: {
    customerId?: number
    phoneNumber?: string
    fullname?: string
  }
  onCustomerChange: (value: string, option: any) => void
  onCustomerSearch: (value: string) => void
}

const ConditionalFieldsSection = ({
  applicationType,
  isEdit,
  accountGroupsData,
  customersData,
  isCustomersFetching,
  initialValues,
  onCustomerChange,
  onCustomerSearch
}: ConditionalFieldsSectionProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Chọn nhóm tài khoản (hiện khi chọn Nhóm tài khoản) */}
      {applicationType === InboundFeeApplicationType.ACCOUNT_GROUP && (
        <div className="w-[calc(50%-8px)]">
          <Form.Item
            name="accountGroup"
            label="Chọn nhóm tài khoản"
            rules={[{ required: true, message: 'Vui lòng chọn nhóm tài khoản' }]}
          >
            <Select
              placeholder="Tìm và chọn nhóm tài khoản"
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={accountGroupsData ? accountGroupsData.map((group) => ({
                value: group.id.toString(),
                label: group.name
              })) : []}
              size="large"
              disabled={isEdit}
            />
          </Form.Item>
        </div>
      )}

      {/* Nhập tài khoản (hiện khi chọn Đối tượng riêng) */}
      {applicationType === InboundFeeApplicationType.INDIVIDUAL && (
        <div className="w-[calc(50%-8px)]">
          <Form.Item
            name="phoneNumber"
            label="Nhập tài khoản"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select
              placeholder="Tìm theo số điện thoại hoặc mã ví"
              showSearch
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={onCustomerSearch}
              loading={isCustomersFetching}
              options={
                isEdit && initialValues?.customerId && initialValues?.phoneNumber
                  ? [
                    {
                      value: initialValues.customerId.toString(),
                      label: initialValues.fullname
                        ? `${initialValues.fullname} - ${initialValues.phoneNumber}`
                        : initialValues.phoneNumber,
                      customerId: initialValues.customerId
                    }
                  ]
                  : customersData?.data?.map((customer) => ({
                    value: customer.phoneNumber,
                    label: `${customer.fullName} - ${customer.phoneNumber}`,
                    customerId: customer.id
                  })) || []
              }
              notFoundContent={isCustomersFetching ? 'Loading...' : 'No data'}
              size="large"
              allowClear
              disabled={isEdit}
              onChange={onCustomerChange}
            />
          </Form.Item>
        </div>
      )}
    </div>
  )
}

export default ConditionalFieldsSection