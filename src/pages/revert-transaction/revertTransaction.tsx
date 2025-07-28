import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import {
  getRefundStatusText,
  getTagAccountStatusColor
} from '@utils/helperFunctions'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Table,
  Tag
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import RevertTransactionModal from './revert-transaction-modal/RevertTransactionModal'
import { GUTTER } from '@constants/appConstant'

const { RangePicker } = DatePicker

function RevertTransaction() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const dummyData = [
    {
      id: 1,
      time: '09/11/2022 12:30',
      transferId: '123456789',
      reciprocalId: '1231231231',
      customerAccount: '123456789',
      value: '123456789',
      payments: 'BIDV',
      status: 'refunded'
    },
    {
      id: 2,
      time: '09/11/2022 12:30',
      transferId: '123456789',
      reciprocalId: '1231231231',
      customerAccount: '123456789',
      value: '123456789',
      payments: 'BIDV',
      status: 'waitingForRefund'
    }
  ]

  const toggleModal = (toggle: boolean) => {
    setOpen(toggle)
  }

  const columns: ColumnsType<any> = [
    {
      title: t('refund.time'),
      dataIndex: 'time',
      key: 'id',
      align: 'center'
    },
    {
      title: t('revert-transaction.transferId'),
      dataIndex: 'transferId',
      key: 'transferId',
      align: 'center'
    },
    {
      title: t('revert-transaction.reciprocalId'),
      dataIndex: 'reciprocalId',
      key: 'reciprocalId',
      align: 'center'
    },
    {
      title: t('revert-transaction.customerAccount'),
      dataIndex: 'customerAccount',
      key: 'customerAccount',
      align: 'center'
    },
    {
      title: t('revert-transaction.payments'),
      dataIndex: 'payments',
      key: 'payments',
      align: 'center'
    },
    {
      title: t('revert-transaction.value'),
      dataIndex: 'value',
      key: 'value',
      align: 'center'
    },
    {
      title: t('revert-transaction.status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <Tag color={getTagAccountStatusColor(status)}>
          {getRefundStatusText(status)}
        </Tag>
      )
    },
    {
      title: t('refund.detail'),
      dataIndex: '',
      key: '',
      render: () => (
        <Button onClick={() => toggleModal(true)}>
          {t('buttons.checking')}
        </Button>
      )
    }
  ]

  const statusOptions = [
    { label: t('labels.all'), value: 'all' },
    { label: t('labels.refunded'), value: true },
    { label: t('labels.waitingForRefund'), value: false }
  ]
  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <>
              <Form.Item
                label={t('revert-transaction.customerAccount')}
                name='customerAccount'
              >
                <Input placeholder={`${t('placeholders.customerAccount')}`} />
              </Form.Item>
              <Form.Item
                label={t('revert-transaction.transferId')}
                name='transferId'
              >
                <Input placeholder={`${t('placeholders.transferId')}`} />
              </Form.Item>
              <Form.Item
                label={t('revert-transaction.reciprocalId')}
                name='reciprocalId'
              >
                <Input placeholder={`${t('placeholders.reciprocalId')}`} />
              </Form.Item>
              <Form.Item
                label={t('revert-transaction.status')}
                name='status'
              >
                <Select
                  placeholder={`${t('placeholders.status')}`}
                  options={statusOptions}
                />
              </Form.Item>
              <Form.Item
                label={t('revert-transaction.date')}
                name='date'
              >
                <RangePicker />
              </Form.Item>

              <ButtonExcel module='customer' />
              <ButtonSearch />
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={dummyData}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
      />
      <RevertTransactionModal
        open={open}
        onCancel={() => toggleModal(false)}
      />
    </Card>
  )
}

export default RevertTransaction
