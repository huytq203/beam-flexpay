import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup'
import { useLazyGetCustomersQuery } from '@services/customerService'
import {
  useUpdateDiscountProductMutation,
  useViewDiscountProductQuery
} from '@services/discountProductService'
import {
  useLazyGetListServiceQuery,
  useLazyViewProductQuery
} from '@services/productService'
import { GroupAccountInterface } from '@type/accountGroup'
import { CustomerTable } from '@type/customer'
import { ApplicableObject, ChildProductType } from '@type/discountProduct'
import { IProductTypes, IServiceType } from '@type/product'
import { IProductTypeSearch } from '@type/productType'
import {
  blockArrowValue,
  blockLetterDecimal,
  blockLetterValue,
  convertNumber,
  moneyInputFormatter
} from '@utils/helperFunctions'
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
  notification
} from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import { useForm } from 'antd/es/form/Form'
import { OptionProps } from 'antd/es/select'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ProductDiscountProps = {
  open: boolean
  onClose: () => void
  id: string
}

type PayloadType = {
  id: string
  applicableObject: string
  productId: string
  discount: string | number
  fixedFee: string | number
  startDate: string
  endDate: string
  applicableAccountId?: string
  accountGroupId?: string
}

export const UpdateProductDiscountModal = (props: ProductDiscountProps) => {
  const { open, onClose, id } = props
  const { Option } = Select
  const { t } = useTranslation()
  const [form] = useForm()

  const [search, setSearch] = useState({
    page: 1,
    take: 10
  })

  const { data: detailData } = useViewDiscountProductQuery(id)

  const [triggerListService, { data: listService, isLoading }] =
    useLazyGetListServiceQuery()

  const [
    triggerChildProductList,
    { data: childProductList, isLoading: isLoadingChildProduct }
  ] = useLazyViewProductQuery()

  const [triggerListAccountGroup, { data: ListGroupAccount }] =
    useLazyGetListGroupQuery()

  const [triggerListAccount, { data: ListAccount }] = useLazyGetCustomersQuery()

  const [selectedId, setSelectedId] = useState<number | string>('')
  const [privateObject, setPrivateObject] = useState()
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<
    number | string
  >('')
  const [selectedStartDate, setSelectedStartDate] = useState<boolean>(true)
  const [intoMoney, setIntoMoney] = useState<number>(0)
  const [selectedDenominations, setSelectedDenominations] = useState<string>('')
  const [visibleServiceDropdown, setVisibleServiceDropdown] =
    useState<boolean>(false)
  const [visibleProductTypeDropdown, setVisibleProductTypeDropdown] =
    useState<boolean>(false)
  const [visibleProductDropdown, setVisibleProductDropdown] =
    useState<boolean>(false)
  const [visibleChildProductDropdown, setVisibleChildProductDropdown] =
    useState<boolean>(false)
  const [groupProductId, setGroupProductId] = useState<number | string>('')
  const [serviceDropdownData, setServiceDropdownData] = useState<
    IServiceType[]
  >([])
  const [productTypeDropdownData, setProductTypeDropdownData] = useState<
    IProductTypes[]
  >([])
  const [productDropdownData, setProductDropdownData] = useState<
    IProductTypes[]
  >([])

  const [productChildDropdownData, setProductChildDropdownData] = useState<
    ChildProductType[]
  >([])
  const [accountDropdownData, setAccountDropdownData] = useState<
    CustomerTable[]
  >([])

  const [accountGroupDropdownData, setAccountGroupDropdownData] = useState<
    GroupAccountInterface[]
  >([])

  const [searchAccount, setSearchAccount] = useState<IProductTypeSearch>({
    page: 1,
    take: 10
  })

  const [searchAccountGroup, setSearchAccountGroup] =
    useState<IProductTypeSearch>({
      page: 1,
      take: 10
    })

  const [loadingServiceDropdown, setLoadingServiceDropdown] =
    useState<boolean>(false)
  const [loadingScroll, setLoadingScroll] = useState<boolean>(false)

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().startOf('day')
  }

  const moneyFormatter = (value?: string) => {
    if (value) {
      return `${value} VNĐ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else return ''
  }

  const productTypeOptions = productDropdownData?.map((item: IProductTypes) => (
    <Option
      key={item.id}
      value={item.id}
    >
      {item.name}
    </Option>
  ))

  const productTypeListOptions = productTypeDropdownData?.map(
    (item: IProductTypes) => (
      <Option
        key={item.id}
        value={item.id}
      >
        {item.name}
      </Option>
    )
  )

  const serviceTypeOptions = () => {
    if (serviceDropdownData.length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      )
    } else
      return serviceDropdownData?.map((item: IServiceType, index: number) => (
        <Option
          key={item.id}
          value={item.id}
        >
          {item.name}
        </Option>
      ))
  }

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

  const renderAccountDropdownData = useCallback(() => {
    return accountDropdownData.map((el: CustomerTable) => (
      <Option
        key={el.id}
        value={el.id}
      >
        {el.accountNumber}
      </Option>
    ))
  }, [accountDropdownData])

  const openDropDown = async (open: boolean) => {
    setLoadingServiceDropdown(true)
    let dupServiceDropdownData = [...serviceDropdownData]
    if (serviceDropdownData.length === 0 && open) {
      setVisibleServiceDropdown(true)
      const data = await triggerListService({
        page: 1,
        take: 10
      })
      if (data.isSuccess && !data.isLoading) {
        data?.data?.data.map((el: IServiceType) => {
          dupServiceDropdownData.push(el)
        })
      }
      setServiceDropdownData(dupServiceDropdownData)
    } else if (!open && serviceDropdownData.length !== 0 && !loadingScroll) {
      setVisibleServiceDropdown(false)
    } else {
      setVisibleServiceDropdown(true)
    }
    setLoadingServiceDropdown(false)
  }

  const onScroll = async (e: any) => {
    setLoadingScroll(true)
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
    setLoadingScroll(false)
  }

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

  const onScrollAccountDropdown = async (e: any) => {
    const target = e.target
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (ListAccount?.meta?.hasNextPage) {
        setSearchAccount({ ...searchAccount, page: searchAccount.page + 1 })
        const data = await triggerListAccount({
          page: searchAccount.page + 1,
          take: 10
        })
        setAccountDropdownData((prev) =>
          prev.concat(data?.data?.data as CustomerTable[])
        )
      }
    }
  }

  const onSelect = useCallback(
    (value: string) => {
      setSelectedId(value)
      setSelectedProductTypeId('')
      setGroupProductId('')
      if (selectedId !== value) {
        form.setFieldsValue({
          productType: undefined,
          groupProductId: undefined,
          childProduct: undefined
        })
      }
    },
    [selectedId]
  )

  const handleSelectProductType = useCallback(
    (_: string, option: { value: string }) => {
      setSelectedProductTypeId(option.value)
      setGroupProductId('')
      if (selectedProductTypeId !== option.value) {
        form.setFieldsValue({
          groupProductId: undefined,
          childProduct: undefined
        })
      }
    },
    [selectedProductTypeId]
  )

  const onSelectGroupProduct = useCallback(
    async (value: string) => {
      setGroupProductId(value)
      if (groupProductId !== value) {
        form.setFieldsValue({
          childProduct: undefined
        })
      }
      await triggerChildProductList(value)
    },
    [groupProductId]
  )

  const onSelectChildProduct = (value: string, option: OptionProps) => {
    const selectedItem = childProductList?.data?.products.filter(
      (el: ChildProductType) => el.id === Number(value)
    )
    setSelectedDenominations(selectedItem[0].price)
    form.setFieldsValue({
      denominations: selectedItem[0].price
    })
  }

  const openDropDownProductType = useCallback(
    (open: boolean) => {
      let dupProductTypeDropdownData = [...productTypeDropdownData]
      if (open) {
        setVisibleProductTypeDropdown(true)
        const selectedItem = serviceDropdownData.filter(
          (el: IServiceType) => el.id === selectedId
        )
        if (selectedId) {
          dupProductTypeDropdownData = selectedItem[0].productTypes
        }
        setProductTypeDropdownData(dupProductTypeDropdownData)
      } else if (!open) {
        setVisibleProductTypeDropdown(false)
      } else {
        setVisibleProductTypeDropdown(true)
      }
    },
    [selectedId]
  )

  const openDropDownProduct = useCallback(
    (open: boolean) => {
      let dupProductDropdownData = [...productDropdownData]
      if (open) {
        setVisibleProductDropdown(true)
        const selectedItem = productTypeDropdownData.filter(
          (el: IProductTypes) => el.id === selectedProductTypeId
        )
        if (selectedProductTypeId) {
          dupProductDropdownData = selectedItem[0].groupProducts
        }
        setProductDropdownData(dupProductDropdownData)
      } else if (!open) {
        setVisibleProductDropdown(false)
      } else {
        setVisibleProductDropdown(true)
      }
    },
    [selectedProductTypeId]
  )

  const refreshData = (field: string, value: string | undefined) => {
    if (value === '' || value === undefined || field === undefined) {
      setSearch({
        ...search,
        page: 1,
        [field]: undefined
      })
    }
  }

  const [updateDiscountProduct, isLoadingCreate] =
    useUpdateDiscountProductMutation()

  const handleSubmit = async (value: any) => {
    if (value.intoMoney < 0) {
      form.setFields([
        {
          name: 'intoMoney',
          errors: [t('messages.smallerThanZeroValidate')]
        }
      ])
      return
    }
    const payload: PayloadType = {
      id: id,
      applicableObject: value.applicableObject,
      accountGroupId:
        typeof value.accountGroupId === 'string'
          ? detailData?.data?.accountGroup?.id
          : value.accountGroupId,
      discount: value.discount > 100 ? 100 : value.discount,
      fixedFee:
        typeof value.fixedFee === 'string'
          ? detailData?.data?.fixedFee
          : value.fixedFee,
      startDate: value.startDate.toISOString(),
      endDate: value.endDate.toISOString(),
      productId:
        typeof value.childProduct === 'string'
          ? detailData?.data?.product?.id
          : value.childProduct
    }

    const result: any = await updateDiscountProduct(payload)
    if (result?.data) {
      notification.success({ message: t('messages.successUpdateNotify') })
      onClose()
    }
  }

  const onValueChanges = (changedValues: any, allValues: any) => {
    const discount = allValues.discount > 100 ? 100 : allValues.discount
    const value =
      Number(allValues.denominations) -
      (Number(discount) / 100) * Number(allValues.denominations) +
      Number(allValues.fixedFee)
    if (allValues.denominations && discount && allValues.fixedFee) {
      setIntoMoney(value)
      form.setFieldsValue({
        intoMoney: value
      })
    } else if (
      allValues.denominations === 0 ||
      discount === 0 ||
      allValues.fixedFee === 0
    ) {
      setIntoMoney(value)
      form.setFieldsValue({
        intoMoney: value
      })
    } else {
      setIntoMoney(0)
      form.setFieldsValue({
        intoMoney: 0
      })
    }
  }

  const getAccountDropdownData = useCallback(async () => {
    const data: any = await triggerListAccount({ take: 10, page: 1 })
    const accountArr: CustomerTable[] = data?.data?.data
    setAccountDropdownData(accountArr)
  }, [])

  const getAccountGroupDropdownData = useCallback(async () => {
    const data: any = await triggerListAccountGroup({ take: 10, page: 1 })
    setAccountGroupDropdownData(data?.data?.data)
  }, [])

  useEffect(() => {
    if (detailData) {
      form.setFieldsValue({
        applicableObject: detailData?.data?.applicableObject,
        applicableAccountId: detailData?.data?.applicableAccount?.accountNumber,
        accountGroupId: detailData?.data?.accountGroup?.name,
        service:
          detailData?.data?.product?.groupProduct?.productType?.service?.name,
        productType: detailData?.data?.product?.groupProduct?.productType?.name,
        groupProductId: detailData?.data?.product?.groupProduct?.name,
        childProduct: detailData?.data?.product?.name,
        denominations: detailData?.data?.denominations,
        discount: detailData?.data?.discount,
        fixedFee: convertNumber(detailData?.data?.fixedFee),
        intoMoney: convertNumber(detailData?.data?.intoMoney),
        startDate: dayjs(detailData?.data?.startDate),
        endDate: dayjs(detailData?.data?.endDate)
      })
    }
    setPrivateObject(detailData?.data?.applicableObject)
  }, [detailData?.data])

  useEffect(() => {
    const variableFee =
      form.getFieldValue('discount') > 100
        ? 100
        : form.getFieldValue('discount')
    const value =
      Number(selectedDenominations) -
      (Number(form.getFieldValue('discount')) / 100) *
        Number(selectedDenominations) +
      Number(form.getFieldValue('fixedFee'))
    if (selectedDenominations) {
      if (form.getFieldValue('fixedFee') && variableFee) {
        setIntoMoney(value)
        form.setFieldsValue({
          intoMoney: convertNumber(value)
        })
      } else if (
        form.getFieldValue('fixedFee') ||
        variableFee === 0 ||
        form.getFieldValue('discount') === 0
      ) {
        setIntoMoney(value)
        form.setFieldsValue({
          intoMoney: convertNumber(value)
        })
      }
    }
  }, [selectedDenominations])

  useEffect(() => {
    if (privateObject === 'PRIVATE_ACCOUNT') {
      getAccountDropdownData()
    }
    if (privateObject === 'CUSTOMER_TYPE') {
      getAccountGroupDropdownData()
    }
  }, [privateObject])

  return (
    <Form
      form={form}
      layout='vertical'
      className='w-100'
      onFinish={handleSubmit}
      onValuesChange={onValueChanges}
    >
      <Row
        className='w-100'
        gutter={GUTTER}
      >
        <Col span={12}>
          <Form.Item
            name='applicableObject'
            label={t`management.discount.applicable-object`}
            rules={[
              {
                required: true,
                message: t`management.discount.messages.object`.toString()
              }
            ]}
          >
            <Select
              onChange={(options) => setPrivateObject(options)}
              placeholder={t`management.discount.form.placeholders.apply`}
              allowClear
              disabled
              options={[
                {
                  label: t('management.discount.system'),
                  value: ApplicableObject.SYSTEM
                },
                {
                  label: t('management.discount.customer-type'),
                  value: ApplicableObject.CUSTOMER_TYPE
                },
                {
                  label: t('management.discount.private-object'),
                  value: ApplicableObject.PRIVATE_ACCOUNT
                }
              ]}
            />
          </Form.Item>
        </Col>
        {privateObject === 'CUSTOMER_TYPE' && (
          <Col span={12}>
            <Form.Item
              name='accountGroupId'
              label={t`management.sales-fee.accountGroup`}
              initialValue={detailData?.data?.accountGroup?.id}
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
                disabled
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
              initialValue={detailData?.data?.accountGroup?.id}
              rules={[
                {
                  required: true,
                  message: t`management.sales-fee.messages.account`.toString()
                }
              ]}
            >
              <Input
                placeholder={t`management.sales-fee.placeholders.account`.toString()}
                disabled
              />
            </Form.Item>
          </Col>
        )}
        <Col span={12}>
          <Form.Item
            name='service'
            label={t`management.discount.service`}
            rules={[
              {
                required: true,
                message: t`management.discount.messages.service`.toString()
              }
            ]}
          >
            <Select
              placeholder={t`management.discount.form.placeholders.service`}
              onDropdownVisibleChange={(open) => openDropDown(open)}
              open={visibleServiceDropdown}
              onPopupScroll={onScroll}
              onSelect={onSelect}
              disabled
            >
              {serviceTypeOptions()}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='productType'
            label={t`management.discount.product-type`}
            rules={[
              {
                required: true,
                message: t`management.discount.messages.productType`.toString()
              }
            ]}
          >
            <Select
              placeholder={t`management.discount.form.placeholders.product-type`}
              onDropdownVisibleChange={(open) => openDropDownProductType(open)}
              onSelect={handleSelectProductType}
              onPopupScroll={onScroll}
              open={visibleProductTypeDropdown}
              disabled
            >
              {productTypeListOptions}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='groupProductId'
            label={t`management.discount.product`}
            rules={[
              {
                required: true,
                message: t`management.discount.messages.product`.toString()
              }
            ]}
          >
            <Select
              placeholder={t`management.discount.form.placeholders.product`}
              onDropdownVisibleChange={(open) => openDropDownProduct(open)}
              open={visibleProductDropdown}
              onSelect={onSelectGroupProduct}
              onPopupScroll={onScroll}
              disabled
            >
              {productTypeOptions}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='childProduct'
            label={t`management.discount.childProduct`}
            rules={[
              {
                required: true,
                message:
                  t`management.discount.messages.child-product`.toString()
              }
            ]}
          >
            <Select
              placeholder={t`management.discount.form.placeholders.childProductPlaceholder`}
              onSelect={onSelectChildProduct}
              disabled
            >
              {childProductOptions()}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='denominations'
            label={t`management.discount.cost`}
          >
            <InputNumber
              disabled
              onKeyDown={blockArrowValue}
              onKeyPress={blockLetterDecimal}
              formatter={moneyFormatter}
              className='w-100'
              placeholder={
                t('management.discount.form.placeholders.cost') as string
              }
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='discount'
            label={t`management.discount.discount`}
            initialValue={0}
            rules={[
              {
                required: true,
                message: t`management.discount.messages.variableFee`.toString()
              },
              {
                pattern: /^[+-]?((\d+(\.\d*)?)|(\.\d+))$/,
                message: `${t('messages.decimalFormat')}`
              },
              () => ({
                validator(_, value) {
                  if (value < 0) {
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
              min={0}
              precision={2}
              step={0.1}
              onKeyPress={blockLetterValue}
              onKeyDown={blockArrowValue}
              placeholder={
                t('management.discount.form.placeholders.discount') as string
              }
              className='w-100'
              formatter={(value) => {
                if (value) {
                  if (value > 100) {
                    form.setFieldsValue({
                      discount: 100
                    })
                    return '100%'
                  }
                }
                return `${value}%` ? `${value}%`.toString() : ''
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='fixedFee'
            label={t`management.discount.fixed-charge`}
            rules={[
              {
                required: true,
                message: t`management.discount.messages.fixedCharge`.toString()
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
              onKeyDown={blockArrowValue}
              onKeyPress={blockLetterDecimal}
              placeholder={
                t(
                  'management.discount.form.placeholders.fixed-charge'
                ) as string
              }
              formatter={moneyInputFormatter}
              className='w-100'
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
            label={t('management.discount.form.time')}
            name='startDate'
            rules={[
              {
                required: true,
                message: t`management.discount.messages.time`.toString()
              }
            ]}
          >
            <DatePicker
              allowClear={false}
              className='w-100'
              placeholder={t`transfer-history.placeholders.from`.toString()}
              onChange={(event) => {
                setSelectedStartDate(false)
                if (!event) {
                  refreshData('startDate', undefined)
                }
              }}
              disabledDate={disabledDate}
              format={TimeFullFormat}
              showTime
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('management.discount.end-time')}
            name='endDate'
            rules={[
              {
                required: true,
                message: t`management.discount.messages.time`.toString()
              }
            ]}
          >
            <DatePicker
              className='w-100'
              format={TimeFullFormat}
              disabledDate={(current) =>
                current &&
                current < dayjs(form.getFieldValue('startDate'), TimeFullFormat)
              }
              placeholder={t`transfer-history.placeholders.to`.toString()}
              onChange={(event) => {
                if (!event) {
                  refreshData('endDate', undefined)
                }
              }}
              showTime
            />
          </Form.Item>
        </Col>
      </Row>
      <div className='text-end'>
        <Button
          className='mr-10'
          onClick={onClose}
        >{t`buttons.back`}</Button>
        <Button
          type='primary'
          className='mr-10'
          htmlType='submit'
          loading={isLoadingCreate.isLoading}
        >{t`buttons.update`}</Button>
      </div>
    </Form>
  )
}
