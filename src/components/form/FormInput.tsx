import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { Input } from "../ui/Input-component";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { ReactNode } from "react";

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string|ReactNode;
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
  [key: string]: any;
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
        const { onChange: customOnChange, ...fieldRest } = rest as any;
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
              onChange={(e: any) => {
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
            onChange={(e: any) => {
              field.onChange(e);
              if (customOnChange) {
                customOnChange(e);
              }
            }}
          />
        );
      }}
    />
  );
}