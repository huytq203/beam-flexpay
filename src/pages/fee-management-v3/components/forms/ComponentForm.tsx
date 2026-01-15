// ============================================
// ComponentForm - Fee Component Form (Refactored from 455-line FormAddFeeComponent)
// ============================================
// Split into smaller, focused components with clear responsibilities
// ============================================

import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useMemo,
  useCallback
} from 'react'
import { Card, Table } from 'antd'
import { ButtonComponent, DialogModal } from '@components/common'
import { PlusOutlined } from '@ant-design/icons'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInputNumber, FormSelect } from '@components/form'
import { useMessage } from '@hooks/useMessage'

import { FeeComponentSchema, type FeeComponentFormValues } from '../../schemas'
import { useEnumOptions, useBaseOnOptions } from '../../hooks'
import { useFeeTier } from '../../hooks/useFeeTier'
import { getTierColumns } from '../tables/TierColumns'
import type { FeeComponent, FeeTier, ComponentFormRef } from '../../types'
import { isTierBasedMethod } from '../../types'

// API imports
import {
  useDeleteFeeComponentTierMutation,
  usePostFeeComponentTierMutation,
  usePutFeeComponentTierMutation
} from '@services/apiFeeComponentTier'

// ============================================
// Constants
// ============================================
const DEFAULT_TIER: FeeTier = {
  minFee: undefined,
  maxFee: undefined,
  fixedAmount: undefined,
  percentage: undefined,
  maxValue: undefined,
  minValue: undefined
}

const DEFAULT_VALUES: FeeComponentFormValues = {
  componentType: '',
  baseOn: '',
  payerType: '',
  beneficiaryType: '',
  roundMode: '',
  calculationMethod: 'DIRECT',
  tiers: [DEFAULT_TIER],
  fixedAmount: undefined,
  percentage: undefined,
  minFee: undefined,
  maxFee: undefined
}

// ============================================
// Props Interface
// ============================================
interface ComponentFormProps {
  initialData?: FeeComponent | null
  onSubmit?: (data: FeeComponentFormValues) => Promise<string | undefined | void> | void
}

// ============================================
// Sub-Components
// ============================================

// General Info Section
interface GeneralInfoSectionProps {
  control: ReturnType<typeof useForm<FeeComponentFormValues>>['control']
  isUpdateMode: boolean
  isVATType: boolean
}

const GeneralInfoSection = React.memo<GeneralInfoSectionProps>(({
  control,
  isUpdateMode,
  isVATType
}) => {
  const {
    componentTypeOptions,
    payerTypeOptions,
    beneficiaryTypeOptions,
    roundModeOptions,
    calculationMethodOptions
  } = useEnumOptions()

  const baseOnOptions = useBaseOnOptions(isUpdateMode)

  return (
    <Card className="mb-3" style={{ width: '100%' }}>
      <p className="font-bold mb-1">Thông tin chung</p>
      <div className="grid grid-cols-12 gap-3 px-2">
        <FormSelect<FeeComponentFormValues>
          control={control}
          name="componentType"
          label="Loại phí"
          className="col-span-4 flex flex-col"
          options={componentTypeOptions}
          placeholder="Chọn loại phí"
          disabled={isUpdateMode}
        />
        <FormSelect<FeeComponentFormValues>
          control={control}
          name="baseOn"
          label="Tính dựa trên"
          className="col-span-4 flex flex-col"
          options={baseOnOptions}
          placeholder="Chọn loại tính phí"
        />
        <FormSelect<FeeComponentFormValues>
          control={control}
          name="payerType"
          label="Người chịu"
          className="col-span-4 flex flex-col"
          options={payerTypeOptions}
          placeholder="Chọn người chịu phí"
          disabled={isUpdateMode}
        />
        <FormSelect<FeeComponentFormValues>
          control={control}
          name="beneficiaryType"
          label="Người hưởng"
          className="col-span-4 flex flex-col"
          options={beneficiaryTypeOptions}
          placeholder="Chọn người hưởng phí"
        />
        <FormSelect<FeeComponentFormValues>
          control={control}
          name="roundMode"
          label="Công thức làm tròn"
          className="col-span-4 flex flex-col"
          options={roundModeOptions}
          placeholder="Chọn công thức làm tròn"
        />
        {!isVATType && (
          <FormSelect<FeeComponentFormValues>
            control={control}
            name="calculationMethod"
            label="Chọn phương thức tính"
            className="col-span-4 flex flex-col"
            options={calculationMethodOptions}
            disabled={isUpdateMode}
          />
        )}
      </div>
    </Card>
  )
})

GeneralInfoSection.displayName = 'GeneralInfoSection'

// VAT Form Section
interface VATFormSectionProps {
  control: ReturnType<typeof useForm<FeeComponentFormValues>>['control']
}

