import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import { Button, Card, Empty, Form, Space, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function InternalWalletAccount() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({})
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const columns: ColumnsType<any> = [
    {
      title: t('internalWallet.walletType'),
      dataIndex: 'walletType',
      key: 'walletType'
    },
    {
      title: t('internalWallet.walletGroup'),
      dataIndex: 'walletGroup',
      key: 'walletGroup'
    },
    {
      title: t('internalWallet.walletNumber'),
      dataIndex: 'walletNumber',
      key: 'walletNumber'
    },
    {
      title: t('internalWallet.walletName'),
      dataIndex: 'walletName',
      key: 'walletName'
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

  return (
    <Card
    // title={
    //   <SearchBar
    //     headerMenu={
    //       <Form form={form}>
    //         <Row>
    //           <Col flex='auto'>
    //             <Form.Item>
    //               <Input />
    //             </Form.Item>
    //           </Col>
    //           <Col flex='300px'>
    //             <Form.Item>
    //               <Select />
    //             </Form.Item>
    //           </Col>
    //         </Row>
    //         <Row
    //           justify='end'
    //           gutter={GUTTER}
    //         >
    //           <Col>
    //             <ButtonAdd
    //               module='internal-wallet'
    //               onClick={addFormToggle}
    //             />
    //           </Col>
    //           <Col>
    //             <ButtonSearch onClick={handleSearch} />
    //           </Col>
    //         </Row>
    //       </Form>
    //     }
    //   />
    // }
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

export default InternalWalletAccount
