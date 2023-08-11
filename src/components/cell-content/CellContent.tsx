import NoDataText from '@components/no-data-text/NoDataText'
import { Typography } from 'antd'
import React from 'react'

const { Text } = Typography
function CellContent({ data }: any) {
  return (
    <React.Fragment>
      {data ? (
        <> {typeof data === 'string' ? <Text>{data}</Text> : data} </>
      ) : (
        <NoDataText />
      )}
    </React.Fragment>
  )
}
export default CellContent
