import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat, TimeFullFormat } from '@constants/datetime'
import {
  useExportRefundCSVQuery,
  useGetRefundListQuery
} from '@services/refundService'
import { viewMode } from '@type/customer'
import {
  REFUND_STATUS,
  RefundListDataType,
  RefundSearchParamsType
} from '@type/refund'
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
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import RefundModal from './refund-modal/RefundModal'

function Refund() {
  const { t } = useTranslation()
  const [form] = useForm()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState(viewMode.view)
  const [skip, setSkip] = useState(true)
  const [search, setSearch] = useState<RefundSearchParamsType>({
    page: 1,
    take: 10
  })
  const [selectedItem, setSelectedItem] = useState<RefundListDataType>()

  const { data: ListRefund, refetch } = useGetRefundListQuery(search)
  const { isSuccess } = useExportRefundCSVQuery(
    { pageCount: ListRefund?.meta?.pageCount, ...search },
    { skip: skip, refetchOnMountOrArgChange: true }
  )

  const toggleModal = (toggle: boolean) => {
    setOpen(toggle)
  }

  const exportData = () => {
    if (ListRefund?.meta.itemCount) {
      setSkip(false)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setSkip(true)
    }
  }, [isSuccess])

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

  const columns: ColumnsType<any> = [
    {
      title: t('refund.time'),
      align: 'center',
      key: 'createdAt',
      render: (record) => (
        <div>{dayjs(record?.createdAt).format(TimeFullFormat)}</div>
      ),
      width: 150,
      fixed: 'left'
    },
    {
      title: t('refund.transferId'),
      align: 'center',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      fixed: 'left'
    },
    {
      title: t('refund.merchantAccount'),
      align: 'center',
      key: 'merchantAccount',
      width: 200,
      render: (record) => <div>{record?.fromCustomer?.accountNumber}</div>
    },
    {
      title: t('refund.merchant'),
      align: 'center',
      key: 'merchantAccount',
      width: 200,
      render: (record) => (
        <div>
          {record?.fromCustomer?.fullName
            ? record?.fromCustomer?.fullName
            : '-'}
        </div>
      )
    },
    {
      title: t('refund.payments'),
      dataIndex: 'gateway',
      key: 'payments',
      width: 200,
      align: 'center'
    },
    {
      title: t('refund.status'),
      align: 'center',
      key: 'status',
      width: 200,
      render: (record) => getStatus(record.status)
    },
    {
      title: t('refund.detail'),
      align: 'center',
      key: 'detail',
      render: (record) => (
        <Button
          onClick={() => {
            setMode(viewMode.view)
            toggleModal(true)
            setSelectedItem(record)
          }}
        >
          {t('buttons.detail')}
        </Button>
      ),
      width: 150,
      fixed: 'right'
    },
    {
      title: t('refund.refund'),
      align: 'center',
      key: 'refund',
      width: 150,
      render: (record) => (
        <Button
          type='primary'
          ghost
          onClick={() => {
            setMode(viewMode.refund)
            toggleModal(true)
            setSelectedItem(record)
          }}
        >
          {t('buttons.refund')}
        </Button>
      ),
      fixed: 'right'
    }
  ]

  const statusOptions = [
    { label: t('labels.all'), value: '' },
    { label: t('labels.refunded'), value: true },
    { label: t('labels.waitingForRefund'), value: false }
  ]

  const onSearch = (values: any) => {
    const record: RefundSearchParamsType = {
      ...values,
      from: values['form'] ? undefined : dayjs(values['form']).toISOString(),
      to: values['to'] ? undefined : dayjs(values['to']).toISOString()
    }
    const newQuery = {
      ...search,
      ...record
    }
    setSearch(newQuery)
  }

  const getTitleModal = useMemo(() => {
    if (mode === viewMode.view) return t('refund.orderModal.title')
    else return t('refund.orderModal.confirmRefund')
  }, [mode])

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={onSearch}
          // initialValues={{ status: '' }}
          cols='2'
          headerMenu={
            <>
              <Form.Item
                label={t('refund.merchantAccount')}
                name='merchantAccount'
              >
                <Input
                  className='w-100'
                  placeholder={`${t('placeholders.merchantAccount')}`}
                />
              </Form.Item>
              <Form.Item
                label={t('refund.merchant')}
                name='merchant'
              >
                <Input
                  className='w-100'
                  placeholder={`${t('placeholders.merchant')}`}
                />
              </Form.Item>
              <Form.Item
                label={t('refund.status')}
                name='status'
              >
                <Select
                  placeholder={`${t('placeholders.status')}`}
                  options={statusOptions}
                />
              </Form.Item>
              <Form.Item
                label={t('refund.transferId')}
                name='code'
              >
                <Input
                  className='w-100'
                  placeholder={`${t('placeholders.transferId')}`}
                />
              </Form.Item>
              <Form.Item
                label={t('refund.startDate')}
                name='from'
                rules={[
                  () => ({
                    validator(_, value) {
                      if (
                        value !== null &&
                        form.getFieldValue('to') !== null &&
                        value > form.getFieldValue('to')
                      ) {
                        form.setFields([
                          {
                            name: 'to',
                            errors: []
                          }
                        ])
                        return Promise.reject(
                          new Error(`${t('messages.startDateValidate')}`)
                        )
                      } else {
                        form.setFields([
                          {
                            name: 'to',
                            errors: []
                          }
                        ])
                        return Promise.resolve()
                      }
                    }
                  })
                ]}
              >
                <DatePicker
                  showTime
                  format={TimeFullFormat}
                  allowClear
                  className='w-100'
                />
              </Form.Item>
              <Form.Item
                label={t('refund.endDate')}
                name='to'
                rules={[
                  () => ({
                    validator(_, value) {
                      if (
                        value !== null &&
                        form.getFieldValue('from') !== null &&
                        value < form.getFieldValue('from')
                      ) {
                        form.setFields([
                          {
                            name: 'from',
                            errors: []
                          }
                        ])
                        return Promise.reject(
                          new Error(`${t('messages.endDateValidate')}`)
                        )
                      } else {
                        form.setFields([
                          {
                            name: 'from',
                            errors: []
                          }
                        ])
                        return Promise.resolve()
                      }
                    }
                  })
                ]}
              >
                <DatePicker
                  format={TimeFullFormat}
                  allowClear
                  showTime
                  className='w-100'
                />
              </Form.Item>

              <ButtonExcel
                module='customer'
                onClick={exportData}
              />
              <ButtonSearch htmlType='submit' />
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={ListRefund?.data}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: ListRefund?.meta?.page || 1,
          pageSize: ListRefund?.meta?.take || 10,
          total: ListRefund?.meta?.itemCount || 0,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <RefundModal
        refetch={refetch}
        open={open}
        onCancel={() => toggleModal(false)}
        title={getTitleModal}
        mode={mode}
        selectedItem={selectedItem}
      />
    </Card>
  )
}

export default Refund
