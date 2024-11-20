import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonView from '@components/button-view/ButtonView'
import SearchBar from '@components/search-bar/SearchBar'
import Table from '@components/table/Table'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat, TimeFullFormat } from '@constants/datetime'
import { TRANSACTION_STATUS_OPTIONS } from '@constants/partnerOptions'
import { useAppSelector } from '@hooks/hook'
import { usePaymentOrderFindAllQuery } from '@services/cmsPaymentOrder'
import { usePaymentPartnerFindAllQuery } from '@services/cmsPaymentParner'
import {
  PaymentOrderDetailDto,
  PaymentOrderFindAllApiArg
} from '@type/application'
import { useToggle } from 'ahooks'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useForm } from 'antd/lib/form/Form'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineRefresh } from 'react-icons/md'
import RepaymentTransactionDetail from './RepaymentTransactionDetail'
import PartnerSelect from '@components/partner-select/PartnerSelect'
import ButtonRefresh from '@components/button-refresh/ButtonRefresh'

function RepaymentTransaction() {
  const { t } = useTranslation()
  const [form] = useForm<PaymentOrderFindAllApiArg>()
  const { accessToken } = useAppSelector((state) => state.auth)

  const [viewDetail, { toggle: viewDetailToggle }] = useToggle()
  const [recordDetail, setRecordDetail] = useState<PaymentOrderDetailDto>()

  const [search, setSearch] = useState<PaymentOrderFindAllApiArg>({
    take: 10,
    page: 1,
    paymentServiceType: 'REPAYMENT'
  })

  const fnSearch = usePaymentOrderFindAllQuery(search)

  const { data: payments } = fnSearch
  const { data: partners } = usePaymentPartnerFindAllQuery({
    page: 1,
    take: 10,
    type: 'REPAYMENT'
  })

  const handleViewDetail = (record: PaymentOrderDetailDto) => {
    setRecordDetail(record)
    viewDetailToggle()
  }

  const handleRefresh = () => {
    fnSearch.refetch()
  }

  //#region Columns
  const columns: ColumnsType<PaymentOrderDetailDto> = [
    {
      title: t('partner-repayment-list.id'),
      width: 80,
      ellipsis: true,
      align: 'center',
      fixed: 'left',
      render(value, record, index) {
        if (search.page === 1) {
          return index + search.page
        } else {
          return index + ((search.page - 1) * search.take + 1)
        }
      }
    },
    {
      title: t('partner-repayment-list.customer'),
      align: 'center',
      dataIndex: ['partnerOrderCode'],
      width: 180,
      fixed: 'left'
    },
    {
      title: t('partner-repayment-list.invoiceDate'),
      align: 'center',
      render(value, record, index) {
        let dateFrom = dayjs(record.paymentPeriodFrom)
          .format(TimeFormat)
          .toString()
        let dateTo = dayjs(record.paymentPeriodTo)
          .locale('vi')
          .format(TimeFormat)
          .toString()
        let date
        if (dateFrom !== 'Invalid Date') date = dateFrom
        if (dateTo !== 'Invalid Date') date += ' - ' + dateTo
        if (date) return date
        else return ''
      },
      width: 200
    },
    {
      title: t('partner-repayment-list.repaymentPartner'),
      align: 'center',
      dataIndex: ['customerPaymentPartner', 'paymentPartner', 'name'],
      width: 200
    },
    {
      title: t('partner-repayment-list.walletId'),
      align: 'center',
      dataIndex: ['customerPaymentPartner', 'customer', 'phoneNumber'],
      width: 200
    },
    {
      title: t('partner-repayment-list.amount'),
      dataIndex: ['amount'],
      align: 'center',
      width: 200,
      render(value, record, index) {
        return (
          <InputNumber
            value={value || 0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            readOnly
            bordered={false}
          />
        )
      }
    },
    {
      title: t('partner-repayment-list.invoiceSource'),
      dataIndex: 'balanceSource',
      align: 'center',
      width: 200
    },
    {
      title: t('partner-repayment-list.invoiceStatus'),
      align: 'center',
      render(value, record, index) {
        return record.partnerOrderStatus === 0
          ? t('partner-repayment-list.unpaid')
          : t('partner-repayment-list.paid')
      },
      width: 200
    },
    {
      title: t('partner-repayment-list.transactionStatus'),
      dataIndex: 'transactionStatus',
      align: 'center',
      render(value, record, index) {
        switch (value) {
          case 'SUCCESS':
            return t('partner-repayment-list.success')
          case 'APPROVED':
            return t('partner-repayment-list.approved')
          case 'FAILED':
            return t('partner-repayment-list.failed')
          default:
            return t('partner-repayment-list.pending')
        }
      },
      width: 200
    },
    {
      title: t('partner-repayment-list.transactionDate'),
      align: 'center',
      render(value, record, index) {
        return dayjs(record.createdAt).format(TimeFormat).toString()
      },
      width: 140
    },
    {
      title: t('labels.action'),
      align: 'center',
      fixed: 'right',
      render(value, record, index) {
        return (
          <Row gutter={GUTTER}>
            <Col>
              <Tooltip title={t('partner-repayment-list.checkStatus')}>
                <ButtonRefresh
                  onClick={handleRefresh}
                />
              </Tooltip>
            </Col>
            <Col>
              <ButtonView onClick={() => handleViewDetail(record)} />
            </Col>
          </Row>
        )
      },
      width: 100
    }
  ]
  //#endregion

  const handleSearch = (values: PaymentOrderFindAllApiArg) => {
    if (values['from']) values['from'] = dayjs(values['from']).toISOString()
    if (values['to']) values['to'] = dayjs(values['to']).toISOString()
    setSearch({
      ...search,
      ...values,
      page: 1
    })
  }

  const handleExport = async () => {

    const _headers = new Headers()
    _headers.append('Authorization', `Bearer ${accessToken}`)
    var requestOptions: any = {
      method: 'GET',
      headers: _headers,
      redirect: 'follow'
    }
    let args = ''
    for (const key in search) {
      if ((search as any)[key]) {
        args += key + '=' + (search as any)[key] + '&'
      }
    }
    fetch(
      import.meta.env.VITE_API_URL + '/payment-order/export/excel?' + args,
      requestOptions
    )
      .then((response) => response.blob())
      .then((result) => {
        const downloadItem = document.createElement('a')
        const url = window.URL || window.webkitURL
        downloadItem.href = url.createObjectURL(result)
        downloadItem.target = '_blank'
        downloadItem.download = `payment-order-repayment.xlsx`
        downloadItem.click()
      })
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              form={form}
              layout='vertical'
              onFinish={handleSearch}
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    name='customerPhone'
                    label={t('partner-repayment-list.phone')}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item
                    name='amount'
                    label={t('partner-repayment-list.amount')}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col flex='200px'>
                  <Form.Item
                    name='transactionStatus'
                    label={t('partner-repayment-list.transactionStatus')}
                  >
                    <Select
                      allowClear
                      options={TRANSACTION_STATUS_OPTIONS()}
                    />
                  </Form.Item>
                </Col>
                <Col flex='170px'>
                  <Form.Item
                    name='from'
                    label={t('partner-repayment-list.startDate')}
                  >
                    <DatePicker
                      format={TimeFormat}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col flex='170px'>
                  <Form.Item
                    name='to'
                    label={t('partner-repayment-list.endDate')}
                  >
                    <DatePicker
                      format={TimeFormat}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col flex='220px'>
                  <Form.Item
                    name='partnerOrderStatus'
                    label={t('partner-repayment-list.invoiceStatus')}
                  >
                    <Select
                      allowClear
                      options={[0, 1].map((value) => {
                        return {
                          value: value,
                          label:
                            value === 0
                              ? t('partner-repayment-list.unpaid')
                              : t('partner-repayment-list.paid')
                        }
                      })}
                    />
                  </Form.Item>
                </Col>
                <Col flex='220px'>
                  <Form.Item
                    name='partnerId'
                    label={t('partner-repayment-list.repaymentPartner')}
                  >
                    <PartnerSelect type='REPAYMENT' />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                justify='end'
                gutter={GUTTER}
              >
                <Col>
                  <ButtonExcel
                    onClick={handleExport}
                    module='repayment'
                  />
                </Col>
                <Col>
                  <ButtonSearch htmlType='submit' />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={payments?.data}
        pagination={{
          current: payments?.meta.page,
          pageSize: payments?.meta.take,
          total: payments?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <RepaymentTransactionDetail
        record={recordDetail}
        onCancel={viewDetailToggle}
        isShow={viewDetail}
      />
    </Card>
  )
}

export default RepaymentTransaction
