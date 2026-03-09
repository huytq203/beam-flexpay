import { Dayjs } from 'dayjs'

import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { transactionType } from '@pages/policy-management/limit-management/LimitAndRegulationsConst'
import { useGetInternalWalletTransactionsQuery } from '@services/apiInternalWallet'
import { viewMode } from '@type/customer'
import {
  InternalWallet,
  InternalWalletTransactionPayload
} from '@type/internalWallet'
import {
  blockArrowValue,
  blockLetterDecimal,
  moneyInputFormatter
} from '@utils/helperFunctions'
import {
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Table,
  TimeRangePickerProps
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import _ from 'lodash'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
  mode: viewMode
  selectedInternalWallet?: InternalWallet
}

const { RangePicker } = DatePicker

const rangePresets: TimeRangePickerProps['presets'] = [
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] }
]

function InternalWalletTransaction(props: props) {
  const [form] = Form.useForm()
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(1, 'year'))
  const [endDate, setEndDate] = useState<Dayjs>(dayjs())

  const [search, setSearch] = useState<InternalWalletTransactionPayload>({
    order: 'DESC',
    page: 1,
    take: 10,
    query: '',
    orderBy: 'createdAt',
    startDate: startDate.format('DD/MM/YYYY HH:mm:ss'),
    endDate: endDate.format('DD/MM/YYYY HH:mm:ss')
  })

  const { t } = useTranslation()

  useEffect(() => {
    setSearch({
      ...search,
      internalWalletId: props.selectedInternalWallet?.id,
      startDate: startDate.format('DD/MM/YYYY HH:mm:ss'),
      endDate: endDate.format('DD/MM/YYYY HH:mm:ss')
    })
  }, [props.selectedInternalWallet])

  const { data: transactionData, refetch } =
    useGetInternalWalletTransactionsQuery(search)
  console.log('transactionData', transactionData)
  const columns: ColumnsType<any> = [
    {
      title: t('internal-wallet.transaction.date'),
      dataIndex: 'transaction',
      key: 'transaction.transactionDate',
      render(value) {
        return dayjs(value?.transactionDate).format('DD/MM/YYYY HH:mm:ss')
      }
    },
    {
      title: t('internal-wallet.transaction.type'),
      dataIndex: 'transaction',
      key: 'transaction.type',
      render(value) {
        var tt = _.find(transactionType, (tt) => tt?.value == value?.type)

        return tt?.label
      }
    },
    {
      title: t('internal-wallet.transaction.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render(value) {
        return moneyInputFormatter(value)
      }
    },
    // {
    //   title: t('internal-wallet.transaction.note'),
    //   dataIndex: 'transaction',
    //   key: 'note',
    //   render(value) {
    //     return value.note
    //   }
    // },
    {
      title: t('internal-wallet.transaction.code'),
      dataIndex: 'transaction',
      key: 'referenceId',
      render(value) {
        return value?.referenceId
      }
    },
    {
      title: t('internal-wallet.transaction.debitCreditAccount'),
      dataIndex: 'targetAccount',
      key: 'targetAccount'
    },
    {
      title: t('internal-wallet.transaction.afterBalance'),
      dataIndex: 'afterAvailable',
      key: 'afterAvailable',
      render(value) {
        return moneyInputFormatter(value)
      }
    }
  ]

  const handleSearch = () => {
    setSearch({
      ...search,
      startDate: startDate.format('DD/MM/YYYY HH:mm:ss'),
      endDate: endDate.format('DD/MM/YYYY HH:mm:ss')
    })
  }

  const onDateRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (dates) {
      let startDate = (dates[0] as Dayjs).startOf('day')
      let endDate = (dates[1] as Dayjs).endOf('day')

      setStartDate(startDate)
      setEndDate(endDate)
    }
  }

  useEffect(() => {
    refetch()
  }, [search])

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={handleSearch}
          cols='2'
          headerMenu={
            <>
              {/* Ngày cập nhật - từ ngày */}
              <Form.Item label={t('internal-wallet.transaction.date')}>
                <RangePicker
                  value={[startDate, endDate]}
                  allowClear={false}
                  presets={rangePresets}
                  format='DD/MM/YYYY'
                  onChange={onDateRangeChange}
                />
              </Form.Item>

              {/* Tai khoan */}
              <Form.Item
                name='accountName'
                label={t('transfer-history.accountName')}
              >
                <Input
                  onKeyDown={blockArrowValue}
                  onKeyPress={blockLetterDecimal}
                />
              </Form.Item>

              {/* Ma giao dich */}
              <Form.Item
                name='transactionCode'
                label={t('internal-wallet.transaction.code')}
              >
                <Input
                  onKeyDown={blockArrowValue}
                  onKeyPress={blockLetterDecimal}
                />
              </Form.Item>

              <ButtonSearch onClick={handleSearch} />
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={transactionData?.data ?? []}
        rowKey='id'
        size='middle'
        bordered
        pagination={{
          current: transactionData?.meta.page,
          pageSize: transactionData?.meta.take,
          total: transactionData?.meta.itemCount,
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
  )
}

export default InternalWalletTransaction
