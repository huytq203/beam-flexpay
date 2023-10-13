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
import InternalWalletForm from './components/InternalWalletForm'
import { InternalWalletPayload } from '@type/internalWallet'
import { useGetListWalletsQuery } from '@services/apiInternalWallet'

function InternalWalletAccount() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState<InternalWalletPayload>({order: 'DESC', page:1, take: 10, query: '', orderBy: 'createdAt'})
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const {data: interWallet} = useGetListWalletsQuery(search)

  console.log('interWallet', interWallet);
  

  const columns: ColumnsType<any> = [
    {
      title: t('internalWallet.walletType'),
      dataIndex: 'walletType',
      key: 'walletType',
      render: () =>  t`internal-wallet.wallet-internal`
    },
    {
      title: t('internalWallet.walletGroup'),
      dataIndex: 'balanceInternalGroupId',
      key: 'balanceInternalGroupId'
    },
    {
      title: t('internalWallet.walletNumber'),
      dataIndex: 'walletNumber',
      key: 'walletNumber'
    },
    {
      title: t('internalWallet.walletName'),
      dataIndex: 'name',
      key: 'name'
    },

    {
      title: t('partner.createdBy'),
      dataIndex:'createdAt',
      key: 'createdAt',
      render(value, record, index) {
        return value ? moment(value).format('DD/MM/YYYY HH:mm:ss') : '-'
      },
      align: 'center',
    },
    {
      title: t('partner.updatedBy'),
      align: 'center',
      render(value, record, index) {
        return record?.updatedBy?.fullName??'-'
      }
    },
    {
      title: t('partner.updatedDate'),
      dataIndex: 'updatedAt',
      render: (value, record, index) =>
        moment(value).format(TimeFormat).toString()
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

  return (
    <Card
    title={
      <SearchBar
      headerMenu={
        <Form form={form} layout='vertical'>
          <Row gutter={GUTTER}>
            <Col span={6}>
              <Form.Item>
                <Input placeholder={t`internal-wallet.placeholders.wallet_id`.toString()}/>
              </Form.Item>
            </Col>
            <Col  span={6}>
              <Form.Item>
                <Input placeholder={t`internal-wallet.placeholders.wallet_name`.toString()} />
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
        dataSource={interWallet?.data ?? []}
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
     <InternalWalletForm
        isShow={addForm}
        onCancel={addFormToggle}
        title={t('internal-wallet.add-wallet-title')}
      />
    </Card>
  )
}

export default InternalWalletAccount
