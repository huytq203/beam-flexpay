import { GUTTER } from '@constants/appConstant'
import { FeeOptions } from '@constants/options'
import { POLICY_MANAGEMENT_TYPE, viewMode } from '@type/policyManagement'
import {
  blockArrowValue,
  blockLetterDecimal,
  blockLetterValue,
  moneyInputFormatter
} from '@utils/helperFunctions'
import { Button, Col, Form, InputNumber, Row, Select } from 'antd'
import { FormInstance, useForm } from 'antd/es/form/Form'
import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Types and interfaces
interface FeeFormData {
  transactionFrom?: number;
  transactionTo?: number;
  type: 'FLEXIBLE' | 'FIXED';
  transferorFlexibleFee?: number;
  transferorFixedFee?: number;
  transferorFeeMin?: number;
  transferorFeeMax?: number;
  receiverFlexibleFee?: number;
  receiverFixedFee?: number;
  receiverFeeMin?: number;
  receiverFeeMax?: number;
}

interface AddFeePackageModalProps {
  onCancel: () => void;
  toggleFee: (value: any, type: viewMode) => void;
  isLoading?: boolean;
  initialValues?: Partial<FeeFormData>;
  mode?: viewMode;
  module?: POLICY_MANAGEMENT_TYPE;
  fee?: any;
  id?: string | number;
}

// Constants
const DEFAULT_FORM_VALUES: FeeFormData = {
  type: 'FLEXIBLE',
  transferorFlexibleFee: 0,
  transferorFixedFee: 0,
  transferorFeeMin: undefined,
  transferorFeeMax: undefined,
  receiverFlexibleFee: 0,
  receiverFixedFee: 0,
  receiverFeeMin: undefined,
  receiverFeeMax: undefined,
};

const TRANSACTION_DEFAULTS = {
  FROM: 0,
  TO: 10000 * 1000000000,
};

// Validation rules
const createValidationRules = (form: FormInstance) => ({
  positiveNumber: () => ({
    validator(_: any, value: number) {
      if (value < 0 && value !== null) {
        return Promise.reject(t('policy-management.common.biggerThanZeroValidate'));
      }
      return Promise.resolve();
    },
  }),

  percentage: () => ({
    validator(_: any, value: number) {
      if (value < 0 || value > 100) {
        return Promise.reject(t('policy-management.depositManagement.transferorFlexibleFee'));
      }
      return Promise.resolve();
    },
  }),

  minMaxFee: (minField: string, maxField: string) => ({
    validator(_: any, value: number) {
      const { getFieldValue, setFields } = form;
      const counterpartField = minField === 'transferorFeeMin' ? 'transferorFeeMax' : 'transferorFeeMin';
      const counterpartValue = getFieldValue(counterpartField);
      console.log('counterpartValue', counterpartValue)
      // Clear errors on counterpart field
      setFields([{ name: counterpartField, errors: [] }]);
      console.log('value', value)
      if (value && counterpartValue) {
        const isMinField = minField.includes('Min');
        console.log('isMinField', isMinField)
        const shouldReject = isMinField ? value > counterpartValue : value < counterpartValue;
        console.log('shouldReject', shouldReject)
        if (shouldReject) {
          return Promise.reject(
            t(`policy-management.depositManagement.${isMinField ? 'min' : 'max'}FeeValidate`)
          );
        }
      }
      return Promise.resolve();
    },
  }),

  transactionRange: (isFromField: boolean) => ({
    validator(_: any, value: number) {
      const { getFieldValue, setFields } = form;
      const counterpartField = isFromField ? 'transactionTo' : 'transactionFrom';
      const counterpartValue = getFieldValue(counterpartField);
      // Clear errors on counterpart field
      setFields([{ name: counterpartField, errors: [] }]);
      if (value >= 0 && counterpartValue >= 0) {
        const shouldReject = isFromField ? value >= counterpartValue : value <= counterpartValue;
        if (shouldReject) {
          return Promise.reject(
            t('policy-management.common.validation.transactionFromBiggerValidate')
          );
        }
      }
      return Promise.resolve();
    },
  }),
});

