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
  Typography,
  notification
} from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CustomAccountingSelect from './components/customer-accouting-select/CustomAccountingSelect'
import {
  accountingOptions,
  accountingTransactionType,
  fundsOptions,
  walletTypeOptions
} from '@constants/options'
import {
  blockArrowValue,
  blockLetterDecimal,
  moneyInputFormatter
} from '@utils/helperFunctions'
import { useLazyCustomerFindAllQuery } from '@services/cmsService'
import { useCreateAccountingMutation } from '@services/accountingService'
import { useLazyGetListWalletsQuery } from '@services/apiInternalWallet'

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
  const transactionType = Form.useWatch('transactionType', form)

  const [getPartners] = useLazyPaymentPartnerFindAllQuery()
  const [getServices] = useLazyPaymentServiceFindAllQuery()
  const [getWalletIds] = useLazyGetListWalletsQuery()
  const [createAccounting] = useCreateAccountingMutation()

  const [createLoading, setCreateLoading] = useState(false)
  const updateLoading = false

  const handleSubmit = async (value: Record<string, any>) => {
    if (value) {
      try {
        setCreateLoading(true)
        const response = (await createAccounting(value)) as any

        if (response?.data?.statusCode < 400) {
          notification.success({
            message: t(`internal-wallet.messages.create-accounting-success`)
          })
          form.resetFields()
          onCancel()
        }
      } catch (error) {
        notification.error({
          message: t(`internal-wallet.messages.create-accounting-failed`)
        })
      } finally {
        setCreateLoading(false)
      }
    }
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
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Select
            placeholder={t('internal-wallet.placeholders.transaction_type')}
            options={accountingTransactionType}
          />
        </Form.Item>
        {/* Nguồn tiền - select */}
        <Form.Item
          name='fundSource'
          label={t('internal-wallet.modal.funds')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Select
            placeholder={t('internal-wallet.placeholders.funds')}
            options={fundsOptions}
          />
        </Form.Item>

        {transactionType === 'ADVANDED_COLLECT' && (
          <>
            {/* Dịch vụ - select */}
            <Form.Item
              name='serviceId'
              label={t('internal-wallet.modal.service')}
              rules={[
                {
                  required: true,
                  message: t('internal-wallet.messages.required').toString()
                }
              ]}
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
              rules={[
                {
                  required: true,
                  message: t('internal-wallet.messages.required').toString()
                }
              ]}
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
          </>
        )}
        {/* Ghi nợ - input */}
        {/* Loại ví - select */}
        <Form.Item
          name='balanceType'
          label={t('internal-wallet.modal.walletType')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Select
            placeholder={t('internal-wallet.placeholders.wallet_type')}
            options={walletTypeOptions}
          />
        </Form.Item>
        {/* Số ví điện tử - select - required */}
        <Form.Item
          name='walletNumber'
          label={t('internal-wallet.modal.walletNumber')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <CustomAccountingSelect
            trigger={getWalletIds}
            search={{
              page: 1,
              take: 10,
              active: true
            }}
            field='walletNumber'
            onSelectData={onSelectData}
            valueSearch='walletNumber'
            placeholder={t(
              'internal-wallet.placeholders.wallet_number'
            ).toString()}
            valuePassed='walletNumber'
          />
        </Form.Item>
        <Form.Item
          name='accountingType'
          label={t('internal-wallet.modal.accounting')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.messages.required').toString()
            }
          ]}
        >
          <Select
            placeholder={t(
              'internal-wallet.placeholders.accounting'
            ).toString()}
            options={accountingOptions}
          />
        </Form.Item>
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
