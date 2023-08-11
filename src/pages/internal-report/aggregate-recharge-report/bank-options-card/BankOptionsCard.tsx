import { Card, Checkbox, Col, Typography } from 'antd'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const BankOptionsCard = () => {
  const { t } = useTranslation()

  const banks = useMemo(
    () => [
      {
        name: 'Vietcombank'
      },
      {
        name: 'Vietcombank'
      },
      {
        name: 'Vietcombank'
      },
      {
        name: 'Vietcombank'
      },
      {
        name: 'Vietcombank'
      },
      {
        name: 'Vietcombank'
      }
    ],
    []
  )

  const trans = useCallback((key: string) => {
    const str = `internal-aggregate-recharge-report.${key}`
    return t(str)
  }, [])
  return (
    <Col
      xs={24}
      lg={4}
    >
      <Card className='h-100'>
        <Typography.Title level={5}>{trans('selectBank')}</Typography.Title>
        {banks.map((bank) => (
          <>
            <Checkbox>{bank.name}</Checkbox>
            <br />
          </>
        ))}
      </Card>
    </Col>
  )
}

export default React.memo(BankOptionsCard)
