import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import { Button, Card, Col, DatePicker, Empty, Form, Input, Row, Select, Space } from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import InternalGroupForm from './components/InternalGroupForm'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import { InternalWalletPayload } from '@type/internalWallet'
import { useGetListWalletGroupsQuery } from '@services/apiInternalWallet'

function InternalGroupWallet() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState<InternalWalletPayload>({order: 'DESC', page:1, take: 10, query: '', orderBy: 'createdAt'})
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const {data: internalWalletGroup} = useGetListWalletGroupsQuery(search)

  const columns: ColumnsType<any> = [
    {
      title: t('groups.group-type'),
      dataIndex: 'id',
      key: 'id',
      align: 'center'
    },
    {
      title: t('groups.wallet-name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('groups.wallet-type'),
      dataIndex: '',
      key: 'type',
      render: () =>  t`internal-wallet.wallet-internal`
    },
    {
      title: t('partner.createdBy'),
      dataIndex:'createdAt',
      key: 'createdAt',
      render(value, record, index) {
        return value ? moment(value).format('DD/MM/YYYY HH:mm:ss') : '-'
      },
      align: 'center',
      width: 200
    },
    {
      title: t('partner.updatedBy'),
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      render(value, record, index) {
        return record?.updatedBy?.fullName??'-'
      },
      align: 'center',
      width: 200
    },
    {
      title: t('partner.updatedDate'),
      dataIndex: 'updatedAt',
      render: (value, record, index) => value ? moment(value).format('DD/MM/YYYY HH:mm:ss') : '-',
      align: 'center',
      width: 150
    },
    {
      title: t('groups.note'),
      dataIndex: 'note',
      key: 'note',
      width: 250,
      render: (value) => value ? value : '-'
    },
    {
      title: t('labels.action'),
      render(value, record, index) {
        return (
          <Space>
            <ButtonUpdate module='internal-wallet' />
            <Button
              icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
            />
          </Space>
        )
      },
      align: 'center',
      width: 150
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
        headerMenu={
          <Form form={form} layout='vertical'>
            <Row gutter={GUTTER}>
              <Col span={6}>
                <Form.Item>
                  <Input placeholder={t`internal-wallet.placeholders.group_id`.toString()}/>
                </Form.Item>
              </Col>
              <Col  span={6}>
                <Form.Item>
                  <Input placeholder={t`internal-wallet.placeholders.group_name`.toString()} />
                </Form.Item>
              </Col>
              <Col  span={6}>
                <Form.Item>
                  <Select placeholder={t`internal-wallet.placeholders.status`.toString()} />
                </Form.Item>
              </Col>
              <Col  span={6}>
                <Form.Item>
                  <DatePicker style={{width: '100%'}}placeholder={t`internal-wallet.placeholders.date`.toString()} />
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
        dataSource={internalWalletGroup?.data ?? []}
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
          current: internalWalletGroup?.meta.page,
          pageSize: internalWalletGroup?.meta.take,
          total: internalWalletGroup?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <InternalGroupForm
        isShow={addForm}
        onCancel={addFormToggle}
        title={t('internal-wallet.groups-title')}
      />
    </Card>
  )
}

export default InternalGroupWallet
