import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { TextArea } from "../ui/textarea-component"; // Giả sử bạn có export TextArea
import { ReactNode } from "react";
import type { TextAreaProps } from "antd/es/input/TextArea";

interface FormTextAreaProps<T extends FieldValues>
  extends Omit<TextAreaProps, "name" | "onChange" | "onBlur" | "value" | "ref"> {
  name: Path<T>;
  control: Control<T>;
  label?: string | ReactNode;
  placeholder?: string;
  rows?: number;
  className?: string;
  classNameLable?: string;
  disabled?: boolean;
  trim?: boolean;
  trimOn?: "change" | "blur";
}

export function FormTextArea<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  rows = 4,
  className = "col-span-12 flex flex-col",
  disabled,
  classNameLable = 'font-medium',
  trim = true,
  trimOn = "blur",
  ...rest
}: FormTextAreaProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className}
      classNameLable={classNameLable}
      render={(field) => (
        <TextArea
          {...field}
          {...rest}
          id={field.name}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          onChange={(e) => {
            let value = e.target.value;

            if (trim && trimOn === "change") {
              value = value.trim();
            }
            field.onChange(value);
          }}
          onBlur={(e) => {
            if (trim && trimOn === "blur") {
              field.onChange(e.target.value.trim());
            }
          }}
        />
      )}
    />
  );
}
