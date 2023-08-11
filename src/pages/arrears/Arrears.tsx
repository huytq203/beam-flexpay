import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  Typography
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ArrearModal from './ArrearModal'

const { Text } = Typography

function Arrears() {
  const { t: trans } = useTranslation()
  const [open, setOpen] = useState(false)

  const toggleOpen = useCallback((value: boolean) => {
    setOpen(value)
  }, [])

  const arrearColumns: ColumnsType<any> = [
    {
      title: trans('labels.no'),
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: trans('arrears.columns.time'),
      dataIndex: 'time',
      key: 'time',
      render: () => '12:30:20'
    },
    {
      title: trans('arrears.columns.tradeCode'),
      dataIndex: 'id',
      key: 'id',
      render: () => '123'
    },
    {
      title: trans('arrears.columns.account'),
      dataIndex: 'id',
      key: 'id',
      render: () => '0984565232'
    },
    {
      title: trans('arrears.columns.transactionType'),
      dataIndex: 'id',
      key: 'id',
      render: () => 'Chuyển tiền'
    },
    {
      title: trans('arrears.columns.description'),
      dataIndex: 'id',
      key: 'id',
      render: () => 'Mô tả'
    },
    {
      title: trans('arrears.columns.transactionObject'),
      dataIndex: 'id',
      key: 'id',
      render: () => '0123456789'
    },
    {
      title: trans('arrears.columns.value'),
      dataIndex: 'id',
      key: 'id',
      render: () => '1000'
    },
    {
      title: trans('arrears.columns.tip'),
      dataIndex: 'id',
      key: 'id',
      render: () => '1000'
    },
    {
      title: trans('arrears.columns.total'),
      dataIndex: 'id',
      key: 'id',
      render: () => '2000'
    },
    {
      title: trans('arrears.columns.status'),
      dataIndex: 'id',
      key: 'id',
      render: () => 'Thành công'
    },
    {
      title: trans('arrears.columns.action'),
      dataIndex: 'id',
      key: 'id',
      render: () => (
        <div>
          <Button onClick={() => setOpen(true)}>
            {trans('buttons.arrear')}
          </Button>
        </div>
      )
    }
  ]

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form>
              <Row
                gutter={GUTTER}
                justify='center'
              >
                <Col flex='500px'>
                  <Form.Item name='phoneNumber'>
                    <Input
                      placeholder={trans('placeholders.phone').toString()}
                    />
                  </Form.Item>
                </Col>
                <Col flex='150px'>
                  <Form.Item>
                    <ButtonSearch />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          }
        />
      }
      extra={<ButtonExcel module='customer' />}
    >
      <Card
        title={trans('arrears.accountInfo')}
        className='wx-500 mb-25'
      >
        <Space split={<div className='wx-30' />}>
          <Space.Compact direction='vertical'>
            <Text className='fw-600'>{trans('arrears.accountName')}</Text>
            <Text className='fw-600'>{trans('arrears.totalBalances')}</Text>
            <Text className='fw-600'>{trans('arrears.availableBalances')}</Text>
          </Space.Compact>
          <Space.Compact direction='vertical'>
            <Text>{trans('arrears.accountName')}</Text>
            <Text>{trans('arrears.totalBalances')}</Text>
            <Text>{trans('arrears.availableBalances')}</Text>
          </Space.Compact>
        </Space>
      </Card>

      <Table
        columns={arrearColumns}
        dataSource={[1, 2, 3]}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
      />
      <ArrearModal
        open={open}
        toggleOpen={toggleOpen}
      />
    </Card>
  )
}

export default Arrears
