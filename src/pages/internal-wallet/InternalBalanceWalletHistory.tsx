import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { transactionType } from '@pages/policy-management/limit-management/LimitAndRegulationsConst'
import { moneyInputFormatter } from '@utils/helperFunctions'
import { useToggle } from 'ahooks'
import {
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select
} from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import _ from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
}

function InternalBalanceWalletHistory({
  record,
  isShow,
  onCancel,
  title
}: props) {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({})
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const columns: ColumnsType<any> = [
    {
      title: t('internalBalanceWallet.date'),
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: t('internalBalanceWallet.transactionType'),
      dataIndex: 'type',
      key: 'type',
      render(transactionT) {
        var value = _.find(transactionType, (tt) => tt.value == transactionT)

        return value?.label ?? 'hhwrwe'
      }
    },
    {
      title: t('internalBalanceWallet.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render(value) {
        return moneyInputFormatter(value)
      }
    },
    {
      title: t('internalBalanceWallet.transactionContent'),
      dataIndex: 'transactionContent',
      key: 'transactionContent'
    },
    {
      title: t('internalBalanceWallet.transactionNumber'),
      dataIndex: 'transactionNumber',
      key: 'transactionNumber'
    },
    {
      title: t('internalBalanceWallet.debitCreditAccount'),
      dataIndex: 'debitCreditAccount',
      key: 'debitCreditAccount'
    },
    {
      title: t('partner.balance'),
      dataIndex: 'balance',
      key: 'balance'
    }
  ]

  const handleSearch = () =>
    setSearch({
      ...search,
      ...form.getFieldsValue()
    })

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
    >
      <Card
        title={
          <SearchBar
            onFinish={handleSearch}
            form={form}
            cols='2'
            headerMenu={
              <>
                {/* Ngày cập nhật - từ ngày */}
                <Form.Item
                  name='startDate'
                  label={t('labels.startDate')}
                >
                  <DatePicker
                    format={TimeFormat}
                    allowClear
                  />
                </Form.Item>

                {/* Ngày cập nhật - đến ngày */}
                <Form.Item
                  name='endDate'
                  label={t('labels.endDate')}
                >
                  <DatePicker
                    format={TimeFormat}
                    allowClear
                  />
                </Form.Item>
                <ButtonSearch onClick={handleSearch} />

                <ButtonAdd
                  module='internal-wallet'
                  onClick={addFormToggle}
                />
              </>
            }
          />
        }
      >
        <Table
          columns={columns}
          dataSource={[]}
          scroll={{ x: '100%' }}
          rowKey='id'
          size='small'
          // loading={isLoading}
          locale={{
            emptyText: (
              <>
                <Empty description={t`nodata`} />
              </>
            )
          }}
          pagination={{
            current: 1, // partners?.meta.page,
            pageSize: 10, // partners?.meta.take,
            total: 20, //partners?.meta.itemCount,
            showSizeChanger: false,
            onChange(page) {
              setSearch({
                ...search,
                page
              })
            }
          }}
        />
      </Card>
    </Modal>
  )
}

export default InternalBalanceWalletHistory
