import ImageUpload from '@components/image-upload/ImageUpload'
import {
  useLazyGetListServiceQuery,
  useLazyListServiceQuery,
  useUpdateProductMutation,
  useViewProductQuery
} from '@services/productService'
import { IProductForm, IProductTypes, IServiceType } from '@type/product'
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Spin,
  notification
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Loading from '@components/loading/Loading'
import { GUTTER } from '@constants/appConstant'
import { attributeOptions } from '@constants/options'
import { convertValueCheckbox } from '@utils/helperFunctions'

type ProductTypeProps = {
  open: boolean
  onClose: () => void
  id: string
}

export const UpdateProductModal = (props: ProductTypeProps) => {
  const { onClose, id } = props
  const { t } = useTranslation()
  const [form] = useForm<IProductForm>()
  const { Option } = Select
  const handleCancel = () => {
    setFiles([])
    onClose()
  }
  const { data: detailData, isLoading } = useViewProductQuery(id)

  const [files, setFiles] = useState<any>([])
  const [imgUrl, setImgUrl] = useState<string>('')
  const [search, setSearch] = useState<{ page: number; take: number }>({
    page: 1,
    take: 10
  })
  const [visibleServiceDropdown, setVisibleServiceDropdown] =
    useState<boolean>(false)
  const [serviceDropdownData, setServiceDropdownData] = useState<
    IServiceType[]
  >([])
  const [loadingServiceDropdown, setLoadingServiceDropdown] =
    useState<boolean>(false)
  const [loadingScroll, setLoadingScroll] = useState<boolean>(false)
  const [selectedId, setSelectedId] = useState<number | string>('')
  const [visibleProductDropdown, setVisibleProductDropdown] =
    useState<boolean>(false)
  const [productDropdownData, setProductDropdownData] = useState<
    IProductTypes[]
  >([])

  const [
    triggerListServiceDropdown,
    { data: listServiceDropdown, isLoading: isLoadingListService }
  ] = useLazyGetListServiceQuery()

  const [
    triggerListProduct,
    { data: listProduct, isLoading: isLoadingListProduct }
  ] = useLazyListServiceQuery()

  const productTypeListOptions = useCallback(() => {
    return productDropdownData.map((item: IProductTypes) => (
      <Option
        key={item.id}
        value={item.id}
      >
        {item.name}
      </Option>
    ))
  }, [productDropdownData])

  const serviceTypeOptions = () => {
    if (
      loadingServiceDropdown &&
      isLoadingListService &&
      serviceDropdownData.length === 0
    ) {
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

  const getDefaultProductData = useCallback(async () => {
    if (!selectedId) {
      const data = await triggerListProduct('')
      if (data) {
        const defaultProductList = data?.data?.data.filter(
          (el: IProductTypes) =>
            el.id === detailData?.data?.productType?.serviceId
        )
        if (defaultProductList) {
          setProductDropdownData(defaultProductList[0].productTypes)
        }
      }
    }
  }, [selectedId, detailData])

  useEffect(() => {
    getDefaultProductData()
  }, [getDefaultProductData])
  useEffect(() => {
    if (detailData) {
      form.setFieldsValue({
        id: detailData?.data?.id,
        service: detailData?.data?.productType?.service?.name,
        productTypeId: detailData?.data?.productType?.name,
        name: detailData?.data?.name,
        description: detailData?.data?.description,
        featured: detailData?.data?.featured,
        showApp: detailData?.data?.showApp,
        showWeb: detailData?.data?.showWeb
      })
      setImgUrl(detailData?.data?.avatar)
    }
  }, [detailData])
  const [updateProduct, isLoadingUpdate] = useUpdateProductMutation()
  const handleSubmit = async (value: any) => {
    const formData = new FormData()
    if (value.name !== detailData?.data?.name) {
      formData.append('name', value.name)
    }
    formData.append(
      'productTypeId',
      typeof value.productTypeId === 'number'
        ? value.productTypeId
        : detailData?.data?.productType?.id
    )
    formData.append('showApp', convertValueCheckbox(value.showApp))
    formData.append('showWeb', convertValueCheckbox(value.showWeb))
    formData.append('description', value.description)
    formData.append('featured', value.featured)
    if (files) {
      formData.append('file', files.originFileObj)
    }
    if (imgUrl === detailData?.data?.avatar) {
      formData.append('image', value.image)
    }
    const result: any = await updateProduct({ payload: formData, id })

    if (result?.data) {
      notification.success({ message: t('messages.updateProductSuccess') })
      onClose()
    }
  }

  const openDropDown = async (open: boolean) => {
    setLoadingServiceDropdown(true)
    let dupServiceDropdownData = [...serviceDropdownData]
    if (serviceDropdownData.length === 0 && open) {
      setVisibleServiceDropdown(true)
      const data = await triggerListServiceDropdown({
        page: 1,
        take: 10
      })
      if (data.isSuccess && !data.isLoading) {
        data?.data?.data.map((el) => {
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
      if (listServiceDropdown?.meta.hasNextPage) {
        setSearch({ ...search, page: search.page + 1 })
        const data = await triggerListServiceDropdown({
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

  const onSelect = useCallback(
    (value: string) => {
      if (detailData && selectedId !== value) {
        form.setFieldsValue({
          productTypeId: ''
        })
      }
      setSelectedId(value)
    },
    [selectedId, detailData]
  )

  const openDropDownProduct = useCallback(
    (open: boolean) => {
      let dupProductDropdownData = [...productDropdownData]
      if (open) {
        setVisibleProductDropdown(true)
        const selectedItem = serviceDropdownData.filter(
          (el: IServiceType) => el.id === selectedId
        )
        if (selectedId) {
          dupProductDropdownData = selectedItem[0].productTypes
          setProductDropdownData(dupProductDropdownData)
        }
      } else if (!open) {
        setVisibleProductDropdown(false)
      } else {
        setVisibleProductDropdown(true)
      }
    },
    [selectedId]
  )

  return (
    <Form
      form={form}
      layout='vertical'
      className='w-100'
      onFinish={handleSubmit}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Row
            className='w-100'
            gutter={GUTTER}
          >
            <Col span={16}>
              {/* service */}
              <Form.Item
                name='service'
                label={t('product.service')}
                initialValue={detailData?.data?.productType?.service?.id}
                rules={[
                  {
                    required: true,
                    message: t('product.error-require').toString()
                  }
                ]}
              >
                <Select
                  disabled={true}
                  onDropdownVisibleChange={(open) => openDropDown(open)}
                  open={visibleServiceDropdown}
                  onPopupScroll={onScroll}
                  onSelect={onSelect}
                  placeholder={t('product.form.placeholder.selectServiceName')}
                >
                  {serviceTypeOptions()}
                </Select>
              </Form.Item>

              {/* productType */}
              <Form.Item
                name='productTypeId'
                label={t('product.productType')}
                initialValue={detailData?.data?.productType?.id}
                rules={[
                  {
                    required: true,
                    message: t('product.error-require').toString()
                  }
                ]}
              >
                <Select
                  disabled={true}
                  onDropdownVisibleChange={(open) => openDropDownProduct(open)}
                  open={visibleProductDropdown}
                  placeholder={t('product.form.placeholder.selectProductName')}
                >
                  {productTypeListOptions()}
                </Select>
              </Form.Item>

              {/* name */}
              <Form.Item
                name='name'
                label={t('product.nameProduct')}
                initialValue={detailData?.data?.name}
                rules={[
                  {
                    required: true,
                    message: t('product.error-require').toString()
                  },
                  {
                    min: 5,
                    max: 255,
                    message: t('messages.minMaxFormValidate', {
                      min: 5,
                      max: 255
                    }).toString()
                  }
                ]}
              >
                <Input
                  disabled={true}
                  placeholder={
                    t('product.form.placeholder.inputProductName') as string
                  }
                />
              </Form.Item>

              {/* Description */}
              <Form.Item
                name='description'
                label={t('product.description')}
                initialValue={detailData?.data?.description}
                rules={[
                  {
                    required: true,
                    message: t('product.error-require').toString()
                  },
                  {
                    min: 5,
                    max: 1000,
                    message: t('messages.minMaxFormValidate', {
                      min: 5,
                      max: 1000
                    }).toString()
                  }
                ]}
              >
                <Input.TextArea
                  placeholder={
                    t('product.form.placeholder.inputDescription') as string
                  }
                />
              </Form.Item>

              {/* attribute */}
              <Form.Item
                name='featured'
                label={t('product.attribute')}
                initialValue={detailData?.data?.featured}
              >
                <Radio.Group>
                  {attributeOptions.map((item, index) => {
                    return (
                      <Radio
                        key={index}
                        value={item.value}
                      >
                        {item.label}
                      </Radio>
                    )
                  })}
                </Radio.Group>
              </Form.Item>

              {/* displayOn */}
              <Form.Item label={t('product.displayOn')}>
                <div className='checkbox-container'>
                  <Form.Item
                    name='showApp'
                    valuePropName='checked'
                    initialValue={detailData?.data?.showApp}
                  >
                    <Checkbox className='mr-20'>
                      {t('productType.showApp')}
                    </Checkbox>
                  </Form.Item>
                  <Form.Item
                    name='showWeb'
                    valuePropName='checked'
                    initialValue={detailData?.data?.showWeb}
                  >
                    <Checkbox className='mr-20'>
                      {t('productType.showWeb')}
                    </Checkbox>
                  </Form.Item>
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              {/* avatar */}
              <div style={{ textAlign: 'center' }}>
                <Form.Item
                  name='avatar'
                  label={t('product.avatar')}
                >
                  <ImageUpload
                    files={files}
                    setFiles={setFiles}
                    setImgUrl={setImgUrl}
                    imgUrl={imgUrl}
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>
          <div className='text-end'>
            <Button
              className='mr-10'
              onClick={onClose}
            >{t`buttons.cancel`}</Button>
            <Button
              type='primary'
              className='mr-10'
              htmlType='submit'
              loading={isLoadingUpdate.isLoading}
            >{t`buttons.update`}</Button>
          </div>
        </>
      )}
    </Form>
  )
}
