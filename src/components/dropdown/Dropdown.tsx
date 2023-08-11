import { GUTTER } from '@constants/appConstant'
import { Col, Input, Row, Select, SelectProps } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = SelectProps & {
  optionData: DefaultOptionType[]
}

function Dropdown(props: Props) {
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<DefaultOptionType[]>([])
  const [name, setName] = useState<string>()
  const inputRef = useRef<any>()
  const { t } = useTranslation()

  useEffect(() => {
    if (props.optionData.length > 0) setData(props.optionData)
  }, [props.options])

  const onNameChange = () => {
    const value = inputRef.current.input.value
    if (value) {
      const _data = data.filter((d) =>
        d.label?.toString().toLowerCase().includes(value.toLowerCase())
      )
      setData(_data)
    } else {
      setData(props.optionData)
    }
  }

  return (
    <Select
      style={{ width: 300 }}
      loading={loading}
      dropdownRender={(menu) => (
        <>
          <Row gutter={GUTTER}>
            <Col flex='auto'>
              <Input
                allowClear
                placeholder={t`labels.enter-keywords`.toString()}
                ref={inputRef}
                value={name}
                onBlur={onNameChange}
                onChange={onNameChange}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>{menu}</Col>
          </Row>
        </>
      )}
      options={data}
      {...props}
    />
  )
}
export default Dropdown
