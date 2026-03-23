import { PageMetaDto, PageMetaSearchDto } from '@type/application'
import { Select, SelectProps } from 'antd'
import { useEffect, useState } from 'react'

interface CustomSelectType<T extends PageMetaSearchDto> extends SelectProps {
  trigger: any
  search: T
  field: string
  readonly?: boolean
  onSelectData: (value: any, field: string) => void
  valueSearch: string
  placeholder: string
  valuePassed?: string
}
function CustomAccountingSelect<T extends PageMetaSearchDto>(props: CustomSelectType<T>) {
  const [data, setData] = useState<any[]>([])
  const [meta, setMeta] = useState<PageMetaDto>({
    hasNextPage: false,
    hasPreviousPage: false,
    itemCount: 0,
    page: 1,
    take: 10,
    pageCount: 1
  })

  const [_search, setSearch] = useState<T>(props.search)

  const handleScroll = async (e: any) => {
    const target = e.target
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (meta.hasNextPage)
        setSearch({
          ..._search,
          page: props.search.page + 1
        })
    }
  }

  const handleSearch = (value: string) => {
    if (!value) setSearch(props.search)
    const asyncData = Promise.resolve(setData([]))
    asyncData.then(() =>
      setSearch({
        ..._search,
        page: 1,
        [props.field]: value
      })
    )
  }

  const getData = () => {
    props.trigger(_search).then((result: any) => {
      setData([...data, ...(result.data as any).data])
      setMeta((result.data as any).meta)
    })
  }

  useEffect(() => {
    getData()
  }, [_search])

  const onSelect = (_: any, option: Record<string, any>) => {
    props.onSelectData(option, props.valueSearch)
  }

  return (
    <Select
      allowClear
      showSearch
      onPopupScroll={handleScroll}
      onSearch={handleSearch}
      suffixIcon={null}
      filterOption={false}
      {...props}
      onSelect={onSelect}
      placeholder={props.placeholder}
    >
      {data.map((el) => (
        <Select.Option
          value={props?.valuePassed ? el[props?.valuePassed] : el.id}
          key={el.id}
        >
          {props?.valuePassed ? el[props?.valuePassed] : el[props.field]}
        </Select.Option>
      ))}
    </Select>
  )
}
export default CustomAccountingSelect