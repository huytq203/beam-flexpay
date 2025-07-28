import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { useToggle } from 'ahooks'
import { Button, Card, Col, Empty, Form, Input, Row, Select, Space } from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import FeesByTransactionTypeForm from './FeesByTransactionTypeForm'
import { GUTTER } from '@constants/appConstant'

function FeesByTransactionType() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({})
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const columns: ColumnsType<any> = [
    {
      title: t('feesByTransactionType.transactionType'),
      dataIndex: 'transactionType',
      key: 'transactionType'
    },
    {
      title: t('feesByTransactionType.funds'),
      dataIndex: 'funds',
      key: 'funds'
    },
    {
      title: t('feesByTransactionType.services'),
      dataIndex: 'services',
      key: 'services'
    },
    {
      title: t('feesByTransactionType.collectionAndPaymentPartner'),
      dataIndex: 'collectionAndPaymentPartner',
      key: 'collectionAndPaymentPartner'
    },
    {
      title: t('feesByTransactionType.affiliateBank'),
      dataIndex: 'affiliateBank',
      key: 'affiliateBank'
    },
    {
      title: t('feesByTransactionType.chargingMethod'),
      dataIndex: 'chargingMethod',
      key: 'chargingMethod'
    },

    {
      title: t('feesByTransactionType.fee'),
      dataIndex: 'fee',
      key: 'fee'
    },
    {
      title: t('feesByTransactionType.vat'),
      dataIndex: 'vat',
      key: 'vat'
    },

    {
      title: t('partner.createdBy'),
      align: 'center',
      render(value, record, index) {
        return record.createdBy.fullName
      }
    },
    {
      title: t('partner.updatedBy'),
      align: 'center',
      render(value, record, index) {
        return record.updatedBy.fullName
      }
    },
    {
      title: t('labels.action'),
      key: 'actions',
      render(value, record, index) {
        return (
          <Space>
            <ButtonUpdate module='internal-wallet' />
            <Button
              icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
            />
          </Space>
        )
      }
    },
    {
      title: t('partner.updatedBy'),
      align: 'center',
      render(value, record, index) {
        return record.updatedBy.fullName
      }
    }
  ]

  const handleSearch = () =>
    setSearch({
      ...search,
      ...form.getFieldsValue()
    })

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={handleSearch}
          cols='2'
          headerMenu={
            <>
              {/* Loại giao dịch - select */}
              <Form.Item
                name='transactionType'
                label={t('transactionConfig.transactionType')}
              >
                <Select />
              </Form.Item>
              {/* Cách thức tính phí - select*/}
              <Form.Item
                name='chargingMethod'
                label={t('feesByTransactionType.chargingMethod')}
              >
                <Select />
              </Form.Item>
              {/* Ngân hàng liên kết - select */}
              <Form.Item
                name='affiliateBank'
                label={t('feesByTransactionType.affiliateBank')}
              >
                <Select />
              </Form.Item>
              {/* Đối tác thu hộ/chi hộ - select */}
              <Form.Item
                name='collectionAndPaymentPartner'
                label={t('feesByTransactionType.collectionAndPaymentPartner')}
              >
                <Select />
              </Form.Item>
              {/* dịch vụ - select */}
              <Form.Item
                name='service'
                label={t('feesByTransactionType.service')}
              >
                <Select />
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
        bordered
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
      <FeesByTransactionTypeForm
        title={t('feesByTransactionType.title')}
        isShow={addForm}
        onCancel={addFormToggle}
      />
    </Card>
  )
}

export default FeesByTransactionType
