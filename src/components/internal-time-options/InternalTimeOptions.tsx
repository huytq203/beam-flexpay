import { DATE_PAYLOAD } from '@pages/internal-report/internal-accounts-report/report.const'
import { Select } from 'antd'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type InternalTimeOptionsPropsType = {
  selectedOption: DATE_PAYLOAD
  setSelectedOption: React.Dispatch<React.SetStateAction<DATE_PAYLOAD>>
}

const InternalTimeOptions = ({
  selectedOption,
  setSelectedOption
}: InternalTimeOptionsPropsType) => {
  const { t: trans } = useTranslation()

  const options = useMemo(
    () => [
      {
        title: trans`labels.today`,
        value: DATE_PAYLOAD.DAY
      },
      {
        title: trans`labels.yesterday`,
        value: DATE_PAYLOAD.LAST_DAY
      },
      {
        title: trans`labels.7days`,
        value: DATE_PAYLOAD.WEEK
      },
      {
        title: trans`labels.thisMonth`,
        value: DATE_PAYLOAD.MONTH
      }
    ],
    []
  )

  return (
    <Select
      style={{ minWidth: '250px' }}
      value={selectedOption}
      onChange={(value) => setSelectedOption(value)}
    >
      {options.map((x) => {
        return (
          <Select.Option
            value={x.value}
            key={x.value}
          >
            {x.title}
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default React.memo(InternalTimeOptions)
