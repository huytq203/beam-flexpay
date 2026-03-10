import { Rule } from "antd/es/form";

export const modalConfig = {
  maskClosable: false,
  footer: null,
  destroyOnClose: true,
  centered: true
}


export const numberValidation: Rule[] = [
  {
    pattern: /^[0-9]+$/,
    message: "Vui lòng nhập số",
  },
];

export const numberAndDotValidation: Rule[] = [
  {
    pattern: /^[0-9.]+$/,
    message: "Vui lòng nhập số hoặc dấu chấm",
  },
];
