import { useLazyGetListServiceQuery } from '@services/productService'
import {
  useUpdateProductTypeMutation,
  useViewDetailProductTypeQuery
} from '@services/productTypeService'
import { IServiceType } from '@type/product'
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  notification,
  Row,
  Select,
  Spin
} from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ProductTypeFormProps = {
  open: boolean
  onClose: () => void
  id: string
}

const UpdateProductTypeModal = (props: ProductTypeFormProps) => {
  const { onClose, id } = props
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const {
    data: detailData,
    isLoading,
    refetch
  } = useViewDetailProductTypeQuery(id)
  useEffect(() => {
    if (detailData) {
      form.setFieldsValue({
        id: detailData?.data?.id,
        name: detailData?.data?.name,
        serviceId: detailData?.data?.service?.name,
        showApp: detailData?.data?.showApp,
        showWeb: detailData?.data?.showWeb
      })
    }
  }, [detailData])
  const [search, setSearch] = useState<{ page: number; take: number }>({
    page: 1,
    take: 10
  })
  const [triggerListService, { data: listService }] =
    useLazyGetListServiceQuery()

  const [visibleServiceDropdown, setVisibleServiceDropdown] =
    useState<boolean>(false)
  const [serviceDropdownData, setServiceDropdownData] = useState<
    IServiceType[]
  >([])
  const [loadingServiceDropdown, setLoadingServiceDropdown] =
    useState<boolean>(false)
  const [loadingScroll, setLoadingScroll] = useState<boolean>(false)

  const [updateProductType, isLoadingUpdate] = useUpdateProductTypeMutation()

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

  const serviceOptions = () => (
    <>
      {loadingServiceDropdown ? (
        <div style={{ height: 35, alignItems: 'center', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          {serviceDropdownData?.map((item, index) => (
            <Select.Option
              value={item.id}
              key={`service-${index}-${item.id}`}
            >
              {item.name}
            </Select.Option>
          ))}
          {loadingScroll && (
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

  const handleSubmit = async (value: any) => {
    const payload: any = {
      id: id,
      serviceId:
        typeof value.serviceId === 'string'
          ? detailData?.data?.service?.id
          : undefined,
      showApp: value.showApp,
      showWeb: value.showWeb,
      name: value.name !== detailData?.data?.name ? value.name : undefined
    }

    const result: any = await updateProductType(payload)
    if (result?.data) {
      notification.success({ message: t('messages.updateProductTypeSuccess') })
      onClose()
    }
  }

  return (
    <Form
      form={form}
      className='w-100'
      layout='vertical'
      onFinish={handleSubmit}
    >
      {isLoading ? (
        <Spin />
      ) : (
        <>
          <Form.Item
            label={t('productType.serviceType')}
            name='serviceId'
            initialValue={detailData?.data?.service?.id}
            rules={[
              {
                required: true,
                message: t('product.error-require').toString()
              }
            ]}
          >
            <Select
              disabled={true}
              listHeight={230}
              onDropdownVisibleChange={(open) => openDropDown(open)}
              open={visibleServiceDropdown}
              onPopupScroll={onScroll}
              placeholder={t('product.form.placeholder.selectServiceName')}
            >
              {serviceOptions()}
            </Select>
          </Form.Item>
          <Form.Item
            label={t('productType.nameServiceType')}
            name='name'
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
              placeholder={t(
                'productType.form.placeholder.inputProductTypeName'
              ).toString()}
            />
          </Form.Item>
          <Row>
            <Col>
              <Form.Item
                label={t('productType.displayOn')}
                name='showApp'
                valuePropName='checked'
                initialValue={detailData?.data?.showApp}
              >
                <Checkbox className='mr-20'>
                  {t('productType.showApp')}
                </Checkbox>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label=' '
                name='showWeb'
                valuePropName='checked'
                initialValue={detailData?.data?.showWeb}
              >
                <Checkbox>{t('productType.showWeb')}</Checkbox>
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
              loading={isLoadingUpdate.isLoading}
            >{t`buttons.update`}</Button>
          </div>
        </>
      )}
    </Form>
  )
}

export default UpdateProductTypeModal
