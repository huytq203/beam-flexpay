import { SearchOutlined } from '@ant-design/icons'
import { ENV } from '@configs/env'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { getAccessTokenCookie } from '@configs/fetchBaseQuery.types'
import { TimeFullFormat } from '@constants/datetime'
import {
  useDeleteProductTypeMutation,
  useLazyProductTypesQuery,
  useProductTypesQuery
} from '@services/productTypeService'
import { PageMeta, ResponseType } from '@type/api'
import { IProductTable } from '@type/product'
import {
  AttributeDisplayOnProduct,
  IProductTypeSearch,
  IProductTypeTable,
  viewMode
} from '@type/productType'
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  TableColumnsType,
  Tooltip,
  Typography,
  notification
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import moment from 'moment'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from '@phosphor-icons/react'
import ProductTypeModal from './ProductTypeModal/ProductTypeModal'
import './style.scss'

const { Text } = Typography

const ProductType = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [mode, setMode] = useState<viewMode>(viewMode.lock)
  const [paginationInfo, setPaginationInfo] = useState<PageMeta>()
  const [listTypeProduct, setListTypeProduct] = useState<IProductTable[]>([])
  const [visibleProductType, setVisibleProductType] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [productTypeSearch, setProductTypeSearch] = useState<any>({
    page: 1,
    take: 10,
    id: '',
    isLoading: false
  })
  const [loading, setLoading] = useState(false)
  const toggleModal = (toggle: boolean) => {
    setOpen(toggle)
  }
  const [search, setSearch] = useState<IProductTypeSearch>({
    page: 1,
    take: 10
  })

  const [form] = useForm()

  const [deleteProductType] = useDeleteProductTypeMutation()

  const { data: productType, refetch } = useProductTypesQuery(search, {
    refetchOnMountOrArgChange: true
  })

  const [getProductTypes] = useLazyProductTypesQuery()

  const productTypeList = useMemo(() => {
    if (productType?.data && productType.data.length > 0) {
      return productType?.data?.map(
        (item: IProductTypeTable, index: number) => ({
          no: ((search?.page ?? 1) - 1) * 10 + index + 1,
          ...item
        })
      )
    } else return []
  }, [productType?.data])

  const Nodata = () => <Text>{t`labels.nodata`}</Text>

  const CellContent = ({ content }: { content: string }) => (
    <Text>{content}</Text>
  )

  const handleSearch = (value: IProductTypeSearch) => {
    const newQuery = {
      ...value,
      show: value.show === '' ? undefined : value.show,
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

  const productTypeData = (data: { data: IProductTable[]; meta: PageMeta }) => {
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
    setLoading(false)
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
      data: IProductTable[]
      meta: any
    }>
    productTypeData(data)
  }

  const inputRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onSearch = (value: string) => {
    setProductTypeSearch({ ...productTypeSearch, name: value, page: 1 })
    try {
      setLoading(true)
      if (inputRef.current) clearTimeout(inputRef.current)
      inputRef.current = setTimeout(async () => {
        if (value) {
          const { data } = (await getProductTypes({
            name: value.trim(),
            page: 1,
            take: 10,
            isLoading: false
          })) as unknown as ResponseType<{
            data: IProductTable[]
            meta: any
          }>
          if (data) {
            productTypeData(data)
          }
        }
      }, 500)
    } catch (error) { }
  }

  const handleOpenSelectProductType = (open: boolean) => {
    let dupProductDropdownData: any = [...listTypeProduct]
    if (open) {
      setVisibleProductType(true)
      setLoading(true)
      fetchDataProductType(productTypeSearch)
      if (listTypeProduct.length == 0) {
        setLoading(true)
        setListTypeProduct(dupProductDropdownData)
      }
    } else if (!open) {
      setVisibleProductType(false)
    } else {
      setVisibleProductType(true)
    }
  }

  const handleScrollProductType = (event: any) => {
    const target = event.target
    if (
      !loading &&
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

  const handleSelect = (_: string, option: { value: string }) => {
    setVisibleProductType(false)
    if (option.value) {
      setLoadingMore(false)
    }
  }

  const handleBlur = () => {
    setVisibleProductType(false)
  }

  const productTypeOptions = () => (
    <>
      {loading ? (
        <div style={{ height: 35, alignItems: 'center', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          {listTypeProduct.map((item, index) => (
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

  const handleModal = (action: viewMode, id?: string) => {
    setOpen(true)
    if (id) setSelectedId(id)
    setMode(action)
  }

  const onHandleDelete = (productType: any) => {
    const checkDelete = productType.groupProducts.some(
      (item: any) => item.products.length > 0
    )
    if (checkDelete) {
      Modal.confirm({
        title: t('productType.confirm.cancel.title'),
        content: t('productType.confirm.cancel.contentProductChild'),
        onOk: () => handleOk(productType.id),
        okText: t('buttons.ok'),
        cancelText: t('buttons.cancel'),
        type: 'warning'
      })
    } else {
      Modal.confirm({
        title: t('productType.confirm.cancel.title'),
        content: t('productType.confirm.cancel.content'),
        onOk: () => handleOk(productType.id),
        okText: t('buttons.ok'),
        cancelText: t('buttons.cancel'),
        type: 'warning'
      })
    }
  }

  const handleOk = async (id: any) => {
    const result: any = await deleteProductType(id as string)
    if (result.data) {
      notification.success({ message: t('messages.deleteProductTypeSuccess') })
    }
  }

  const renderDisplayOn = (record: any) => {
    if (record.showWeb === 1 && record.showApp === 1) {
      return 'Web-App'
    } else if (record.showApp === 1) {
      return 'App'
    } else if (record.showWeb === 1) {
      return 'Web'
    } else {
      return ''
    }
  }

  const productTypeColumns: TableColumnsType<IProductTypeTable> = [
    {
      title: t('productType.id'),
      dataIndex: 'no',
      key: 'id',
      align: 'center',
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      },
      width: 80,
      fixed: 'left'
    },
    {
      title: t('productType.nameServiceType'),
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (record) => {
        return record ? <CellContent content={record} /> : <Nodata />
      },
      width: 150,
      fixed: 'left'
    },
    {
      title: t('productType.displayOn'),
      dataIndex: 'displayOn',
      key: 'displayOn',
      align: 'center',
      render: (text, record) => {
        return renderDisplayOn(record)
      },
      width: 300
    },
    {
      title: t('productType.timeUpdate'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'center',
      render: (record) => {
        return record ? (
          <CellContent content={moment(record).format(TimeFullFormat)} />
        ) : (
          <Nodata />
        )
      },
      width: 300
    },
    {
      title: t('productType.actions'),
      align: 'center',
      render: (value: string, record: any) => (
        <Row
          gutter={GUTTER}
          justify='center'
        >
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
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.edit')}
            >
              <ButtonUpdate
                module='product_type'
                onClick={async () =>
                  await handleModal(viewMode.update, record.id)
                }
              />
            </Tooltip>
          </Col>
        </Row>
      ),
      width: 200,
      fixed: 'right'
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
                label={t('productType.productType')}
                name='id'
              >
                <Select
                  placeholder={t`placeholders.productType`}
                  onPopupScroll={handleScrollProductType}
                  open={visibleProductType}
                  allowClear={true}
                  showSearch
                  filterOption={false}
                  value={productTypeSearch?.name ?? undefined}
                  onSearch={onSearch}
                  onBlur={handleBlur}
                  onSelect={handleSelect}
                  onDropdownVisibleChange={(open) =>
                    handleOpenSelectProductType(open)
                  }
                  onChange={(event) => {
                    if (!event) {
                      refreshData('id', undefined)
                    }
                  }}
                >
                  {productTypeOptions()}
                </Select>
              </Form.Item>

              <Form.Item
                label={t('productType.displayOn')}
                name='show'
              >
                <Select
                  allowClear
                  placeholder={t`placeholders.displayOn`}
                  options={[
                    {
                      label: t('productType.app'),
                      value: AttributeDisplayOnProduct.APP
                    },
                    {
                      label: t('productType.web'),
                      value: AttributeDisplayOnProduct.WEB
                    },
                    {
                      label: t('productType.web-app'),
                      value: AttributeDisplayOnProduct.BOTH
                    }
                  ]}
                  onChange={(event) => {
                    if (!event) {
                      refreshData('show', undefined)
                    }
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  icon={<SearchOutlined />}
                >
                  {t('buttons.search')}
                </Button>
              </Form.Item>
            </>
          }
        />
      }
    >
      <Table
        columns={productTypeColumns}
        dataSource={productTypeList || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: productType?.meta?.page,
          pageSize: productType?.meta?.take,
          total: productType?.meta?.itemCount,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <ProductTypeModal
        open={open}
        onCancel={() => toggleModal(false)}
        mode={mode}
        id={selectedId}
        refetch={refetch}
      />
    </Card>
  )
}

export default ProductType
