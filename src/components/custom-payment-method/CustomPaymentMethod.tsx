import { useLazyGetPublicBanksQuery } from '@services/apiBankService'
import { PublicBankInterface } from '@type/bank'
import { pageEnum, viewMode } from '@type/policyManagement'
import { TreeSelect } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type IProps = {
  mode?: viewMode
  defaultMethod?: string
  handleSelectMethod: (values: number[] | string, status?: string) => void
  defaultSelected?: number[]
  module?: pageEnum
}

type SelectItem = {
  value: number
  label: string
}

function CustomPaymentMethod({
  mode,
  defaultMethod,
  handleSelectMethod,
  defaultSelected,
  module
}: IProps) {
  const { t } = useTranslation()

  const getTagsLabel = useCallback(() => {
    switch (module) {
      case pageEnum.accountBankPayment:
        return t`policy-management.depositManagement.optionLabels.allPaymentMethods`.toString()
      case pageEnum.withdrawMoney:
        return t`policy-management.depositManagement.optionLabels.allBankWithdraw`.toString()
      case pageEnum.directDeposit:
        return t`policy-management.depositManagement.optionLabels.allDepositMethods`.toString()
      default:
        return '-'
    }
  }, [module])

  const [selectedValues, setSelectedValues] = useState<number[] | string>(
    t`policy-management.depositManagement.optionLabels.all-method`.toString()
  )
  const [getPublicBanks] = useLazyGetPublicBanksQuery()
  const [banks, setBanks] = useState<SelectItem[] | undefined>()

  const getBankIds = (bankList: SelectItem[]) => {
    return bankList && bankList.map((bank) => bank.value)
  }

  const fetchData = async () => {
    const { data } = await getPublicBanks({})
    if (data && data.length > 0) {
      let bankList = data.map((bank: PublicBankInterface) => ({
        value: bank.id,
        label: bank.name
      })) as SelectItem[]
      if (pageEnum.withdrawMoney === module || pageEnum.directDeposit === module) {
        bankList = bankList.filter((bank) => bank.value === 48)
        // set default value for withdraw money and direct deposit with VP Bank
      }
      setBanks(bankList)
      setSelectedValues(getBankIds(bankList))
      handleSelectMethod(getBankIds(bankList), 'all')
    }
  }

  const handleOpenDropDown = async (open: boolean) => {
    if (open && !banks && defaultMethod === 'search') {
      fetchData()
    }
  }

  useEffect(() => {
    if (defaultMethod === 'configure') {
      fetchData()
    }
  }, [defaultMethod])

  useEffect(() => {
    if (banks) {
      if (defaultSelected && mode === viewMode.update) {
        setSelectedValues(defaultSelected)
        handleSelectMethod(defaultSelected)
      }
      if (mode === viewMode.create) {
        setSelectedValues(getBankIds(banks))
        handleSelectMethod(getBankIds(banks), 'select-all')
      }
    }
  }, [banks, defaultSelected])

  return (
    <TreeSelect
      suffixIcon
      disabled={mode === viewMode.update}
      treeNodeFilterProp='label'
      treeCheckable={true}
      showCheckedStrategy={TreeSelect.SHOW_CHILD}
      onChange={(ids) => {
        setSelectedValues(ids)
        if (banks && ids?.length === banks?.length) {
          handleSelectMethod(ids, 'all')
          return
        }
        handleSelectMethod(ids)
      }}
      value={selectedValues}
      maxTagCount={selectedValues.length === banks?.length ? 0 : 2}
      placeholder={t`policy-management.depositManagement.optionLabels.choose-method`}
      style={{ minWidth: 190 }}
      dropdownStyle={{ maxHeight: '350px', minWidth: 300 }}
      maxTagPlaceholder={(omittedValues) =>
        selectedValues === getTagsLabel() ||
        banks?.length === selectedValues?.length
          ? t`policy-management.depositManagement.optionLabels.all-method`.toString()
          : `+ ${
              omittedValues.length
            } ${t`policy-management.depositManagement.optionLabels.method`}...`
      }
      onDropdownVisibleChange={(open) => handleOpenDropDown(open)}
      treeData={
        banks
          ? [
              {
                title: (
                  <>
                    {banks && selectedValues.length === banks.length && (
                      <span
                        style={{
                          display: 'inline-block',
                          color: '#ccc',
                          cursor: 'not-allowed'
                        }}
                      >
                        {t`policy-management.depositManagement.optionLabels.all`}
                      </span>
                    )}
                    {banks && selectedValues.length < banks.length && (
                      <span
                        onClick={() => {
                          const ids = getBankIds(banks)
                          setSelectedValues(ids)
                          handleSelectMethod(ids, 'all')
                        }}
                        style={{
                          display: 'inline-block',
                          color: '#286FBE',
                          cursor: 'pointer'
                        }}
                      >
                        {t`policy-management.depositManagement.optionLabels.all`}
                      </span>
                    )}
                    &nbsp;&nbsp;&nbsp;
                    {selectedValues.length === 0 && (
                      <span
                        style={{
                          display: 'inline-block',
                          color: '#ccc',
                          cursor: 'not-allowed'
                        }}
                      >
                        {t`policy-management.depositManagement.optionLabels.all`}
                      </span>
                    )}
                    {selectedValues.length > 0 && (
                      <span
                        onClick={() => {
                          setSelectedValues([])
                          handleSelectMethod([])
                        }}
                        style={{
                          display: 'inline-block',
                          color: '#286FBE',
                          cursor: 'pointer'
                        }}
                      >
                        {t`policy-management.depositManagement.optionLabels.remove-all`}
                      </span>
                    )}
                  </>
                ),
                checkable: false,
                value: 'xxx'
              },
              ...banks
            ]
          : undefined
      }
    />
  )
}

export default CustomPaymentMethod
