import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import { Button, Card, Empty, Form, Space } from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import InternalGroupForm from './InternalGroupForm'

function InternalGroupWallet() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({})
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const columns: ColumnsType<any> = [
    {
      title: t('groups.group-type'),
      dataIndex: 'groupType',
      key: 'name'
    },
    {
      title: t('groups.wallet-name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('groups.wallet-type'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: t('partner.createdBy'),
      render(value, record, index) {
        return record.createdBy.fullName
      },
      align: 'center',
      width: 200
    },
    {
      title: t('partner.updatedBy'),
      render(value, record, index) {
        return record.updatedBy.fullName
      },
      align: 'center',
      width: 200
    },
    {
      title: t('partner.updatedDate'),
      render: (value, record, index) =>
        moment(new Date(record?.updatedAt)).format(TimeFormat).toString(),
      align: 'center',
      width: 150
    },
    {
      title: t('groups.note'),
      dataIndex: 'note',
      key: 'note',
      width: 250
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
      <InternalGroupForm
        isShow={addForm}
        onCancel={addFormToggle}
        title={t('groups.title')}
      />
    </Card>
  )
}

export default InternalGroupWallet
