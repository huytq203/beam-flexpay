import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import { Button, Card, Col, DatePicker, Empty, Form, Input, Row, Select, Space, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TransactionAccountingConfigurationForm from './TransactionAccountingConfigurationForm'
import { viewMode } from '@type/customer'

function TransactionAccountingConfiguration() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({})
  const [selected, setSelected] = useState(undefined)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const columns: ColumnsType<any> = [
    {
      title: t('transactionConfig.transactionType'),
      dataIndex: 'transactionType',
      key: 'transactionType'
    },
    {
      title: t('transactionConfig.content'),
      dataIndex: 'content',
      key: 'content'
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
      title: t('partner.updatedDate'),
      render: (value, record, index) =>
        moment(new Date(record?.updatedAt)).format(TimeFormat).toString()
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
    }
  ]

  const handleSearch = () =>
    setSearch({
      ...search,
      ...form.getFieldsValue()
    })

  const onCancel = () => {
    setMode(viewMode.update)
    setSelected(undefined)
    addFormToggle();
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form form={form} layout='vertical'>
              <Row gutter={GUTTER}>
                <Col span={6}>
                  <Form.Item>
                    <Select placeholder={t`internal-wallet.placeholders.transaction_type`.toString()} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item>
                    <Input placeholder={t`internal-wallet.placeholders.wallet_id`.toString()} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item>
                    <Select placeholder={t`internal-wallet.placeholders.status`.toString()} />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                justify='end'
                gutter={GUTTER}
              >
                <Col>
                  <ButtonAdd
                    module='internal-wallet'
                    onClick={addFormToggle}
                  />
                </Col>
                <Col>
                  <ButtonSearch onClick={handleSearch} />
                </Col>
              </Row>
            </Form>
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
      <TransactionAccountingConfigurationForm title={t`internal-wallet.add-configuration`} isShow={addForm} onCancel={onCancel} />
    </Card>
  )
}

export default TransactionAccountingConfiguration