// Custom hooks
const useFormValidation = (form: FormInstance) => {
  return useMemo(() => createValidationRules(form), [form]);
};

const usePercentageFormatter = (form: FormInstance, fieldName: string) => {
  return useCallback((value: string | number | undefined) => {
    if (value && Number(value) > 100) {
      form.setFieldsValue({ [fieldName]: 100 });
      return '100%';
    }
    return value ? `${value}%` : '';
  }, [form, fieldName]);
};

// Subcomponents
const TransactionRangeFields: React.FC<{ validation: any }> = ({ validation }) => (
  <Row gutter={GUTTER}>
    <Col span={12}>
      <Form.Item
        name="transactionFrom"
        label={t`policy-management.depositManagement.modalContent.tableModal.transactionFrom`}
        rules={[validation.transactionRange(true)]}
      >
        <InputNumber
          type="text"
          inputMode="numeric"
          style={{ width: '100%' }}
          formatter={moneyInputFormatter}
          onKeyPress={blockLetterDecimal}
          onKeyDown={blockArrowValue}
          placeholder={t`policy-management.depositManagement.modalContent.feePackage.transactionFromPlaceholder` || ''}
        />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item
        name="transactionTo"
        label={t`policy-management.depositManagement.modalContent.tableModal.transactionTo`}
        rules={[validation.transactionRange(false)]}
      >
        <InputNumber
          type="text"
          inputMode="numeric"
          style={{ width: '100%' }}
          formatter={moneyInputFormatter}
          onKeyPress={blockLetterDecimal}
          placeholder={t`policy-management.depositManagement.modalContent.feePackage.transactionToPlaceholder` || ''}
        />
      </Form.Item>
    </Col>
  </Row>
);

