import { openNotification } from '@configs/fetchBaseQueryCustom'
import { GUTTER } from '@constants/appConstant'
import {
  useCreateDepositRequestMutation,
  useGetDetailDepositRequestQuery,
  useUpdateDepositRequestMutation
} from '@services/apiAccountingRequest'
import { TransactionTypeOptions } from '@type/accountingRequest'
import { STATUS_CODE } from '@type/api'
import { viewMode } from '@type/customer'
import { IInternalWalletQuery } from '@type/internalWallet'
import {
  blockArrowValue,
  blockLetterDecimal,
  compareData,
  moneyInputFormatter
} from '@utils/helperFunctions'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Spin
} from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DepositRequestSelection } from './DepositRequestSelection'

type props = {
  title: string
  onCancel: VoidFunction
  mode: viewMode
  record?: any
  isShow: boolean
}

function DepositRequestForm({ record, onCancel, title, mode, isShow }: props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const [createDepositRequest] = useCreateDepositRequestMutation()
  const [updateDepositRequest] = useUpdateDepositRequestMutation()

  const { data: depositRequest } = useGetDetailDepositRequestQuery(record?.id, {
    skip: !record?.id
  })

  console.log('record', record)
  const [loading, setLoading] = useState(false)
  const [searchInternalWallet, setSearchInternalWallet] =
    useState<IInternalWalletQuery>({
      page: 1,
      take: 10
    })
  const handleSubmit = async (value: any) => {
    
  }

  const walletGroupValue = Form.useWatch('walletGroup', {
    form,
    preserve: true
  })
  const nameValue = Form.useWatch('name', { form, preserve: true })

  const onCancelModal = () => {
    if (walletGroupValue && nameValue) {
      Modal.confirm({
        title: 'Hủy thêm mới yêu cầu hoạch toán',
        content: t`internal-wallet.messages.confirm-cancel-create-deposit-request`,
        okText: t`buttons.yes`,
        cancelText: t`buttons.no`,
        onOk: () => {
          onCancel()
        }
      })
    } else {
      onCancel()
    }
  }
  const setWalletNumber = (value: any, field: string) => {
    if (field === 'from') {
      form.setFieldsValue({ walletNumberFrom: value })
    } else if (field === 'to') {
      form.setFieldsValue({ walletNumberTo: value })
    }
  }

  const setWalletId = (value: any, field: string) => {
    if (field === 'from') {
      form.setFieldsValue({ from: value })
    } else if (field === 'to') {
      form.setFieldsValue({ to: value })
    }
  }

  useEffect(() => {
    if (
      (mode === viewMode.update || mode === viewMode.view) &&
      record &&
      record?.id
    ) {
      console.log('record', record)
      form.setFieldsValue({ from: { value: record.from.id, label: record.from.name } })
      form.setFieldsValue({ walletNumberFrom: record.from.walletNumber })
      form.setFieldsValue({ to: { value: record.to.id, label: record.to.name }  })
      form.setFieldsValue({ walletNumberTo: record.to.walletNumber })
      form.setFieldsValue({ amount: record.amount })
      form.setFieldsValue({ reason: record.reason })
      form.setFieldsValue({ transactionType: record.transactionType })
    }

    if (mode !== viewMode.update || !isShow) form.resetFields()
  }, [record, mode])

  const handleClear = (field: any) => {
    console.log('clear')
    setSearchInternalWallet({
      ...searchInternalWallet,
      page: 1,
      keyword: undefined
    })
    setWalletNumber(undefined, field)
  }

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          layout='vertical'
          form={form}
          initialValues={{ walletType: 'Ví nội bộ' }}
          onFinish={handleSubmit}
        >
          <Row gutter={GUTTER}>
            <Col
              xs={12}
              md={12}
              xl={12}
            >
              {/* Từ ví */}
              <Form.Item
                name='from'
                label={'from'}
              >
                <DepositRequestSelection
                  placeholder={'Chọn ví nội bộ'}
                  onClear={handleClear}
                  setWalletNumber={setWalletNumber}
                  setWalletId={setWalletId}
                  field='from'
                  value={form.getFieldValue('from')}
                />
              </Form.Item>
              {/* Den ví */}
              <Form.Item
                name='to'
                label={'to'}
              >
                <DepositRequestSelection
                  placeholder={'Chọn ví nội bộ'}
                  onClear={handleClear}
                  setWalletNumber={setWalletNumber}
                  setWalletId={setWalletId}
                  field='to'
                />
              </Form.Item>
              {/* So tien */}
              <Form.Item
                name='amount'
                label={'amount'}
              >
                <InputNumber
                  type='text'
                  inputMode='numeric'
                  style={{ width: '100%' }}
                  formatter={moneyInputFormatter}
                  onKeyPress={blockLetterDecimal}
                  onKeyDown={blockArrowValue}
                />
              </Form.Item>
              {/* Ly do */}
              <Form.Item
                name='reason'
                label={'reason'}
              >
                <Input.TextArea
                  allowClear={true}
                  disabled={mode === viewMode.view}
                  readOnly={mode === viewMode.view}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col
              xs={12}
              md={12}
              xl={12}
            >
              {/* So ví */}
              <Form.Item
                name='walletNumberFrom'
                label={'so vi dien tu'}
              >
                <Input
                  disabled={true}
                  readOnly={true}
                  placeholder={''}
                  type='text'
                  style={{ width: '100%' }}
                  onKeyDown={blockArrowValue}
                  onKeyPress={blockLetterDecimal}
                />
              </Form.Item>
              {/* So ví */}
              <Form.Item
                name='walletNumberTo'
                label={'so vi dien tu'}
              >
                <Input
                  disabled={true}
                  readOnly={true}
                  placeholder={''}
                  type='text'
                  style={{ width: '100%' }}
                  onKeyDown={blockArrowValue}
                  onKeyPress={blockLetterDecimal}
                />
              </Form.Item>
              {/* Transaction Type */}
              <Form.Item
                name='transactionType'
                label={'Transaction Type'}
              >
                <Select
                  //placeholder={t`internal-account-report.placeholders.status`.toString()}
                  options={TransactionTypeOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
          <Row
            justify='end'
            gutter={GUTTER}
          >
            <Col>
              <Form.Item shouldUpdate>
                <Button
                  className='btn-100'
                  loading={loading}
                  onClick={onCancelModal}
                >
                  {t('buttons.cancel')}
                </Button>
              </Form.Item>
            </Col>
            <Col>
              <Button
                // onClick={() => {
                //   onCancel(value)
                // }}
                type='primary'
                className='btn-100'
              >
                {t('buttons.clear')}
              </Button>
            </Col>
            <Col>
              <Button
                className='btn-100'
                type='primary'
                htmlType='submit'
                loading={loading}
              >
                {t('buttons.save')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  )
}

export default DepositRequestForm
