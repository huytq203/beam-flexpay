import { SearchOutlined } from '@ant-design/icons'
import { ENV } from '@configs/env'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { GUTTER } from '@constants/appConstant'
import { getAccessTokenCookie } from '@configs/fetchBaseQuery.types'
import {
  useDeleteProductMutation,
  useGetListProductQuery
} from '@services/productService'
import { PageMeta, ResponseType } from '@type/api'
import {
  AttributeProduct,
  IProductSearch,
  IProductTypes,
  IServiceType,
  viewMode
} from '@type/product'
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
  notification
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import type { ColumnsType } from 'antd/es/table'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from '@phosphor-icons/react'
import ProductModal from './productModal/ProductModal'
import './style.scss'
import SearchBar from '@components/search-bar/SearchBar'
import ButtonSearch from '@components/button-search/ButtonSearch'

const Product = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<viewMode>(viewMode.lock)
  const [form] = useForm()
  const toggleModal = (toggle: boolean) => {
    setOpen(toggle)
  }
  const [search, setSearch] = useState<IProductSearch>({
    page: 1,
    take: 10
  })
  const [visible, setVisible] = useState(false)
  const [visibleProductType, setVisibleProductType] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [loadingListService, setLoadingListService] = useState(false)
  const [loadingListProductType, setLoadingListProductType] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [serviceSearch, setServiceSearch] = useState({
    page: 1,
    take: 10,
    serviceId: ''
  })

  const [paginationInfo, setPaginationInfo] = useState<PageMeta>()
  const [listService, setListService] = useState<IServiceType[]>([])
  const [listTypeProduct, setListTypeProduct] = useState<IProductTypes[]>([])
  const [productTypeSearch, setProductTypeSearch] = useState({
    page: 1,
    take: 10,
    productTypeName: ''
  })

  const { data: product, refetch } = useGetListProductQuery(
    search as IProductSearch
  )

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
      `${ENV.API_URL}/service?` + new URLSearchParams(query)
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
      `${ENV.API_URL}/product-type?` +
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

  const productList = useMemo(() => {
    if (product?.data && product?.data.length > 0) {
      return product?.data.map((item: IServiceType, index: number) => ({
        no: ((search?.page ?? 1) - 1) * 10 + index + 1,
        ...item
      }))
    } else return []
  }, [product?.data])

  const handleModal = (action: viewMode, id?: string) => {
    setOpen(true)
    if (id) setSelectedId(id)
    setMode(action)
  }

  const [deleteProduct] = useDeleteProductMutation()

  const onHandleDelete = (id: any) => {
    Modal.confirm({
      title: t('product.confirm.cancel.title'),
      content: t('product.confirm.cancel.content'),
      onOk: () => handleOk(id),
      okText: t('buttons.ok'),
      cancelText: t('buttons.cancel'),
      type: 'warning'
    })
  }

  const handleOk = async (id: any) => {
    const result: any = await deleteProduct(id as string)
    if (result.data) {
      notification.success({ message: t('messages.deleteProductSuccess') })
    }
  }

  const handleSearch = (value: IProductSearch) => {
    const newQuery = {
      ...value,
      featured: value.featured === '' ? undefined : value.featured,
      page: 1
    }
    setSearch(newQuery)
  }

  const refreshData = (field: string, value: string | undefined) => {
    if (value === '' || value === undefined || field === undefined) {
      setSearch({
        ...search,
        page: 1,
        [field]: undefined
      })
    }
  }

  const renderAttribute = (record: any) => {
    if (record === 'NEW_PRODUCT') {
      return t('product.attributeValue.newProduct')
    } else if (record === 'HOT_PRODUCT') {
      return t('product.attributeValue.hotProduct')
    } else if (record === 'PROMOTION_PRODUCTS') {
      return t('product.attributeValue.promoProduct')
    } else {
      return ''
    }
  }

  const productColumns: ColumnsType<IServiceType> = [
    {
      title: t('product.serviceType'),
      key: 'serviceType',
      dataIndex: ['productType', 'service', 'name'],
      align: 'center',
      width: 200,
      fixed: 'left'
    },
    {
      title: t('product.productType'),
      key: 'productType',
      dataIndex: ['productType', 'name'],
      align: 'center',
      width: 300
    },
    {
      title: t('product.product'),
      key: 'product',
      dataIndex: ['name'],
      align: 'center',
      width: 300
    },
    {
      title: t('product.attribute'),
      key: 'attribute',
      dataIndex: ['featured'],
      align: 'center',
      render: (record) => {
        return renderAttribute(record)
      },
      width: 300
    },
    {
      title: t('product.displayOn'),
      key: 'displayOn',
      dataIndex: 'displayOn',
      align: 'center',
      children: [
        {
          title: 'Web',
          align: 'center',
          render: (value, record, index) => <Checkbox checked={value.showWeb} />
        },
        {
          title: 'App',
          align: 'center',
          render: (value, record, index) => <Checkbox checked={value.showApp} />
        }
      ],
      width: 300
    },
    {
      title: t('product.note'),
      key: 'description',
      dataIndex: 'description',
      ellipsis: true
    },
    {
      title: t('product.actions'),
      align: 'center',
      width: 120,
      fixed: 'right',
      render: (record, index) => (
        <Row
          gutter={GUTTER}
          justify='center'
        >
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.edit')}
            >
              <ButtonUpdate
                module='product'
                onClick={async () =>
                  await handleModal(viewMode.update, record.id)
                }
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.view')}
            >
              <Button
                icon={<Eye />}
                onClick={() => handleModal(viewMode.view, record.id)}
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
          form={form}
          onFinish={handleSearch}
          cols='2'
          headerMenu={
            <>
              <Form.Item
                label={t('product.service')}
                name='serviceId'
              >
                <Select
                  placeholder={t`placeholders.service`}
                  open={visible}
                  allowClear={true}
                  onBlur={handleBlur}
                  onSelect={handleSelect}
                  onClear={() => {
                    clearSelected()
                    form.setFieldsValue({
                      productTypeId: undefined
                    })
                  }}
                  onPopupScroll={handleScroll}
                  onDropdownVisibleChange={(open) => handleOpenSelect(open)}
                  onChange={(event) => {
                    if (!event) {
                      refreshData('serviceId', undefined)
                    }
                  }}
                >
                  {serviceOptions()}
                </Select>
              </Form.Item>

              <Form.Item
                label={t('product.productType')}
                name='productTypeId'
              >
                <Select
                  placeholder={t`placeholders.productType`}
                  onPopupScroll={handleScrollProductType}
                  onDropdownVisibleChange={(open) =>
                    handleOpenSelectProductType(open)
                  }
                  allowClear={true}
                  open={visibleProductType}
                  onChange={(event) => {
                    if (!event) {
                      refreshData('productTypeId', undefined)
                    }
                  }}
                >
                  {productTypeOptions()}
                </Select>
              </Form.Item>

              <Form.Item
                label={t('product.attribute')}
                name='featured'
              >
                <Select
                  allowClear
                  placeholder={t`placeholders.attribute`}
                  options={[
                    {
                      label: t('product.attributeValue.newProduct'),
                      value: AttributeProduct.NEW_PRODUCT
                    },
                    {
                      label: t('product.attributeValue.hotProduct'),
                      value: AttributeProduct.HOT_PRODUCT
                    },
                    {
                      label: t('product.attributeValue.promoProduct'),
                      value: AttributeProduct.PROMOTION_PRODUCTS
                    }
                  ]}
                  onChange={(event) => {
                    if (!event) {
                      refreshData('featured', undefined)
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label={t('product.nameProduct')}
                name='groupProduct'
              >
                <Input
                  placeholder={t`placeholders.productName`.toString()}
                  allowClear
                  onChange={(event) => {
                    if (
                      event.target.value === '' ||
                      event.target.value === undefined
                    ) {
                      refreshData('groupProduct', event.target.value)
                    }
                  }}
                />
              </Form.Item>

              <ButtonSearch htmlType='submit' />
            </>
          }
        />
      }
    >
      <Table
        columns={productColumns}
        dataSource={productList || []}
        rowKey='id'
        size='small'
        scroll={{ x: '100%' }}
        bordered
        pagination={{
          current: product?.meta?.page,
          pageSize: product?.meta?.take,
          total: product?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <ProductModal
        open={open}
        onCancel={() => toggleModal(false)}
        mode={mode}
        id={selectedId}
      />
    </Card>
  )
}

export default Product
