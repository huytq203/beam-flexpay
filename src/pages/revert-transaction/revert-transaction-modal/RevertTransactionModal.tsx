import ItemDetail from '@components/item-detail/ItemDetail'
import {
  getRefundStatusText,
  getTagAccountStatusColor
} from '@utils/helperFunctions'
import {Button, Col, Divider, Modal, Row, Tag} from 'antd'
import {useTranslation} from 'react-i18next'

interface IProps {
  open: boolean
  onCancel: () => void
}

function RevertTransactionModal({onCancel, open}: IProps) {
  const {t} = useTranslation()

  const dummyData = {
    transferId: 'PM 123',
    reciprocalId: '123',
    time: '11/9/2023 12:30',
    payments: 'Mua hàng online',
    amountOfMoney: '100,000 VND',
    status: 'refunded'
  }

  return (
    <Modal
      centered
      onCancel={onCancel}
      open={open}
      width={800}
      footer={null}
      title={t('revert-transaction.checking')}
    >
      <Divider />
      <Row>
        <Col
          xs={24}
          md={12}
        >
          <ItemDetail
            boldTitle={true}
            title={`${t('revert-transaction.transferId')}:`}
            data={dummyData.transferId}
          />
          <ItemDetail
            boldTitle={true}
            title={`${t('revert-transaction.reciprocalId')}:`}
            data={dummyData.reciprocalId}
          />
          <ItemDetail
            boldTitle={true}
            title={`${t('revert-transaction.customerAccount')}:`}
            data={dummyData.time}
          />
        </Col>
        <Col
          xs={24}
          md={12}
        >
          <ItemDetail
            boldTitle={true}
            title={`${t('revert-transaction.payments')}:`}
            data={dummyData.payments}
          />
          <ItemDetail
            boldTitle={true}
            title={`${t('revert-transaction.value')}:`}
            data={dummyData.amountOfMoney}
          />
          <ItemDetail
            boldTitle={true}
            title={`${t('revert-transaction.time')}:`}
            data={dummyData.time}
          />
          <ItemDetail
            boldTitle={true}
            title={`${t('revert-transaction.status')}:`}
            data={
              <Tag color={getTagAccountStatusColor(dummyData.status)}>
                {getRefundStatusText(dummyData.status)}
              </Tag>
            }
          />
        </Col>
      </Row>
      <Row>
        <Col
          span={24}
          className='d-flex justify-end'
        >
          <Button
            type='primary'
            onClick={onCancel}
          >
            {t('buttons.close')}
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default RevertTransactionModal
