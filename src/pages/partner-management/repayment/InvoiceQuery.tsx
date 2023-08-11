import ButtonSearch from '@components/button-search/ButtonSearch'
import PartnerSelect from '@components/partner-select/PartnerSelect'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { usePaymentPartnerGetPartnerOderDetailQuery } from '@services/cmsService'
import { PaymentPartnerGetPartnerOderDetailApiArg } from '@type/application'
import {
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Row,
  Typography,
  notification
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

export default function InvoiceQuery() {
  const { t } = useTranslation()
  const [form] = useForm<PaymentPartnerGetPartnerOderDetailApiArg>()

  const [search, setSearch] =
    useState<PaymentPartnerGetPartnerOderDetailApiArg>({
      billCode: ''
    })

  const { data: orders } = usePaymentPartnerGetPartnerOderDetailQuery(search, {
    skip: search.billCode === ''
  })

  const handleSearch = () => {
    const values = form.getFieldsValue()
    if (values['billCode']) {
      setSearch({
        ...search,
        ...form.getFieldsValue()
      })
    } else {
      notification.open({
        type: 'warning',
        message: t('invoiceQuery.billCodeNullError')
      })
    }
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              form={form}
              layout='vertical'
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    label={t('invoiceQuery.invoiceId')}
                    name='billCode'
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col flex='400px'>
                  <Form.Item
                    label={t('partner.repaymentPartner')}
                    name='paymentPartnerId'
                  >
                    <PartnerSelect type='REPAYMENT' />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={GUTTER}
                justify='end'
              >
                <Col>
                  <ButtonSearch onClick={handleSearch} />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Descriptions
        title={`${t('invoiceQuery.invoiceId')} : ${
          orders?.partnerOrderCode ?? t('labels.nodata')
        }`}
        column={2}
        layout='vertical'
        bordered
      >
        <Descriptions.Item label={t('invoiceQuery.customer')}>
          {orders?.partnerCustomerName ?? <Text>{t('labels.nodata')}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={t('invoiceQuery.address')}>
          {orders?.partnerCustomerAddress ?? <Text>{t('labels.nodata')}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={t('invoiceQuery.debt')}>
          <InputNumber
            value={orders?.amount || 0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            readOnly
            bordered={false}
            style={{ minWidth: 200, height: '22px' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label={t`invoiceQuery.fee`}>
          {orders?.fee ?? <Text>{t('labels.nodata')}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={t('invoiceQuery.invoiceStatus')}>
          {orders?.status === true
            ? t`invoiceQuery.paid`
            : t`invoiceQuery.unpaid`}
        </Descriptions.Item>
        <Descriptions.Item label={t('invoiceQuery.partnerName')}>
          {orders?.partner?.name ?? <Text>{t('labels.nodata')}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={t('invoiceQuery.billDetails')}>
          {orders?.billDetails ? (
            orders?.billDetails.map((d) => (
              <Descriptions
                key={crypto.randomUUID()}
                style={{ marginBottom: 8 }}
              >
                <Descriptions.Item label={t('invoiceQuery.invoiceId')}>
                  {d.code}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t('invoiceQuery.debt')}
                  className='input-description'
                >
                  <InputNumber
                    value={orders?.amount || 0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    readOnly
                    bordered={false}
                    className='input-number'
                  />
                </Descriptions.Item>
                <Descriptions.Item label={t('invoiceQuery.period')}>
                  {dayjs(d.period).format(TimeFormat).toString()}
                </Descriptions.Item>
              </Descriptions>
            ))
          ) : (
            <Text>{t('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}
