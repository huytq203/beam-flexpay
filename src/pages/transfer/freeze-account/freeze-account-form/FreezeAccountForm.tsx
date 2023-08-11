import {
  blockLetterDecimal,
  convertNumber,
  moneyInputFormatter
} from '@utils/helperFunctions'
import { Button, Form, Input, InputNumber, Space } from 'antd'
import { useTranslation } from 'react-i18next'

interface IProps {
  setVisibleHistory?: React.Dispatch<React.SetStateAction<boolean>>
  isOpenFreeze?: boolean
  triggerGetHistory?: any
  detail?: any
  searchValue?: string
  setDisableFreeze?: React.Dispatch<React.SetStateAction<boolean>>
  history?: boolean
}

function FreezeAnUnFreezeAccountForm({
  setVisibleHistory,
  isOpenFreeze,
  triggerGetHistory,
  detail,
  searchValue,
  setDisableFreeze,
  history = true
}: IProps) {
  const { t } = useTranslation()

  const handleVisibleHistory = async () => {
    if (setVisibleHistory && triggerGetHistory && searchValue && detail) {
      await triggerGetHistory({
        page: 1,
        take: 10,
        status: isOpenFreeze ? true : false,
        customerAccountNumber: searchValue
      })
      setVisibleHistory(true)
    }
  }

  return (
    <>
      <Form.Item
        label={t('freezeAndUnfreezeAccount.accountName')}
        name='accountName'
      >
        <Space.Compact>
          <Input
            bordered={false}
            readOnly
            className='wx-350'
            value={detail && detail?.fullName}
          />
          {history && (
            <Button
              type='link'
              onClick={handleVisibleHistory}
              disabled={detail ? false : true}
            >
              {isOpenFreeze
                ? t('freezeAndUnfreezeAccount.openFreezeHistory')
                : t('freezeAndUnfreezeAccount.history')}
            </Button>
          )}
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label={t('freezeAndUnfreezeAccount.totalBalance')}
        name='totalBalance'
      >
        <Space.Compact>
          <Input
            bordered={false}
            readOnly
            value={
              detail &&
              convertNumber(
                detail?.balances[0]?.availableMoney +
                  detail?.balances[0]?.freezedMoney
              )
            }
          />
          <Button type='ghost'>{t('freezeAndUnfreezeAccount.unit')}</Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label={t('freezeAndUnfreezeAccount.avaiableBalance')}
        name='avaiableBalance'
      >
        <Space.Compact>
          <Input
            bordered={false}
            readOnly
            value={detail && convertNumber(detail?.balances[0]?.availableMoney)}
          />
          <Button type='ghost'>{t('freezeAndUnfreezeAccount.unit')}</Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label={t('freezeAndUnfreezeAccount.freezeBalance')}
        name='freezeBalance'
      >
        <Space.Compact>
          <Input
            bordered={false}
            readOnly
            value={detail && convertNumber(detail?.balances[0]?.freezedMoney)}
          />
          <Button type='ghost'>{t('freezeAndUnfreezeAccount.unit')}</Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label={
          isOpenFreeze
            ? t('freezeAndUnfreezeAccount.unfreezeAccount.freezeBalanceRequest')
            : t('freezeAndUnfreezeAccount.amountToFrozen')
        }
        name='freezeBalanceRequest'
        rules={[
          {
            required: true,
            message:
              t`freezeAndUnfreezeAccount.validation.freezeMoneyRequestValidation`.toString()
          },
          () => ({
            validator(_, value) {
              if (
                value > detail?.balances[0]?.availableMoney &&
                !isOpenFreeze
              ) {
                return Promise.reject(
                  new Error(
                    t`freezeAndUnfreezeAccount.validation.maxMoneyFreeze`.toString()
                  )
                )
              } else if (
                value > detail?.balances[0]?.freezedMoney &&
                isOpenFreeze
              ) {
                return Promise.reject(
                  new Error(
                    t`freezeAndUnfreezeAccount.validation.maxMoneyOpenFreeze`.toString()
                  )
                )
              } else if ((value === 0 || value < 1) && value !== null) {
                return Promise.reject(
                  new Error(
                    t`freezeAndUnfreezeAccount.validation.smallerThanZero`.toString()
                  )
                )
              } else {
                return Promise.resolve()
              }
            }
          })
        ]}
      >
        <InputNumber
          disabled={!detail}
          type='text'
          inputMode='numeric'
          style={{ width: '100%' }}
          onChange={(e) => {
            if (e) {
              if (setDisableFreeze) {
                setDisableFreeze(false)
              }
            }
          }}
          formatter={moneyInputFormatter}
          onKeyPress={blockLetterDecimal}
          placeholder={
            isOpenFreeze
              ? t`freezeAndUnfreezeAccount.unfreezeAccount.placeholders.money`.toString()
              : t`freezeAndUnfreezeAccount.placeholders.money`.toString()
          }
        />
      </Form.Item>
      <Form.Item
        label={t('freezeAndUnfreezeAccount.reason')}
        name='reason'
        rules={[
          {
            required: true,
            message: t`freezeAndUnfreezeAccount.validation.require`.toString()
          }
        ]}
      >
        <Input.TextArea
          disabled={!detail}
          placeholder={t(
            'freezeAndUnfreezeAccount.placeholders.reason'
          ).toString()}
        />
      </Form.Item>
    </>
  )
}
export default FreezeAnUnFreezeAccountForm
