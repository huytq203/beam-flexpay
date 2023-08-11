import { objectOptions } from '@constants/options'
import { CustomerTable, viewMode } from '@type/customer'
import { IProductTypeSearch, IProductTypeTable } from '@type/productType'
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  notification,
  Row,
  Select,
  Spin
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { RangePickerProps } from 'antd/es/date-picker'
import dayjs from 'dayjs'
import { useCreateSaleFeeMutation } from '@services/apiSaleFeeService'
import { useLazyGetCustomersQuery } from '@services/customerService'
import {
  blockArrowValue,
  blockLetterDecimal,
  blockLetterValue,
  convertNumber,
  moneyInputFormatter
} from '@utils/helperFunctions'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { GroupAccountInterface } from '@type/accountGroup'
import { IProductTypes, IServiceType } from '@type/product'
import {
  useLazyGetListServiceQuery,
  useLazyViewProductQuery
} from '@services/productService'
import { ChildProductType } from '@type/discountProduct'
import { OptionProps } from 'antd/es/select'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'

interface IProps {
  mode?: viewMode
  refetch: () => void
  onCancel: () => void
}

type PayloadType = {
  applicableObject: string
  productId: string
  variableFee: string | number
  fixedFee: string | number
  startDate: string
  endDate: string
  account?: string
  accountGroupId?: string
}