const VATFormSection = React.memo<VATFormSectionProps>(({ control }) => (
  <Card>
    <p className="font-bold mb-3">Phương thức tính (Calculation Method)</p>
    <FormInputNumber
      control={control}
      name="percentage"
      label="Phí phần trăm (%)"
      className="col-span-3 flex flex-col gap-2"
      placeholder="0%"
      classNameLable="font-medium"
    />
  </Card>
))

VATFormSection.displayName = 'VATFormSection'

// Direct Calculation Section
interface DirectCalculationSectionProps {
  control: ReturnType<typeof useForm<FeeComponentFormValues>>['control']
}

const DirectCalculationSection = React.memo<DirectCalculationSectionProps>(({ control }) => (
  <Card>
    <div className="grid grid-cols-12 gap-3">
      <FormInputNumber
        control={control}
        name="fixedAmount"
        label="Phí cố định (Fixed)"
        className="col-span-3 flex flex-col gap-2"
        placeholder="0"
        classNameLable="font-medium"
      />
      <FormInputNumber
        control={control}
        name="percentage"
        label="Phí phần trăm (%)"
        className="col-span-3 flex flex-col gap-2"
        placeholder="0%"
        classNameLable="font-medium"
      />
      <FormInputNumber
        control={control}
        name="minFee"
        label="Tối thiểu (Min)"
        className="col-span-3 flex flex-col gap-2"
        placeholder="0"
        classNameLable="font-medium"
      />
      <FormInputNumber
        control={control}
        name="maxFee"
        label="Tối đa (Max)"
        className="col-span-3 flex flex-col gap-2"
        placeholder="0"
        classNameLable="font-medium"
      />
    </div>
  </Card>
))

DirectCalculationSection.displayName = 'DirectCalculationSection'

// Tier Table Section
interface TierTableSectionProps {
  control: ReturnType<typeof useForm<FeeComponentFormValues>>['control']
  fields: ReturnType<typeof useFieldArray>['fields']
  getValues: ReturnType<typeof useForm<FeeComponentFormValues>>['getValues']
  onAddTier: () => void
  onDeleteTier: (index: number, id?: string) => void
}

const TierTableSection = React.memo<TierTableSectionProps>(({
  control,
  fields,
  getValues,
  onAddTier,
  onDeleteTier
}) => {
  const columns = useMemo(
    () => getTierColumns({ control, getValues, onDeleteTier }),
    [control, getValues, onDeleteTier]
  )

  return (
    <>
      <Table
        columns={columns}
        dataSource={fields}
        pagination={false}
        bordered
        size="small"
        rowKey="id"
      />
      <ButtonComponent
        content=" Thêm khoảng phí (Add Tier)"
        type="dashed"
        onClick={onAddTier}
        style={{ width: '100%', marginTop: 16 }}
        icon={<PlusOutlined />}
      />
    </>
  )
})

TierTableSection.displayName = 'TierTableSection'

