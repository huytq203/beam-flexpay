import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import CustomSelect from '@components/custom-select/CustomSelect'
import SearchBar from '@components/search-bar/SearchBar'
import { useLazyGetListGroupPermissionQuery } from '@services/apiGroupPermissionService'
import { useGroupFindAllQuery } from '@services/cmsService'
import { GroupFindAllApiArg } from '@type/application'
import { GroupPermissionData, viewMode } from '@type/permission'
import { getStatusText, getTagColor } from '@utils/helperFunctions'
import { Card, Form, Select, Tag } from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import GroupPermissionModal from './group-permission-modal/GroupPermissionModal'

import ButtonAction from '@components/button-action/ButtonAction'
import { useActionHandler } from '@hooks/useActionHandler'
import './style.scss'

const ManageGroupPermission = () => {
  const { t: trans } = useTranslation()
  const form = Form.useFormInstance<GroupFindAllApiArg>()

  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [selectedId, setSelectedId] = useState<string>('')
  const [visible, setVisible] = useState<boolean>(false)

  const [search, setSearch] = useState<GroupFindAllApiArg>({
    page: 1,
    take: 10
  })

  const { data: groupPermissionList, refetch } = useGroupFindAllQuery(search)
  const [triggerGroupPermissionList] = useLazyGetListGroupPermissionQuery()

  const handleModal = (action: viewMode, id?: string) => {
    setVisible(true)
    if (id) setSelectedId(id)
    setMode(action)
  }

  const handleActionClick = useActionHandler<GroupPermissionData>(handleModal)

  const onCancel = () => {
    setVisible(false)
  }

  const submit = (value: GroupFindAllApiArg) => {
    const newQuery = {
      ...search,
      name: (value.name as any)?.label.trim(),
      status: value.status !== null ? value.status : undefined,
      page: 1
    }
    setSearch(newQuery)
  }

  const groupPermissionColumns: ColumnsType<GroupPermissionData> = [
    {
      title: trans('labels.no'),
      align: 'center',
      width: 100,
      render: (text, object, index) => (
        <div>
          {((groupPermissionList?.meta?.page as number) - 1) * 10 + index + 1}
        </div>
      )
    },
    {
      title: trans('labels.permissionGroupName'),
      dataIndex: ['name'],
      ellipsis: true,
      align: 'center'
    },
    {
      title: trans('labels.status'),
      dataIndex: 'status',
      ellipsis: true,
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
      align: 'center',
      title: trans('labels.createdDate'),
      dataIndex: 'createdAt',
      ellipsis: true,
      render: (text: string) => <div>{dayjs(text).format('DD-MM-YYYY')}</div>
    },
    {
      title: trans('labels.action'),
      dataIndex: 'active',
      align: 'center',
      width: 120,
      render: (value: string, record: GroupPermissionData) => (
        <ButtonAction
          module='group'
          trans={trans}
          action={['update', 'delete']}
          record={record}
          onClick={handleActionClick}
        />
      )
    }
  ]

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={submit}
          headerMenu={
            <>
              <Form.Item
                name='name'
                label={trans('labels.permissionGroupName')}
              >
                <CustomSelect
                  field='name'
                  trigger={triggerGroupPermissionList}
                  search={{
                    page: 1,
                    take: 10
                  }}
                />
                {/* <Select
                      allowClear
                      showSearch
                      onSearch={onSearch}
                      showArrow={false}
                      filterOption={false}
                      style={{ minWidth: 220 }}
                      labelInValue
                      maxTagCount={2}
                      onPopupScroll={onScroll}
                      placeholder={trans(
                        'placeholders.permissionGroupName'
                      ).toString()}
                    >
                      {groupDropdownData?.map((el) => (
                        <Select.Option
                          value={el.id}
                          key={el.id}
                        >
                          {el.name}
                        </Select.Option>
                      ))}
                    </Select> */}
              </Form.Item>
              <Form.Item
                name='status'
                label={trans('labels.status')}
              >
                <Select
                  allowClear
                  placeholder={trans('placeholders.status')}
                  options={[
                    {
                      value: null,
                      label: trans('labels.all')
                    },
                    {
                      value: true,
                      label: trans('labels.active')
                    },
                    {
                      value: false,
                      label: trans('labels.lock')
                    }
                  ]}
                />
              </Form.Item>
              <ButtonSearch htmlType='submit' />

              <ButtonAdd
                module='group'
                onClick={() => {
                  handleModal(viewMode.create)
                }}
              />
            </>
          }
        />
      }
    >
      <Table
        columns={groupPermissionColumns}
        dataSource={groupPermissionList?.data || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: groupPermissionList?.meta?.page || 1,
          pageSize: groupPermissionList?.meta?.take || 10,
          total: groupPermissionList?.meta?.itemCount || 0,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <GroupPermissionModal
        visible={visible}
        onCancel={onCancel}
        mode={mode}
        id={selectedId}
        refetch={refetch}
      />
    </Card>
  )
}

export default ManageGroupPermission
