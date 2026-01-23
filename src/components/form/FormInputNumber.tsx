import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { InputNumber } from "@components/index";
import { ReactNode } from "react";

interface FormInputNumberProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string|ReactNode;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    defaultValue?: number | undefined
    [key: string]: any;
}

export function FormInputNumber<T extends FieldValues>({
    name,
    control, 
    label,
    placeholder,
    className = "col-span-6 flex flex-col",
    disabled,
    defaultValue,
    classNameLable='font-medium',
    ...rest
}: FormInputNumberProps<T>) {
    return (
        <FormField
            name={name}
            control={control}
            label={label}
            className={className}
            classNameLable={classNameLable}
            render={(field) => (
                <InputNumber
                    {...field}
                    {...rest}
                    id={field.name}
                    placeholder={placeholder}
                    disabled={disabled}
                    defaultValue={defaultValue}
                />
            )}
        />
    );
}
