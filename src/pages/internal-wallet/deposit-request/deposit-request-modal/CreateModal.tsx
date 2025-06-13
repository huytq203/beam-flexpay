import SearchSelect from '@components/search-select-props/SearchSelectProps'
import { GUTTER } from '@constants/appConstant'
import {
  useCreateDepositRequestMutation,
  useLazyGetDetailDepositRequestQuery,
  useUpdateDepositRequestMutation
} from '@services/apiAccountingRequest'
import { useLazyGetListWalletsQuery } from '@services/apiInternalWallet'
import { CustomerType } from '@type/accountGroup'
import {
  AccountingRequestBody,
  TransactionTypeOptions
} from '@type/accountingRequest'
import { viewMode } from '@type/customer'
import {
  blockArrowValue,
  blockLetterDecimal,
  moneyInputFormatter
} from '@utils/helperFunctions'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message
} from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  onCancel: Function
  selectedId?: number | undefined
  mode: viewMode
  refetch: () => void
}

function CreateModal({ mode, onCancel, selectedId, refetch }: IProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form] = Form.useForm()

  const [trigger] = useLazyGetListWalletsQuery()

  const [createDepositRequest] = useCreateDepositRequestMutation()
  const [updateDepositRequest] = useUpdateDepositRequestMutation()

  const [getDetailDepositRequest] = useLazyGetDetailDepositRequestQuery()

  useEffect(() => {
    const getData = async () => {
      if ((mode === viewMode.update || mode === viewMode.view) && selectedId) {
        const { data } = await getDetailDepositRequest(selectedId)
        const internalWalletFromId = {
          label: data?.from?.name,
          value: data?.from?.id
        }
        const internalWalletToId = {
          label: data?.to?.name,
          value: data?.to?.id
        }

        if (data && data?.id) {
          form.setFieldsValue({...data, from: internalWalletFromId, to: internalWalletToId})
        }
      }
    }
    getData()
  }, [mode, selectedId, getDetailDepositRequest, form])

  const onCloseModal = () => {
    onCancel()
  }

  const showSuccessMessage = (msg: string) => {
    message.destroy()
    message.success(msg)
  }

  const onSubmit = async (value: any) => {
    value.from = value.from?.value || value.from
    value.to = value.to?.value || value.to
    setIsSubmitting(true)
    const { ...rest } = value
    const body = {
      ...rest
    }
    const data = (await (mode === viewMode.create
      ? createDepositRequest(body)
      : updateDepositRequest({ id: selectedId, ...body }))) || {
      data: undefined
    }
    if (
      (data as any)?.data?.statusCode === 200 ||
      (data as any)?.data?.statusCode === 201
    ) {
      showSuccessMessage(
        mode === viewMode.create
          ? t`internal-wallet.messages.create-accounting-request-success`
          : t`internal-wallet.messages.update-accounting-request-success`
      )
      refetch()
      onCloseModal()
    } else {
      setIsSubmitting(false)
    }
  }

  const fetchWalletData = async (params: {
    page: number
    take: number
    name: string
  }) => {
    const response = await trigger(params).unwrap()
    return response
  }

  const setWalletNumber = (value: any, field: string) => {
    if (field === 'from') {
      form.setFieldValue('walletNumberFrom', value)
    } else if (field === 'to') {
      form.setFieldValue('walletNumberTo', value)
    }
  }

  const onChange = (value: any) => {
    console.log('onChange', value)
  }
  return (
    <div className='create-group'>
      <Form
        layout='vertical'
        form={form}
        onFinish={onSubmit}
        initialValues={{
          customerType: CustomerType.PERSONAL
        }}
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
              <SearchSelect
                disabled={mode === viewMode.view}
                placeholder={
                  t`internal-wallet.placeholders.wallet_name` as string
                }
                fetchData={fetchWalletData}
                searchKey='name'
                valueKey='id'
                take={10}
                field='from'
                callback={setWalletNumber}
                onChange={onChange}
              />
            </Form.Item>
            {/* den ví */}
            <Form.Item
              name='to'
              label={'to'}
            >
              <SearchSelect
                disabled={mode === viewMode.view}
                placeholder={
                  t`internal-wallet.placeholders.wallet_name` as string
                }
                fetchData={fetchWalletData}
                searchKey='name'
                valueKey='id'
                take={10}
                field='to'
                callback={setWalletNumber}
                onChange={onChange}
              />
            </Form.Item>
            {/* So tien */}
            <Form.Item
              name='amount'
              label={'amount'}
            >
              <InputNumber
                disabled={mode === viewMode.view}
                readOnly={mode === viewMode.view}
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
                disabled={mode === viewMode.view}
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
            <Button onClick={onCloseModal}>{t`buttons.close`}</Button>
          </Col>
          <Col>
            <Form.Item shouldUpdate>
              {mode !== viewMode.view && (
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={isSubmitting}
                >
                  {mode === viewMode.create
                    ? t`buttons.create`
                    : t`buttons.update`}
                </Button>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
export default CreateModal
