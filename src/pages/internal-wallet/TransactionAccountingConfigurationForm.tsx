import { GUTTER } from '@constants/appConstant'
import { useLazyPaymentPartnerFindAllQuery } from '@services/cmsPaymentParner'
import { useLazyPaymentServiceFindAllQuery } from '@services/cmsPaymentService'
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Typography
} from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import CustomAccountingSelect from './components/customer-accouting-select/CustomAccountingSelect'
import { accountingOptions, accountingTransactionType, fundsOptions, walletTypeOptions } from '@constants/options'
import { blockArrowValue, blockLetterDecimal, moneyInputFormatter } from '@utils/helperFunctions'
import { useLazyCustomerFindAllQuery } from '@services/cmsService'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
}

function TransactionAccountingConfigurationForm({
  record,
  isShow,
  onCancel,
  title
}: props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const [getPartners] = useLazyPaymentPartnerFindAllQuery()
  const [getServices] = useLazyPaymentServiceFindAllQuery()
  const [getWalletIds] = useLazyCustomerFindAllQuery()

  const createLoading = false
  const updateLoading = false

  const handleSubmit = (value: Record<string, any>) => {
    console.log("run here", value);

  }

  useEffect(() => {
    if (isShow && record && record.id) form.setFieldsValue(record)
    if (!isShow) form.resetFields()
  }, [isShow, record])

  const onSelectData = (value: Record<string, any>, field: string) => {
    form.setFieldValue(field, value.value)
  }

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
      width={1000}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
      >
        {/* Loại giao dịch - select */}
        <Form.Item
          name='transactionType'
          label={t('internal-wallet.modal.transactionType')}
        >
          <Select placeholder={t('internal-wallet.placeholders.transaction_type')} options={accountingTransactionType} />
        </Form.Item>
        {/* Nguồn tiền - select */}
        <Form.Item
          name='funds'
          label={t('internal-wallet.modal.funds')}
        >
          <Select placeholder={t('internal-wallet.placeholders.funds')} options={fundsOptions} />
        </Form.Item>

        {/* Dịch vụ - select */}
        <Form.Item
          name='serviceId'
          label={t('internal-wallet.modal.service')}
        >
          <CustomAccountingSelect
            trigger={getServices}
            search={{
              page: 1,
              take: 10,
              active: true
            }}
            field='name'
            onSelectData={onSelectData}
            valueSearch='serviceId'
            placeholder={t('internal-wallet.placeholders.service')}
          />
        </Form.Item>
        {/* Đối tác - select */}
        <Form.Item
          name='partnerId'
          label={t('internal-wallet.modal.partner')}
        >
          <CustomAccountingSelect
            trigger={getPartners}
            search={{
              page: 1,
              take: 10,
              type: 'REPAYMENT'
            }}
            field='name'
            onSelectData={onSelectData}
            valueSearch='partnerId'
            placeholder={t('internal-wallet.placeholders.partner')}
          />
        </Form.Item>
        {/* Ghi nợ - input */}
        {/* Loại ví - select */}
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            lg={12}
          >
            <div>
              <Typography.Text style={{ fontWeight: 600, fontSize: 14 }}>
                {t('internal-wallet.modal.debit')}
              </Typography.Text>
              <Divider style={{ marginTop: 8, marginBottom: 8 }} />
            </div>
            <Form.Item
              name='walletType'
              label={t('internal-wallet.modal.walletType')}
            >
              <Select placeholder={t('internal-wallet.placeholders.wallet_type')} options={walletTypeOptions} />
            </Form.Item>
            {/* Số ví điện tử - select - required */}
            <Form.Item
              name='walletNumber'
              label={t('internal-wallet.modal.walletNumber')}
              rules={[{ required: true }]}
            >
              <Input placeholder={t('internal-wallet.placeholders.wallet_number').toString()}
                type='text'
                inputMode='numeric'
                style={{ width: '100%' }}
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterDecimal} />
            </Form.Item>
            {/* hạch toán - select - required */}
            <Form.Item
              name='accounting'
              label={t('internal-wallet.modal.accounting')}
              rules={[{ required: true }]}
            >
              <Select placeholder={t('internal-wallet.placeholders.accounting').toString()} options={accountingOptions} />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            lg={12}
          >
            <div>
              <Typography.Text style={{ fontWeight: 600, fontSize: 14 }}>
                {t('internal-wallet.modal.credit')}
              </Typography.Text>
              <Divider style={{ marginTop: 8, marginBottom: 8 }} />
            </div>
            <Form.Item
              name='walletType'
              label={t('internal-wallet.modal.walletType')}
            >
              <Select placeholder={t('internal-wallet.placeholders.wallet_type')} options={walletTypeOptions} />
            </Form.Item>
            {/* Số ví điện tử - select - required */}
            <Form.Item
              name='walletNumber'
              label={t('internal-wallet.modal.walletNumber')}
              rules={[{ required: true }]}
            >
              <Input placeholder={t('internal-wallet.placeholders.wallet_number').toString()}
                type='text'
                inputMode='numeric'
                style={{ width: '100%' }}
                onKeyDown={blockArrowValue}
                onKeyPress={blockLetterDecimal} />
            </Form.Item>
            {/* hạch toán - select - required */}
            <Form.Item
              name='accounting'
              label={t('internal-wallet.modal.accounting')}
              rules={[{ required: true }]}
            >
              <Select placeholder={t('internal-wallet.placeholders.accounting').toString()} options={accountingOptions} />
            </Form.Item>
          </Col>
        </Row>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              className='btn-100'
              onClick={onCancel}
              loading={createLoading || updateLoading}
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              className='btn-100'
              type='primary'
              htmlType='submit'
              onClick={handleSubmit}
              loading={createLoading || updateLoading}
            >
              {t('buttons.save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default TransactionAccountingConfigurationForm
