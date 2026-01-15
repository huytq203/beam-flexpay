export interface SelectOption {
  label: string;
  value: string | boolean;
}

export const mapEnumToSelectOptions = <
  T extends Record<string, string | boolean>
>(
  enumObject: T
): SelectOption[] => {
  return Object.entries(enumObject).map(([key, value]) => ({
    label: String(value), // đảm bảo label là string
    value: key
  }));
};
