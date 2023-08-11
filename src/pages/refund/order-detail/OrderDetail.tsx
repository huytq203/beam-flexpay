import ItemDetail from '@components/item-detail/ItemDetail'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import { useGetRefundDetailQuery } from '@services/refundService'
import { REFUND_STATUS, RefundListDataType } from '@type/refund'
import { convertNumber } from '@utils/helperFunctions'
import { Button, Col, Divider, Row, Spin, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { t } from 'i18next'

interface IOrderDetail {
  onCancel: () => void
  selectedItem: RefundListDataType | undefined
}

const { Text } = Typography

function OrderDetail({ onCancel, selectedItem }: IOrderDetail) {
  const getStatus = (value: string) => {
    switch (value) {
      case REFUND_STATUS.SUCCESS:
        return <Tag color='warning'>{t('refund.pendingRefund')}</Tag>
      case REFUND_STATUS.REFUND_SUCCESS:
        return <Tag color='success'>{t('refund.successRefund')}</Tag>
      default:
        return t('labels.nodata')
    }
  }

  const { data: DetailData, isLoading } = useGetRefundDetailQuery(
    selectedItem?.id as string
  )

  return (
    <>
      {isLoading ? (
        <Spin />
      ) : (
        <>
          <Row gutter={GUTTER}>
            <Divider style={{ margin: '10px 0!important' }} />
            <Col
              md={24}
              xl={12}
            >
              <Text className='f-24 d-block fw-600 mb-20'>
                {t('refund.orderModal.transferInformation')}
              </Text>
              <ItemDetail
                title={`${t('refund.transferId')}:`}
                data={DetailData?.code}
              />
              <ItemDetail
                title={`${t('refund.orderModal.time')}:`}
                data={dayjs(DetailData?.createdAt).format(TimeFullFormat)}
              />
              <ItemDetail
                title={`${t('refund.orderModal.type')}:`}
                data={DetailData?.type}
              />
              <ItemDetail
                title={`${t('refund.orderModal.description')}:`}
                data={DetailData?.note}
              />
              <ItemDetail
                title={`${t('refund.orderModal.amountOfMoney')}:`}
                data={
                  DetailData?.amount
                    ? convertNumber(Number(DetailData?.amount))
                    : t(`labels.nodata`)
                }
              />
              <ItemDetail
                title={`${t('refund.status')}:`}
                data={getStatus(DetailData?.status as string)}
              />
            </Col>
            <Col
              md={24}
              xl={12}
            >
              <Text className='f-24 d-block fw-600 mb-20'>
                {t('refund.orderModal.sellerInformation')}
              </Text>
              <ItemDetail
                title={`${t('refund.merchantAccount')}:`}
                data={DetailData?.toCustomer?.accountNumber}
              />
              <ItemDetail
                title={`${t('refund.merchant')}:`}
                data={
                  selectedItem?.toCustomer?.fullName
                    ? selectedItem?.toCustomer?.fullName
                    : t(`labels.nodata`)
                }
              />
              <Text className='f-24 d-block fw-600 mb-20'>
                {t('refund.orderModal.buyerInformation')}
              </Text>
              <ItemDetail
                title={`${t('refund.orderModal.buyer')}:`}
                data={DetailData?.fromCustomer?.accountNumber}
              />
              <ItemDetail
                title={`${t('refund.orderModal.buyerName')}:`}
                data={
                  selectedItem?.fromCustomer?.fullName
                    ? selectedItem?.fromCustomer?.fullName
                    : t(`labels.nodata`)
                }
              />
            </Col>
          </Row>
          <Row justify='end'>
            <Col span={2}>
              <Button
                type='primary'
                onClick={onCancel}
              >
                {t('buttons.close')}
              </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default OrderDetail
