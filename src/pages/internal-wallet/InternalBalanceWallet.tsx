import { EyeOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs';
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonView from '@components/button-view/ButtonView'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { useGetListWalletGroupsQuery, useGetListWalletsQuery } from '@services/apiInternalWallet'
import { viewMode } from '@type/customer'
import { InternalWallet, InternalWalletPayload } from '@type/internalWallet'
import { blockArrowValue, blockLetterDecimal, moneyInputFormatter } from '@utils/helperFunctions'
import { useToggle } from 'ahooks'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  TimeRangePickerProps
} from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import InternalWalletTransactionModal from './InternalWalletTransactionModal'

const { RangePicker } = DatePicker;

const rangePresets: TimeRangePickerProps['presets'] = [
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
];

function InternalBalanceWallet() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const [selectedInternalWallet, setSelectedInternalWallet] = useState<InternalWallet>()
  const [mode, setMode] = useState<viewMode>(viewMode.create)

  const [startDate, setStartDate] = useState<dayjs>(dayjs())
  const [endDate, setEndDate] = useState<dayjs>(dayjs().subtract(1, 'year'))

  const [search, setSearch] = useState<InternalWalletPayload>({
    order: 'DESC',
    page: 1,
    take: 10,
    query: '',
    orderBy: 'createdAt'
  })

  const { data: internalWallet, refetch } = useGetListWalletsQuery(search)

  const { data: internalWalletGroup } = useGetListWalletGroupsQuery(
    {
      page: 1,
      take: 10,
    }
  )

  const columns: ColumnsType<any> = [
    {
      title: t('internalBalanceWallet.walletGroup'),
      dataIndex: 'balanceInternalGroup',
      key: 'balanceInternalGroup',
      render(value, record, index) {
        return value ? value?.walletGroup : '-'
      },
    },
    {
      title: t('internalBalanceWallet.walletGroupName'),
      dataIndex: 'balanceInternalGroup',
      key: 'balanceInternalGroup',
      render(value, record, index) {
        return record.balanceInternalGroup.name
      },

    },
    {
      title: t('internalBalanceWallet.walletNumber'),
      dataIndex: 'walletNumber',
      key: 'walletNumber',
      render(value, record, index) {
        return `${record.balanceInternalGroup.walletGroup}.${record.walletNumber}`
      },
    },
    {
      title: t('internalBalanceWallet.walletName'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('internalBalanceWallet.balance'),
      dataIndex: 'availableMoney',
      key: 'availableMoney',
      render(value) {
        return moneyInputFormatter(value)
      }
    },
    {
      title: t('partner.updatedDate'),
      key: 'updatedDate',
      render: (value, record, index) =>
        record?.updatedAt
          ? moment(new Date(record?.updatedAt)).format(TimeFormat).toString()
          : '-'
    },
    {
      title: t('internalBalanceWallet.status'),
      dataIndex: 'active',
      key: 'active',
      render: (value, record, index) => {
        if (value == true) {
          return (<Tag color="green">{t("internal-wallet.status.active")}</Tag>)
        } else {

          return (<Tag color="red">{t("internal-wallet.status.in-active")}</Tag>)
        }
      }
    },
    {
      title: t('labels.action'),
      render(value, record, index) {
        return (
          <Space align="center">
            <ButtonView
              onClick={() => {
                setMode(viewMode.view)
                setSelectedInternalWallet(record)
                addFormToggle()
              }}
            />
          </Space>
        )
      }
    }
  ]

  const cancelModal = () => {
    setSelectedInternalWallet(undefined)
    addFormToggle()
    refetch()
  }

  useEffect(() => {
  }, [form])

  const onDateRangeChange = (dates: null | (Dayjs | null)[], dateStrings: string[]) => {
    if (dates) {
      let startDate = (dates[0] as Dayjs).startOf('day')
      let endDate = (dates[1] as Dayjs).endOf('day')

      setStartDate(startDate)
      setEndDate(endDate)
    }
  }


  const handleSearch = () =>
    setSearch({
      ...search,
      ...form.getFieldsValue(),
      startDate: startDate.format("DD/MM/YYYY HH:mm:ss"),
      endDate: endDate.format("DD/MM/YYYY HH:mm:ss")
    })

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
                  {/* Số ví nội bộ */}
                  <Form.Item
                    name='walletNumber'
                    label={t('internalBalanceWallet.walletNumber')}
                  >
                    <Input
                      onKeyDown={blockArrowValue}
                      onKeyPress={blockLetterDecimal}
                    />
                  </Form.Item>
                </Col>
                <Col flex='250px'>
                  {/* Nhóm ví */}
                  <Form.Item
                    name='internalWalletGroupId'
                    label={t('internalBalanceWallet.walletGroup')}
                  >
                    <Select
                      options={internalWalletGroup?.data?.map(group => ({
                        label: group.name,
                        value: group.id
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  {/* Ngày cập nhật - từ ngày */}
                  <Form.Item
                    label={t('internal-wallet.transaction.date')}
                  >
                    <RangePicker
                      value={[startDate, endDate]}
                      allowClear={false}
                      presets={rangePresets}
                      format="DD/MM/YYYY"
                      onChange={onDateRangeChange}
                    />
                  </Form.Item>
                </Col>
                <Col flex='250px'>
                  {/* Trạng thái ví nội bộ */}
                  <Form.Item
                    name='active'
                    label={t('internalBalanceWallet.status')}
                  >
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
        dataSource={internalWallet?.data ?? []}
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
          current: internalWallet?.meta.page,
          pageSize: internalWallet?.meta.take,
          total: internalWallet?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <InternalWalletTransactionModal
        selectedInternalWallet={selectedInternalWallet}
        width={900}
        isShow={addForm}
        onCancel={cancelModal}
        title={t('internal-wallet.view-transactions')}
        mode={mode}
      />

    </Card>
  )
}

export default InternalBalanceWallet