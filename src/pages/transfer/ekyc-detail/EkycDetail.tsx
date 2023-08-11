import {
  useApproveEkycMutation,
  useDetailEkycQuery
} from '@services/apiEkycService'
import {
  Button,
  Col,
  Divider,
  Form,
  Image,
  Input,
  Modal,
  notification,
  Row
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useTranslation } from 'react-i18next'
import './style.scss'
import DefaultImage from '@assets/image/defaultImage.png'
import ItemDetail from '@components/item-detail/ItemDetail'
import { GUTTER } from '@constants/appConstant'

type ekycDetailProps = {
  open: boolean
  close: () => void
  id: string
}

const EkycDetail = (props: ekycDetailProps) => {
  const { t } = useTranslation()
  const { open, close, id } = props

  const [detailForm] = useForm()

  const { data: detailData, isLoading } = useDetailEkycQuery(id)

  const [approveProduct, isLoadingApprove] = useApproveEkycMutation()

  const [removeApprove, isLoadingRemove] = useApproveEkycMutation()

  const renderType = (detailData: any) => {
    switch (detailData) {
      case 'PERSONAL':
        return t('ekyc.personal')
      default:
        return t('ekyc.enterprise')
    }
  }

  const handleRemove = async (value: any) => {
    const result: any = await removeApprove({
      status: 'REFUSED',
      id
    })
    if (result?.data) {
      notification.success({ message: t('ekyc.message.removeApprove') })
      close()
    }
  }

  const handleSubmit = async (value: any) => {
    const result: any = await approveProduct({
      status: 'VERIFIED',
      id
    })
    if (result?.data) {
      notification.success({ message: t('ekyc.message.approveSucces') })
      close()
    }
  }

  return (
    <Modal
      open={open}
      title={t('ekyc.detail.title')}
      footer={null}
      width={570}
      onCancel={close}
      maskClosable={false}
      mask
      destroyOnClose={true}
      className='modal-ekyc'
    >
      <Form
        form={detailForm}
        onFinish={handleSubmit}
      >
        <Divider />
        <Row gutter={GUTTER}>
          <Col span={24}>
            <ItemDetail
              boldTitle
              title={t('ekyc.accountNumber').toString()}
              data={detailData?.data?.customer?.phoneNumber}
            />

            <ItemDetail
              boldTitle
              title={t('ekyc.accountType').toString()}
              data={renderType(detailData?.data?.customer?.type)}
            />

            <ItemDetail
              boldTitle
              title={t('ekyc.dateOfBirthday').toString()}
              data={detailData?.data?.birthDay ?? t`labels.nodata`}
            />

            <ItemDetail
              boldTitle
              title={t('ekyc.IdNumber').toString()}
              data={detailData?.data?.identityNumber}
            />

            <ItemDetail
              boldTitle
              title={t('ekyc.address').toString()}
              data={detailData?.data?.placeOfResidence}
            />
          </Col>
        </Row>
        <Image.PreviewGroup>
          <Row
            gutter={GUTTER}
            className='image-list'
          >
            {detailData?.data?.documents &&
              detailData?.data?.documents?.map((img: any) => (
                <Col
                  className='mb-5'
                  span={12}
                >
                  <Image
                    src={img.uri}
                    width='100%'
                    fallback={DefaultImage}
                  />
                </Col>
              ))}
          </Row>
        </Image.PreviewGroup>

        <div className='text-end mt-15'>
          {detailData?.data?.status === 'PENDING' ? (
            <>
              <Button
                type='primary'
                className='mr-10'
                htmlType='submit'
                loading={isLoadingApprove.isLoading}
                disabled={isLoadingRemove.isLoading}
              >{t`ekyc.detail.btnOk`}</Button>
              <Button
                className='mr-10'
                onClick={handleRemove}
                loading={isLoadingRemove.isLoading}
                disabled={isLoadingApprove.isLoading}
              >{t`ekyc.detail.btnCancel`}</Button>
            </>
          ) : (
            <>
              <Button
                type='primary'
                className='mr-10'
                disabled
              >{t`ekyc.detail.btnOk`}</Button>
              <Button
                className='mr-10'
                disabled
              >{t`ekyc.detail.btnCancel`}</Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  )
}

export default EkycDetail
