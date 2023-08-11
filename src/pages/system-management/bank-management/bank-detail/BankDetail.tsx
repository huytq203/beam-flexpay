import ItemDetail from '@components/item-detail/ItemDetail'
import { TimeFormat } from '@constants/datetime'
import { BANK_CHANNEL } from '@type/bank'
import { getBankStatus, getTagColor } from '@utils/helperFunctions'
import { Button, Col, Row, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  bank: any
  onCancel: () => void
}

type BankType = 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY'

function BankDetail({ bank, onCancel }: IProps) {
  const { t } = useTranslation()

  const withdrawFromType = useCallback(
    (type: BankType) => {
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
    },
    [bank?.type]
  )

  const depositFromType = useCallback(
    (type: BankType) => {
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
    },
    [bank?.type]
  )

  return (
    <>
      <Row className='mt-20'>
        <Col md={12}>
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.bank-name`.toString()}
            data={bank?.name}
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.bank-code`.toString()}
            data={bank?.bankCode}
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.short-name`.toString()}
            data={bank?.tradingName}
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.deposit-bank`.toString()}
            data={
              bank?.type
                ? t(`system-management.bank.options.${bank?.type}`)
                : null
            }
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.deposit-bank`.toString()}
            data={depositFromType(bank?.type)}
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.withdraw-bank`.toString()}
            data={withdrawFromType(bank?.type)}
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.address`.toString()}
            data={bank?.address}
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.website`.toString()}
            data={
              <a
                href={`${bank?.website}`}
                target='_blank'
              >
                {bank?.website}
              </a>
            }
          />
        </Col>
        <Col md={12}>
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.logo`.toString()}
            data={
              bank?.image ? (
                <img
                  height={50}
                  src={bank?.image}
                  alt='logo'
                />
              ) : null
            }
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.tiny-logo`.toString()}
            data={
              bank?.shortLogo ? (
                <img
                  height={50}
                  src={bank?.shortLogo}
                  alt='shortLogo'
                />
              ) : null
            }
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.created-time`.toString()}
            data={
              <Typography>
                {dayjs(bank?.createdAt).format(TimeFormat)}
              </Typography>
            }
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.order`.toString()}
            data={bank?.priority}
          />
          <ItemDetail
            boldTitle={true}
            title={t`system-management.bank.status`.toString()}
            data={
              bank?.active === 0 || bank?.active === 1 ? (
                <Tag color={getTagColor(bank.active)}>
                  {getBankStatus(bank.active)}
                </Tag>
              ) : null
            }
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
            onClick={onCancel}
          >{t`buttons.close`}</Button>
        </Col>
      </Row>
    </>
  )
}
export default BankDetail
