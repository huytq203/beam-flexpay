import NoDataText from '@components/no-data-text/NoDataText'
import { Typography } from 'antd'
import React from 'react'

const { Text } = Typography

interface ICellContent {
  data: any
  isDash?: boolean
}

function CellContent(props: ICellContent) {
  const { data, isDash = false } = props
  return (
    <React.Fragment>
      {data ? (
        <> {typeof data === 'string' ? <Text>{data}</Text> : data} </>
      ) : (
        <NoDataText isDash={isDash} />
      )}
    </React.Fragment>
  )
}

export default CellContent
