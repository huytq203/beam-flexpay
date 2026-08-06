import {
  Controller,
  Control,
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
  render: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode
}

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  className = 'col-span-6 flex flex-col ',
  classNameLable,
  required = false,
  render
}: FormFieldProps<T>) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
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
            {render(field)}
            {fieldState.error && (
              <p className='text-red-500'>{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  )
}
