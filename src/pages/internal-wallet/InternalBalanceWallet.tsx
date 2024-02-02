import { EyeOutlined } from '@ant-design/icons'
import ButtonSearch from '@components/button-search/ButtonSearch'
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
  Row,
  Select
} from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function InternalBalanceWallet() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({})
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const columns: ColumnsType<any> = [
    {
      title: t('internalBalanceWallet.walletGroup'),
      dataIndex: 'walletGroup',
      key: 'walletGroup'
    },
    {
      title: t('internalBalanceWallet.walletGroupName'),
      dataIndex: 'walletGroupName',
      key: 'walletGroupName'
    },
    {
      title: t('internalBalanceWallet.walletNumber'),
      dataIndex: 'walletNumber',
      key: 'walletNumber'
    },
    {
      title: t('internalBalanceWallet.walletName'),
      dataIndex: 'walletName',
      key: 'walletName'
    },
    {
      title: t('internalBalanceWallet.balance'),
      dataIndex: 'balance',
      key: 'balance'
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
      dataIndex: 'status',
      key: 'status',
      render: (value, record, index) => {
        // TODO: render custom value
        return value
      }
    },
    {
      title: t('labels.action'),
      render(value, record, index) {
        return <Button icon={<EyeOutlined />} />
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
                    <Input />
                  </Form.Item>
                </Col>
                <Col flex='250px'>
                  {/* Nhóm ví */}
                  <Form.Item
                    name='walletGroup'
                    label={t('internalBalanceWallet.walletGroup')}
                  >
                    <Select />
                  </Form.Item>
                </Col>
                <Col>
                  {/* Ngày cập nhật - từ ngày */}
                  <Form.Item
                    name='startDate'
                    label={t('labels.startDate')}
                  >
                    <DatePicker
                      format={TimeFormat}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col>
                  {/* Ngày cập nhật - đến ngày */}
                  <Form.Item
                    name='endDate'
                    label={t('labels.endDate')}
                  >
                    <DatePicker
                      format={TimeFormat}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col flex='250px'>
                  {/* Trạng thái ví nội bộ */}
                  <Form.Item
                    name='status'
                    label={t('internalBalanceWallet.status')}
                  >
                    <Select />
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
    </Card>
  )
}

export default InternalBalanceWallet