function SaleFeeForm({ mode = viewMode.create, onCancel, refetch }: IProps) {
  const { t } = useTranslation()
  const { Option } = Select
  const [form] = Form.useForm()

  const [privateObject, setPrivateObject] = useState()
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedProductType, setSelectedProductType] = useState<string>('')
  const [selectedGroupProduct, setSelectedGroupProduct] = useState<string>('')
  const [selectedDenominations, setSelectedDenominations] = useState<string>('')
  const [intoMoney, setIntoMoney] = useState<number>(0)
  const [search, setSearch] = useState<IProductTypeSearch>({
    page: 1,
    take: 10
  })
  const [searchAccount, setSearchAccount] = useState<IProductTypeSearch>({
    page: 1,
    take: 10
  })

  const [searchAccountGroup, setSearchAccountGroup] =
    useState<IProductTypeSearch>({
      page: 1,
      take: 10
    })

  const [disableStatus, setDisableStatus] = useState<{
    productType: boolean
    product: boolean
    childProduct: boolean
  }>({
    productType: false,
    product: true,
    childProduct: true
  })

  const [productTypeDropdownData, setProductTypeDropdownData] = useState<
    IProductTypes[]
  >([])

  const [serviceDropdownData, setServiceDropdownData] = useState<
    IServiceType[]
  >([])

  const [productDropdownData, setProductDropdownData] = useState<
    IProductTypes[]
  >([])

  const [accountDropdownData, setAccountDropdownData] = useState<
    CustomerTable[]
  >([])

  const [accountGroupDropdownData, setAccountGroupDropdownData] = useState<
    GroupAccountInterface[]
  >([])

  const [createSaleFee, { isLoading }] = useCreateSaleFeeMutation()

  const [triggerListAccount, { data: ListAccount }] = useLazyGetCustomersQuery()

  const [triggerListAccountGroup, { data: ListGroupAccount }] =
    useLazyGetListGroupQuery()

  const [
    triggerChildProductList,
    { data: childProductList, isLoading: isLoadingChildProduct }
  ] = useLazyViewProductQuery()

  const [
    triggerListService,
    { data: listService, isLoading: isLoadingServiceList }
  ] = useLazyGetListServiceQuery()

  const getAccountDropdownData = useCallback(async () => {
    const data: any = await triggerListAccount({ take: 10, page: 1 })
    const accountArr: CustomerTable[] = data?.data?.data
    setAccountDropdownData(accountArr)
  }, [])

  const getAccountGroupDropdownData = useCallback(async () => {
    const data: any = await triggerListAccountGroup({ take: 10, page: 1 })
    setAccountGroupDropdownData(data?.data?.data)
  }, [])

  const onScrollAccountGroupDropdown = async (e: any) => {
    const target = e.target
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (ListGroupAccount?.meta?.hasNextPage) {
        setSearchAccountGroup({
          ...searchAccountGroup,
          page: searchAccountGroup.page + 1
        })
        const data = await triggerListAccountGroup({
          page: searchAccountGroup.page + 1,
          take: 10
        })
        setAccountGroupDropdownData((prev) =>
          prev.concat(data?.data?.data as GroupAccountInterface[])
        )
      }
    }
  }

  const onScrollServiceDropdown = async (e: any) => {
    const target = e.target
    let dupServiceDropdownData = [...serviceDropdownData]
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (listService?.meta.hasNextPage) {
        setSearch({ ...search, page: search.page + 1 })
        const data = await triggerListService({
          page: search.page + 1,
          take: 10
        })
        if (data.isSuccess && !data.isLoading) {
          data?.data?.data.map((el) => {
            dupServiceDropdownData.push(el)
          })
        }
        setServiceDropdownData(dupServiceDropdownData)
      }
    }
  }

  const onpenDropdownService = async (open: boolean) => {
    if (serviceDropdownData.length === 0 && open) {
      const data = await triggerListService({
        page: 1,
        take: 10
      })
      setServiceDropdownData(data?.data?.data as IServiceType[])
    }
  }

  const openDropDownProductType = useCallback(
    (open: boolean) => {
      let dupProductTypeDropdownData = [...productTypeDropdownData]
      if (open) {
        const selectedItem = serviceDropdownData.filter(
          (el: IServiceType) => el.id === Number(selectedService)
        )
        if (selectedService) {
          dupProductTypeDropdownData = selectedItem[0].productTypes
        }
        setProductTypeDropdownData(dupProductTypeDropdownData)
      }
    },
    [selectedService]
  )

  const openDropDownProduct = useCallback(
    (open: boolean) => {
      let dupProductDropdownData = [...productDropdownData]
      if (open) {
        const selectedItem = productTypeDropdownData.filter(
          (el: IProductTypes) => el.id === Number(selectedProductType)
        )
        if (selectedProductType) {
          dupProductDropdownData = selectedItem[0].groupProducts
        }
        setProductDropdownData(dupProductDropdownData)
      }
    },
    [selectedProductType]
  )

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().startOf('day')
  }

  const handleSelectProductType = useCallback(
    (_: string, option: { value: string }) => {
      setSelectedProductType(option.value)
      setSelectedGroupProduct('')
      if (selectedProductType !== option.value) {
        form.setFieldsValue({
          product: undefined,
          childProduct: undefined
        })
      }
    },
    [selectedProductType]
  )

  const onSelectService = async (value: string) => {
    setSelectedService(value)
    setSelectedProductType('')
    // setGroupProductId(undefined)
    if (selectedService !== value) {
      form.setFieldsValue({
        productType: undefined,
        product: undefined,
        childProduct: undefined
      })
    }
  }

  const onSelectChildProduct = (value: string, option: OptionProps) => {
    const selectedItem = childProductList?.data?.products.filter(
      (el: ChildProductType) => el.id === Number(value)
    )
    setSelectedDenominations(selectedItem[0].price)
    form.setFieldsValue({
      denominations: selectedItem[0].price
    })
  }

  const onSelectGroupProduct = useCallback(async (value: string) => {
    setSelectedGroupProduct(value)
    await triggerChildProductList(value)
  }, [])

  const renderAccountGroupDropdownData = useCallback(() => {
    return accountGroupDropdownData.map((el: GroupAccountInterface) => (
      <Option
        key={el.id}
        value={el.id}
      >
        {el.name}
      </Option>
    ))
  }, [accountGroupDropdownData])

  const renderProductTypeDropdownData = useCallback(() => {
    return productTypeDropdownData.map((el: IProductTypes) => (
      <Option
        key={el.id}
        value={el.id}
      >
        {el.name}
      </Option>
    ))
  }, [productTypeDropdownData])

  const renderProductDropdownData = useCallback(() => {
    return productDropdownData.map((el: IProductTypes) => (
      <Option
        key={el.id}
        value={el.id}
      >
        {el.name}
      </Option>
    ))
  }, [productDropdownData])

  const renderServiceDropdownData = useCallback(() => {
    if (serviceDropdownData.length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      )
    } else {
      return serviceDropdownData.map((el: IServiceType) => (
        <Option
          key={el.id}
          value={el.id}
        >
          {el.name}
        </Option>
      ))
    }
  }, [serviceDropdownData, isLoadingServiceList])

  const childProductOptions = useCallback(() => {
    if (childProductList?.data?.products) {
      return childProductList?.data?.products.map((el: ChildProductType) => (
        <Option
          key={el.id}
          value={el.id}
        >
          {el.name}
        </Option>
      ))
    } else
      return (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      )
  }, [childProductList?.data])

  useEffect(() => {
    if (privateObject === 'PRIVATE_ACCOUNT') {
      getAccountDropdownData()
    }
    if (privateObject === 'CUSTOMER_TYPE') {
      getAccountGroupDropdownData()
    }
  }, [privateObject])

  useEffect(() => {
    const variableFee =
      form.getFieldValue('variableFee') > 100
        ? 100
        : form.getFieldValue('variableFee')
    const value =
      Number(selectedDenominations) +
      (Number(form.getFieldValue('variableFee')) / 100) *
        Number(selectedDenominations) +
      Number(form.getFieldValue('fixedFee'))
    if (selectedDenominations) {
      if (form.getFieldValue('fixedFee') && variableFee) {
        setIntoMoney(value)
        form.setFieldsValue({
          intoMoney: convertNumber(value)
        })
      } else if (
        form.getFieldValue('fixedFee') === 0 ||
        variableFee === 0 ||
        form.getFieldValue('variableFee') === 0
      ) {
        setIntoMoney(value)
        form.setFieldsValue({
          intoMoney: convertNumber(value)
        })
      }
    }
  }, [selectedDenominations])

  const submit = async (values: any) => {
    if (values.intoMoney < 0) {
      form.setFields([
        {
          name: 'intoMoney',
          errors: [t('messages.smallerThanZeroValidate')]
        }
      ])
      return
    }
    const payload: PayloadType = {
      applicableObject: values.object,
      productId: values.childProduct,
      variableFee: values.variableFee > 100 ? 100 : values.variableFee,
      fixedFee: values.fixedFee,
      startDate: values.time[0].toISOString(),
      endDate: values.time[1].toISOString()
    }
    if (values.applicableAccountId) {
      payload.account = values.applicableAccountId
    }
    if (values.accountGroupId) {
      payload.accountGroupId = values.accountGroupId
    }
    const data: any = await createSaleFee(payload)
    if (data.data.statusCode === 201) {
      notification.success({
        message: t('messages.successCreateSaleFee')
      })
    }
    onCancel()
    refetch()
  }

  const onValueChanges = (changedValues: any, allValues: any) => {
    const variableFee =
      allValues.variableFee > 100 ? 100 : allValues.variableFee
    const value =
      Number(allValues.denominations) +
      (Number(variableFee) / 100) * Number(allValues.denominations) +
      Number(allValues.fixedFee)
    if (allValues.denominations && variableFee && allValues.fixedFee) {
      setIntoMoney(value)
      form.setFieldsValue({
        intoMoney: convertNumber(value)
      })
    } else if (
      allValues.denominations === 0 ||
      variableFee === 0 ||
      allValues.fixedFee === 0
    ) {
      setIntoMoney(value)
      form.setFieldsValue({
        intoMoney: convertNumber(value)
      })
    } else {
      setIntoMoney(0)
      form.setFieldsValue({
        intoMoney: 0
      })
    }
  }

  return (
    <Form
      layout='vertical'
      onFinish={submit}
      form={form}
      onValuesChange={onValueChanges}
    >
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            initialValue={'SYSTEM'}
            name='object'
            label={t`management.sales-fee.object`}
            rules={[
              {
                required: true,
                message: t`management.sales-fee.messages.object`.toString()
              }
            ]}
          >
            <Select
              options={objectOptions}
              placeholder={t`management.sales-fee.placeholders.object`}
              onChange={(options) => setPrivateObject(options)}
            />
          </Form.Item>
        </Col>
        {privateObject === 'CUSTOMER_TYPE' && (
          <Col span={12}>
            <Form.Item
              name='accountGroupId'
              label={t`management.sales-fee.accountGroup`}
              rules={[
                {
                  required: true,
                  message:
                    t`management.sales-fee.messages.accountType`.toString()
                }
              ]}
            >
              <Select
                onPopupScroll={onScrollAccountGroupDropdown}
                placeholder={t`management.sales-fee.placeholders.accountType`.toString()}
              >
                {renderAccountGroupDropdownData()}
              </Select>
            </Form.Item>
          </Col>
        )}
        {privateObject === 'PRIVATE_ACCOUNT' && (
          <Col span={12}>
            <Form.Item
              name='applicableAccountId'
              label={t`management.discount.account`}
              rules={[
                {
                  required: true,
                  message: t`management.sales-fee.messages.account`.toString()
                }
              ]}
            >
              <Input
                placeholder={t`management.sales-fee.placeholders.account`.toString()}
              />
            </Form.Item>
          </Col>
        )}
        <Col span={12}>
          <Form.Item
            name='service'
            label={t`management.sales-fee.service`}
            rules={[
              {
                required: true,
                message: t`management.sales-fee.messages.service`.toString()
              }
            ]}
          >
            <Select
              placeholder={t`management.discount.form.placeholders.service`}
              onDropdownVisibleChange={(open) => onpenDropdownService(open)}
              onSelect={onSelectService}
              onPopupScroll={onScrollServiceDropdown}
            >
              {renderServiceDropdownData()}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='productType'
            label={t`management.sales-fee.productType`}
            rules={[
              {
                required: true,
                message: t`management.sales-fee.messages.productType`.toString()
              }
            ]}
          >
            <Select
              disabled={!selectedService}
              onSelect={handleSelectProductType}
              onDropdownVisibleChange={(open) => openDropDownProductType(open)}
              // onPopupScroll={onScroll}
              placeholder={t`management.sales-fee.placeholders.productType`}
            >
              {renderProductTypeDropdownData()}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='product'
            label={t`management.sales-fee.product`}
            rules={[
              {
                required: true,
                message: t`management.sales-fee.messages.product`.toString()
              }
            ]}
          >
            <Select
              disabled={!selectedProductType}
              placeholder={t`management.sales-fee.placeholders.product`}
              onDropdownVisibleChange={(open) => openDropDownProduct(open)}
              onSelect={onSelectGroupProduct}
            >
              {renderProductDropdownData()}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='childProduct'
            label={t`management.sales-fee.childProduct`}
            rules={[
              {
                required: true,
                message:
                  t`management.sales-fee.messages.child-product`.toString()
              }
            ]}
          >
            <Select
              onSelect={onSelectChildProduct}
              disabled={!selectedGroupProduct}
              placeholder={t`management.sales-fee.placeholders.childProduct`}
            >
              {childProductOptions()}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='denominations'
            label={t`management.sales-fee.denominations`}
          >
            <InputNumber
              disabled
              onKeyPress={blockLetterDecimal}
              formatter={moneyInputFormatter}
              onKeyDown={blockArrowValue}
              className='w-100'
              placeholder={t`management.sales-fee.placeholders.variableFee`.toString()}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='variableFee'
            label={t`management.sales-fee.variableFee`}
            initialValue={0}
            rules={[
              {
                required: true,
                message: t`management.sales-fee.messages.variableFee`.toString()
              },
              () => ({
                validator(_, value) {
                  if (value < 0) {
                    return Promise.reject(new Error())
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <InputNumber
              min={0}
              type='text'
              precision={2}
              step={0.1}
              inputMode='numeric'
              onKeyDown={blockArrowValue}
              onKeyPress={blockLetterValue}
              className='w-100'
              formatter={(value) => {
                if (value) {
                  if (value > 100) {
                    form.setFieldsValue({
                      variableFee: 100
                    })
                    return '100%'
                  }
                }
                return `${value}%` ? `${value}%`.toString() : ''
              }}
              placeholder={t`management.sales-fee.placeholders.variableFee`.toString()}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='fixedFee'
            label={t`management.sales-fee.fixedCharge`}
            rules={[
              {
                required: true,
                message: t`management.sales-fee.messages.fixedCharge`.toString()
              },
              () => ({
                validator(_, value) {
                  if (value < 0 && value !== null) {
                    return Promise.reject(
                      new Error(`${t('messages.smallerThanZeroValidate')}`)
                    )
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <InputNumber
              min='0'
              formatter={moneyInputFormatter}
              onKeyPress={blockLetterDecimal}
              onKeyDown={blockArrowValue}
              className='w-100'
              placeholder={t`management.sales-fee.placeholders.variableFee`.toString()}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            initialValue={0}
            name='intoMoney'
            label={t`management.discount.current-charge`}
          >
            {intoMoney !== 0 ? (
              <Input
                value={intoMoney}
                disabled
              />
            ) : (
              <Input disabled />
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='time'
            label={t`management.sales-fee.time`}
            rules={[
              {
                required: true,
                message: t`management.sales-fee.messages.time`.toString()
              }
            ]}
          >
            <DatePicker.RangePicker
              disabledDate={disabledDate}
              showTime
              className='w-100'
              format={TimeFullFormat}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row className='justify-end'>
        <Col>
          <Button
            className='mr-10'
            onClick={onCancel}
          >{t`buttons.cancel`}</Button>
          <Button
            loading={isLoading}
            type='primary'
            htmlType='submit'
          >{t`buttons.create`}</Button>
        </Col>
      </Row>
    </Form>
  )
}
export default SaleFeeForm
