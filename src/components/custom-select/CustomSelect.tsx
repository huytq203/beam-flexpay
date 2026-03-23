import { PageMetaDto, PageMetaSearchDto } from '@type/application'
import { Select, SelectProps } from 'antd'
import { useEffect, useState } from 'react'

interface CustomSelectType<T extends PageMetaSearchDto> extends SelectProps {
  trigger: any
  search: T
  field: string
  readonly?: boolean
}
function CustomSelect<T extends PageMetaSearchDto>(props: CustomSelectType<T>) {
  const [data, setData] = useState<any[]>([])
  const [meta, setMeta] = useState<PageMetaDto>({
    hasNextPage: false,
    hasPreviousPage: false,
    itemCount: 0,
    page: 1,
    take: 10,
    pageCount: 1
  })
  const { trigger, search, field, readonly, ...selectProps } = props; // Loại bỏ các props không cần thiết
  const [_search, setSearch] = useState<T>(search)

  const handleScroll = async (e: any) => {
    const target = e.target
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (meta.hasNextPage)
        setSearch({
          ..._search,
          page: _search.page + 1
        })
    }
  }

  const handleSearch = (value: string) => {
    if (!value) setSearch(search)
    const asyncData = Promise.resolve(setData([]))
    asyncData.then(() =>
      setSearch({
        ..._search,
        page: 1,
        [field]: value
      })
    )
  }

  const getData = () => {
    trigger(_search).then((result) => {
      setData([...data, ...(result.data as any).data])
      setMeta((result.data as any).meta)
    }).catch(error => {
      console.error("Error fetching data:", error);
    });
  }

  useEffect(() => {
    getData()
  }, [_search])

  return (
    <Select
      allowClear
      showSearch
      onPopupScroll={handleScroll}
      onSearch={handleSearch}
      suffixIcon={null}
      filterOption={false}
      {...selectProps}
    >
      {data.map((el) => (
        <Select.Option
          value={el.id}
          key={el.id}
        >
          {el[field]}
        </Select.Option>
      ))}
    </Select>
  )
}
export default CustomSelect
