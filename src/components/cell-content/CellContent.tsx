import NoDataText from '@components/no-data-text/NoDataText'
import { Typography } from 'antd'
import React from 'react'

const { Text } = Typography

interface ICellContent {
  data: any
  isDash?: boolean
  color?: string
}

function CellContent(props: ICellContent) {
  const { data, isDash = false, color } = props
  return (
    <React.Fragment>
      {data ? (
        <> {typeof data === 'string' ? <Text style={color ? { color } : undefined}>{data}</Text> : data} </>
      ) : (
        <NoDataText isDash={isDash} />
      )}
    </React.Fragment>
  )
}

export default CellContent
