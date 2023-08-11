import ItemDetail from '@components/item-detail/ItemDetail'
import NoDataText from '@components/no-data-text/NoDataText'
import { TimeFullFormat } from '@constants/datetime'
import { getAccountType, getVerifyTye } from '@utils/helperFunctions'
import { Button, Col, Divider, Modal, Row } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

interface IProps {
  open: boolean
  onCancel: () => void
  account: any
}
function AccountDetailModal({ open, onCancel, account }: IProps) {
  const { t } = useTranslation()

  return (
    <>
      <Modal
        centered
        title={t`internal-account-report.detail-modal`}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={900}
      >
        <Divider className='mt-20' />
        <Row>
          <Col
            xs={24}
            lg={12}
          >
            <ItemDetail
              title={t`internal-account-report.name`.toString()}
              data={account?.fullName}
              boldTitle
            />
            <ItemDetail
              title={t`internal-account-report.phone-number`.toString()}
              data={account?.phoneNumber}
              boldTitle
            />
            <ItemDetail
              title={t`internal-account-report.account-type`.toString()}
              data={getAccountType(account?.type)}
              boldTitle
            />
            <ItemDetail
              title={t`internal-account-report.address`.toString()}
              data={account?.address}
              boldTitle
            />
          </Col>
          <Col
            xs={24}
            lg={12}
          >
            <ItemDetail
              title={t`internal-account-report.verified-type`.toString()}
              data={getVerifyTye(account?.customerVerificationId)}
              boldTitle
            />
            <ItemDetail
              title={t`internal-account-report.registration-time`.toString()}
              data={
                account?.createdAt ? (
                  dayjs(account?.createdAt).format(TimeFullFormat)
                ) : (
                  <NoDataText />
                )
              }
              boldTitle
            />
            <ItemDetail
              title={t`internal-account-report.registration-device`.toString()}
              data={account?.device?.platformName}
              boldTitle
            />
            <ItemDetail
              title={t`internal-account-report.verified-time`.toString()}
              data={
                account?.customerVerification?.createdAt ? (
                  dayjs(account?.customerVerification?.createdAt).format(
                    TimeFullFormat
                  )
                ) : (
                  <NoDataText />
                )
              }
              boldTitle
            />
          </Col>
        </Row>
        <Row>
          <Col
            span={24}
            className='d-flex justify-end'
          >
            <Button
              type='primary'
              ghost
              onClick={onCancel}
              className='mb-10'
            >{t`buttons.close`}</Button>
          </Col>
        </Row>
      </Modal>
    </>
  )
}
export default AccountDetailModal
