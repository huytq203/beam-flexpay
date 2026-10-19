import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { InputNumber } from "@components/index";
import type { InputNumberProps } from "antd";
import { ReactNode } from "react";
import { formatThousands, parseThousands } from "@utils/format-number-input";

interface FormInputNumberProps<T extends FieldValues>
    extends Omit<InputNumberProps, "name" | "value" | "defaultValue" | "className" | "ref"> {
    name: Path<T>;
    control: Control<T>;
    label?: string|ReactNode;
    placeholder?: string;
    className?: string;
    classNameLable?: string;
    disabled?: boolean;
    defaultValue?: number | undefined
    /**
     * Ô để trống giữ nguyên trạng rỗng thay vì rơi về 0. Dùng cho ô lọc, nơi
     * "không nhập" nghĩa là không đặt cận — khác ô nhập số tiền trong form,
     * nơi 0 là giá trị khởi điểm hợp lệ.
     */
    allowEmpty?: boolean
    /**
     * Không in lỗi dưới ô mà chỉ đổi viền sang đỏ; chỗ hiển thị lỗi do nơi dùng đảm nhiệm
     * (ví dụ một dòng lỗi chung cho cả hàng của bảng).
     */
    hideError?: boolean
    /** Ép viền lỗi khi lỗi thuộc về một nhóm ô, không riêng ô này. */
    invalid?: boolean
    /** Xem `FormField.idPrefix`. */
    idPrefix?: string
    /** Hiển thị dấu phẩy phân cách hàng nghìn; giá trị lưu trong form vẫn là số. */
    thousandSeparator?: boolean
}

export function FormInputNumber<T extends FieldValues>({
    name,
    control, 
    label,
    placeholder,
    className = "col-span-6 flex flex-col",
    disabled,
    defaultValue=0,
    allowEmpty=false,
    hideError=false,
    invalid=false,
    idPrefix,
    classNameLable='font-medium',
    thousandSeparator=false,
    ...rest
}: FormInputNumberProps<T>) {
    const fallback = allowEmpty ? undefined : defaultValue
    return (
        <FormField
            name={name}
            control={control}
            label={label}
            className={className}
            classNameLable={classNameLable}
            hideError={hideError}
            idPrefix={idPrefix}
            render={(field, fieldState) => (
                <InputNumber
                    {...field}
                    {...(thousandSeparator
                        ? { formatter: formatThousands, parser: parseThousands }
                        : {})}
                    {...rest}
                    id={idPrefix ? `${idPrefix}-${field.name}` : field.name}
                    status={invalid || (hideError && fieldState.error) ? 'error' : rest.status}
                    aria-invalid={invalid || Boolean(fieldState.error) || undefined}
                    placeholder={placeholder}
                    disabled={disabled}
                    defaultValue={fallback}
                    value={field.value ?? fallback}
                />
            )}
        />
    );
}
