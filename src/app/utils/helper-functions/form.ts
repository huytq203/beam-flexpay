import type { KeyboardEvent } from 'react'
import { forOwn, fromPairs } from 'lodash'

export const blockLetterValue = (event: KeyboardEvent<HTMLInputElement>) => {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
  if (!numbers.includes(event.nativeEvent.key.toString())) {
    event.preventDefault()
  }
}

export const blockArrowValue = (event: KeyboardEvent<HTMLInputElement>) => {
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.stopPropagation()
  }
}

export const blockLetterDecimal = (
  event: KeyboardEvent<HTMLInputElement>
) => {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  if (!numbers.includes(event.nativeEvent.key.toString())) {
    event.preventDefault()
  }
}

export const blockLetterDecimalAndDot = (
  event: KeyboardEvent<HTMLInputElement>
) => {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
  if (!numbers.includes(event.nativeEvent.key.toString())) {
    event.preventDefault()
  }
}

export const convertValueCheckbox = (value: boolean | number): string => {
  return value ? '1' : '0'
}

export interface Data {
  [key: string]: unknown
}

export const formDataToObject = (formData: FormData): Data => {
  return fromPairs(Array.from(formData.entries()))
}

export const compareFormData = (
  formData: FormData,
  initData: Data
): string[] => {
  const formDataObject = formDataToObject(formData)
  const differentFields: string[] = []

  forOwn(formDataObject, (value, key) => {
    if (key === 'bigImage') return
    if (value != initData[key]) differentFields.push(key)
  })

  return differentFields
}

export const normalizeText = (text: string): string => {
  if (!text) return text
  return text
    .replace(/[\uff01-\uff5e]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0xfee0)
    )
    .replace(/\u3000/g, ' ')
    .trim()
}

export interface SelectOption {
  label: string
  value: string
}

export const mapEnumToSelectOptions = <
  T extends Record<string, string | boolean>
>(enumObject: T): SelectOption[] => {
  return Object.entries(enumObject).map(([key, value]) => ({
    label: String(value),
    value: key
  }))
}
