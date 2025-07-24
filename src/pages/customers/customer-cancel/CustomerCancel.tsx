import { AuditLogManagementModal } from '@components/audit-log/AuditLogManagementModal'
import ButtonExcel from '@components/button-excel/ButtonExcel'
import ButtonSearch from '@components/button-search/ButtonSearch'
import CellContent from '@components/cell-content/CellContent'
import SearchBar from '@components/search-bar/SearchBar'
import { TimeFormat } from '@constants/datetime'
import { useCustomerFindAllQuery } from '@services/cmsService'
import {
  useCancelAccountMutation,
  useExportExcelQuery
} from '@services/customerService'
import { CustomerFindAllApiArg, UserDetailDto } from '@type/application'
import { accountStatus } from '@type/customer'
import {
  fnDisableEndDate,
  fnDisableStartDate,
  getAccountType,
  getStatusAccountText,
  getStatusText,
  getStringDateFromMoment,
  getTagAccountStatusColor,
  getTagColor
} from '@utils/helperFunctions'
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { pageEnum, viewMode } from '../../../app/types/policyManagement'
import ButtonCancel from '@components/button-cancel/ButtonCancel'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'

const CustomerCancel = () => {
  const { t: trans } = useTranslation()
  const [form] = Form.useForm()
  const [search, setSearch] = useState<CustomerFindAllApiArg>({
    page: 1,
    take: 10,
    status: [accountStatus.NOT_VERIFIED]
  })

  const [open, setOpen] = useState<boolean>(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [visibleConfirmModal, setVisibleConfirmModal] = useState<boolean>(false)

  const { data: accounts, refetch } = useCustomerFindAllQuery(search)

  const [cancelAccount] = useCancelAccountMutation()

  const onCancelHistory = () => {
    if (mode === viewMode.history || mode === viewMode.delete) {
      setOpen(false)
    } else {
      setVisibleConfirmModal(true)
    }
  }

  const onCloseConfirmModal = () => {
    setVisibleConfirmModal(false)
  }

  const onCancel = useCallback((customerId: string) => {
    Modal.confirm({
      centered: true,
      title: trans`customer-cancel.cancelMessage`,
      onOk: async () => {
        const result = await cancelAccount({ customerId })
        if (result) {
          refetch()
        }
      },
      okText: trans`buttons.ok`,
      cancelText: trans`buttons.back`
    })
  }, [])

  const columns: ColumnsType<UserDetailDto> = [
    {
      title: trans`customer-cancel.registrationDate`,
      dataIndex: 'createdAt',
      align: 'center',
      render: (date: string) => <p>{dayjs(date).format(TimeFormat)}</p>
    },
    {
      title: trans`customer-cancel.accountNumber`,
      dataIndex: 'phoneNumber',
      align: 'center'
    },
    {
      title: trans`customer-cancel.typeAccount`,
      dataIndex: 'type',
      align: 'center',
      render: (record: string) => <CellContent data={getAccountType(record)} />
    },
    {
      title: trans`customer-cancel.email`,
      dataIndex: 'email',
      align: 'center',
      render: (record: string) => <CellContent data={record} />
    },
    {
      title: trans`customer-cancel.status`,
      dataIndex: 'active',
      align: 'center',
      render: (record: boolean) => (
        <CellContent
          data={
            <Tag
              color={getTagColor(record)}
              className='text-capitalize'
            >
              {getStatusText(record)}
            </Tag>
          }
        />
      )
    },
    {
      title: trans`customer-cancel.authStatus`,
      dataIndex: 'status',
      align: 'center',
      render: (record: string) => (
        <CellContent
          data={
            <Tag
              color={getTagAccountStatusColor(record)}
              className='text-capitalize'
            >
              {getStatusAccountText(record)}
            </Tag>
          }
        />
      )
    },
    {
      title: trans`customer-cancel.cancel`,
      dataIndex: 'id',
      align: 'center',
      render: (value: string) => (
        <Tooltip title={trans`customer-cancel.cancel`}>
          <ButtonCancel
            module='customer'
            onClick={() => {
              onCancel(value)
            }}
            type='primary'
            className='mw-100'
            danger
            ghost
          />
        </Tooltip>
      )
    }
  ]

  const submit = (value: CustomerFindAllApiArg) => {
    const data = {
      ...search,
      phoneNumber: value.phoneNumber,
      from: value?.from
        ? getStringDateFromMoment(value?.from, TimeFormat)
        : undefined,
      to: value?.to
        ? getStringDateFromMoment(value?.to, TimeFormat)
        : undefined,
      page: 1
    }
    setSearch(data)
  }

  // #region export excel
  const [skip, setSkip] = useState(true)
  const { isSuccess } = useExportExcelQuery(
    { pageCount: accounts?.meta.pageCount, ...search },
    { skip: skip, refetchOnMountOrArgChange: true }
  )

  const handleExport = () => {
    if (accounts?.meta.itemCount) {
      setSkip(false)
    }
  }

  const handleOpenHistory = () => {
    setMode(viewMode.history)
    setOpen(true)
  }
  //test deploy
  useEffect(() => {
    if (isSuccess) {
      setSkip(true)
    }
  }, [isSuccess])
  // #endregion

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={submit}
          cols='3'
          headerMenu={
            <>
              <Form.Item
                name='phoneNumber'
                label={trans`customer-cancel.account`}
              >
                <Input
                  placeholder={trans('placeholders.omiAccount').toString()}
                />
              </Form.Item>

              <Form.Item
                name='from'
                label={`${trans`customer-cancel.registrationDate`} ${trans`customer-cancel.fromDate`}`}
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  className='w-100'
                  disabledDate={(current) =>
                    fnDisableStartDate(
                      current,
                      dayjs(form.getFieldValue('to'), 'YYYY-MM-DD')
                    )
                  }
                />
              </Form.Item>

              <Form.Item
                name='to'
                label={trans`customer-cancel.toDate`}
              >
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  className='w-100'
                  disabledDate={(current) =>
                    fnDisableEndDate(
                      current,
                      dayjs(form.getFieldValue('from'), 'YYYY-MM-DD')
                    )
                  }
                />
              </Form.Item>

              <ButtonSearch
                type='primary'
                htmlType='submit'
              />
              {/* lịch sử hoạt động */}
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={accounts?.data ?? []}
        rowKey='phoneNumber'
        scroll={{ x: '100%' }}
        size='small'
        bordered
        pagination={{
          current: accounts?.meta?.page,
          pageSize: accounts?.meta?.take,
          total: accounts?.meta?.itemCount,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <AuditLogManagementModal
        onCloseConfirmModal={onCloseConfirmModal}
        visibleConfirmModal={visibleConfirmModal}
        refetch={refetch}
        page={pageEnum.customerCancel}
        onCancel={onCancelHistory}
        open={open}
        setOpen={setOpen}
        mode={mode}
        entityType='CUSTOMER_MANAGEMENT'
      />
    </Card>
  )
}

export default CustomerCancel
