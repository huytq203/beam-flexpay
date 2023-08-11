import ButtonCancel from '@components/button-cancel/ButtonCancel'
import ButtonSubmit from '@components/button-submit/ButtonSubmit'
import { GUTTER } from '@constants/appConstant'
import {
  useSystemFeeManagementDirectDepositMutation,
  useSystemFeeManagementUpdateDirectDepositMutation
} from '@services/cmsService'
import {
  CreateSystemFeeManagementDto,
  SystemFeeManagementDto,
  UpdateSystemFeeManagementDto
} from '@type/application'
import { modalConfig } from '@utils/constants'
import { useToggle } from 'ahooks'
import { Col, Form, Modal, Row, notification } from 'antd'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import FeeSetupModal from '../FeeSetupModal'
import DirectDepositForm from './DirectDepositForm'

type props = {
  open: boolean
  close: VoidFunction
  id?: string
}

const DirectDepositSetupModal = ({ close, open, id }: props) => {
  const [feeForm, { toggle }] = useToggle(false)
  const [form] = Form.useForm<SystemFeeManagementDto>()

  const [fnCreate] = useSystemFeeManagementDirectDepositMutation()
  const [fnUpdate] = useSystemFeeManagementUpdateDirectDepositMutation()

  const handleSubmit = () => {
    const values: SystemFeeManagementDto = form.getFieldsValue()
    // if (id) {
    //   fnUpdate({
    //     id: id,
    //     updateSystemFeeManagementDto:
    //       values as unknown as UpdateSystemFeeManagementDto
    //   })
    //     .unwrap()
    //     .then(() => {
    //       notification.success({
    //         message: t('messages.update-success')
    //       })
    //     })
    //     .then(close)
    // } else {
    //   fnCreate({
    //     createSystemFeeManagementDto:
    //       values as unknown as CreateSystemFeeManagementDto
    //   })
    //     .unwrap()
    //     .then(() => {
    //       notification.success({
    //         message: t('messages.create-success')
    //       })
    //     })
    //     .then(close)
    // }
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      title={
        <h3 className='mb-20'>{t`policy-management.depositManagement.setUpModalTitle`}</h3>
      }
      {...modalConfig}
      width={1500}
    >
      <FeeSetupModal
        depositMethodLabel={t`policy-management.payment.depositMethod`}
        depositMethodErorr={t`policy-management.depositManagement.validateDBankRequired`}
        toggle={toggle}
        form={form}
        record={form.getFieldsValue()}
      />

      <DirectDepositForm
        open={feeForm}
        close={toggle}
        key={crypto.randomUUID()}
        values={form.getFieldsValue()}
        setValues={(_values) => {
          form.setFieldsValue(_values)
        }}
      />
      <Row
        className='justify-end'
        gutter={GUTTER}
      >
        <Col>
          <ButtonCancel onClick={close} />
        </Col>
        <Col>
          <ButtonSubmit onClick={handleSubmit} />
        </Col>
      </Row>
    </Modal>
  )
}
export default DirectDepositSetupModal
