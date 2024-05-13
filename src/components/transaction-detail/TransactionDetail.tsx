import ItemDetail from '@components/item-detail/ItemDetail'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import {
  useLazyTransactionFindOneQuery,
  useTransactionUpdateStatusMutation
} from '@services/cmsService'
import { TransactionStatus } from '@type/transfer'
import {
  convertNumber,
  getTransactionStatus,
  getTransactionType
} from '@utils/helperFunctions'
import {
  Button,
  Col,
  Modal,
  Radio,
  RadioChangeEvent,
  Row,
  Tag,
  message
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  open: boolean
  onCancel: () => void
  id: string
}

type StatusType =
  | 'SUCCESS'
  | 'APPROVED'
  | 'PENDING'
  | 'FAILED'
  | 'ERROR'
  | 'REFUND_SUCCESS'

const TransactionDetail = ({ open, onCancel, id }: IProps) => {
  const { t } = useTranslation()

  const [type, setType] = useState<StatusType>()

  const [changeStatus] = useTransactionUpdateStatusMutation()

  const [fnQuery, { data: transaction }] = useLazyTransactionFindOneQuery()

  const plainOptions = [
    {
      label: t`transfer-history.modal.approve`,
      value: TransactionStatus.SUCCESS
    },
    {
      label: t`transfer-history.modal.reject`,
      value: TransactionStatus.FAILED
    }
  ]

  const onChange = (event: RadioChangeEvent) => {
    setType(event.target.value)
  }

  const showMessage = (msg: string) => {
    message.destroy()
    message.success(msg)
  }

  const updateTransaction = () => {
    if (type !== undefined) {
      changeStatus({ id, updateTransactionStatusDto: { status: type } })
        .unwrap()
        .then(() => {
          if (type === 'SUCCESS') {
            showMessage(
              t('transfer-history.modal.approved-success', {
                transaction: transaction?.code
              })
            )
          } else {
            showMessage(
              t('transfer-history.modal.rejected-success', {
                transaction: transaction?.code
              })
            )
          }
          setType(undefined)
        })
      onCancel()
    }
  }

  const onClose = () => {
    setType(undefined)
    onCancel()
  }

  useEffect(() => {
    if (id) fnQuery({ id: id })
  }, [id])

  return (
    <Modal
      open={open}
      title={t`transfer-history.modal.detail`}
      width={850}
      footer={null}
      onCancel={onClose}
      centered
      afterClose={() => {}}
    >
      <Row>
        <Col flex='1'>
          <ItemDetail
            boldTitle={true}
            title={t`transfer-history.transferNumber`.toString()}
            data={transaction?.referenceId}
          />
          <ItemDetail
            boldTitle={true}
            title={t`transfer-history.accountName`.toString()}
            data={transaction?.sourceAccountName}
          />
          <ItemDetail
            boldTitle={true}
            title={t`transfer-history.transferType`.toString()}
            data={`${
              transaction?.type ? getTransactionType(transaction?.type) : ''
            }`}
          />
          <ItemDetail
            boldTitle={true}
            title={t`transfer-history.status`.toString()}
            data={
              <Tag
                color={getTransactionStatus(transaction?.status ?? '')?.value}
              >
                {getTransactionStatus(transaction?.status ?? '')?.label}
              </Tag>
            }
          />
        </Col>
        <Col flex='1'>
          {transaction?.references.map((ref) => (
            <ItemDetail
              key={crypto.randomUUID()}
              boldTitle={true}
              title={ref.from}
              data={convertNumber(ref.amount) + ' VNĐ'}
            />
          ))}
          <ItemDetail
            boldTitle={true}
            title={t`transfer-history.time`.toString()}
            data={`${dayjs(transaction?.createdAt).format(TimeFullFormat)}`}
          />
          <ItemDetail
            boldTitle={true}
            title={t`transfer-history.note`.toString()}
            data={transaction?.note}
          />
          {transaction?.status === TransactionStatus.PENDING && (
            <Row className='mb-20'>
              <Col>
                <Radio.Group
                  options={plainOptions}
                  onChange={onChange}
                  value={type}
                />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
      <Row
        justify='center'
        gutter={GUTTER}
      >
        {transaction?.status === TransactionStatus.PENDING && (
          <Col span={2}>
            <Button
              type='primary'
              onClick={updateTransaction}
              disabled={!type}
            >
              {t('transfer-history.modal.update')}
            </Button>
          </Col>
        )}
        <Col span={2}>
          <Button
            type='primary'
            onClick={onClose}
          >
            {t('buttons.close')}
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}
export default TransactionDetail