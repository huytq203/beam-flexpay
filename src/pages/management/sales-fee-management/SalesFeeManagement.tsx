import { SearchOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import { GUTTER } from '@constants/appConstant'
import { useGetListSaleFeeQuery } from '@services/apiSaleFeeService'
import { useLazyListServiceQuery } from '@services/productService'
import { useLazyViewDetailProductTypeQuery } from '@services/productTypeService'
import { viewMode } from '@type/customer'
import { IProductTypes, IServiceType } from '@type/product'
import {
  ChildProductType,
  ISaleFeeType,
  ManageSaleFeeProductType,
  SaleFeeSearchParams
} from '@type/saleFeeType'
import { convertNumber, formatObject } from '@utils/helperFunctions'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Table,
  Typography
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from '@phosphor-icons/react'
import SaleFeeModal from './sale-fee-modal/SaleFeeModal'
import SearchBar from '@components/search-bar/SearchBar'
import ButtonSearch from '@components/button-search/ButtonSearch'
import { TimeFullFormat } from '@constants/datetime'

const { Text } = Typography

function SalesFeeManagement() {
  const { Option } = Select
  const [form] = useForm()

  const { t: trans } = useTranslation()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<ISaleFeeType>({
    id: 0,
    startDate: '',
    endDate: '',
    product: [],
    intoMoney: 0,
    fixedFee: 0,
    denominations: 0,
    variableFee: 0,
    applicableObject: '',
    accountGroupId: 0,
    applicableAccountId: 0
  })
  const [search, setSearch] = useState<SaleFeeSearchParams>({
    page: 1,
    take: 10
  })
  const [oldValues, setOldValues] = useState<{
    serviceId: string
    productType: string
    product: string
    childProduct: string
  }>({ serviceId: '', productType: '', product: '', childProduct: '' })
  const [serviceDropdownData, setServiceDropdownData] = useState<
    IServiceType[]
  >([])
  const [productTypeDropdownData, setProductTypeDopdownData] = useState<
    IProductTypes[]
  >([])
  const [productDropdownData, setProductDropdownData] = useState<
    ManageSaleFeeProductType[]
  >([])
  const [childProductDropdownData, setChildProductDropdownData] = useState<
    ChildProductType[]
  >([])

  const [disableStatus, setDisableStatus] = useState<{
    productType: boolean
    product: boolean
    childProduct: boolean
  }>({
    productType: false,
    product: false,
    childProduct: false
  })

  const Nodata = () => <Text>{trans`labels.nodata`}</Text>

  const {
    data: listSaleFee,
    refetch,
    isLoading
  } = useGetListSaleFeeQuery(search)

  const [triggerListProductType, { isLoading: isLoadingService }] =
    useLazyListServiceQuery()

  const [triggerListProduct] = useLazyViewDetailProductTypeQuery()

  const saleFeeList = useMemo(() => {
    if (listSaleFee?.data?.data && listSaleFee?.data?.data.length > 0) {
      return listSaleFee?.data?.data.map(
        (item: ISaleFeeType, index: number) => ({
          no: ((search?.page ?? 1) - 1) * 10 + index + 1,
          ...item
        })
      )
    } else return []
  }, [listSaleFee?.data?.data])

  const serviceDropdownChange = async (open: boolean) => {
    if (open && serviceDropdownData?.length === 0) {
      const data = await triggerListProductType('')
      const serviceArr = data?.data?.data
      setServiceDropdownData(serviceArr)
    }
  }

  const getServiceIdDropdownData = (id: string) => {
    const selectedService = serviceDropdownData.filter(
      (el: IServiceType) => Number(el.id) === Number(id)
    )
    const productTypeArr = selectedService[0].productTypes
    setProductTypeDopdownData(productTypeArr)
  }

  const serviceDropdownOption = useCallback(() => {
    if (serviceDropdownData.length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      )
    } else {
      return serviceDropdownData?.map((el: IServiceType) => (
        <Option
          key={el.id}
          value={el.id}
        >
          {el?.name}
        </Option>
      ))
    }
  }, [serviceDropdownData])

  const productTypeDropdownOption = useCallback(() => {
    return productTypeDropdownData?.map((el: IProductTypes) => (
      <Option
        key={el.id}
        value={el.id}
      >
        {el.name}
      </Option>
    ))
  }, [productTypeDropdownData])

  const productDropdownOption = useCallback(() => {
    return productDropdownData?.map((el: ManageSaleFeeProductType) => (
      <Option
        key={el.id}
        value={el.id}
      >
        {el.name}
      </Option>
    ))
  }, [productDropdownData])

  const childProductsDropdownOption = useCallback(() => {
    return childProductDropdownData?.map((el) => (
      <Option
        key={el.id}
        value={el.name}
      >
        {el.name}
      </Option>
    ))
  }, [childProductDropdownData])

  const getProductTypeDropdownData = async (id: string) => {
    const data: any = await triggerListProduct(id)
    const productArr: ManageSaleFeeProductType[] =
      data?.data?.data?.groupProducts
    if (productArr.length > 0) {
      setProductDropdownData(productArr)
    } else {
      setProductDropdownData([])
    }
  }

  const getChildProductDropdownData = (id: string) => {
    const selectedProduct = productDropdownData.filter(
      (el) => Number(el.id) === Number(id)
    )
    setChildProductDropdownData(selectedProduct[0].products)
  }

  const onSelectService = (value: string) => {
    setOldValues({ ...oldValues, productType: value })
    setDisableStatus({ ...disableStatus, productType: true })
    getServiceIdDropdownData(value)
    if (oldValues.productType !== value) {
      form.setFieldsValue({
        productTypeId: undefined,
        groupProductId: undefined,
        product: undefined
      })
    }
  }

  const onSelectProductType = async (value: string) => {
    setOldValues({ ...oldValues, product: value })
    setDisableStatus({ ...disableStatus, product: true })
    getProductTypeDropdownData(value)
    if (oldValues.product !== value) {
      form.setFieldsValue({
        groupProductId: undefined,
        product: undefined
      })
    }
  }

  const onSelectProduct = (value: string) => {
    setOldValues({ ...oldValues, product: value })
    setDisableStatus({ ...disableStatus, childProduct: true })
    getChildProductDropdownData(value)
    if (oldValues.childProduct !== value) {
      form.setFieldsValue({
        product: undefined
      })
    }
  }

  const onClearService = () => {
    form.setFieldsValue({
      serviceId: undefined,
      productTypeId: undefined,
      groupProductId: undefined,
      product: undefined
    })
    setDisableStatus({
      productType: false,
      product: false,
      childProduct: false
    })
  }

  const onClearProductType = () => {
    form.setFieldsValue({
      productTypeId: undefined,
      groupProductId: undefined,
      product: undefined
    })
    setDisableStatus({ ...disableStatus, product: false, childProduct: false })
  }

  const onClearProduct = () => {
    form.setFieldsValue({
      groupProductId: undefined,
      product: undefined
    })
    setDisableStatus({ ...disableStatus, childProduct: false })
  }

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        key: 'id',
        align: 'center',
        title: trans(`labels.no`),
        render: (text, object, index) => (
          <div>
            {((listSaleFee?.data?.meta?.page as number) - 1) * 10 + index + 1}
          </div>
        ),
        fixed: 'left',
        width: 100
      },
      {
        key: 'serviceType',
        dataIndex: ['product', 'groupProduct', 'productType', 'service'],
        align: 'center',
        title: trans`management.sales-fee.service`,
        render: (record) => <div>{record?.name}</div>,
        width: 200,
        fixed: 'left'
      },
      {
        key: 'producTypeName',
        dataIndex: ['product', 'groupProduct', 'productType'],
        align: 'center',
        title: trans`management.sales-fee.productType`,
        width: 200,
        render: (record) => record?.name,
        fixed: 'left'
      },
      {
        key: 'groupProductName',
        dataIndex: ['product', 'groupProduct'],
        align: 'center',
        title: trans`management.sales-fee.product`,
        width: 200,
        render: (record) => <div>{record?.name}</div>
      },
      {
        key: 'menhgia',
        align: 'center',
        title: trans`management.sales-fee.denominations`,
        width: 200,
        render: (record) =>
          record?.denominations ? (
            <div>{convertNumber(record?.denominations)}</div>
          ) : (
            Nodata()
          )
      },
      {
        key: 'variableFee',
        align: 'center',
        title: trans`management.sales-fee.variableFee`,
        width: 200,
        render: (record) => <div>{convertNumber(record?.variableFee)}%</div>
      },
      {
        key: 'fixedFee',
        align: 'center',
        title: trans`management.sales-fee.fixedCharge`,
        width: 200,
        render: (record) => <div>{convertNumber(record?.fixedFee)}</div>
      },
      {
        key: 'intoMoney',
        align: 'center',
        title: trans`management.sales-fee.money`,
        width: 200,
        render: (record) => <div>{convertNumber(record?.intoMoney)}</div>
      },
      {
        key: 'applicableObject',
        align: 'center',
        title: trans`management.sales-fee.object`,
        width: 200,
        render: (record) => <div>{formatObject(record?.applicableObject)}</div>
      },
      {
        key: 'startDate',
        align: 'center',
        title: trans`management.sales-fee.applyTime`,
        width: 200,
        render: (record) => (
          <div>{dayjs(record?.startDate).format(TimeFullFormat)}</div>
        )
      },
      {
        key: 'endDate',
        align: 'center',
        title: trans`management.sales-fee.endTime`,
        width: 200,
        render: (record) => (
          <div>{dayjs(record?.endDate).format(TimeFullFormat)}</div>
        )
      },
      {
        key: 'action',
        align: 'center',
        title: trans`management.sales-fee.action`,
        width: 100,
        fixed: 'right',
        render: (record) => (
          <Button
            icon={<Eye />}
            onClick={() => {
              setMode(viewMode.view)
              toggleModal(true)
              setSelectedId(record?.id)
              setSelectedItem(record)
            }}
          />
        )
      }
    ],
    [listSaleFee?.data?.meta?.page]
  )

  const toggleModal = (toggle: boolean) => {
    setOpen(toggle)
  }

  const submit = (value: any) => {
    const newQuery = {
      ...search,
      ...value,
      page: 1
    }
    setSearch(newQuery)
  }

  const onFormValueChange = async (changedValues: any, allValues: any) => {
    if (allValues.groupProduct === '') {
      setSearch((prev) => ({ ...prev, groupProduct: undefined }))
      form.setFieldsValue({
        groupProduct: undefined
      })
      refetch()
    }
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              form={form}
              layout='vertical'
              onFinish={submit}
              onValuesChange={onFormValueChange}
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    name='groupProduct'
                    label={trans`management.sales-fee.fastSearch`}
                  >
                    <Input
                      placeholder={trans`management.sales-fee.placeholders.fastSearch`.toString()}
                    />
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    name='serviceId'
                    label={trans`management.sales-fee.service`}
                  >
                    <Select
                      onClear={onClearService}
                      allowClear
                      onDropdownVisibleChange={serviceDropdownChange}
                      placeholder={trans`management.sales-fee.placeholders.object`}
                      onSelect={onSelectService}
                    >
                      {serviceDropdownOption()}
                    </Select>
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    name='productTypeId'
                    label={trans`management.sales-fee.productType`}
                  >
                    <Select
                      onClear={onClearProductType}
                      allowClear
                      onSelect={onSelectProductType}
                      disabled={!disableStatus.productType}
                      placeholder={trans`management.sales-fee.placeholders.productType`}
                    >
                      {productTypeDropdownOption()}
                    </Select>
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    name='groupProductId'
                    label={trans`management.sales-fee.product`}
                  >
                    <Select
                      onClear={onClearProduct}
                      allowClear
                      onSelect={onSelectProduct}
                      disabled={!disableStatus.product}
                      placeholder={trans`management.sales-fee.placeholders.product`}
                    >
                      {productDropdownOption()}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={GUTTER}
                justify='end'
              >
                <Col>
                  <ButtonAdd
                    module='product'
                    onClick={() => {
                      setMode(viewMode.create)
                      toggleModal(true)
                    }}
                  />
                </Col>
                <Col>
                  <ButtonSearch htmlType='submit' />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        loading={isLoading}
        scroll={{ x: '100%' }}
        bordered
        columns={columns}
        dataSource={saleFeeList ? saleFeeList : []}
        pagination={{
          current: listSaleFee?.data?.meta?.page || 1,
          pageSize: listSaleFee?.data?.meta?.take || 10,
          total: listSaleFee?.data?.meta?.itemCount || 0,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <SaleFeeModal
        selectedItem={selectedItem}
        selectedId={selectedId}
        refetch={refetch}
        open={open}
        onCancel={() => toggleModal(false)}
        mode={mode}
      />
    </Card>
  )
}

export default SalesFeeManagement
