import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import PartnerSelect from '@components/partner-select/PartnerSelect'
import SearchBar from '@components/search-bar/SearchBar'
import Table from '@components/table/Table'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { DisburseTransactionPeriodOption } from '@constants/partnerOptions'
import { useAppSelector } from '@hooks/hook'
import { usePaymentOrderFindAllQuery } from '@services/cmsPaymentOrder'
import { PaymentOrderFindAllApiArg } from '@type/application'
import {
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function DisburseTransaction() {
  const { t } = useTranslation()
  const [form] = useForm()
  const { accessToken } = useAppSelector((state) => state.auth)

  const [search, setSearch] = useState<PaymentOrderFindAllApiArg>({
    page: 1,
    take: 10,
    order: 'DESC',
    paymentServiceType: 'DISBURSE'
  })

  const { data: orders } = usePaymentOrderFindAllQuery(search)

  const getFormValues = () => {
    const values = form.getFieldsValue()
    if (values['from'])
      values['from'] = dayjs(values['from']).format('DD-MM-YYYY').toString()
    if (values['to'])
      values['to'] = dayjs(values['to']).format('DD-MM-YYYY').toString()
    return values
  }

  const handleSearch = () => {
    const values = getFormValues()
    if (values['paymentPeriod']) {
      const month = values['paymentPeriod'].split('/')[0]
      const year = values['paymentPeriod'].split('/')[1]

      values['paymentPeriodFrom'] = dayjs(`${year}-${month}-1`)
        .startOf('month')
        .toISOString()
      values['paymentPeriodTo'] = dayjs(`${year}-${month}-1`)
        .endOf('month')
        .toISOString()
    }

    setSearch({
      ...search,
      ...values
    })
  }

  const handleExport = () => {
    const _headers = new Headers()
    _headers.append('Authorization', `Bearer ${accessToken}`)
    var requestOptions: any = {
      method: 'GET',
      headers: _headers,
      redirect: 'follow'
    }
    let args = ''
    for (const key in search) {
      args += key + '=' + (search as any)[key] + '&'
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
        downloadItem.download = `payment-order-disburse.xlsx`
        downloadItem.click()
      })
  }

  //#region columns
  const columns: ColumnsType<any> = [
    {
      title: t('partner-repayment-list.id'),
      dataIndex: 'id',
      align: 'center',
      width: 80,
      ellipsis: true,
      fixed: 'left'
    },
    {
      title: t('partner-repayment-list.customer'),
      align: 'center',
      fixed: 'left',
      width: 200,
      render(_, record) {
        return record.customerPaymentPartner.customer.identityNumber
      }
    },
    {
      title: t('partner-repayment-list.invoiceDate'),
      align: 'center',
      width: 250,
      render(_, record) {
        if (record)
          return dayjs(record.paymentPeriodFrom).format('MM/YYYY').toString()
        else return ''
      }
    },
    {
      title: t('partner.partner'),
      dataIndex: 'id',
      width: 250,
      align: 'center'
    },
    {
      title: t('partner-repayment-list.walletId'),
      align: 'center',
      width: 200,
      render(_, record) {
        return record.customerPaymentPartner.customer.phoneNumber
      }
    },
    {
      title: t('partner.paymentAmount'),
      dataIndex: 'amount',
      align: 'center',
      width: 150,
      render(value) {
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
      title: t('partner-repayment-list.transactionStatus'),
      dataIndex: 'transactionStatus',
      align: 'center',
      width: 150,
      render(value) {
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
      }
    },
    {
      title: t('partner-repayment-list.transactionDate'),
      align: 'center',
      width: 150,
      render(_, record) {
        return dayjs(record.createdAt).format(TimeFormat).toString()
      }
    },
    {
      title: t('labels.action'),
      align: 'center',
      width: 100,
      fixed: 'right',
      render() {
        return <ButtonUpdate module='repayment' />
      }
    }
  ]
  //#endregion

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={handleSearch}
          cols='2'
          headerMenu={
            <>
              <Form.Item
                label={t('partner.fullname')}
                name='partnerCustomerName'
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t('partner.customerId')}
                name='customerIdentityNumber'
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('partner.startDate')}
                name='from'
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label={t('partner.endDate')}
                name='to'
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label={t('partner.walletId')}
                name='customerPhone'
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('partner.amountOfDays')}
                name='amount'
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('partner.paymentPartner')}
                name='partnerId'
              >
                <PartnerSelect type='DISBURSE' />
              </Form.Item>

              <Form.Item
                label={t('partner.paymentPeriod')}
                name='paymentPeriod'
              >
                <Select
                  disabled={!form.getFieldValue('partnerId')}
                  options={DisburseTransactionPeriodOption()}
                />
              </Form.Item>
              <ButtonSearch onClick={handleSearch} />

              <ButtonExcel
                module='repayment'
                onClick={handleExport}
              />
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={orders?.data || []}
        pagination={{
          current: orders?.meta?.page,
          pageSize: orders?.meta?.take,
          total: orders?.meta?.itemCount,
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

export default DisburseTransaction
