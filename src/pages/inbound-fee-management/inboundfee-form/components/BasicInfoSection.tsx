import { Form, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { InboundFeeApplicationType } from '@type/inbound-fee'

const { Option } = Select

interface BasicInfoSectionProps {
  isEdit: boolean
  onApplicationTypeChange: (value: string) => void
  onTransactionTypeChange: (value: string) => void
}

const BasicInfoSection = ({
  isEdit,
  onApplicationTypeChange,
  onTransactionTypeChange
}: BasicInfoSectionProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-4">
      {/* Đối tượng áp dụng */}
      <div className="w-[calc(50%-8px)]">
        <Form.Item
          name="applicationType"
          label={t('labels.applicableTarget')}
          rules={[{ required: true, message: 'Vui lòng chọn đối tượng áp dụng' }]}
          tooltip="Hệ thống: áp dụng cho toàn bộ | Đối tượng riêng: áp dụng cho ví cụ thể | Nhóm tài khoản: áp dụng cho nhóm ví"
        >
          <Select
            placeholder="Chọn đối tượng áp dụng"
            onChange={onApplicationTypeChange}
            size="large"
            disabled={isEdit}
          >
            <Option value={InboundFeeApplicationType.SYSTEM}>Hệ thống</Option>
            <Option value={InboundFeeApplicationType.INDIVIDUAL}>Đối tượng riêng</Option>
            <Option value={InboundFeeApplicationType.ACCOUNT_GROUP}>Nhóm tài khoản</Option>
          </Select>
        </Form.Item>
      </div>

      {/* Loại giao dịch */}
      <div className="w-[calc(50%-8px)]">
        <Form.Item
          name="transactionType"
          label={t('labels.transactionType')}
          rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch' }]}
          tooltip="Chọn loại giao dịch để áp dụng chính sách phí"
        >
          <Select
            placeholder="Chọn loại giao dịch"
            onChange={onTransactionTypeChange}
            size="large"
            disabled={isEdit}
          >
            <Option value="deposit">Nạp tiền</Option>
            <Option value="withdrawal">Rút tiền</Option>
            <Option value="payment">Thanh toán</Option>
            <Option value="transfer">Chuyển tiền</Option>
            <Option value="refund">Hoàn tiền</Option>
          </Select>
        </Form.Item>
      </div>
    </div>
  )
}

export default BasicInfoSection
