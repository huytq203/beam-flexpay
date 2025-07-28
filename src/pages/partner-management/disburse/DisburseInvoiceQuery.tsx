import ButtonSearch from '@components/button-search/ButtonSearch'
import PartnerSelect from '@components/partner-select/PartnerSelect'
import SearchBar from '@components/search-bar/SearchBar'
import Table from '@components/table/Table'
import { GUTTER } from '@constants/appConstant'
import { usePaymentOrderFindAllQuery } from '@services/cmsPaymentOrder'
import {
  PaymentOrderDetailDto,
  PaymentOrderFindAllApiArg
} from '@type/application'
import { Card, Col, Form, Input, Row } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function DisburseInvoiceQuery() {
  const { t } = useTranslation()
  const [form] = useForm<PaymentOrderFindAllApiArg>()

  const [search, setSearch] = useState<PaymentOrderFindAllApiArg>({
    page: 1,
    take: 10,
    order: 'DESC',
    paymentServiceType: 'DISBURSE'
  })

  const { data: orders } = usePaymentOrderFindAllQuery(search)

  //#region columns
  const columns: ColumnsType<PaymentOrderDetailDto> = [
    {
      title: t('partner-repayment-list.id'),
      dataIndex: 'id',
      align: 'center',
      width: 80,
      fixed: 'left',
      render(value, record, index) {
        return value.slice(0, 8) + '...'
      }
    },
    {
      title: t('partner-repayment-list.transactionStatus'),
      dataIndex: 'transactionStatus',
      align: 'center',
      width: 150,
      fixed: 'left',
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
      }
    },
    {
      title: t('partner-repayment-list.customer'),
      dataIndex: ['customerPaymentPartner', 'customer', 'phoneNumber'],
      align: 'center',
      width: 150,
      fixed: 'left'
    },
    {
      title: t('partner.customer'),
      dataIndex: ['customerPaymentPartner', 'partnerCustomerName'],
      align: 'center',
      width: 250
    },
    {
      title: t('partner.identityNumber'),
      dataIndex: ['customerPaymentPartner', 'customer', 'identityNumber'],
      width: 120,
      align: 'center'
    },
    {
      title: t('partner.phoneNumber'),
      align: 'center',
      width: 120,
      render(value, record, index) {
        return record.customerPaymentPartner.customer.phoneNumber
      }
    },
    {
      title: t('partner.paymentPeriod1'),
      width: 200,
      fixed: 'left',
      render(value, record, index) {
        if (record)
          return dayjs(record.paymentPeriodFrom).format('MM/YYYY').toString()
        else return ''
      },
      align: 'center'
    }
  ]
  //#endregion

  const handleSearch = (values: PaymentOrderFindAllApiArg) => {
    setSearch({
      ...search,
      ...values
    })
  }

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={handleSearch}
          headerMenu={
            <>
              <Form.Item
                label={t('partner.phoneNumber')}
                name='customerPhone'
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('partner.identityNumber')}
                name='customerIdentityNumber'
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('partner.paymentPartner')}
                name='partnerId'
              >
                <PartnerSelect type='DISBURSE' />
              </Form.Item>

              <ButtonSearch htmlType='submit' />
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

export default DisburseInvoiceQuery
