import { GUTTER } from '@constants/appConstant'
import { typeOptions } from '@constants/options'
import {
  useCreateAccountGroupMutation,
  useLazyGetDetailAccountGroupQuery,
  useUpdateAccountGroupMutation
} from '@services/apiAccountGroup'
import { useLazyGetCustomersQuery } from '@services/customerService'
import { CustomerType, GroupAccountBody } from '@type/accountGroup'
import { CustomerTable } from '@type/customer'
import { viewMode } from '@type/permission'
import { Pagination } from '@type/table'
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  message
} from 'antd'
import _ from 'lodash'
import type { BaseSelectRef } from 'rc-select'
import { createRef, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type CustomerSearch = {
  page: number
  take: number
  phoneNumber: string
}

interface IProps {
  onCancel: Function
  selectedId?: number | undefined
  mode: viewMode
  refetch: () => void
}

function CreateGroup({ mode, onCancel, selectedId, refetch }: IProps) {
  const { t } = useTranslation()
  const [customers, setCustomers] = useState<CustomerTable[]>([])
  const [pagination, setPagination] = useState<Pagination | undefined>(
    undefined
  )
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState<CustomerSearch>({
    page: 1,
    take: 10,
    phoneNumber: ''
  })
  const inputNumberRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ref = createRef<BaseSelectRef>()
  const [form] = Form.useForm()

  const [trigger] = useLazyGetCustomersQuery()
  const [createAccountGroup] = useCreateAccountGroupMutation()
  const [updateAccountGroup] = useUpdateAccountGroupMutation()
  const [getDetailAccountGroup] = useLazyGetDetailAccountGroupQuery()
  const [valueSearch, setValueSearch] = useState('')

  const storeData = (data: CustomerTable[]) => {
    if (search.page === 1) {
      setCustomers(data)
    } else {
      setCustomers((pre) => pre.concat(data))
    }
    setLoading(false)
  }

  useEffect(() => {
    const getData = async () => {
      if (mode === viewMode.update && selectedId) {
        const { data } = await getDetailAccountGroup(selectedId)
        const customerIds =
          data?.customers && data?.customers?.length > 0
            ? data?.customers.map((customer) => ({
                label:
                  customer?.phoneNumber +
                  '-' +
                  `${customer?.fullName ?? t`labels.nodata`}`,
                value: customer.id
              }))
            : []
        if (data && data?.id) {
          form.setFieldsValue({
            customerType: data.customerType,
            name: data.name,
            customerIds
          })
        }
      }
    }
    getData()
  }, [])

  const onDropdown = async (open: boolean) => {}

  const customerOptions = () => {
    return (
      <>
        <>
          {customers.map((item, index) => (
            <Select.Option
              value={item.id}
              key={`customer-${index}`}
            >
              {item.phoneNumber} - {item?.fullName ?? t`labels.nodata`}
            </Select.Option>
          ))}
          {loadingMore && (
            <div style={{ height: 20 }}>
              <Spin />
            </div>
          )}
        </>
      </>
    )
  }

  const onCloseModal = () => {
    onCancel()
  }

  const showSuccessMessage = (msg: string) => {
    message.destroy()
    message.success(msg)
  }

  const onSubmit = async (value: GroupAccountBody) => {
    setIsSubmitting(true)
    const { customerIds, ...rest } = value
    const body = {
      ...rest,
      customerIds: customerIds.map((item: any) => item.value)
    }
    const data = (await (mode === viewMode.create
      ? createAccountGroup(body)
      : updateAccountGroup({ id: selectedId, ...body }))) || { data: undefined }
    if (
      (data as any)?.data?.statusCode === 200 ||
      (data as any)?.data?.statusCode === 201
    ) {
      showSuccessMessage(
        mode === viewMode.create
          ? t`customer-group.message.create-success`
          : t`customer-group.message.update-success`
      )
      refetch()
      onCloseModal()
    } else {
      setIsSubmitting(false)
    }
  }

  const onScroll = async (event: any) => {
    const target = event.target
    if (
      !loading &&
      target.scrollTop + target.offsetHeight > target.scrollHeight - 2
    ) {
      if (pagination && pagination?.page < pagination?.pageCount) {
        target.scrollTo(0, target.scrollHeight)
        setLoadingMore(true)
        const query = {
          ...search,
          phoneNumber: valueSearch,
          page: search.page + 1
        }
        setSearch(query)
        const data = await trigger(query)
        if (data && !data.isLoading && data.isSuccess) {
          storeData(data.data.data)
          setPagination(data.data.meta)
          setLoadingMore(false)
        }
      }
    }
  }

  const handleSearch = async (value: any) => {
    setValueSearch(value)
    if (inputNumberRef.current) clearTimeout(inputNumberRef.current)
    inputNumberRef.current = setTimeout(async () => {
      if (value) {
        setLoading(true)
        setOpen(true)
        storeData([])
        const query = { ...search, phoneNumber: value }
        const phoneData = await trigger(query)
        const nameQuery = { ...search, name: value }
        const nameData = await trigger(nameQuery)
        let data: CustomerTable[] = []
        if (phoneData && phoneData.isSuccess)
          data = [...data, ...phoneData.data.data]
        if (nameData && nameData.isSuccess)
          data = [...data, ...nameData.data.data]
        const _storeData = _.compact(data)
        storeData(_storeData)
        setPagination(phoneData.data?.meta)
        setLoadingMore(false)
      }
    }, 500)
  }

  const onBlur = (value: string) => {
    form.setFieldValue('name', value.trim())
  }

  return (
    <div className='create-group'>
      <Form
        layout='vertical'
        form={form}
        onFinish={onSubmit}
        initialValues={{
          customerType: CustomerType.PERSONAL
        }}
      >
        <Form.Item
          name='customerType'
          label={t`customer-group.modal.type`}
          rules={[
            {
              required: true,
              message: t`customer-group.message.type-required`.toString()
            }
          ]}
        >
          <Select
            placeholder={t`customer-group.placeholders.type`}
            options={typeOptions}
          />
        </Form.Item>
        <Form.Item
          name='name'
          label={t`customer-group.modal.name`}
          rules={[
            {
              required: true,
              message: t`customer-group.message.name-required`.toString()
            },
            {
              validator(rule, value, callback) {
                const regex = new RegExp(/^[A-Za-z0-9 ]+$/)
                const result = regex.test(value)
                if (result) return Promise.resolve()
                else
                  return Promise.reject(
                    t`customer-group.message.name-special`.toString()
                  )
              }
            }
          ]}
        >
          <Input
            placeholder={t`customer-group.placeholders.name`.toString()}
            onBlur={(e) => onBlur(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name='customerIds'
          label={t`customer-group.modal.customer`}
          rules={[
            {
              required: true,
              message: t`customer-group.message.group-required`.toString()
            }
          ]}
        >
          <Select
            loading={loading}
            mode='multiple'
            style={{ width: '100%' }}
            ref={ref}
            open={open}
            onFocus={() => setOpen(true)}
            popupClassName='customer-popup'
            onBlur={() => setOpen(false)}
            onDropdownVisibleChange={(open) => onDropdown(open)}
            onPopupScroll={onScroll}
            searchValue={valueSearch}
            placeholder={t`customer-group.placeholders.customer`}
            labelInValue={true}
            onSearch={handleSearch}
            notFoundContent={
              loading ? (
                <div className='d-flex justify-center'>
                  <Spin />
                </div>
              ) : (
                <Empty description={t`labels.nodata`} />
              )
            }
            filterOption={false}
          >
            {customerOptions()}
          </Select>
        </Form.Item>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button onClick={onCloseModal}>{t`buttons.close`}</Button>
          </Col>
          <Col>
            <Form.Item shouldUpdate>
              <Button
                type='primary'
                htmlType='submit'
                loading={isSubmitting}
              >
                {mode === viewMode.create
                  ? t`buttons.create`
                  : t`buttons.update`}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
export default CreateGroup
