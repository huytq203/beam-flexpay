import ButtonSearch from "@components/button-search/ButtonSearch";
import SearchBar from "@components/search-bar/SearchBar";
import TransactionTable from "@components/transaction-table/TransactionTable";
import { GUTTER } from "@constants/appConstant";
import { TimeFormat } from "@constants/datetime";
import { TransactionFindAllApiArg } from "@type/application";
import { TransactionStatus, TransactionType } from "@type/transfer";
import { Card, Col, DatePicker, Form, Input, Row, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

interface CustomerHistoryProps {
  historySearch: TransactionFindAllApiArg;
  setHistorySearch: (search: TransactionFindAllApiArg) => void;
}

interface HistoryFormValues {
  referenceId?: string;
  accountNumber?: string;
  from?: Dayjs;
  to?: Dayjs;
  type?: string;
  status?: string;
}

const CustomerHistoryTab = (props: CustomerHistoryProps) => {
  const { t: trans } = useTranslation();
  const { historySearch, setHistorySearch } = props;
  const [searchForm] = Form.useForm<HistoryFormValues>();

  /**
   * Clean and format form values for API request
   */
  const formatFormValues = (values: HistoryFormValues): any => {
    const cleanValue = (value: string | undefined): string | undefined => {
      return value === '' || value === undefined ? undefined : value.trim();
    };
    
    return {
      ...historySearch,
      referenceId: cleanValue(values.referenceId),
      from: values.from ? values.from.startOf('day').toISOString() : undefined,
      to: values.to ? values.to.endOf('day').toISOString() : undefined,
      status: values.status === '' ? undefined : values.status,
      type: values.type === '' ? undefined : values.type,
      page: 1,
      take: 10
    };
  };

  /**
   * Handle search form submission
   */
  const handleSearch = useCallback((values: HistoryFormValues) => {
    const formattedValues = formatFormValues(values);
    setHistorySearch(formattedValues);
  }, [historySearch.accountNumber, setHistorySearch]);

  /**
   * Clear a specific field and refresh data
   */
  const clearFieldAndRefresh = useCallback((field: keyof TransactionFindAllApiArg) => {
    setHistorySearch({
      ...historySearch,
      page: 1,
      [field]: undefined
    });
  }, [historySearch, setHistorySearch]);

  /**
   * Handle blur event for text inputs
   */
  const handleBlur = useCallback((field: keyof HistoryFormValues, value: string) => {
    searchForm.setFieldValue(field, value.trim());
  }, [searchForm]);

  /**
   * Handle input change for text fields
   */
  const handleInputChange = useCallback((field: keyof TransactionFindAllApiArg, value: string) => {
    if (value === '' || value === undefined) {
      clearFieldAndRefresh(field);
    }
  }, [clearFieldAndRefresh]);

  /**
   * Handle date picker clear
   */
  const handleDateClear = useCallback((field: keyof TransactionFindAllApiArg) => {
    clearFieldAndRefresh(field);
  }, [clearFieldAndRefresh]);

  return (
    <>
      <h3 className='mb-16'>{trans('customer.transaction')}</h3>
      <Card
        title={
          <SearchBar
            headerMenu={
              <Form
                form={searchForm}
                className='w-100'
                layout='vertical'
                onFinish={handleSearch}
                initialValues={{
                  status: '',
                  type: ''
                }}
              >
                <Row gutter={GUTTER}>
                  {/* Reference ID Field */}
                  <Col flex='auto'>
                    <Form.Item
                      label={trans('transfer-history.transferNumber')}
                      name='referenceId'
                    >
                      <Input
                        allowClear
                        className='w-100'
                        placeholder={trans('transfer-history.placeholders.code').toString()}
                        onBlur={(e) => handleBlur('referenceId', e.target.value)}
                        onChange={(e) => handleInputChange('referenceId', e.target.value)}
                      />
                    </Form.Item>
                  </Col>

                  {/* From Date Field */}
                  <Col flex='140px'>
                    <Form.Item
                      label={trans('transfer-history.from')}
                      name='from'
                    >
                      <DatePicker
                        allowClear
                        format={TimeFormat}
                        className='w-100'
                        placeholder={trans('transfer-history.placeholders.from').toString()}
                        disabledDate={(current) =>
                          current > dayjs() ||
                          current >= dayjs(searchForm.getFieldValue('to'), 'YYYY-MM-DD')
                        }
                        onChange={(date) => {
                          if (!date) handleDateClear('from');
                        }}
                      />
                    </Form.Item>
                  </Col>

                  {/* To Date Field */}
                  <Col flex='140px'>
                    <Form.Item
                      label={trans('transfer-history.to')}
                      name='to'
                    >
                      <DatePicker
                        allowClear
                        className='w-100'
                        format={TimeFormat}
                        disabledDate={(current) =>
                          current > dayjs() ||
                          current < dayjs(searchForm.getFieldValue('from'), 'YYYY-MM-DD')
                        }
                        placeholder={trans('transfer-history.placeholders.to').toString()}
                        onChange={(date) => {
                          if (!date) handleDateClear('to');
                        }}
                      />
                    </Form.Item>
                  </Col>

                  {/* Transaction Type Field */}
                  <Col flex='220px'>
                    <Form.Item
                      label={trans('transfer-history.transferType')}
                      name='type'
                    >
                      <Select
                        placeholder={trans('transfer-history.placeholders.type')}
                        options={[
                          { label: trans('transfer-history.choice.all'), value: '' },
                          { label: trans('transfer-history.types.deposit'), value: TransactionType.DEPOSIT },
                          { label: trans('transfer-history.types.transfer'), value: TransactionType.TRANSFER },
                          { label: trans('transfer-history.types.payment'), value: TransactionType.PAYMENT },
                          { label: trans('transfer-history.types.withdraw'), value: TransactionType.WITHDRAW },
                          { label: trans('transfer-history.types.receive'), value: TransactionType.RECEIVAL }
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  {/* Status Field */}
                  <Col flex='220px'>
                    <Form.Item
                      label={trans('transfer-history.status')}
                      name='status'
                    >
                      <Select
                        options={[
                          { label: trans('transfer-history.choice.all'), value: '' },
                          { label: trans('transfer-history.choice.success'), value: TransactionStatus.SUCCESS },
                          { label: trans('transfer-history.choice.inprogress'), value: TransactionStatus.PENDING },
                          { label: trans('transfer-history.choice.approved'), value: TransactionStatus.APPROVED },
                          { label: trans('transfer-history.choice.reject'), value: TransactionStatus.FAILED }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Search Button */}
                <Row justify='end' gutter={GUTTER}>
                  <Col>
                    <ButtonSearch htmlType='submit' />
                  </Col>
                </Row>
              </Form>
            }
          />
        }
      >
        <TransactionTable
          search={historySearch}
          setSearch={setHistorySearch}
          skip={!historySearch.accountNumber}
        />
      </Card>
    </>
  );
};

export default CustomerHistoryTab;