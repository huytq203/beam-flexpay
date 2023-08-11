import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons'
import { GUTTER } from '@constants/appConstant'
import { bankStatus } from '@constants/options'
import { address, bankName, hyperLink } from '@constants/regex'
import {
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation
} from '@services/apiBankService'
import { useBankFindOneQuery } from '@services/cmsBank'
import { STATUS_CODE } from '@type/api'
import { BANK_CHANNEL, TYPE_BANK } from '@type/bank'
import { viewMode } from '@type/customer'
import { blockLetterDecimal } from '@utils/helperFunctions'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Upload,
  message,
  Space,
  Spin
} from 'antd'
import type { RcFile } from 'antd/es/upload'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiFillDelete } from 'react-icons/ai'

interface IProps {
  onCancel: () => void
  mode: viewMode
  bank?: any
  refetch: () => void
}

type BankType = 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY'

function BankConfiguration({ onCancel, mode, bank, refetch }: IProps) {
  const { t } = useTranslation()

  const [image, setImage] = useState<any>()
  const [shortImage, setShortImage] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState()
  const [isDisable, setIsDisable] = useState(true)

  const [form] = Form.useForm()

  const [createBankAccount] = useCreateBankAccountMutation()
  const [updateBankAccount] = useUpdateBankAccountMutation()
  const { data, isLoading } = useBankFindOneQuery({ id: bank?.id })

  /**
   * if mode is edit, that function auto set value item for form
   */

  useEffect(() => {
    if (mode === viewMode.update && bank) {
      // setType(bank?.typeBank ?? TYPE_BANK.DEPOSIT_BANK)
      form.setFieldsValue({
        ...data
      })
      setImage(bank.image)
      setShortImage(bank.shortLogo)
    }
  }, [data])

  useEffect(() => {
    if (form.getFieldValue('type')) {
      setType(form.getFieldValue('type'))
    }
  }, [form.getFieldValue('type')])

  /**
   * function show message success message
   * @param msg
   */
  const showMessage = (msg: string) => {
    message.destroy()
    message.success(msg)
  }

  /**
   * function control close modal
   */

  const closeModal = () => {
    setImage(undefined)
    setShortImage(undefined)
    form.resetFields()
    onCancel()
  }

  /**
   * function control submit when create and edit data
   * @param value
   */
  const submit = async (value: any) => {
    if (!value) return

    setLoading(true)
    const formData = new FormData()
    const { image, shortLogo, bankCode, name, ...rest } = value

    let restData = { ...rest, name }

    /**
     * for in the value that get from form without image and shortlogo
     */
    for (const item in restData) {
      if (typeof value[item] === 'object') continue
      if (value[item] || value[item] === 0) {
        formData.append(item, value[item])
      }
    }

    /**
     * for in only image and shortLogo to decision append data ot not
     */
    for (const item in { image, shortLogo }) {
      const prop = item as keyof typeof value as string
      const propValue = value[prop]
      if (typeof propValue !== 'object' || propValue === null) continue
      formData.append(prop, propValue)
    }

    let data: any

    /**
     * handle what api is called, configuration or update api
     */
    if (mode === viewMode.configuration) {
      data = await createBankAccount(formData)
    } else {
      if (typeof image !== 'object' && image) {
        formData.append('bigImage', image)
      }
      if (typeof shortLogo !== 'object' && shortLogo) {
        formData.append('logo', shortLogo)
      }
      data = bank?.id && (await updateBankAccount({ id: bank.id, formData }))
    }

    /**
     * show success message if status is 200 or 201
     */
    if (
      data?.data === STATUS_CODE.CREATED ||
      data?.data === STATUS_CODE.SUCCESS
    ) {
      showMessage(
        mode === viewMode.configuration
          ? t`system-management.message.create-success`
          : t`system-management.message.edit-success`
      )
      closeModal()
      refetch()
    }
    setLoading(false)
  }

  /**
   * function control upload image
   * @param param0
   * @param typeLogo
   * @returns
   */
  const onChange = ({ file }: any, typeLogo: string) => {
    if (file.status === 'uploading') {
      return
    }
    if (file.status === 'done') {
      const reader = new FileReader()
      if (file && file.originFileObj) {
        reader.readAsDataURL(file.originFileObj)
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target) {
            if (typeLogo === 'logo') {
              form.setFields([
                { name: 'image', value: file.originFileObj, errors: undefined }
              ])
              setImage(event.target.result)
            } else {
              form.setFields([
                {
                  name: 'shortLogo',
                  value: file.originFileObj,
                  errors: undefined
                }
              ])
              setShortImage(event.target.result)
            }
          }
        }
      }
    }
  }

  /**
   * function dummy request when upload data
   * @param param0
   */
  const dummyRequest = ({ file, onSuccess }: any) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  /**
   * function check size and type of upload file
   * @param file
   * @returns
   */
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error(t('system-management.message.fileType').toString())
    }
    const is10MB = file.size / 1024 / 1024 <= 10
    if (!is10MB) {
      message.error(t('system-management.message.oversize').toString())
    }
    return isJpgOrPng && is10MB
  }

  /**
   * function return component UploadLogo
   * @param param0
   * @returns
   */
  const UploadLogo = ({ type, img }: { type: string; img: string }) => (
    <Upload
      beforeUpload={beforeUpload}
      listType='picture-card'
      showUploadList={false}
      accept='image/png'
      style={{ width: '100%', height: '200px' }}
      onChange={(e) => {
        onChange(e, type)
      }}
      progress={{ strokeWidth: 2 }}
      customRequest={dummyRequest}
    >
      {img ? (
        <div className='upload-image'>
          <img
            className='upload-logo'
            src={img}
            alt='full-logo'
          />
        </div>
      ) : (
        <div className='upload'>
          <PlusOutlined />
        </div>
      )}
    </Upload>
  )

  const onBlur = (field: string, value: string) => {
    form.setFieldValue(field, value.trim())
  }

  /**
   * get channel depend on value of bank type
   * @returns
   */
  const depositeArrOption = [
    {
      value: BANK_CHANNEL.DIRECT,
      label: t`system-management.bank.direct`
    },
    {
      value: BANK_CHANNEL.NAPAS,
      label: t`system-management.bank.napas`
    },
    {
      value: BANK_CHANNEL.NONE,
      label: t`system-management.bank.disable`
    }
  ]

  const withDrawArrOption = [
    {
      value: BANK_CHANNEL.IBFT,
      label: t`system-management.bank.ibft`
    },
    {
      value: BANK_CHANNEL.DIRECT,
      label: t`system-management.bank.direct`
    },
    {
      value: BANK_CHANNEL.NONE,
      label: t`system-management.bank.disable`
    }
  ]

  /**
   * confirmation modal to close configuration modal
   */
  const onBack = () => {
    Modal.confirm({
      centered: true,
      title: t`system-management.bank.close-update-configuration-modal`,
      content: t`system-management.bank.content-close-update-configuration-modal`,
      icon: <ExclamationCircleFilled />,
      onOk() {
        onCancel()
      },
      okText: t`system-management.bank.close-button`,
      cancelText: t`system-management.bank.cancel-button`
    })
  }

  /**
   * check disable button when value is undefined
   * @param restValue
   * @returns
   */

  const checkDisable = (restValue: any) => {
    const {
      name = undefined,
      tradingName = undefined,
      typeBank = undefined,
      website = undefined,
      address = undefined,
      type = undefined
      // depositType = undefined,
      // withdrawType = undefined
    } = restValue

    return (
      name === undefined ||
      tradingName === undefined ||
      type === undefined ||
      // depositType === undefined ||
      // withdrawType == undefined ||
      website == undefined ||
      address === undefined ||
      name === '' ||
      tradingName === '' ||
      typeBank === '' ||
      website == '' ||
      address === ''
    )
  }

  /**
   * handle values when form change
   * @param _
   * @param allValue
   */

  const handleChangeValues = (_: any, allValue: any) => {
    const { active, chanel, shortLogo, priority, ...rest } = allValue
    const isDisable = checkDisable(rest)
    if (isDisable) setIsDisable(true)
    else setIsDisable(false)
  }

  const withdrawFromType = useCallback(() => {
    const type: BankType = form.getFieldValue('type')
    switch (type) {
      case 'LINK':
        return BANK_CHANNEL.DIRECT
      case 'DEPOSIT':
        return BANK_CHANNEL.IBFT
      case 'GATEWAY':
        return BANK_CHANNEL.NAPAS
      case 'WITHDRAW':
        return BANK_CHANNEL.NONE
      default:
        return BANK_CHANNEL.NONE
    }
  }, [type])

  const depositFromType = useCallback(() => {
    const type: BankType = form.getFieldValue('type')
    switch (type) {
      case 'LINK':
        return BANK_CHANNEL.DIRECT
      case 'DEPOSIT':
        return BANK_CHANNEL.NONE
      case 'GATEWAY':
        return BANK_CHANNEL.NAPAS
      case 'WITHDRAW':
        return BANK_CHANNEL.IBFT
      default:
        return BANK_CHANNEL.NONE
    }
  }, [type])

  /**
   * each time change image have to check disable status of button
   */

  useEffect(() => {
    if (mode === viewMode.update && data) {
      const { active, shortLogo, priority, ...rest } = form.getFieldsValue()
      const isDisable = checkDisable(rest)
      if (isDisable || image === undefined) setIsDisable(true)
      else setIsDisable(false)
    }
  }, [image, data])

  return (
    <Spin spinning={isLoading}>
      <Form
        layout='vertical'
        onFinish={submit}
        form={form}
        initialValues={{
          chanel: BANK_CHANNEL.DIRECT,
          active: 1,
          bankCode: 1
        }}
        onValuesChange={handleChangeValues}
      >
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            lg={12}
          >
            <Form.Item
              label={t`system-management.bank.bank-name`}
              name='name'
              rules={[
                {
                  required: true,
                  message: t`system-management.message.bank-name`.toString()
                },
                {
                  pattern: bankName,
                  message: t`system-management.message.wrong-format`.toString()
                },
                {
                  max: 500,
                  message: t`system-management.message.max-bank-name`.toString()
                }
              ]}
            >
              <Input
                placeholder={t`system-management.bank.placeholders.bank-name`.toString()}
                disabled={mode === viewMode.update}
                onBlur={(e) => onBlur('name', e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label={t`system-management.bank.bank-code`}
              name='bankCode'
            >
              <Input
                disabled={mode === viewMode.update}
                placeholder={t`system-management.bank.placeholders.bank-code`.toString()}
                onBlur={(e) => onBlur('bankCode', e.target.value)}
                addonAfter={
                  mode === viewMode.configuration ? 'VNVX' : undefined
                }
              />
            </Form.Item>
            <Form.Item
              label={t`system-management.bank.short-name`}
              name='tradingName'
              rules={[
                {
                  required: true,
                  message: t`system-management.message.short-name`.toString()
                },
                {
                  pattern: /^[a-zA-Z0-9 ]+$/,
                  message: t`system-management.message.wrong-format`.toString()
                }
              ]}
            >
              <Input
                className='w-100'
                placeholder={t`system-management.bank.placeholders.short-name`.toString()}
                onBlur={(e) => onBlur('tradingName', e.target.value)}
              />
            </Form.Item>
            {/* select type */}
            <Form.Item
              name='type'
              label={t`system-management.bank.type`}
              rules={[
                {
                  required: true,
                  message: t`system-management.message.type`.toString()
                }
              ]}
            >
              <Select
                options={['LINK', 'DEPOSIT', 'WITHDRAW', 'GATEWAY'].map(
                  (x) => ({
                    value: x,
                    label: x ? t(`system-management.bank.options.${x}`) : null
                  })
                )}
                onChange={setType}
              />
            </Form.Item>
            <Row gutter={GUTTER}>
              <Col flex='auto'>
                <p>{t`system-management.bank.deposit-bank`}</p>
                <Select
                  value={withdrawFromType()}
                  options={depositeArrOption}
                  bordered={false}
                  suffixIcon={null}
                  disabled
                />
              </Col>
              <Col flex='auto'>
                <p>{t`system-management.bank.withdraw-bank`}</p>
                <Select
                  value={depositFromType()}
                  options={withDrawArrOption}
                  bordered={false}
                  suffixIcon={null}
                  disabled
                />
              </Col>
            </Row>
            {/* select type */}
            <Form.Item
              label={t`system-management.bank.address`}
              name='address'
              rules={[
                {
                  min: 5,
                  max: 500,
                  message: t('messages.minMaxFormValidate', {
                    min: 5,
                    max: 500
                  }).toString()
                },
                {
                  required: true,
                  message: t`system-management.message.address`.toString()
                }
                // {
                //   pattern: address,
                //   message: t`system-management.message.wrong-format`.toString()
                // }
              ]}
            >
              <Input
                placeholder={t`system-management.bank.placeholders.address`.toString()}
                onBlur={(e) => onBlur('address', e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label={t`system-management.bank.website`}
              name='website'
              rules={[
                {
                  required: true,
                  message: t`system-management.message.website`.toString()
                },
                {
                  pattern: hyperLink,
                  message: t`system-management.message.link-format`.toString()
                }
              ]}
            >
              <Input
                placeholder={t`system-management.bank.placeholders.website`.toString()}
                onBlur={(e) => onBlur('website', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col
            xs={12}
            lg={12}
          >
            <Form.Item
              label={t`system-management.bank.status`}
              name='active'
            >
              <Select
                options={bankStatus}
                placeholder={t`system-management.bank.placeholders.status`}
              />
            </Form.Item>
            <Form.Item
              label={t`system-management.bank.bank-order`}
              name='priority'
            >
              <InputNumber
                type='text'
                inputMode='numeric'
                className='w-100'
                placeholder={t`system-management.bank.placeholders.order`.toString()}
                onKeyPress={blockLetterDecimal}
                onBlur={(e) => onBlur('priority', e.target.value)}
              />
            </Form.Item>
            <Row gutter={GUTTER}>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item
                  className='custom-upload'
                  label={t`system-management.bank.full-logo`}
                  name='image'
                  valuePropName='fileList'
                  rules={[
                    {
                      required: true,
                      message: t`system-management.message.full-logo`.toString()
                    }
                  ]}
                >
                  <UploadLogo
                    type='logo'
                    img={image}
                  />
                </Form.Item>
                {image && (
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <AiFillDelete
                      color='red'
                      onClick={() => {
                        setImage(undefined)
                        form.resetFields(['image'])
                      }}
                    />
                  </div>
                )}
              </Col>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item
                  className='custom-upload'
                  label={t`system-management.bank.tiny-logo`}
                  name='shortLogo'
                  valuePropName='fileList'
                >
                  <UploadLogo
                    type='tiny-logo'
                    img={shortImage}
                  />
                </Form.Item>
                {shortImage && (
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <AiFillDelete
                      color='red'
                      onClick={() => {
                        setShortImage(undefined)
                        form.resetFields(['shortLogo'])
                      }}
                    />
                  </div>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button onClick={onBack}>{t`system-management.bank.back`}</Button>
          </Col>
          <Col>
            <Form.Item shouldUpdate>
              {() => (
                <Button
                  disabled={isDisable}
                  type='primary'
                  htmlType='submit'
                  loading={loading}
                >
                  {mode === viewMode.configuration
                    ? t`buttons.create`
                    : t`buttons.edit`}
                </Button>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Spin>
  )
}
export default BankConfiguration
