import { PageMetaDto, PageMetaSearchDto } from '@type/application'
import { Select, SelectProps } from 'antd'
import React, { useEffect, useState } from 'react'

/** Một option trả về từ API: luôn có `id`, và `field` trỏ tới nhãn hiển thị. */
interface CustomSelectOption {
  id: string | number
  [key: string]: React.ReactNode
}

/** Kết quả của lazy trigger (RTK Query) mà component này mong đợi. */
interface CustomSelectTriggerResult {
  data: {
    data: CustomSelectOption[]
    meta: PageMetaDto
  }
}

interface CustomSelectType<T extends PageMetaSearchDto> extends SelectProps {
  trigger: (search: T) => Promise<CustomSelectTriggerResult>
  search: T
  field: string
  readonly?: boolean
}
function CustomSelect<T extends PageMetaSearchDto>(props: CustomSelectType<T>) {
  const [data, setData] = useState<CustomSelectOption[]>([])
  const [meta, setMeta] = useState<PageMetaDto>({
    hasNextPage: false,
    hasPreviousPage: false,
    itemCount: 0,
    page: 1,
    take: 10,
    pageCount: 1
  })
  const { trigger, search, field, readonly: _readonly, ...selectProps } = props; // Loại bỏ các props không cần thiết
  const [_search, setSearch] = useState<T>(search)

  const handleScroll: React.UIEventHandler<HTMLDivElement> = async (e) => {
    const target = e.target
    if (!(target instanceof HTMLElement)) return
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
      setData([...data, ...result.data.data])
      setMeta(result.data.meta)
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
