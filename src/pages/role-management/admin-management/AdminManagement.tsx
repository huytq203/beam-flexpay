import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonLock from '@components/button-lock/ButtonLock'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUnlock from '@components/button-unlock/ButtonUnlock'
import ButtonUpdateGroupPermission from '@components/button-update-permission/ButtonUpdatePermission'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { useUserFindAllQuery } from '@services/cmsUser'
import { AdminAccountData, viewMode } from '@type/admin'
import { UserFindAllApiArg } from '@type/application'
import { getStatusText, getTagColor } from '@utils/helperFunctions'
import {
  Button,
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
import { AiFillEye } from 'react-icons/ai'
import { AdminModal } from './AdminModal/AdminModal'
import { AdminManagementOptions } from '@constants/options'

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
    <Text>{content}</Text>
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
        <Row
          gutter={GUTTER}
          justify='center'
        >
          <Col>
            <Tooltip
              placement='top'
              title={trans('tooltips.update')}
            >
              <ButtonUpdate
                key={crypto.randomUUID()}
                module='admin'
                onClick={() => handleModal(viewMode.update, record.id)}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={trans('admin-management.tooltip.view')}
            >
              <Button
                icon={<AiFillEye />}
                onClick={() => handleModal(viewMode.view, record.id)}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={trans('admin-management.tooltip.permission')}
            >
              <ButtonUpdateGroupPermission
                key={crypto.randomUUID()}
                module='admin'
                onClick={() => handleModal(viewMode.permission, record.id)}
              />
            </Tooltip>
          </Col>
          {record.active === 0 ? (
            <Col>
              <Tooltip
                placement='top'
                title={trans('admin-management.tooltip.unlock')}
              >
                <ButtonUnlock
                  module='admin'
                  onClick={() => handleModal(viewMode.unlock, record.id)}
                />
              </Tooltip>
            </Col>
          ) : (
            <Col>
              <Tooltip
                placement='top'
                title={trans('admin-management.tooltip.lock')}
              >
                <ButtonLock
                  module='admin'
                  onClick={() => handleModal(viewMode.lock, record.id)}
                />
              </Tooltip>
            </Col>
          )}
          <Col>
            <Tooltip
              placement='top'
              title={trans('admin-management.tooltip.delete')}
            >
              <ButtonDelete
                module='admin'
                onClick={() => handleModal(viewMode.delete, record.id)}
              />
            </Tooltip>
          </Col>
        </Row>
      )
    }
  ]

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              layout='vertical'
              onFinish={submit}
              form={form}
              initialValues={{
                active: null
              }}
            >
              <Row gutter={GUTTER}>
                <Col span={6}>
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
                </Col>
                <Col span={6}>
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
                </Col>
                <Col span={6}>
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
                </Col>
                <Col span={6}>
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
                </Col>
              </Row>
              <Row
                justify='end'
                gutter={GUTTER}
              >
                <Col>
                  <ButtonAdd
                    key={crypto.randomUUID()}
                    module='admin'
                    onClick={() => handleModal(viewMode.create)}
                  />
                </Col>
                <Col>
                  <ButtonSearch
                    key={crypto.randomUUID()}
                    htmlType='submit'
                  />
                </Col>
              </Row>
            </Form>
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
