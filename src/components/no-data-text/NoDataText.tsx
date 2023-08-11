import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

function NoDataText() {
  const { t: trans } = useTranslation()
  return <Text>{trans`labels.nodata`}</Text>
}
export default NoDataText
