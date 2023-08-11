import { TimeFormat } from '@constants/datetime'
import { PaymentOrderDetailDto } from '@type/application'
import { Button, Col, Descriptions, InputNumber, Modal, Row, Tag } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

type props = {
  record?: PaymentOrderDetailDto
  isShow: boolean
  onCancel: VoidFunction
}

const RepaymentTransactionDetail = ({ isShow, onCancel, record }: props) => {
  const { t } = useTranslation()

  const getStatus = (value?: number) => {
    if (!value) return ''
    switch (value) {
      case 0:
        return <Tag color='blue'>{t('partner-repayment-list.success')}</Tag>
      case 1:
        return <Tag color='green'>{t('partner-repayment-list.approved')}</Tag>
      case 3:
        return <Tag color='red'>{t('partner-repayment-list.failed')}</Tag>
      default:
        return <Tag color='yellow'>{t('partner-repayment-list.pending')}</Tag>
    }
  }

  return (
    <Modal
      open={isShow}
      footer={null}
      maskClosable={false}
      width={1024}
      onCancel={onCancel}
      centered
    >
      <Descriptions
        title={t('buttons.view') + ' ' + record?.partnerOrderCode}
        layout='vertical'
        bordered
      >
        <Descriptions.Item label={t('partner-repayment-list.customer')}>
          {record?.partnerOrderCode}
        </Descriptions.Item>
        <Descriptions.Item label={t('partner-repayment-list.invoiceDate')}>
          {dayjs(record?.paymentPeriodFrom).format('MM/YYYY').toString()}
        </Descriptions.Item>
        <Descriptions.Item label={t('partner-repayment-list.repaymentPartner')}>
          {record?.customerPaymentPartner?.partnerCustomerName}
        </Descriptions.Item>
        <Descriptions.Item label={t('partner-repayment-list.walletId')}>
          {record?.customerPaymentPartner?.customer?.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label={t('partner-repayment-list.amount')}>
          <InputNumber
            defaultValue={record?.amount || 0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            readOnly
            bordered={false}
          />
        </Descriptions.Item>
        <Descriptions.Item label={t('partner-repayment-list.invoiceSource')}>
          {record?.balanceSource}
        </Descriptions.Item>
        <Descriptions.Item label={t('partner-repayment-list.invoiceStatus')}>
          {record?.partnerOrderStatus === 0 ? (
            <Tag color='yellow'>{t('partner-repayment-list.unpaid')}</Tag>
          ) : (
            <Tag color='blue'>{t('partner-repayment-list.paid')}</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={t('partner-repayment-list.transactionStatus')}
        >
          {getStatus(record?.transactionStatus)}
        </Descriptions.Item>
        <Descriptions.Item label={t('partner-repayment-list.transactionDate')}>
          {dayjs(record?.createdAt).format(TimeFormat).toString()}
        </Descriptions.Item>
      </Descriptions>
      <Row justify='end'>
        <Col className='mt-10'>
          <Button
            type='primary'
            onClick={onCancel}
            className='mw-100'
          >
            {t('buttons.close')}
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}
export default RepaymentTransactionDetail
