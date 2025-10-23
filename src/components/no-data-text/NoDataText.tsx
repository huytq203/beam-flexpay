import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

function NoDataText({ isDash = false }: { isDash?: boolean }) {
  const { t: trans } = useTranslation()
  return isDash ? <Text>-</Text> : <Text>{trans`labels.nodata`}</Text>
}

export default NoDataText
