import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TransactionAccountingConfigurationForm from './TransactionAccountingConfigurationForm'
import { viewMode } from '@type/customer'
import { accountingStatus, accountingTransactionType, fundsOptions } from '@constants/options'
import {
  blockArrowValue,
  blockLetterDecimal,
  getAccountingTransactionType,
  getTransactionType
} from '@utils/helperFunctions'
import { get, orderBy, take } from 'lodash'
import {
  useGetAccountingQuery,
  useUpdateActiveMutation
} from '@services/accountingService'
import { openNotification } from '@configs/fetchBaseQueryCustom'
import CustomAccountingSelect from './components/customer-accouting-select/CustomAccountingSelect'
import { useLazyGetListWalletsQuery } from '@services/apiInternalWallet'

function TransactionAccountingConfiguration() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({
    page: 1,
    take: 10,
    order: 'DESC',
    orderBy: 'createdAt'
  })
  const [selected, setSelected] = useState(undefined)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [addForm, { toggle: addFormToggle }] = useToggle()
  const [getWalletIds] = useLazyGetListWalletsQuery()

  const { data: accounting } = useGetAccountingQuery(search)
  const [updateStatus] = useUpdateActiveMutation()

  console.log('accounting', accounting)

  const changeStatus = (status: number, id: string) => {
    Modal.confirm({
      title: status
        ? t`internal-wallet.modal.change-status-lock-title-accounting`
        : t`internal-wallet.modal.change-status-unlock-title-accounting`,
      content: status
        ? t`internal-wallet.modal.change-status-lock-description-accounting`
        : t`internal-wallet.modal.change-status-unlock-description-accounting`,
      okText: status
        ? t`internal-wallet.modal.change-status-lock-ok-button`
        : t`internal-wallet.modal.change-status-unlock-ok-button`,
      cancelText: t`internal-wallet.modal.change-status-cancel-button`,
      onOk: async () => {
        try {
          const response = (await updateStatus({
            active: status ? 0 : 1,
            id
          })) as { data: { statusCode: number } }
          if (
            response.data.statusCode === 201 ||
            response.data.statusCode === 200
          ) {
            openNotification(
              status
                ? t`internal-wallet.messages.lock-accounting-success`
                : t`internal-wallet.messages.unlock-accounting-success`,
              'success'
            )
          } else {
            openNotification(
              status
                ? t`internal-wallet.messages.lock-accounting-failed`
                : t`internal-wallet.messages.unlock-accounting-failed`
            )
          }
        } catch (error) {
          openNotification(
            status
              ? t`internal-wallet.messages.lock-group-failed`
              : t`internal-wallet.messages.unlock-group-failed`
          )
        }
      }
    })
  }

  const columns: ColumnsType<any> = [
    {
      title: t('transactionConfig.transactionType'),
      dataIndex: 'transactionType',
      key: 'transactionType',
      align: 'center',
      render(value, record, index) {
        return getAccountingTransactionType(value)
      }
    },
    {
      align: 'center',
      title: t('transactionConfig.content'),
      dataIndex: 'content',
      key: 'content',
      render() {
        return '-'
      }
    },
    {
      title: t('partner.createdBy'),
      align: 'center',
      render(value, record, index) {
        return record?.createdBy?.fullName ?? '-'
      }
    },
    {
      title: t('partner.updatedBy'),
      align: 'center',
      dataIndex: 'updatedBy',
      render(value, record, index) {
        return record?.createdBy?.fullName ?? '-'
      }
    },
    {
      align: 'center',
      title: t('partner.updatedDate'),
      dataIndex: 'updatedAt',
      render: (value, record, index) =>
        record?.updatedAt
          ? moment(new Date(record?.updatedAt)).format(TimeFormat).toString()
          : '-'
    },
    {
      title: t('labels.action'),
      key: 'actions',
      align: 'center',
      render(value, record, index) {
        return (
          <Space>
            <Button
              icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => changeStatus(record.active, record.id)}
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
    addFormToggle()
  }

  const onSelectData = (data: any, field: string) => {}

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              form={form}
              layout='vertical'
              initialValues={{ active: 1 }}
            >
              <Row gutter={GUTTER}>
                <Col span={6}>
                  <Form.Item name='transaction_type'>
                    <Select
                      placeholder={t`internal-wallet.placeholders.transaction_type`.toString()}
                      options={accountingTransactionType}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name='fundSource'>
                    <Select
                      placeholder={t('internal-wallet.placeholders.funds')}
                      options={fundsOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name='active'>
                    <Select
                      placeholder={t`internal-wallet.placeholders.status`.toString()}
                      options={accountingStatus}
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
        dataSource={accounting?.data?.data ?? []}
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
          current: accounting?.data?.meta.page,
          pageSize: accounting?.data?.meta.take,
          total: accounting?.data?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <TransactionAccountingConfigurationForm
        title={t`internal-wallet.add-configuration`}
        isShow={addForm}
        onCancel={onCancel}
      />
    </Card>
  )
}

export default TransactionAccountingConfiguration
