import FloatingLabelInput from '@components/floating-label-input/FloatingLabelInput'
import TransactionStep from '@components/transaction-step/TransactionStep'
import { TimeFullFormat } from '@constants/datetime'
import { useTransactionInfoFindOneQuery } from '@services/cmsService'
import { CustomerInfoWalletDto, TransactionMainDto, TransactionStepDto } from '@type/application'
import { convertLocalStringNumber, getPaymentMethod, getStatusText, getTextTransactionStatus, getTransactionType } from '@utils/helperFunctions'
import { Col, Divider, Empty, Modal, Row, Spin, Typography } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  open: boolean
  onCancel: () => void
  id: string
}
const xs = 24
const md = 12
const xl = 6

const TransactionDetail = ({ open, onCancel, id }: IProps) => {
  const { t } = useTranslation()

  const { data, isLoading, isError, refetch } = useTransactionInfoFindOneQuery({ id }, { skip: !id })

  // Memo hóa các giá trị derived
  const transactionMain = useMemo(
    () => data?.transaction as TransactionMainDto | undefined,
    [data]
  )
  const customerInfo = useMemo(
    () => data?.customer as CustomerInfoWalletDto | undefined,
    [data]
  )
  const transactionSteps = useMemo(
    () => data?.transactionSteps as TransactionStepDto[] | undefined,
    [data]
  )

  useEffect(() => {
    if (id && open) refetch()
  }, [id, open, refetch])

  const onClose = () => {
    onCancel()
  }

  return (
    <Modal
      open={open}
      title={t`transfer-history.modal.detail`}
      width={1200}
      footer={null}
      onCancel={onClose}
      centered
      destroyOnClose
      afterClose={() => {}}
    >
      {isLoading ? (
        <Spin style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }} />
      ) : isError ? (
        <Empty description={t('transfer-history.noData') || 'Không có dữ liệu'} />
      ) : !transactionMain ? (
        <Empty description={t('transfer-history.noData') || 'Không có dữ liệu'} />
      ) : (
        <>
          <Divider className='mt-20'>Thông Tin Chi Tiết Giao Dịch</Divider>
          <Row>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.transferNumber`.toString()}
                value={transactionMain?.code || ''}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.transferType`.toString()}
                value={getTransactionType(transactionMain?.type || '')}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.amount_transaction`.toString()}
                value={convertLocalStringNumber(transactionMain?.amount || 0)}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.fee`.toString()}
                value={convertLocalStringNumber(transactionMain?.fee || 0)}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.status`.toString()}
                value={getTextTransactionStatus(transactionMain?.status || '')}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.time`.toString()}
                value={dayjs(transactionMain?.createdAt).format(TimeFullFormat)}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.note`.toString()}
                value={transactionMain?.note || ''}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.bankName`.toString()}
                value={transactionMain?.bankName || ''}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.paymentMethod`.toString()}
                value={getPaymentMethod(transactionMain?.paymentMethod || '')}
              />
            </Col>
          </Row>
          <Divider className='mt-20'>Thông Tin Ví Điện Tử </Divider>
          <Row>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.accountName`.toString()}
                value={customerInfo?.fullName || ''}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.accountCode`.toString()}
                value={customerInfo?.sub || ''}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.phoneNumber`.toString()}
                value={customerInfo?.phoneNumber || ''}
              />
            </Col>
            <Col xs={xs} md={md} xl={xl}>
              <FloatingLabelInput
                label={t`transfer-history.status`.toString()}
                value={getStatusText(customerInfo?.active)}
              />
            </Col>
          </Row>
          <Divider className='mt-20'>Lịch Sử Luồng Tiền</Divider>
          <TransactionStep transactionSteps={transactionSteps || []} />
        </>
      )}
    </Modal>
  )
}

export default TransactionDetail
