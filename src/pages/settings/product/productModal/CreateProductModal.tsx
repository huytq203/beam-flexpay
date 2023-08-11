import ImageUpload from '@components/image-upload/ImageUpload'
import {
  useCreateProductMutation,
  useLazyGetListServiceQuery
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

import { GUTTER } from '@constants/appConstant'
import { attributeOptions } from '@constants/options'
import { convertValueCheckbox } from '@utils/helperFunctions'

type ProductTypeProps = {
  open: boolean
  onClose: () => void
}

export const CreateProductModal = (props: ProductTypeProps) => {
  const { onClose } = props
  const { t } = useTranslation()
  const [form] = useForm<IProductForm>()
  const { Option } = Select
  const [search, setSearch] = useState<{ page: number; take: number }>({
    page: 1,
    take: 10
  })
  const [files, setFiles] = useState<any>([])
  const [imgUrl, setImgUrl] = useState<string>('')
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

  useEffect(() => {
    form.setFieldValue('featured', 'NEW_PRODUCT')
  }, [])
  const [triggerListService, { data: listService, isLoading }] =
    useLazyGetListServiceQuery()

  const [createProduct, isLoadingCreate] = useCreateProductMutation()

  const productTypeListOptions = productDropdownData?.map(
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
    if (
      loadingServiceDropdown &&
      isLoading &&
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

  const onSelect = useCallback(
    (value: string) => {
      setSelectedId(value)
      if (selectedId !== value) {
        form.setFieldsValue({
          productTypeId: ''
        })
      }
    },
    [selectedId]
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
        }
        setProductDropdownData(dupProductDropdownData)
      } else if (!open) {
        setVisibleProductDropdown(false)
      } else {
        setVisibleProductDropdown(true)
      }
    },
    [selectedId]
  )

  const handleSubmit = async (value: any) => {
    const formData = new FormData()
    formData.append('name', value.name)
    formData.append('productTypeId', value.productTypeId)
    formData.append('showApp', convertValueCheckbox(value.showApp).toString())
    formData.append('showWeb', convertValueCheckbox(value.showWeb).toString())
    formData.append('description', value.description)
    formData.append('featured', value.featured)
    formData.append('file', files.originFileObj)

    const result: any = await createProduct(formData)

    if (result?.data) {
      notification.success({ message: t('messages.createProductSuccess') })
      onClose()
    }
  }

  return (
    <Form
      form={form}
      layout='vertical'
      className='w-100'
      onFinish={handleSubmit}
    >
      <Row
        className='w-100'
        gutter={GUTTER}
      >
        <Col span={16}>
          {/* service */}
          <Form.Item
            name='service'
            label={t('product.service')}
            rules={[
              {
                required: true,
                message: t('product.error-require').toString()
              }
            ]}
          >
            <Select
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
            rules={[
              {
                required: true,
                message: t('product.error-require').toString()
              }
            ]}
          >
            <Select
              onDropdownVisibleChange={(open) => openDropDownProduct(open)}
              open={visibleProductDropdown}
              disabled={!selectedId}
              placeholder={t('product.form.placeholder.selectProductName')}
            >
              {productTypeListOptions}
            </Select>
          </Form.Item>

          {/* name */}
          <Form.Item
            name='name'
            label={t('product.nameProduct')}
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
              placeholder={
                t('product.form.placeholder.inputProductName') as string
              }
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            name='description'
            label={t('product.description')}
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
          >
            <Radio.Group defaultValue={'NEW_PRODUCT'}>
              {attributeOptions?.map((item, index) => {
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
              >
                <Checkbox className='mr-20'>
                  {t('productType.showApp')}
                </Checkbox>
              </Form.Item>
              <Form.Item
                name='showWeb'
                valuePropName='checked'
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
          <Form.Item
            name='file'
            label={t('product.avatar')}
          >
            <ImageUpload
              files={files}
              setFiles={setFiles}
              setImgUrl={setImgUrl}
              imgUrl={imgUrl}
            />
          </Form.Item>
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
          loading={isLoadingCreate.isLoading}
        >{t`buttons.add`}</Button>
      </div>
    </Form>
  )
}
