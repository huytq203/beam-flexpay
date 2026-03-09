import { BellOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { getAccessTokenCookie } from '@configs/fetchBaseQuery.types'
import { TimeFullFormat } from '@constants/datetime'
import { useGetListDiscountProductQuery } from '@services/discountProductService'
import { PageMeta, ResponseType } from '@type/api'
import { viewMode } from '@type/customer'
import {
  IDiscountProductSearch,
  IDiscountProductType
} from '@type/discountProduct'
import { IProductTypes, IServiceType } from '@type/product'
import { ISaleFeeType } from '@type/saleFeeType'
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
  Tooltip,
  Typography
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from '@phosphor-icons/react'
import ProductDiscountModal from './product-discount-modal/ProductDiscountModal'

const { Text } = Typography
function ProductDiscountManagement() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [form] = useForm()

  const [search, setSearch] = useState<{
    page: number
    take: number
    groupProduct?: string
  }>({
    page: 1,
    take: 10,
    groupProduct: ''
  })

  const [visible, setVisible] = useState(false)
  const [visibleProductType, setVisibleProductType] = useState(false)
  const [visibleProduct, setVisibleProduct] = useState(false)
  const [paginationInfo, setPaginationInfo] = useState<PageMeta>()
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>('')
  const [loadingListService, setLoadingListService] = useState(false)
  const [loadingListProductType, setLoadingListProductType] = useState(false)
  const [loadingListProduct, setLoadingListProduct] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
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
  const [serviceSearch, setServiceSearch] = useState({
    page: 1,
    take: 10,
    serviceId: ''
  })

  const [listService, setListService] = useState<IServiceType[]>([])
  const [listTypeProduct, setListTypeProduct] = useState<IProductTypes[]>([])
  const [listProduct, setListProduct] = useState<IProductTypes[]>([])

  const [productTypeSearch, setProductTypeSearch] = useState({
    page: 1,
    take: 10,
    productTypeName: ''
  })

  const [productSearch, setProductSearch] = useState({
    page: 1,
    take: 10,
    productName: ''
  })

  const Nodata = () => <Text>{t`labels.nodata`}</Text>

  const CellContent = ({ content }: { content: string }) => (
    <Text>{content}</Text>
  )

  const {
    data: discountProduct,
    refetch,
    isLoading
  } = useGetListDiscountProductQuery(search as IDiscountProductSearch)

  const discountProductList = useMemo(() => {
    if (discountProduct?.data && discountProduct?.data.length > 0) {
      return discountProduct?.data.map(
        (item: IDiscountProductType, index: number) => ({
          no: ((search?.page ?? 1) - 1) * 10 + index + 1,
          ...item
        })
      )
    } else return []
  }, [discountProduct?.data])

  const handleModal = (action: viewMode, id?: string) => {
    setOpen(true)
    if (id) setSelectedId(id)
    setMode(action)
  }

  // dropdown service
  const serviceData = (data: { data: IServiceType[]; meta: PageMeta }) => {
    if (
      data.data &&
      data.data.length > 0 &&
      data.meta &&
      data.meta.page === 1
    ) {
      setListService(data.data)
      setPaginationInfo(data.meta)
    } else {
      setListService((pre) => pre.concat(data.data))
      setPaginationInfo(data.meta)
    }
    setLoadingListService(false)
  }

  const fetchDataService = async (query: any) => {
    const endpoint =
      `${import.meta.env.VITE_API_URL}/service?` + new URLSearchParams(query)
    const accessToken = getAccessTokenCookie()
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    const { data } = (await response.json()) as ResponseType<{
      data: IServiceType[]
      meta: any
    }>
    serviceData(data)
  }

  const handleOpenSelect = (open: boolean) => {
    if (open) {
      setVisible(true)
      if (listService.length == 0) {
        setLoadingListService(true)
        fetchDataService(serviceSearch)
      }
    } else if (!open && listService.length !== 0 && !loadingMore) {
      setVisible(false)
    } else {
      setVisible(true)
    }
  }

  const handleScroll = (event: any) => {
    const target = event.target
    if (
      !loadingListService &&
      target.scrollTop + target.offsetHeight === target.scrollHeight
    ) {
      if (paginationInfo && paginationInfo?.page < paginationInfo?.pageCount) {
        target.scrollTo(0, target.scrollHeight)
        setLoadingMore(true)
        const data = { ...serviceSearch, page: serviceSearch.page + 1 }
        setServiceSearch(data)
        fetchDataService(serviceSearch)
      } else {
        setLoadingMore(false)
      }
    }
  }

  const handleSelect = useCallback(
    (_: string, option: { value: string }) => {
      setSelectedId(option.value)
      if (selectedId !== option.value) {
        form.setFieldsValue({
          productTypeId: undefined
        })
      }
    },
    [selectedId]
  )

  const handleSelectProductType = useCallback(
    (_: string, option: { value: string }) => {
      setSelectedProductTypeId(option.value)
      if (selectedProductTypeId !== option.value) {
        form.setFieldsValue({
          groupProductId: undefined
        })
      }
    },
    [selectedProductTypeId]
  )

  const handleBlur = () => {
    setVisible(false)
  }

  // dropdown productType
  const productTypeData = (data: { data: IProductTypes[]; meta: PageMeta }) => {
    if (
      data.data &&
      data.data.length > 0 &&
      data.meta &&
      data.meta.page === 1
    ) {
      setListTypeProduct(data.data)
      setPaginationInfo(data.meta)
    } else {
      setListTypeProduct((pre) => pre.concat(data.data))
      setPaginationInfo(data.meta)
    }
    setLoadingListProductType(false)
  }

  const fetchDataProductType = async (query: any) => {
    const endpoint =
      `${import.meta.env.VITE_API_URL}/product-type?` +
      new URLSearchParams(query)
    const accessToken = getAccessTokenCookie()
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    const { data } = (await response.json()) as ResponseType<{
      data: IProductTypes[]
      meta: any
    }>
    productTypeData(data)
  }

  const clearSelected = () => {
    fetchDataProductType(productTypeSearch)
    setSelectedId('')
    form.setFieldValue('productTypeId', '')
  }

  const clearSelectedProductType = () => {
    fetchDataProduct(productSearch)
    setSelectedProductTypeId('')
    form.setFieldValue('groupProductId', '')
  }

  const handleOpenSelectProductType = useCallback(
    (open: boolean) => {
      let dupProductDropdownData = [...listTypeProduct]

      if (open) {
        setVisibleProductType(true)
        const itemAll = listService?.map((item: any) => item.productTypes)
        const selectedItem = listService.filter(
          (el: any) => el.id === selectedId
        )

        if (selectedId) {
          dupProductDropdownData = selectedItem[0]?.productTypes
          setListTypeProduct(dupProductDropdownData)
        } else if (listService.length === 0) {
          setLoadingListProductType(true)
          fetchDataProductType(productTypeSearch)
          dupProductDropdownData = itemAll
          setListTypeProduct(dupProductDropdownData)
        }
      } else if (!open) {
        setVisibleProductType(false)
      } else {
        setVisibleProductType(true)
      }
    },
    [selectedId]
  )

  const handleScrollProductType = (event: any) => {
    const target = event.target
    if (
      !loadingListProductType &&
      target.scrollTop + target.offsetHeight === target.scrollHeight
    ) {
      if (paginationInfo && paginationInfo?.page < paginationInfo?.pageCount) {
        target.scrollTo(0, target.scrollHeight)
        setLoadingMore(true)
        const data = { ...productTypeSearch, page: productTypeSearch.page + 1 }
        setProductTypeSearch(data)
        fetchDataProductType(productTypeSearch)
      } else {
        setLoadingMore(false)
      }
    }
  }

  /// dropdown product
  const productData = (data: { data: IProductTypes[]; meta: PageMeta }) => {
    if (
      data.data &&
      data.data.length > 0 &&
      data.meta &&
      data.meta.page === 1
    ) {
      setListProduct(data.data)
      setPaginationInfo(data.meta)
    } else {
      setListProduct((pre) => pre.concat(data.data))
      setPaginationInfo(data.meta)
    }
    setLoadingListProduct(false)
  }

  const fetchDataProduct = async (query: any) => {
    const endpoint =
      `${import.meta.env.VITE_API_URL}/group-product?` +
      new URLSearchParams(query)
    const accessToken = getAccessTokenCookie()
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    const { data } = (await response.json()) as ResponseType<{
      data: IProductTypes[]
      meta: any
    }>
    productData(data)
  }

  const handleOpenSelectProduct = useCallback(
    (open: boolean) => {
      let dupProductDropdownData = [...listProduct]
      if (open) {
        setVisibleProduct(true)
        const itemAll = listTypeProduct?.map((item: any) => item.groupProducts)
        const selectedItem = listTypeProduct.filter(
          (el: any) => el.id === selectedProductTypeId
        )

        if (selectedProductTypeId) {
          dupProductDropdownData = selectedItem[0]?.groupProducts
          setListProduct(dupProductDropdownData)
        } else if (listService.length === 0) {
          setLoadingListProduct(true)
          fetchDataProduct(productSearch)
          dupProductDropdownData = itemAll
          setListTypeProduct(dupProductDropdownData)
        }
      } else if (!open) {
        setVisibleProduct(false)
      } else {
        setVisibleProduct(true)
      }
    },
    [selectedProductTypeId]
  )

  const handleScrollProduct = (event: any) => {
    const target = event.target
    if (
      !loadingListProduct &&
      target.scrollTop + target.offsetHeight === target.scrollHeight
    ) {
      if (paginationInfo && paginationInfo?.page < paginationInfo?.pageCount) {
        target.scrollTo(0, target.scrollHeight)
        setLoadingMore(true)
        const data = { ...productSearch, page: productSearch.page + 1 }
        setProductSearch(data)
        fetchDataProduct(productSearch)
      } else {
        setLoadingMore(false)
      }
    }
  }

  const productOptions = () => (
    <>
      {loadingListProduct ? (
        <div style={{ height: 35, alignItems: 'center', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          {listProduct?.map((item, index) => (
            <Select.Option
              key={index}
              value={item.id}
            >
              {item.name}
            </Select.Option>
          ))}
          {loadingMore && (
            <div
              style={{ height: 10, alignItems: 'center', textAlign: 'center' }}
            >
              <Spin />
            </div>
          )}
        </>
      )}
    </>
  )

  const productTypeOptions = () => (
    <>
      {loadingListProductType ? (
        <div style={{ height: 35, alignItems: 'center', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          {listTypeProduct?.map((item, index) => (
            <Select.Option
              key={index}
              value={item.id}
            >
              {item.name}
            </Select.Option>
          ))}
          {loadingMore && (
            <div
              style={{ height: 10, alignItems: 'center', textAlign: 'center' }}
            >
              <Spin />
            </div>
          )}
        </>
      )}
    </>
  )

  const serviceOptions = () => (
    <>
      {loadingListService ? (
        <div style={{ height: 35, alignItems: 'center', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          {listService?.map((item, index) => (
            <Select.Option
              value={item.id}
              key={`service-${index}-${item.id}`}
            >
              {item.name}
            </Select.Option>
          ))}
          {loadingMore && (
            <div
              style={{ height: 10, alignItems: 'center', textAlign: 'center' }}
            >
              <Spin />
            </div>
          )}
        </>
      )}
    </>
  )

  const handleSearch = (value: IDiscountProductSearch) => {
    const newQuery = {
      ...value,
      applicableObject:
        value.applicableObject === '' ? undefined : value.applicableObject,
      page: 1
    }
    setSearch(newQuery)
  }

  const toggleModal = (toggle: boolean) => setOpen(toggle)

  const columns: ColumnsType<any> = [
    {
      title: t`management.discount.service`,
      dataIndex: ['product', 'groupProduct', 'productType', 'service', 'name'],
      key: 'service',
      align: 'center',
      fixed: 'left',
      width: 120
    },
    {
      title: t`management.discount.product-type`,
      dataIndex: ['product', 'groupProduct', 'productType', 'name'],
      key: 'productType',
      fixed: 'left',
      width: 200,
      align: 'center'
    },
    {
      title: t`management.discount.product`,
      dataIndex: ['product', 'groupProduct', 'name'],
      key: 'product',
      width: 200,
      align: 'center'
    },
    {
      title: t`management.discount.cost`,
      dataIndex: 'denominations',
      key: 'denominations',
      align: 'center',
      width: 200,
      render: (value, record, index) => <Text>{convertNumber(value)}</Text>
    },
    {
      title: t`management.discount.discount`,
      dataIndex: 'discount',
      key: 'discount',
      align: 'center',
      width: 200,
      render: (value, record, index) => <Text>{value}%</Text>
    },
    {
      title: t`management.discount.fixed-charge`,
      key: 'fixedFee',
      align: 'center',
      width: 200,
      render: (record) => <div>{convertNumber(record.fixedFee)}</div>
    },
    {
      title: t`management.discount.current-charge`,
      key: 'intoMoney',
      align: 'center',
      width: 200,
      render: (record) => <div>{convertNumber(record.intoMoney)}</div>
    },
    {
      key: 'applicableObject',
      align: 'center',
      title: t`management.discount.object`,
      width: 200,
      render: (record) => <div>{formatObject(record.applicableObject)}</div>
    },
    {
      title: t`management.discount.time`,
      dataIndex: 'startDate',
      key: 'startDate',
      align: 'center',
      width: 200,
      render: (record) => {
        return record ? (
          <CellContent content={dayjs(record).format(TimeFullFormat)} />
        ) : (
          <Nodata />
        )
      }
    },
    {
      title: t`management.discount.end-time`,
      dataIndex: 'endDate',
      key: 'endDate',
      align: 'center',
      width: 200,
      render: (record) => {
        return record ? (
          <CellContent content={dayjs(record).format(TimeFullFormat)} />
        ) : (
          <Nodata />
        )
      }
    },
    {
      title: t`management.discount.action`,
      align: 'center',
      width: 200,
      fixed: 'right',
      render: (record) => (
        <Tooltip
          placement='top'
          title={t('admin-management.tooltip.edit')}
        >
          <Button
            icon={<Pencil />}
            onClick={() => {
              handleModal(viewMode.updateDiscount, record.id)
              setSelectedItem(record)
            }}
          />
        </Tooltip>
      )
    },
    {
      title: t`management.discount.notify`,
      dataIndex: '',
      key: 'id',
      align: 'center',
      width: 200,
      fixed: 'right',
      render: (record) => (
        <Tooltip title={t`buttons.notify`}>
          <Button
            disabled={dayjs(record?.endDate) < dayjs()}
            onClick={() => {
              toggleModal(true)
              setMode(viewMode.notify)
              setSelectedItem(record)
            }}
            icon={<BellOutlined />}
          />
        </Tooltip>
      )
    }
  ]

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
              onValuesChange={onFormValueChange}
              layout='vertical'
              form={form}
              onFinish={handleSearch}
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    name='groupProduct'
                    label={t`management.discount.quickSearch`}
                  >
                    <Input
                      placeholder={t`placeholders.quickSearch`.toString()}
                    />
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    name='serviceId'
                    label={t`management.discount.service`}
                  >
                    <Select
                      placeholder={t`placeholders.service`}
                      open={visible}
                      onBlur={handleBlur}
                      onSelect={handleSelect}
                      onClear={clearSelected}
                      onPopupScroll={handleScroll}
                      onDropdownVisibleChange={(open) => handleOpenSelect(open)}
                    >
                      {serviceOptions()}
                    </Select>
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    name='productTypeId'
                    label={t`management.discount.product-type`}
                  >
                    <Select
                      placeholder={t`placeholders.productType`}
                      onPopupScroll={handleScrollProductType}
                      onDropdownVisibleChange={(open) =>
                        handleOpenSelectProductType(open)
                      }
                      allowClear={true}
                      open={visibleProductType}
                      onSelect={handleSelectProductType}
                      onClear={clearSelectedProductType}
                    >
                      {productTypeOptions()}
                    </Select>
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    name='groupProductId'
                    label={t`management.discount.product`}
                  >
                    <Select
                      placeholder={t`placeholders.product`}
                      onPopupScroll={handleScrollProduct}
                      onDropdownVisibleChange={(open) =>
                        handleOpenSelectProduct(open)
                      }
                      allowClear={true}
                      open={visibleProduct}
                    >
                      {productOptions()}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row
                justify='end'
                gutter={GUTTER}
              >
                <Col>
                  <ButtonSearch htmlType='submit' />
                </Col>
                <Col>
                  <ButtonAdd
                    module='product'
                    onClick={() => {
                      setMode(viewMode.create)
                      toggleModal(true)
                    }}
                  />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        columns={columns}
        loading={isLoading}
        dataSource={discountProductList || []}
        scroll={{ x: '100%' }}
        size='small'
        bordered
        pagination={{
          current: discountProduct?.meta?.page,
          pageSize: discountProduct?.meta?.take,
          total: discountProduct?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <ProductDiscountModal
        mode={mode}
        open={open}
        onCancel={() => toggleModal(false)}
        id={selectedId}
        selectedItem={selectedItem}
      />
    </Card>
  )
}
export default ProductDiscountManagement
