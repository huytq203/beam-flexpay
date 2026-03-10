import { Empty, Select, Spin } from 'antd'
import { BaseSelectRef } from 'rc-select'
import React, { createRef, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import { Pagination } from '@type/table'


interface SearchSelectProps {
  placeholder?: string
  fetchData: (params: {
    page: number
    take: number
    name: string
  }) => Promise<{
    data: any[]
    meta: Pagination
  }>
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  readOnly?: boolean
  allowClear?: boolean
  searchKey?: string
  valueKey?: string
  take?: number
  field?: string
  callback?: (value: any, field: string) => void
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  placeholder,
  fetchData,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  allowClear = true,
  searchKey = 'name',
  valueKey = 'id',
  take = 10,
  field,
  callback
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [valueSearch, setValueSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [options, setOptions] = useState<any[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageCount: 1
  })
  
  const inputNumberRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = createRef<BaseSelectRef>()

  const storeData = (newData: any[], page: number) => {
    if (page === 1) {
      setOptions(newData)
    } else {
      setOptions(prev => [...prev, ...newData])
    }
  }

  const handleSearch = async (value: string) => {
    setValueSearch(value);
  
    // Clear the existing timeout if any
    if (inputNumberRef.current) {
      clearTimeout(inputNumberRef.current);
    }
  
    // Debounce the search
    inputNumberRef.current = setTimeout(async () => {
      if (!value) {
        setOptions([]);
        return;
      }
  
      setLoading(true);
  
      try {
        const query = { page: 1, take, name: value };
        const response = await fetchData(query);
  
        storeData(response.data, 1);
        setPagination(response.meta);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 500);
  }

  const handleScroll = async (event: any) => {
    const target = event.target;
  
    // Exit early if already loading or no more pages
    if (
      loading || 
      loadingMore || 
      !pagination || 
      pagination.page >= pagination.pageCount
    ) {
      return;
    }
  
    // Check if scrolled near the bottom
    const isNearBottom = target.scrollTop + target.offsetHeight > target.scrollHeight - 2;
    if (!isNearBottom) return;
  
    target.scrollTo(0, target.scrollHeight);
    setLoadingMore(true);
  
    try {
      const nextPage = pagination.page + 1;
      const query = {
        page: nextPage,
        take,
        name: valueSearch,
      };
  
      const response = await fetchData(query);
      storeData(response.data, nextPage);
      setPagination(response.meta);
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoadingMore(false);
    }
  };
  

  const renderOptions = () => {
    return (
      <>
        {options.map((item, index) => (
          <Select.Option
            value={item[valueKey]}
            key={`option-${item?.walletNumber}`}
            label={item[searchKey]}

          >
            {item[searchKey] ?? t`labels.nodata`}
          </Select.Option>
        ))}
        {loadingMore && (
          <div style={{ height: 20, textAlign: 'center' }}>
            <Spin />
          </div>
        )}
      </>
    )
  }

  return (
    <Select
      showSearch
      loading={loading}
      style={{ width: '100%' }}
      ref={ref}
      open={open}
      onFocus={() => setOpen(true)}
      popupClassName='search-select-popup'
      onDropdownVisibleChange={(open) => setOpen(open)}
      onPopupScroll={handleScroll}
      searchValue={valueSearch}
      placeholder={placeholder}
      labelInValue={true}
      onSearch={handleSearch}
      onSelect={(res) => {
        setOpen(false)
        console.log('onSelect', res?.key)
        callback && field && callback( typeof(res?.key) == 'string'? res.key.split('-')[1]: '', field)
      }}
      onClear={() => {
        console.log('onClear')
        callback && field && callback('', field)
      }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      allowClear={allowClear}
      notFoundContent={
        loading ? (
          <div className='d-flex justify-center'>
            <Spin />
          </div>
        ) : (
          <Empty description={t`labels.nodata`} />
        )
      }
      filterOption={false}
    >
      {renderOptions()}
    </Select>
  )
}

export default SearchSelect