// ============================================
// Main Component
// ============================================
const ComponentForm = forwardRef<ComponentFormRef, ComponentFormProps>(
  ({ onSubmit, initialData }, ref) => {
    // Form setup
    const {
      control,
      handleSubmit,
      watch,
      getValues,
      reset,
      formState: { errors }
    } = useForm<FeeComponentFormValues>({
      resolver: zodResolver(FeeComponentSchema),
      defaultValues: DEFAULT_VALUES,
      shouldUnregister: true
    })

    // Field array for tiers
    const { fields, append, remove } = useFieldArray({
      control,
      name: 'tiers'
    })

    // State
    const [openDialog, setOpenDialog] = useState(false)
    const [deleteComponentId, setDeleteComponentId] = useState<string>('')

    // Hooks
    const { successMess, errorMess } = useMessage()

    // API mutations for tiers
    const [postFeeComponentTier] = usePostFeeComponentTierMutation()
    const [putFeeComponentTier] = usePutFeeComponentTierMutation()
    const [deleteFeeComponentTier, { isLoading: isDeleteLoading }] =
      useDeleteFeeComponentTierMutation()

    // Derived state
    const isUpdateMode = !!(initialData as FeeComponent)?.id
    const componentTypes = watch('componentType')
    const calculationMethod = watch('calculationMethod')
    const isVATType = componentTypes === 'VAT'
    const isTierMode = isTierBasedMethod(String(calculationMethod))

    // Sync initial data
    useEffect(() => {
      if (initialData) {
        const dataToReset = { ...initialData }
        if (!dataToReset.tiers || dataToReset.tiers.length === 0) {
          dataToReset.tiers = [DEFAULT_TIER]
        }
        reset(dataToReset as FeeComponentFormValues)
      } else {
        reset(DEFAULT_VALUES)
      }
    }, [initialData, reset])

    // Handlers
    const handleDeleteTier = useCallback(async (id?: string) => {
      try {
        if (id) {
          await deleteFeeComponentTier(id).unwrap()
        }
        setOpenDialog(false)
        successMess('Xóa thành công')
      } catch (error) {
        errorMess('Xóa thất bại')
      }
    }, [deleteFeeComponentTier, successMess, errorMess])

    const handleUpdateTier = useCallback(async () => {
      const allTiers = getValues('tiers')
      const feeComponentId = (initialData as FeeComponent)?.id
      const roundModeVal = getValues('roundMode')

      if (!allTiers || allTiers.length === 0) return

      const payload = allTiers.map((tierData) => ({
        feeComponentId,
        minValue: tierData.minValue ?? 0,
        maxValue: tierData.maxValue ?? 0,
        roundMode: roundModeVal,
        minFee: tierData.minFee ?? 0,
        maxFee: tierData.maxFee ?? 0,
        fixedAmount: tierData.fixedAmount ?? 0,
        percentage: tierData.percentage ?? 0
      }))

      await putFeeComponentTier({ body: payload }).unwrap()
    }, [getValues, initialData, putFeeComponentTier])

    const handleSubmitAllTiers = useCallback(async (feeComponentId?: string) => {
      const allTiers = getValues('tiers')
      const roundModeVal = getValues('roundMode')
      const componentId = feeComponentId || (initialData as FeeComponent)?.id

      if (!componentId) {
        errorMess('Không có feeComponentId')
        return
      }

      if (!allTiers || allTiers.length === 0) {
        errorMess('Không có dữ liệu tier để thêm')
        return
      }

      try {
        const payload = allTiers.map((tierData) => ({
          feeComponentId: componentId,
          minValue: tierData.minValue ?? 0,
          maxValue: tierData.maxValue ?? 0,
          roundMode: roundModeVal,
          minFee: tierData.minFee ?? 0,
          maxFee: tierData.maxFee ?? 0,
          fixedAmount: tierData.fixedAmount ?? 0,
          percentage: tierData.percentage ?? 0
        }))

        await postFeeComponentTier(payload).unwrap()
        successMess('Thêm mới thành công')
      } catch (error) {
        errorMess('Thêm mới thất bại')
      }
    }, [getValues, initialData, postFeeComponentTier, successMess, errorMess])

    const onDeleteTier = useCallback((index: number, id?: string) => {
      if (id) {
        setDeleteComponentId(id)
        setOpenDialog(true)
      } else {
        remove(index)
      }
    }, [remove])

    const onAddTier = useCallback(() => {
      append(DEFAULT_TIER)
    }, [append])

    // Imperative handle for parent components
    useImperativeHandle(ref, () => ({
      submit: async () => {
        handleSubmit(
          async (data) => {
            if (onSubmit) {
              await onSubmit(data)
            }
          },
          (errors) => {
            console.log('Validation Errors:', errors)
          }
        )()
      },
      update: async () => {
        await handleSubmit(
          async (data) => {
            try {
              const promises: Promise<unknown>[] = []

              if (onSubmit) {
                promises.push(onSubmit(data) as Promise<unknown>)
              }
              if (isTierMode) {
                promises.push(handleUpdateTier())
              }

              await Promise.all(promises)
              successMess('Cập nhật phí thành công')
            } catch (error: unknown) {
              const err = error as { data?: { detail?: string } }
              errorMess(err?.data?.detail || 'Cập nhật thất bại')
            }
          },
          (errors) => {
            console.log('Validation Errors:', errors)
          }
        )()
      },
      reset: () => reset(DEFAULT_VALUES),
      submitAllTiers: handleSubmitAllTiers,
      updateAllTiers: handleUpdateTier
    }), [handleSubmit, onSubmit, isTierMode, handleUpdateTier, handleSubmitAllTiers, reset, successMess, errorMess])

    // Render logic
    const renderCalculationSection = () => {
      if (isVATType) {
        return <VATFormSection control={control} />
      }

      // Don't show tier form in create mode
      if (isTierMode && !isUpdateMode) {
        return null
      }

      if (isTierMode && isUpdateMode) {
        return (
          <Card className="mb-3" style={{ width: '100%' }}>
            <p className="font-bold mb-3">Phương thức tính (Calculation Method)</p>
            <TierTableSection
              control={control}
              fields={fields}
              getValues={getValues}
              onAddTier={onAddTier}
              onDeleteTier={onDeleteTier}
            />
          </Card>
        )
      }

      return (
        <Card className="mb-3" style={{ width: '100%' }}>
          <p className="font-bold mb-3">Phương thức tính (Calculation Method)</p>
          <DirectCalculationSection control={control} />
        </Card>
      )
    }

    return (
      <div className="overflow-auto">
        <GeneralInfoSection
          control={control}
          isUpdateMode={isUpdateMode}
          isVATType={isVATType}
        />

        {renderCalculationSection()}

        <DialogModal
          open={openDialog}
          onOk={() => handleDeleteTier(deleteComponentId)}
          onCancel={() => setOpenDialog(false)}
          confirmLoading={isDeleteLoading}
          content="Bạn có xác nhận xóa?"
        />
      </div>
    )
  }
)

ComponentForm.displayName = 'ComponentForm'

export default ComponentForm