const FlexibleFeeFields: React.FC<{
  prefix: 'transferor' | 'receiver';
  form: FormInstance;
  validation: any;
}> = ({ prefix, form, validation }) => {
  const formatPercentage = usePercentageFormatter(form, `${prefix}FlexibleFee`);
  
  return (
    <>
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name={`${prefix}FlexibleFee`}
            label={t`policy-management.depositManagement.modalContent.tableModal.variableFee`}
            rules={[
              {
                required: true,
                message: t`policy-management.common.validation.noTransactionFlexibleFeeValidate`,
              },
              validation.percentage,
            ]}
          >
            <InputNumber
              precision={2}
              step={0.1}
              type="text"
              style={{ width: '100%' }}
              formatter={formatPercentage}
              inputMode="numeric"
              onKeyDown={blockArrowValue}
              onKeyPress={blockLetterValue}
              placeholder={t`policy-management.depositManagement.modalContent.feePackage.variableFeePlaceholder` || ''}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name={`${prefix}FeeMin`}
            label={t`policy-management.depositManagement.modalContent.tableModal.minFee`}
            rules={[validation.minMaxFee(`${prefix}FeeMin`, `${prefix}FeeMax`)]}
          >
            <InputNumber
              type="text"
              inputMode="numeric"
              style={{ width: '100%' }}
              formatter={moneyInputFormatter}
              onKeyDown={blockArrowValue}
              onKeyPress={blockLetterDecimal}
              placeholder={t`policy-management.depositManagement.modalContent.feePackage.minFeePlaceholder` || ''}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={`${prefix}FeeMax`}
            label={t`policy-management.depositManagement.modalContent.tableModal.maxFee`}
            rules={[validation.minMaxFee(`${prefix}FeeMax`, `${prefix}FeeMin`)]}
          >
            <InputNumber
              type="text"
              inputMode="numeric"
              style={{ width: '100%' }}
              formatter={moneyInputFormatter}
              onKeyDown={blockArrowValue}
              onKeyPress={blockLetterDecimal}
              placeholder={t`policy-management.depositManagement.modalContent.feePackage.maxFeePlaceholder` || ''}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

const FixedFeeFields: React.FC<{
  prefix: 'transferor' | 'receiver';
  validation: any;
}> = ({ prefix, validation }) => (
  <Row gutter={GUTTER}>
    <Col span={12}>
      <Form.Item
        name={`${prefix}FixedFee`}
        label={t`policy-management.depositManagement.modalContent.tableModal.fixedFee`}
        rules={[
          {
            required: true,
            message: prefix === 'transferor' 
              ? t`policy-management.common.validation.noTransactionFixedFeeValidate`
              : t`policy-management.depositManagement.validateRequired`,
          },
          validation.positiveNumber,
        ]}
      >
        <InputNumber
          type="text"
          inputMode="numeric"
          style={{ width: '100%' }}
          formatter={moneyInputFormatter}
          onKeyDown={blockArrowValue}
          onKeyPress={blockLetterDecimal}
          placeholder={t`policy-management.depositManagement.modalContent.feePackage.fixedFeePlaceholder` || ''}
        />
      </Form.Item>
    </Col>
  </Row>
);

const FeeSection: React.FC<{
  title: string;
  type: 'FLEXIBLE' | 'FIXED';
  prefix: 'transferor' | 'receiver';
  form: FormInstance;
  validation: any;
}> = ({ title, type, prefix, form, validation }) => (
  <>
    <Col span={24} style={{ fontWeight: '600', marginBottom: '10px' }}>
      {title}
    </Col>
    {type === 'FLEXIBLE' ? (
      <FlexibleFeeFields prefix={prefix} form={form} validation={validation} />
    ) : (
      <FixedFeeFields prefix={prefix} validation={validation} />
    )}
  </>
);

// Main component
export const AddFeePackageModal: React.FC<AddFeePackageModalProps> = ({
  onCancel,
  toggleFee,
  isLoading = false,
  initialValues = {},
  mode,
  fee,
}) => {
  const [form] = useForm();
  const [type, setType] = useState<'FLEXIBLE' | 'FIXED'>('FLEXIBLE');
  const validation = useFormValidation(form);

  const formInitialValues = useMemo(() => ({
    ...DEFAULT_FORM_VALUES,
    ...initialValues,
  }), [initialValues]);

  const handleSubmit = useCallback(async (values: FeeFormData) => {
    const processedValues = {
      ...values,
      transactionFrom: values.transactionFrom ?? TRANSACTION_DEFAULTS.FROM,
      transactionTo: values.transactionTo ?? TRANSACTION_DEFAULTS.TO,
    };

    try {
      await toggleFee(processedValues, viewMode.create);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Error submitting fee package:', error);
      // Handle error appropriately
    }
  }, [toggleFee, form, onCancel]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    onCancel();
  }, [form, onCancel]);

  useEffect(() => {
    console.log('fee', fee)
    console.log('mode', mode)
    if (mode === viewMode.update) {
      form.setFieldsValue(fee)
      setType(fee.type)
    }
  }, [mode, fee])
  return (
    <Form
      onFinish={handleSubmit}
      layout="vertical"
      form={form}
      initialValues={formInitialValues}
    >
      <TransactionRangeFields validation={validation} />
      
      <Row gutter={GUTTER}>
        <Col span={12}>
          <Form.Item
            name="type"
            label={t`policy-management.depositManagement.modalContent.tableModal.type`}
          >
            <Select options={FeeOptions} onChange={setType} />
          </Form.Item>
        </Col>
      </Row>

     
      <FeeSection
        title={t`policy-management.depositManagement.modalContent.tableModal.onTransferor`}
        type={type}
        prefix="transferor"
        form={form}
        validation={validation}
      />

      <FeeSection
        title={t`policy-management.depositManagement.modalContent.tableModal.onReceiver`}
        type={type}
        prefix="receiver"
        form={form}
        validation={validation}
      />
      

      <Row justify="end" gutter={GUTTER}>
        <Col>
          <Button className="mr-10" onClick={handleCancel}>
            {t`buttons.cancel`}
          </Button>
        </Col>
        <Col>
          <Button loading={isLoading} type="primary" htmlType="submit">
            {t`buttons.create`}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};