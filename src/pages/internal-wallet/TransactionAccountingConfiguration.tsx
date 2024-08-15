import _ from 'lodash'
import { LockOutlined, UnlockOutlined, EyeOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TransactionAccountingConfigurationForm from './TransactionAccountingConfigurationForm'
import { viewMode } from '@type/customer'
import {
  accountingStatus,
  accountingTransactionType,
  fundsOptions
} from '@constants/options'
import { getAccountingTransactionType } from '@utils/helperFunctions'
import {
  useGetAccountingQuery,
  useUpdateActiveMutation
} from '@services/accountingService'
import { openNotification } from '@configs/fetchBaseQueryCustom'
import { Accounting } from '@type/accounting'
import { FaPen } from 'react-icons/fa'

function TransactionAccountingConfiguration() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({
    page: 1,
    take: 10,
    order: 'DESC',
    orderBy: 'createdAt'
  })
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const [selectedAccounting, setSelectedAccounting] = useState<Accounting>()

  const { data: accounting, refetch: refetchAccounting } =
    useGetAccountingQuery(search)
  const [updateStatus] = useUpdateActiveMutation()

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
        } catch (error) {}
      }
    })
  }

  const columns: ColumnsType<any> = [
    {
      title: t('transactionConfig.transactionType'),
      dataIndex: 'transactionType',
      key: 'transactionType',
      align: 'center',
      render(value) {
        return getAccountingTransactionType(value)
      }
    },
    {
      align: 'center',
      title: t('accounting.fundSource'),
      dataIndex: 'fundSource',
      key: 'fundSource',
      render(value) {
        //todo
        switch (value) {
          case 'NAPAS':
            return t('internal-wallet.fundsOptions.napas')
          case 'LINK_BANK':
            return t('internal-wallet.fundsOptions.bank')
          case 'PAYMENT_GATEWAY':
            return t('internal-wallet.fundsOptions.gate')
          case 'EWALLET':
            return t('internal-wallet.fundsOptions.wallet')
          case 'ATM_CARD':
            return t('internal-wallet.fundsOptions.atmCard')
        }
      }
    },
    {
      title: t('partner.createdBy'),
      align: 'center',
      render(_, record) {
        return record?.createdBy?.fullName ?? '-'
      }
    },
    {
      title: t('partner.updatedBy'),
      align: 'center',
      dataIndex: 'updatedBy',
      render(_, record) {
        return record?.updatedBy?.fullName ?? '-'
      }
    },
    {
      align: 'center',
      title: t('partner.serviceName'),
      dataIndex: 'serviceName',
      render: (_, record) => record?.service?.name ?? '-'
    },
    {
      align: 'center',
      title: t('partner.partnerName'),
      dataIndex: 'partnerName',
      render: (_, record) => record?.partner?.name ?? '-'
    },
    {
      align: 'center',
      title: t('partner.updatedDate'),
      dataIndex: 'updatedAt',
      render: (_, record) =>
        record?.updatedAt
          ? moment(new Date(record?.updatedAt)).format(TimeFormat).toString()
          : '-'
    },
    {
      align: 'center',
      title: t('partner.status'),
      dataIndex: 'active',
      render: (value) => (
        <Tag color={!value ? 'error' : 'success'}>
          {!value ? 'Khóa' : 'Hoạt động'}
        </Tag>
      )
    },
    {
      title: t('labels.action'),
      key: 'actions',
      align: 'center',
      render(_, record) {
        return (
          <Space>
            <Tooltip
              placement='topLeft'
              title='Xem'
            >
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  setMode(viewMode.view)
                  setSelectedAccounting(record)
                  addFormToggle()
                }}
              />
            </Tooltip>

            <Tooltip
              placement='topLeft'
              title='Sửa'
            >
              <Button
                icon={<FaPen />}
                onClick={() => {
                  setMode(viewMode.update)
                  setSelectedAccounting(record)
                  addFormToggle()
                }}
              />
            </Tooltip>

            <Tooltip
              placement='topLeft'
              title={record.active ? 'Khóa' : 'Mở khóa'}
            >
              <Button
                icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => changeStatus(record.active, record.id)}
              />
            </Tooltip>
          </Space>
        )
      }
    }
  ]

  const handleSearch = () =>
    setSearch(
      _(form.getFieldsValue()).omitBy(_.isUndefined).omitBy(_.isNull).value()
    )

  const onCancel = () => {
    addFormToggle()
    setMode(viewMode.create)
    setSelectedAccounting(undefined)
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
                <Col span={6}>
                  <Form.Item
                    name='type'
                    label={t('accounting.transactionType')}
                  >
                    <Select
                      placeholder={t`internal-wallet.placeholders.transaction_type`.toString()}
                      defaultValue={null}
                      options={accountingTransactionType}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name='fundSource'
                    label={t('accounting.fundSource')}
                  >
                    <Select
                      placeholder={t('internal-wallet.placeholders.funds')}
                      defaultValue={null}
                      options={fundsOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name='active'
                    label={t('accounting.status')}
                  >
                    <Select
                      placeholder={t`internal-wallet.placeholders.status`.toString()}
                      defaultValue={null}
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
                    module='internalwallet'
                    onClick={() => {
                      setMode(viewMode.create)
                      setSelectedAccounting(undefined)
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
        dataSource={accounting?.data ?? []}
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
          current: accounting?.meta.page,
          pageSize: accounting?.meta.take,
          total: accounting?.meta.itemCount,
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
        title={
          mode === viewMode.create
            ? t(`internal-wallet.create-configuration`)
            : mode === viewMode.update
            ? t(`internal-wallet.update-configuration`)
            : t(`internal-wallet.view-configuration`)
        }
        isShow={addForm}
        mode={mode}
        selectedAccounting={selectedAccounting}
        onCancel={onCancel}
        onSubmit={refetchAccounting}
      />

    </Card>
  )
}

export default TransactionAccountingConfiguration
