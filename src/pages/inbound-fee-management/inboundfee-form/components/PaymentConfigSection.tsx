import { Form } from 'antd'
import CustomMultiSelect from '@components/custom-multi-select/CustomMultiSelect'

interface Bank {
  id: number
  name: string
  bankCode: string
}

interface Provider {
  value: string
  label: string
}

interface PaymentMethod {
  value: string
  label: string
}

interface PaymentConfigSectionProps {
  isEdit: boolean
  transactionType: string
  paymentMethods: PaymentMethod[]
  banksData?: Bank[]
  providers: Provider[]
}

const PaymentConfigSection = ({
  isEdit,
  transactionType,
  paymentMethods,
  banksData,
  providers
}: PaymentConfigSectionProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Phương thức giao dịch */}
      <div className="w-[calc(50%-8px)]">
        <Form.Item
          name="method"
          label="Phương thức giao dịch"
          rules={[{ required: true, message: 'Phải chọn ít nhất 1 phương thức giao dịch' }]}
        >
          <CustomMultiSelect
            options={paymentMethods}
            placeholder="Chọn một hoặc nhiều phương thức"
            disabled={isEdit}
            className="w-full"
          />
        </Form.Item>
      </div>

      {/* Ngân hàng */}
      <div className="w-[calc(50%-8px)]">
        <Form.Item
          name="bank"
          label="Ngân hàng"
          rules={[{ required: true, message: 'Phải chọn ít nhất 1 ngân hàng' }]}
        >
          <CustomMultiSelect
            options={banksData?.map((bank) => ({
              value: bank.id.toString(),
              label: bank.name
            })) || []}
            placeholder="Chọn một hoặc nhiều ngân hàng"
            disabled={isEdit}
            className="w-full"
          />
        </Form.Item>
      </div>

      {/* Nhà cung cấp */}
      <div className="w-[calc(50%-8px)]">
        <Form.Item
          name="provider"
          label="Nhà cung cấp"
          rules={[{ required: true, message: 'Phải chọn ít nhất 1 nhà cung cấp' }]}
        >
          <CustomMultiSelect
            options={providers}
            placeholder="Chọn một hoặc nhiều nhà cung cấp"
            disabled={isEdit}
            className="w-full"
          />
        </Form.Item>
      </div>
    </div>
  )
}

export default PaymentConfigSection
