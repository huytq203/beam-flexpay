import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import {
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import InternalWalletForm from './components/InternalWalletForm'
import { InternalWalletPayload } from '@type/internalWallet'
import { useGetListWalletsQuery } from '@services/apiInternalWallet'
import { viewMode } from '@type/customer'

function InternalWalletAccount() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [recordSelected, setRecordSelected] = useState<any | undefined>(
    undefined
  )
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [search, setSearch] = useState<InternalWalletPayload>({
    order: 'DESC',
    page: 1,
    take: 10,
    query: '',
    orderBy: 'createdAt'
  })
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const { data: interWallet, refetch } = useGetListWalletsQuery(search)

  const columns: ColumnsType<any> = [
    {
      title: t('internalWallet.walletType'),
      dataIndex: 'walletType',
      key: 'walletType',
      render: () => t`internal-wallet.wallet-internal`
    },
    {
      title: t('internalWallet.walletGroup'),
      dataIndex: 'balanceInternalGroup',
      key: 'balanceInternalGroup',
      render(value, record, index) {
        return value ? value?.name : '-'
      },
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
      dataIndex: 'createdBy',
      key: 'createdBy',
      render(value, record, index) {
        return value ? value?.fullName : '-'
      },
      align: 'center'
    },
    {
      title: t('partner.updatedBy'),
      align: 'center',
      render(value, record, index) {
        return record?.updatedBy?.fullName ?? '-'
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
      render(record) {
        return (
          <Space align="center">
            <ButtonUpdate
              onClick={() => {
                setMode(viewMode.update)
                setRecordSelected(record)
                addFormToggle()
              }}
              module='internal-wallet'
            />
          </Space>
        )
      }
    }
  ]

  const handleSearch = () => {
    const active = form.getFieldValue('active')
    setSearch({
      ...search,
      ...form.getFieldsValue(),
      active: active !== null ? active : undefined
    })
  }


  const cancelModal = () => {
    setRecordSelected(null)
    addFormToggle()
    refetch()
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              form={form}
              layout='vertical'
              initialValues={{ active: null }}
            >
              <Row gutter={GUTTER}>
                <Col span={6}>
                  <Form.Item name='walletNumber'>
                    <Input
                      placeholder={t`internal-wallet.placeholders.wallet_id`.toString()}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name='name'>
                    <Input
                      placeholder={t`internal-wallet.placeholders.wallet_name`.toString()}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name='active'>
                    <Select
                      placeholder={t`internal-wallet.placeholders.status`.toString()}
                      options={[
                        { label: t`internal-wallet.status.all`, value: null },
                        { label: t`internal-wallet.status.active`, value: 1 },
                        { label: t`internal-wallet.status.de-active`, value: 0 }
                      ]}
                    />
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
                    onClick={() => {
                      setMode(viewMode.create)
                      addFormToggle()
                    }}
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
          current: interWallet?.meta.page,
          pageSize: interWallet?.meta.take,
          total: interWallet?.meta.itemCount,
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
        record={recordSelected}
        isShow={addForm}
        onCancel={cancelModal}
        title={
          mode === viewMode.create
            ? t('internal-wallet.add-wallet-title')
            : t('internal-wallet.edit-wallet-title')
        }
        mode={mode}
      />
    </Card>
  )
}

export default InternalWalletAccount
