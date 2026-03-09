import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import ButtonView from '@components/button-view/ButtonView'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { useGetListDepositRequestQuery } from '@services/apiAccountingRequest'
import {
  AccountingRequestParamsInterface,
  AccountingRequestPayload,
  getAccountingRequestStatus,
  getTransactionTypeAccounting,
  RequestStatusOptions,
  TransactionTypeOptions
} from '@type/accountingRequest'
import { viewMode } from '@type/customer'
import { convertNumber } from '@utils/helperFunctions'
import {
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Space,
  Table,
  Tag
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DepositRequestModal from './deposit-request-modal/DepositRequestModal'
import ButtonApprover from '@components/button-approver/ButtonApprover'

function DepositRequest() {
  const { t } = useTranslation()

  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState<AccountingRequestPayload>({
    page: 1,
    take: 10
    // status: accountStatus.VERIFIED
  })
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined)
  const [form] = Form.useForm()
  const { data: accountingRequest, refetch } =
    useGetListDepositRequestQuery(search)
  /**
   * control action open and close of modal
   * @param state
   */
  const triggerModal = (state: boolean) => {
    setOpen(state)
  }

  const onClearSearch = (field: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [field]: undefined
    }
    setSearch(newSearch)
  }
  /**
   * define column of table
   */
  const columns: ColumnsType<any> = [
    {
      title: 'Transaction Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 200,
      render: (value, record, index) =>
        value ? dayjs(value).format('DD/MM/YYYY HH:mm:ss') : '-'
    },
    {
      title: 'Id Proposal',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 200
    },
    {
      title: 'From account',
      dataIndex: 'from',
      key: 'from',
      render: (value, record, index) => {
        return record?.from?.name ?? '-'
      },
      width: 200
    },
    {
      title: 'To account',
      dataIndex: 'to',
      key: 'to',
      render(value, record, index) {
        return record?.to?.name ?? '-'
      },
      align: 'center',
      width: 200
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      width: 200,
      render: (record) => <div>{convertNumber(record)}</div>
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
      align: 'center',
      width: 150,
      render: (transactionType: string) => (
        console.log('transactionType', transactionType),
        (
          <Tag color={getTransactionTypeAccounting(transactionType)?.value}>
            {getTransactionTypeAccounting(transactionType)?.label}
          </Tag>
        )
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 150,
      render: (status: string) => (
        <Tag color={getAccountingRequestStatus(status)?.value}>
          {getAccountingRequestStatus(status)?.label}
        </Tag>
      )
    },
    {
      title: 'Reason Reject',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      align: 'center'
    },
    {
      title: t('labels.action'),
      render(value, record, index) {
        return (
          <Space>
            <Col>
              <ButtonView
                type='primary'
                className='mr-10'
                ghost
                onClick={() => {
                  setSelectedId(record.id)
                  setMode(viewMode.view)
                  triggerModal(true)
                }}
              />
            </Col>
            <Col>
              <ButtonUpdate
                onClick={() => {
                  setSelectedId(record.id)
                  setMode(viewMode.update)
                  triggerModal(true)
                }}
                module='internalwallet'
              />
            </Col>
            <Col>
              <ButtonApprover
                module='internalwallet'
                onClick={() => {
                  setSelectedId(record.id)
                  setMode(viewMode.update)
                  triggerModal(true)
                }}
              />
            </Col>
          </Space>
        )
      },
      align: 'center',
      width: 150
    }
  ]

  const onSearch = (value: AccountingRequestParamsInterface) => {
    const walletNumber = value.walletNumber?.trim()
    const startDate = value.startDate
    const endDate = value.endDate
    setSearch({
      page: 1,
      ...value,
      walletNumber: walletNumber,
      startDate: startDate,
      endDate: endDate
    })
  }

  return (
    <Card
      title={
        <SearchBar
          onFinish={onSearch}
          cols='2'
          form={form}
          headerMenu={
            <>
              <Form.Item
                name='status'
                label={t`internal-wallet.title.status_request`}
              >
                <Select
                  placeholder={t`internal-wallet.placeholders.status`.toString()}
                  options={RequestStatusOptions}
                  allowClear
                  onClear={() => onClearSearch('status')}
                  onChange={(e) => {
                    if (e === '' || e === undefined) {
                      setSearch({
                        ...search,
                        status: undefined
                      })
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name='transactionType'
                label={t`internal-wallet.title.transaction_type`}
              >
                <Select
                  placeholder={t`internal-wallet.placeholders.status`.toString()}
                  options={TransactionTypeOptions}
                  allowClear
                  onClear={() => onClearSearch('transactionType')}
                  onChange={(e) => {
                    if (e === '' || e === undefined) {
                      setSearch({
                        ...search,
                        transactionType: undefined
                      })
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name='startDate'
                label={t`internal-account-report.start-time`}
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  className='w-100'
                  placeholder={t`internal-account-report.placeholders.start-time`.toString()}
                  onChange={(e) => {
                    if (!e) {
                      onClearSearch('startDate')
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name='endDate'
                label={t`internal-account-report.end-time`}
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  className='w-100'
                  placeholder={t`internal-account-report.placeholders.end-time`.toString()}
                  onChange={(e) => {
                    if (!e) {
                      onClearSearch('endDate')
                    }
                  }}
                />
              </Form.Item>
              <ButtonSearch htmlType='submit' />

              <ButtonAdd
                module='internalwallet'
                type='primary'
                onClick={() => {
                  setMode(viewMode.create)
                  triggerModal(true)
                }}
              />

              <ButtonExcel
                module='bank_management'
                label={t('buttons.exportFile').toString()}
              />
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={accountingRequest?.data ?? []}
        bordered
        scroll={{ x: '100%' }}
        rowKey={'id'}
        pagination={{
          current: accountingRequest?.meta?.page,
          pageSize: accountingRequest?.meta.take,
          total: accountingRequest?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      {open &&
        ((selectedId && mode === viewMode.update) ||
          mode === viewMode.create ||
          (selectedId && mode === viewMode.view)) && (
          <DepositRequestModal
            open={open}
            onCancel={() => triggerModal(false)}
            mode={mode}
            selectedId={selectedId}
            refetch={refetch}
          />
        )}
    </Card>
  )
}
export default DepositRequest
