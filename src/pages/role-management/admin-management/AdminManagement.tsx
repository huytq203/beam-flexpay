import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonLock from '@components/button-lock/ButtonLock'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUnlock from '@components/button-unlock/ButtonUnlock'
import SearchBar from '@components/search-bar/SearchBar'
import { useUserFindAllQuery } from '@services/cmsUser'
import { AdminAccountData, viewMode } from '@type/admin'
import { UserFindAllApiArg } from '@type/application'
import { getStatusText, getTagColor } from '@utils/helperFunctions'
import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminModal } from './AdminModal/AdminModal'
import { AdminManagementOptions } from '@constants/options'
import ButtonAction from '@components/button-action/ButtonAction'
import { useActionHandler } from '@hooks/useActionHandler'

const AdminManagement = () => {
  const [visible, setVisible] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [mode, setMode] = useState<viewMode>(viewMode.lock)
  const [search, setSearch] = useState<UserFindAllApiArg>({
    page: 1,
    take: 10
  })

  const { data: adminAccount, refetch } = useUserFindAllQuery(search)

  const { t: trans } = useTranslation()

  const [form] = Form.useForm<UserFindAllApiArg>()

  const { Text } = Typography

  const onCancel = () => {
    setVisible(false)
  }

  const handleModal = (action: viewMode, id?: string) => {
    setVisible(true)
    if (id) setSelectedId(id)
    setMode(action)
  }

  const handleActionClick = useActionHandler<AdminAccountData>(handleModal)

  const submit = (value: UserFindAllApiArg) => {
    const newQuery = {
      ...search,
      fullName: value.fullName?.trim(),
      phoneNumber: value.phoneNumber?.trim(),
      email: value.email?.trim(),
      active: value.active !== null ? value.active : undefined,
      page: 1
    }
    setSearch(newQuery)
  }

  const CellContent = ({ content }: { content: string }) => (
    <Tooltip title={content ? content : ''}>
      <Text>{content}</Text>
    </Tooltip>
  )

  const Nodata = () => <Text>{trans`labels.nodata`}</Text>

  const adminColumns: ColumnsType<AdminAccountData> = [
    {
      title: 'Id',
      dataIndex: 'id',
      align: 'center',
      width: 80
    },
    {
      title: trans('admin-management.label.userName'),
      dataIndex: 'fullName',
      ellipsis: true,
      align: 'center',
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      }
    },
    {
      title: trans('admin-management.label.email'),
      dataIndex: 'email',
      ellipsis: true,
      align: 'center',
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      }
    },
    {
      title: trans('admin-management.label.phoneNumber'),
      dataIndex: 'phoneNumber',
      align: 'center',
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      }
    },
    {
      title: trans('admin-management.label.role'),
      dataIndex: 'role',
      align: 'center',
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      }
    },
    {
      title: trans('admin-management.label.status'),
      dataIndex: 'active',
      align: 'center',
      render: (record: boolean) => (
        <Tag
          color={getTagColor(record)}
          className='text-capitalize'
        >
          {getStatusText(record)}
        </Tag>
      )
    },
    {
      title: trans('admin-management.label.action'),
      width: 250,
      align: 'center',
      render: (value: string, record: AdminAccountData) => (
        <div className='flex gap-2'>
          <ButtonAction
            module='admin'
            trans={trans}
            action={['update', 'permission', 'delete', 'view']}
            record={record}
            onClick={handleActionClick}
          />
          {record.active === 0 ? (
            <Tooltip
              placement='top'
              title={trans('admin-management.tooltip.unlock')}
            >
              <ButtonUnlock
                module='admin'
                onClick={() => handleModal(viewMode.unlock, record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip
              placement='top'
              title={trans('admin-management.tooltip.lock')}
            >
              <ButtonLock
                module='admin'
                onClick={() => handleModal(viewMode.lock, record.id)}
              />
            </Tooltip>
          )}
        </div>
      )
    }
  ]

  return (
    <Card
      title={
        <SearchBar<UserFindAllApiArg>
          form={form}
          onFinish={submit}
          headerMenu={
            <>
              <Form.Item
                name='fullName'
                label={trans('admin-management.label.userName')}
              >
                <Input
                  allowClear
                  placeholder={trans(
                    'admin-management.placeholder.userNamePlaceholder'
                  ).toString()}
                />
              </Form.Item>

              <Form.Item
                name='email'
                label={trans('admin-management.label.email')}
              >
                <Input
                  allowClear
                  placeholder={trans(
                    'admin-management.placeholder.emailPlaceholder'
                  ).toString()}
                />
              </Form.Item>
              <Form.Item
                name='phoneNumber'
                label={trans('admin-management.label.phoneNumber')}
                rules={[
                  {
                    pattern: new RegExp(
                      /^(\\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6]|9[0-4|6-9])([0-9]{7})$/
                    ),
                    message: trans(
                      'messages.phoneNumberCorrectFormat'
                    ).toString()
                  }
                ]}
              >
                <Input
                  allowClear
                  placeholder={trans(
                    'admin-management.placeholder.phoneNumberPlaceholder'
                  ).toString()}
                  onBlur={(e) => {
                    const value = e.target.value.trim()
                    form.setFieldValue('phoneNumber', value)
                  }}
                />
              </Form.Item>
              <Form.Item
                name='active'
                label={trans('admin-management.label.status')}
              >
                <Select
                  allowClear
                  placeholder={trans(
                    'admin-management.placeholder.statusPlaceholder'
                  )}
                  options={AdminManagementOptions}
                />
              </Form.Item>
              <ButtonSearch htmlType='submit' />

              <ButtonAdd
                module='admin'
                onClick={() => handleModal(viewMode.create)}
              />
            </>
          }
        />
      }
    >
      <Table
        columns={adminColumns}
        dataSource={adminAccount?.data || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: adminAccount?.meta?.page || 1,
          pageSize: adminAccount?.meta?.take || 10,
          total: adminAccount?.meta?.itemCount || 0,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <AdminModal
        mode={mode}
        visible={visible}
        onCancel={onCancel}
        id={selectedId}
        refetch={refetch}
      />
    </Card>
  )
}

export default AdminManagement
