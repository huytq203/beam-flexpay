import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { SelectInput } from "../ui/select-component"; // Import từ UI components của bạn
import { ReactNode } from "react";
import type { SelectProps } from "antd";

interface SelectOption {
  label: string|boolean | ReactNode;
  value: string | number | null | undefined;
}

interface FormSelectProps<T extends FieldValues>
  extends Omit<
    SelectProps,
    "name" | "value" | "onChange" | "options" | "defaultValue" | "className"
  > {
  name: Path<T>;
  control: Control<T>;
  label?: string | ReactNode;
  options: SelectOption[];
  defaultValue?: string | number;
  className?: string;
  classNameLable?: string;
  hidden?: boolean;
  required?:boolean
  onChange?: (value: string | number) => void;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  required,
  defaultValue,
  classNameLable = "font-medium",
  className = "col-span-6 flex flex-col",
  ...rest
}: FormSelectProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      required={required}
      classNameLable={classNameLable}
      className={className}
      render={(field) => {
        const { onChange: customOnChange, allowClear = true, ...fieldRest } = rest
        // Extract onChange from field to prevent it from overriding handleChange in SelectInput
        const { onChange: fieldOnChange, ...fieldWithoutOnChange } = field
        return (
          <SelectInput
            {...fieldWithoutOnChange}
            {...fieldRest}
            id={field.name}
            allowClear={allowClear} 
            defaultValue={defaultValue}
            data={options}
            handleChange={(value) => {
              fieldOnChange(value)
              if (customOnChange) {
                customOnChange(value)
              }
            }}
          />
        )
      }}
    />
  );
}
