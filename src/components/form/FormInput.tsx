import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { Input } from "../ui/Input-component";
import { ReactNode } from "react";
import type { InputProps } from "antd";

interface FormInputProps<T extends FieldValues>
  extends Omit<
    InputProps,
    "name" | "value" | "type" | "prefix" | "className" | "ref"
  > {
  name: Path<T>;
  control: Control<T>;
  label?: string | ReactNode;
  placeholder?: string;
  className?: string; // For the wrapper (grid positioning)
  inputClassName?: string; // For the input element itself
  disabled?: boolean;
  type?: string;
  classNameLable?: string;
  prefix?: React.ReactNode; // Icon or element to display at the beginning
  // Password specific props
  passwordConfig?: {
    iconRender?: (visible: boolean) => React.ReactNode;
    visibilityToggle?: boolean;
  };
  trim?: boolean;
  trimOn?: "change" | "blur";
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  className = "col-span-6 flex flex-col", // Wrapper default
  inputClassName = "", // Input default
  disabled,
  type,
  classNameLable = 'font-medium',
  prefix,
  passwordConfig,
  trim = true,
  trimOn = "blur",
  ...rest
}: FormInputProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className} // This goes to FormField wrapper div
      classNameLable={classNameLable}
      render={(field) => {
        const { onChange: customOnChange, onBlur: customOnBlur, ...fieldRest } = rest;
        if (type === 'password') {
          return (
            <Input.Password
              {...field}
              {...fieldRest}
              id={field.name}
              placeholder={placeholder}
              disabled={disabled}
              className={inputClassName} // This goes to Input element
              prefix={prefix}
              iconRender={passwordConfig?.iconRender}
              visibilityToggle={passwordConfig?.visibilityToggle ?? true}
              onChange={(e) => {
                field.onChange(e);
                if (customOnChange) {
                  customOnChange(e);
                }
              }}
            />
          );
        }
        return (
          <Input
            {...field}
            {...fieldRest}
            id={field.name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClassName} // This goes to Input element
            prefix={prefix}
            onChange={(e) => {
              let value = e.target.value;

              if (trim && trimOn === "change") {
                value = value.trim();
              }

              field.onChange(value);

              if (customOnChange) {
                customOnChange(e);
              }
            }}
            onBlur={(e) => {
              if (trim && trimOn === "blur") {
                field.onChange(e.target.value.trim());
              }
              // Giữ lại onBlur của react-hook-form (đánh dấu touched) và của
              // caller — trước đây cả hai đều bị handler này ghi đè mất.
              field.onBlur();
              customOnBlur?.(e);
            }}
          />
        );
      }}
    />
  );
}