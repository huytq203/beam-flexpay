import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import CellContent from '@components/cell-content/CellContent'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { typeOptions } from '@constants/options'
import { useGetListGroupQuery } from '@services/apiAccountGroup'
import {
  CustomerType,
  GroupAccountParamsInterface,
  GroupDataInterface
} from '@type/accountGroup'
import { viewMode } from '@type/permission'
import { Card, Col, Form, Input, Row, Select, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GroupModal from './group-modal/GroupModal'

function CustomerGroup() {
  const { t } = useTranslation()

  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState<GroupAccountParamsInterface>({
    page: 1,
    take: 10
    // status: accountStatus.VERIFIED
  })

  const [form] = Form.useForm<GroupAccountParamsInterface>()

  const [selectedId, setSelectedId] = useState<number | undefined>(undefined)
  const { data: groupCustomer, refetch } = useGetListGroupQuery(search)

  /**
   * control action open and close of modal
   * @param state
   */
  const triggerModal = (state: boolean) => {
    setOpen(state)
  }
  /**
   * memorized data
   */
  const groups = useMemo(() => {
    const data: GroupDataInterface[] = []
    const personalList: GroupDataInterface[] = []
    let personalCount = 0
    let businessCount = 0
    const defaultType = CustomerType.PERSONAL

    for (const item of groupCustomer?.data || []) {
      for (let i = 0; i < (item.customers?.length || 0); i++) {
        const customer = item.customers[i]
        const number =
          item.totalCustomer > 1 ? (i === 0 ? item.totalCustomer : 0) : 1
        const groupData: GroupDataInterface = {
          customerType: item.customerType,
          groupId: item.id,
          name: item.name,
          totalCustomer: number,
          ...customer,
          pointItem: 0
        }

        switch (item.customerType) {
          case defaultType:
            personalCount++
            personalList.push(groupData)
            break
          default:
            businessCount++
            data.push(groupData)
        }
      }
    }

    data.unshift(...personalList)

    if (data.length > 0) {
      const isFirstCustomerPersonal = data[0]?.customerType === defaultType
      const firstPointItem = isFirstCustomerPersonal
        ? personalCount
        : businessCount
      const secondPointItem = isFirstCustomerPersonal
        ? businessCount
        : personalCount

      data[0].pointItem = firstPointItem

      if (data.length > firstPointItem) {
        data[firstPointItem].pointItem = secondPointItem
      }
    }
    return data
  }, [groupCustomer])

  const getCustomerType = (type: CustomerType) => {
    if (type === CustomerType.PERSONAL) {
      return t`customer-group.customer-type.personal`
    } else return t`customer-group.customer-type.enterprise`
  }

  /**
   * define column of table
   */
  const columns: ColumnsType<GroupDataInterface> = [
    {
      title: t`customer-group.type`,
      dataIndex: ['customerType'],
      align: 'center',
      width: 180,
      fixed: 'left',
      render: (value, row) => {
        const obj: any = {
          children: getCustomerType(value),
          props: {}
        }
        if (row.pointItem !== 0) {
          obj.props.rowSpan = row.pointItem
          obj.props.style = {
            borderBottom: '1px solid rgba(5, 5, 5, 0.06)',
            borderTop: 'none'
          }
        } else {
          obj.props.rowSpan = 0
        }
        return obj
      }
    },
    {
      title: t`customer-group.group`,
      dataIndex: ['name'],
      align: 'center',
      width: 300,
      render: (value, row, index) => {
        const obj: any = {
          children: value,
          props: {}
        }
        if (row.totalCustomer > 0) {
          obj.props.rowSpan = row.totalCustomer
          obj.props.style = {
            borderBottom: '1px solid rgba(5, 5, 5, 0.06)',
            borderTop: 'none'
          }
        } else {
          obj.props.rowSpan = 0
        }
        return obj
      }
    },
    {
      title: t`customer-group.count`,
      dataIndex: ['totalCustomer'],
      align: 'center',
      width: 90,
      render: (value, row, index) => {
        const obj: any = {
          children: value,
          props: {}
        }
        if (row.totalCustomer > 0) {
          obj.props.rowSpan = row.totalCustomer
          obj.props.style = {
            borderBottom: '1px solid rgba(5, 5, 5, 0.06)',
            borderTop: 'none'
          }
        } else {
          obj.props.rowSpan = 0
        }
        return obj
      }
    },
    {
      title: t`customer-group.OmiPay`,
      dataIndex: 'phoneNumber',
      align: 'center',
      width: 180
    },
    {
      title: t`customer-group.omipay-name`,
      dataIndex: 'fullName',
      align: 'center',
      width: 180,
      render: (record) => <CellContent data={record} />
    },
    {
      title: t`customer-group.action`,
      align: 'center',
      width: 180,
      fixed: 'right',
      render: (value, row) => {
        const obj: any = {
          children: (
            <>
              <ButtonUpdate
                type='primary'
                className='mr-10'
                ghost
                onClick={() => {
                  setSelectedId(row.groupId)
                  setMode(viewMode.update)
                  triggerModal(true)
                }}
                module='customer_group'
              />
              <ButtonDelete
                danger
                onClick={() => {
                  setSelectedId(row.groupId)
                  setMode(viewMode.delete)
                  triggerModal(true)
                }}
                module='customer_group'
              />
            </>
          ),
          props: {}
        }
        if (row.totalCustomer > 0) {
          obj.props.rowSpan = row.totalCustomer
          obj.props.style = {
            borderBottom: '1px solid rgba(5, 5, 5, 0.06)',
            borderTop: 'none'
          }
        } else {
          obj.props.rowSpan = 0
        }
        return obj
      }
    }
  ]

  const onSearch = (value: GroupAccountParamsInterface) => {
    const name = value.name?.trim()
    const customerAccountNumber = value.customerAccountNumber?.trim()
    setSearch({ page: 1, ...value, name: name, customerAccountNumber })
  }

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={onSearch}
          cols='2'
          headerMenu={
            <>
              <Form.Item
                name='customerType'
                label={t`customer-group.modal.type`}
              >
                <Select
                  placeholder={t`customer-group.placeholders.type`}
                  options={typeOptions}
                  onChange={(e) => {
                    if (e === '' || e === undefined) {
                      setSearch({
                        page: 1,
                        ...search,
                        customerType: undefined
                      })
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name='name'
                label={t`customer-group.group`}
              >
                <Input
                  allowClear
                  placeholder={t`customer-group.placeholders.groups`.toString()}
                  onChange={(e) => {
                    if (e.target.value === '' || e.target.value === undefined) {
                      setSearch({ page: 1, ...search, name: undefined })
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name='customerAccountNumber'
                label={t`customer-group.account`}
              >
                <Input
                  allowClear
                  placeholder={t`customer-group.placeholders.customer`.toString()}
                  onChange={(e) => {
                    if (e.target.value === '' || e.target.value === undefined) {
                      setSearch({
                        page: 1,
                        ...search,
                        customerAccountNumber: undefined
                      })
                    }
                  }}
                />
              </Form.Item>
              <div className='flex gap-2 items-center '>
                <ButtonSearch
                  htmlType='submit'
                  className='w-full'
                />

                <ButtonAdd
                  module='customer_group'
                  type='primary'
                  onClick={() => {
                    setMode(viewMode.create)
                    triggerModal(true)
                  }}
                  className='w-full'
                />
              </div>
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={groups}
        bordered
        scroll={{ x: '100%' }}
        rowKey={'id'}
        pagination={{
          current: groupCustomer?.meta?.page,
          pageSize: groups?.length,
          total: groupCustomer?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      {open &&
        ((selectedId && mode === viewMode.update) ||
          mode === viewMode.create ||
          (selectedId && mode === viewMode.delete)) && (
          <GroupModal
            open={open}
            onCancel={() => triggerModal(false)}
            mode={mode}
            selectedId={selectedId}
            refetch={refetch}
          />
        )}
    </Card>
  )
}
export default CustomerGroup
