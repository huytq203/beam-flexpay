import { useState } from 'react'
import useDebounce from '@hooks/useDebounce'
import type { PickerSearchParams } from './picker.types'

export interface PickerSearchState {
  page: number
  size: number
  name: string
  code: string
  params: PickerSearchParams
  setName: (value: string) => void
  setCode: (value: string) => void
  changePage: (nextPage: number, nextSize: number) => void
}

export const usePickerSearch = (): PickerSearchState => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [name, setNameValue] = useState('')
  const [code, setCodeValue] = useState('')
  const debouncedName = useDebounce(name.trim(), 400)
  const debouncedCode = useDebounce(code.trim(), 400)

  return {
    page,
    size,
    name,
    code,
    params: {
      page,
      size,
      name: debouncedName || undefined,
      code: debouncedCode || undefined
    },
    setName: (value) => {
      setNameValue(value)
      setPage(1)
    },
    setCode: (value) => {
      setCodeValue(value)
      setPage(1)
    },
    changePage: (nextPage, nextSize) => {
      setPage(nextSize !== size ? 1 : nextPage)
      setSize(nextSize)
    }
  }
}
