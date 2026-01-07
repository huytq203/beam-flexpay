import { Controller, Control, FieldValues, Path } from "react-hook-form";
import React, { ReactNode } from "react";

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string|ReactNode;
  className?: string;
  classNameLable?:string;
  render: (field: any) => React.ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  className = "col-span-6 flex flex-col ",
  classNameLable,
  render,
}: FormFieldProps<T>) {
  return (
    <div className={className}>
      {label && <label htmlFor={name} className={classNameLable}>{label}</label>}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            {render(field)}
            {fieldState.error && (
              <p className="text-red-500">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
}