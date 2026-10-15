import {
  Controller,
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path
} from 'react-hook-form'
import React, { ReactNode } from 'react'

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label?: string | ReactNode
  className?: string
  classNameLable?: string
  required?: boolean
  /**
   * Không in thông báo lỗi ngay dưới ô. Dùng khi chỗ chứa quá hẹp (ô trong bảng) và lỗi được
   * hiển thị ở nơi khác; ô vẫn nhận `fieldState` để tự đánh dấu viền lỗi.
   */
  hideError?: boolean
  /**
   * Tiền tố cho id của ô và dòng lỗi. Cần khi một màn có hai form cùng tên trường, để nhãn
   * không trỏ nhầm sang ô của form kia.
   */
  idPrefix?: string
  render: (
    field: ControllerRenderProps<T, Path<T>>,
    fieldState: ControllerFieldState,
    errorId?: string
  ) => React.ReactNode
}

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  className = 'col-span-6 flex flex-col ',
  classNameLable,
  required = false,
  hideError = false,
  idPrefix,
  render
}: FormFieldProps<T>) {
  const id = idPrefix ? `${idPrefix}-${String(name)}` : String(name)
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={`${classNameLable} inline-flex items-center`}
        >
          {label}
          {required && <span className='text-red-600 ml-1'>*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            {render(
              field,
              fieldState,
              fieldState.error && !hideError ? `${id}-error` : undefined
            )}
            {fieldState.error && !hideError && (
              <p
                className='text-red-500'
                id={`${id}-error`}
                role='alert'
              >
                {fieldState.error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  )
}
