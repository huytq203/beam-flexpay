import { usePaymentPartnerFindAllQuery } from '@services/cmsService'
import {
  PaymentPartnerDto,
  PaymentPartnerFindAllApiArg
} from '@type/application'
import { Select, SelectProps } from 'antd'
import _ from 'lodash'
import { useEffect, useState } from 'react'

type props = SelectProps & {
  type: 'REPAYMENT' | 'DISBURSE'
  // selectedValue: string | string[]
}

const PartnerSelect = (props: props) => {
  const [search, setSearch] = useState<PaymentPartnerFindAllApiArg>({
    take: 10,
    page: 1,
    type: props.type
  })

  const [data, setData] = useState<PaymentPartnerDto[]>([])

  const { data: partners } = usePaymentPartnerFindAllQuery(search)

  const onScroll = (e: any) => {
    const target = e.target
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (partners && partners?.meta.hasNextPage) {
        setSearch({ ...search, page: search.page + 1 })
      }
    }
  }

  useEffect(() => {
    let _data: PaymentPartnerDto[] = []
    if (data && data.length > 0) {
      _data = _.uniq([...data, ...(partners?.data as PaymentPartnerDto[])])
    } else {
      _data = (partners?.data as PaymentPartnerDto[]) ?? []
    }
    setData(_data)
  }, [partners])

  return (
    <Select
      allowClear
      onPopupScroll={onScroll}
      {...props}
    >
      {data &&
        data?.map((d) => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
    </Select>
  )
}
export default PartnerSelect
