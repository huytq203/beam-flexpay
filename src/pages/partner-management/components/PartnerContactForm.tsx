import FileUpload from '@components/upload/FileUpload';
import { openNotification } from '@configs/fetchBaseQueryCustom';
import { GUTTER } from '@constants/appConstant';
import { PARTNER_TYPE, PARTNER_TYPE_OPTIONS } from '@constants/partnerOptions';
import {
  usePaymentPartnerCreateMutation,
  usePaymentPartnerUpdateMutation
} from '@services/cmsPaymentParner';
import { usePaymentServiceFindAllQuery } from '@services/cmsPaymentService';
import { PaymentPartnerDetailDto } from '@type/application';
import { Button, Col, Form, Input, Modal, Row, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import './index.scss';

type props = {
  title: string;
  record?: PaymentPartnerDetailDto | undefined;
  isShow: boolean;
  onCancel: VoidFunction;
  type: PARTNER_TYPE;
};

export default function PartnerContactForm({
  record,
  isShow,
  onCancel,
  title,
  type
}: props) {
  const { t } = useTranslation();
  const [form] = useForm();

  const { data: services } = usePaymentServiceFindAllQuery({
    type: type,
    active: true,
    take: 50,
  });

  const [createPartner, { isLoading: createLoading }] =
    usePaymentPartnerCreateMutation();
  const [updatePartner, { isLoading: updateLoading }] =
    usePaymentPartnerUpdateMutation();

  const onSubmit = async () => {
    const record = form.getFieldsValue();
    let res: any;
    var formdata = new FormData();
    if (form.getFieldValue('file'))
      formdata.append(
        'file',
        form.getFieldValue('file').originFileObj,
        form.getFieldValue('file').name
      );
    formdata.append('name', record.name);
    formdata.append('description', record.description);
    formdata.append('active', record.active);
    formdata.append('paymentServiceId', record.paymentServiceId);

    if (record.id) {
      updatePartner({ id: record.id, body: formdata })
        .unwrap()
        .then(() => {
          openNotification(t('messages.update-success'), 'success');
          onCancel();
        });
    } else {
      createPartner(formdata)
        .unwrap()
        .then(() => {
          openNotification(t('messages.create-success'), 'success');
          onCancel();
        });
    }
  };

  useEffect(() => {
    if (isShow && record && record.id) {
      form.setFieldsValue({
        id: record.id,
        paymentServiceId: record.paymentService.id,
        paymentServiceName: record.paymentService.name,
        description: record.description,
        name: record.name,
        active: record.active,
        logo: record.logo
      });
    }
    if (!isShow) {
      form.resetFields();
    }
  }, [isShow, record]);

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
      maskClosable={false}
    >
      <Form
        layout='vertical'
        form={form}
        initialValues={{
          type: type,
          active: true,
        }}
      >
        <Form.Item
          hidden={true}
          name='id'
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('partner.service-type')}
          name='type'
        >
          <Select
            options={PARTNER_TYPE_OPTIONS}
            disabled
          />
        </Form.Item>
        <Form.Item
          label={t('partner.service-name')}
          name='paymentServiceId'
        >
          <Select
            defaultValue={record?.paymentService?.name}
            options={services?.data.map((s) => ({
              label: s.name,
              value: s.id
            }))}
          />
        </Form.Item>
        <Form.Item
          label={t('partner.partner-name')}
          name='name'
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('partner.partner-description')}
          name='description'
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('labels.status')}
          name='active'
        >
          <Select
            options={[
              {
                label: t('labels.active'),
                value: true
              },
              {
                label: t('labels.inactivated'),
                value: false
              }
            ]}
          />
        </Form.Item>
        <Form.Item
          name='file'
          label={t('partner.logo')}
        >
          <FileUpload
            fileSelect={(file) => form.setFieldValue('file', file)}
            preview={record?.logo}
          />
        </Form.Item>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              className='btn-100'
              onClick={onCancel}
              loading={createLoading || updateLoading}
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              className='btn-100'
              type='primary'
              onClick={onSubmit}
              loading={createLoading || updateLoading}
            >
              {t('buttons.save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
