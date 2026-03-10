import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { PARTNER_TYPE_OPTIONS } from '@constants/partnerOptions'
import { usePaymentServiceFindAllQuery } from '@services/cmsPaymentService'
import {
  PaymentServiceDetailDto,
  PaymentServiceFindAllApiArg
} from '@type/application'
import { useToggle } from 'ahooks'
import { Card, Col, Empty, Form, Image, Input, Row, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import Table, { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import RepaymentServiceForm from './RepaymentServiceForm'

function RepaymentService() {
  const { t } = useTranslation()
  const [form] = useForm()

  const [record, setRecord] = useState<PaymentServiceDetailDto>()
  const [search, setSearch] = useState<PaymentServiceFindAllApiArg>({
    page: 1,
    take: 10
  })

  const { data: services } = usePaymentServiceFindAllQuery(search)

  const [addForm, { toggle: addFormToggle }] = useToggle()
  const [updateForm, { toggle: updateFormToggle }] = useToggle()

  //#region columns
  const columns: ColumnsType<PaymentServiceDetailDto> = [
    {
      title: 'STT',
      dataIndex: 'id',
      width: 80
    },
    {
      title: t('payment-service.type'),
      dataIndex: 'type',
      width: 130,
      render(value) {
        if (value === 'DISBURSE') return t('DISBURSE')
        else return t('REPAYMENT')
      }
    },
    {
      title: t('payment-service.name'),
      dataIndex: 'name',
      width: 130
    },
    {
      title: t('payment-service.logo'),
      dataIndex: 'logo',
      width: 250,
      render(value) {
        if (value)
          return (
            <Image
              src={import.meta.env.VITE_IMAGE_URL + value}
              preview={false}
            />
          )
      }
    },
    {
      title: t('payment-service.status'),
      dataIndex: 'active',
      width: 130,
      align: 'center',
      render(value) {
        if (value) return t('labels.active')
        else return t('labels.inActive')
      }
    },
    {
      title: t('partner.createdDate'),
      width: 130,
      align: 'center',
      render: (_, record) =>
        moment(new Date(record?.createdAt)).format(TimeFormat).toString()
    },
    {
      title: t('partner.createdBy'),
      width: 130,
      align: 'center',
      render(_, record) {
        return record.createdBy?.fullName
      }
    },
    {
      title: t('partner.updatedBy'),
      width: 130,
      align: 'center',
      render(_, record) {
        return record.updatedBy?.fullName
      }
    },
    {
      title: t('partner.updatedDate'),
      width: 130,
      align: 'center',
      render: (_, record) =>
        moment(new Date(record?.updatedAt)).format(TimeFormat).toString()
    },
    {
      title: t('labels.action'),
      align: 'center',
      width: 100,
      render(_, record) {
        return (
          <ButtonUpdate
            module='repayment'
            onClick={() => {
              setRecord(record)
              updateFormToggle()
            }}
          />
        )
      }
    }
  ]
  //#endregion

  const handleSearch = () => {
    let values = form.getFieldsValue()
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
          cols='2'
          headerMenu={
            <>
              <Form.Item
                label={t('payment-service.name')}
                name='name'
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('payment-service.type')}
                name='type'
              >
                <Select options={PARTNER_TYPE_OPTIONS} />
              </Form.Item>

              <ButtonAdd
                onClick={addFormToggle}
                module='repayment'
              />

              <ButtonSearch onClick={handleSearch} />
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={services?.data || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        locale={{
          emptyText: (
            <>
              <Empty description={t`labels.nodata`} />
            </>
          )
        }}
        pagination={{
          current: services?.meta.page,
          pageSize: services?.meta.take,
          total: services?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <RepaymentServiceForm
        title={t('labels.addnew', { name: t('payment-service.title') })}
        isShow={addForm}
        onCancel={addFormToggle}
      />
      <RepaymentServiceForm
        title={t('labels.update', { name: t('payment-service.title') })}
        record={record}
        isShow={updateForm}
        onCancel={updateFormToggle}
      />
    </Card>
  )
}

export default RepaymentService
