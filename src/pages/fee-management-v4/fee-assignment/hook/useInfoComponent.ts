import { useMemo, useState, useEffect, useCallback, useImperativeHandle, ForwardedRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { FeeComponentType } from '@pages/fee-management-v4/fee-management/schemas/FeeManagement.schema'

import { useMessage } from '@hooks/useMessage'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import {
    baseOn,
    beneficiaryType,
    calculationMethodEnum,
    componentType,
    payerType,
    roundMode
} from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import { zodResolver } from '@hookform/resolvers/zod'
import { FeeComponentSchema } from '@pages/fee-management-v4/fee-management/schemas/FeeManagement.schema'
import { FeeComponent, FeeTier } from '../types/FeeComponent.types'
import { useDeleteFeeComponentTierMutation, usePostFeeComponentTierMutation, usePutFeeComponentTierMutation } from '@services/apiFeeComponentTier'
import { getTierColumns } from '@pages/fee-management-v4/fee-management/columns/FormAddFeeComponent.columns'

const DEFAULT_TIER = {
    minFee: undefined,
    maxFee: undefined,
    fixedAmount: undefined,
    percentage: undefined,
    maxValue: undefined,
    minValue: undefined
}

const DEFAULT_VALUES: FeeComponentType = {
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

export interface UseInfoComponentRef {
    submit: () => Promise<string | undefined | void>
    update: () => Promise<void>
    reset: () => void
    submitAllTiers: (feeComponentId?: string) => Promise<void>
    updateAllTiers: () => Promise<void>
}

interface UseInfoComponentProps {
    selectedRow: FeeComponent | null
    combinedInitialData?: FeeComponent | FeeTier[] | null
    onSubmit?: (data: FeeComponentType) => Promise<string | undefined | void> | void
    onUpdate?: (data: FeeComponentType, componentId?: string) => Promise<void> | void
    onSuccess?: (id?: string) => void
    policyId?: string
    ref?: ForwardedRef<UseInfoComponentRef>
}

export const useInfoComponent = ({
    selectedRow,
    combinedInitialData,
    onSubmit: onSubmitProp,
    onUpdate: onUpdateProp,
    onSuccess,
    policyId,
    ref
}: UseInfoComponentProps) => {
    const { control, reset, watch, getValues, handleSubmit, formState: { errors } } = useForm<FeeComponentType>({
        resolver: zodResolver(FeeComponentSchema),
        defaultValues: DEFAULT_VALUES,
        shouldUnregister: false
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tiers'
    })

    const [openDialog, setOpenDialog] = useState(false)
    const [deleteComponentId, setDeleteComponentId] = useState<string>('')
    const [deleteIndex, setDeleteIndex] = useState<number>(-1)

    const [postFeeComponentTier] = usePostFeeComponentTierMutation()
    const [putFeeComponentTier] = usePutFeeComponentTierMutation()
    const [deleteFeeComponentTier, { isLoading: isDeleteLoading }] =
        useDeleteFeeComponentTierMutation()
    const { successMess, errorMess } = useMessage()

    const isUpdateMode = !!(selectedRow as FeeComponent)?.id

    const selectOptions = {
        componentType: mapEnumToSelectOptions(componentType),
        baseOn: mapEnumToSelectOptions(baseOn),
        payerType: mapEnumToSelectOptions(payerType),
        beneficiaryType: mapEnumToSelectOptions(beneficiaryType),
        roundMode: mapEnumToSelectOptions(roundMode),
        calculationMethod: mapEnumToSelectOptions(calculationMethodEnum)
    }

    const componentTypes = watch('componentType')
    const calculationMethod = watch('calculationMethod')

    const isVATType = ['VAT'].includes(String(componentTypes))
    const isTierMode = ['PROGRESSIVE_TIER', 'FLAT_TIER'].includes(String(calculationMethod))

    // Khi componentType đổi sang VAT, reset calculationMethod về DIRECT
    useEffect(() => {
        if (isVATType && calculationMethod !== 'DIRECT') {
            reset((currentValues) => ({
                ...currentValues,
                calculationMethod: 'DIRECT'
            }))
        }
    }, [isVATType, calculationMethod, reset])

    const handleAddTier = useCallback(() => {
        append(DEFAULT_TIER)
    }, [append])

    const onDeleteTier = useCallback((index: number, id?: string) => {
        if (id) {
            setDeleteComponentId(id)
            setDeleteIndex(index)
            setOpenDialog(true)
        } else {
            remove(index)
        }
    }, [remove])

    const confirmDelete = useCallback(async () => {
        try {
            if (deleteComponentId) {
                await deleteFeeComponentTier(deleteComponentId).unwrap()
                remove(deleteIndex)
                successMess('Xóa thành công')
            }
            setOpenDialog(false)
            setDeleteComponentId('')
            setDeleteIndex(-1)
        } catch {
            errorMess('Xóa thất bại')
        }
    }, [deleteComponentId, deleteIndex, deleteFeeComponentTier, remove, successMess, errorMess])

    const cancelDelete = useCallback(() => {
        setOpenDialog(false)
        setDeleteComponentId('')
        setDeleteIndex(-1)
    }, [])

    const handleUpdateTiers = useCallback(async () => {
        const allTiers = getValues('tiers')
        const feeComponentId = (selectedRow as FeeComponent)?.id
        const roundModeVal = getValues('roundMode')

        if (!allTiers || allTiers.length === 0) {
            return
        }

        const payload = allTiers.map((tierData) => ({
            feeComponentId,
            minValue: Number(tierData.minValue ?? 0),
            maxValue: Number(tierData.maxValue ?? 0),
            roundMode: roundModeVal,
            minFee: Number(tierData.minFee ?? 0),
            maxFee: Number(tierData.maxFee ?? 0),
            fixedAmount: Number(tierData.fixedAmount ?? 0),
            percentage: Number(tierData.percentage ?? 0)
        }))

        await putFeeComponentTier({ body: payload }).unwrap()
    }, [getValues, selectedRow, putFeeComponentTier])

    const handleSubmitAllTiers = useCallback(async (feeComponentId?: string) => {
        const allTiers = getValues('tiers')
        const roundModeVal = getValues('roundMode')

        const componentId = feeComponentId || (selectedRow as FeeComponent)?.id

        if (!componentId) {
            throw new Error('Không có feeComponentId')
        }

        if (!allTiers || allTiers.length === 0) {
            throw new Error('Không có dữ liệu tier để thêm')
        }

        const payload = allTiers.map((tierData) => ({
            feeComponentId: componentId,
            minValue: Number(tierData.minValue ?? 0),
            maxValue: Number(tierData.maxValue ?? 0),
            roundMode: roundModeVal,
            minFee: Number(tierData.minFee ?? 0),
            maxFee: Number(tierData.maxFee ?? 0),
            fixedAmount: Number(tierData.fixedAmount ?? 0),
            percentage: Number(tierData.percentage ?? 0)
        }))

        await postFeeComponentTier(payload).unwrap()
    }, [getValues, selectedRow, postFeeComponentTier])

    const columns = useMemo(
        () =>
            getTierColumns({
                control,
                getValues,
                onDeleteTier
            }),
        [control, getValues, onDeleteTier]
    )

    useEffect(() => {
        if (selectedRow) {
            const dataToReset = { ...selectedRow } as FeeComponentType

            // Tính isTierMode từ selectedRow, không dùng biến watch bên ngoài
            const selectedRowIsTierMode = ['PROGRESSIVE_TIER', 'FLAT_TIER'].includes(
                String(selectedRow.calculationMethod)
            )

            if (selectedRowIsTierMode && Array.isArray(combinedInitialData)) {
                dataToReset.tiers = combinedInitialData as FeeTier[]
            } else if (!selectedRowIsTierMode && combinedInitialData && !Array.isArray(combinedInitialData)) {
                const feeComponentData = combinedInitialData as FeeComponent
                dataToReset.fixedAmount = feeComponentData.fixedAmount
                dataToReset.percentage = feeComponentData.percentage
                dataToReset.minFee = feeComponentData.minFee
                dataToReset.maxFee = feeComponentData.maxFee
            }

            if (!dataToReset.tiers || dataToReset.tiers.length === 0) {
                dataToReset.tiers = [DEFAULT_TIER]
            }

            reset(dataToReset)
        } else {
            reset(DEFAULT_VALUES)
        }
    }, [selectedRow, combinedInitialData, reset])

    useImperativeHandle(ref, () => ({
        submit: () => new Promise<string | undefined>((resolve) => {
            handleSubmit(
                async (data) => {
                    try {
                        if (onSubmitProp) {
                            const result = await onSubmitProp(data)
                            successMess('Thêm thành phần phí thành công')
                            if (onSuccess) {
                                onSuccess(typeof result === 'string' ? result : undefined)
                            }
                            resolve(typeof result === 'string' ? result : undefined)
                        } else {
                            resolve(undefined)
                        }
                    } catch {
                        resolve(undefined)
                    }
                },
                () => resolve(undefined)
            )()
        }),
        update: () => new Promise<void>((resolve, reject) => {
            handleSubmit(
                async (data) => {
                    try {
                        const promises: Promise<any>[] = []

                        if (onUpdateProp) {
                            const componentId = (selectedRow as FeeComponent)?.id
                            promises.push(onUpdateProp(data, componentId) as Promise<any>)
                        }

                        const currentIsTierMode = ['PROGRESSIVE_TIER', 'FLAT_TIER'].includes(
                            String(data.calculationMethod)
                        )

                        if (currentIsTierMode) {
                            promises.push(handleUpdateTiers())
                        }

                        await Promise.all(promises)

                        successMess('Cập nhật thành phần phí thành công')
                        if (onSuccess) {
                            onSuccess()
                        }
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                },
                () => reject(new Error('Validation failed'))
            )()
        }),
        reset: () => reset(DEFAULT_VALUES),
        submitAllTiers: handleSubmitAllTiers,
        updateAllTiers: handleUpdateTiers
    }), [handleSubmit, onSubmitProp, onUpdateProp, onSuccess, handleSubmitAllTiers, handleUpdateTiers, reset, successMess, errorMess])

    return {
        control,
        watch,
        reset,
        getValues,
        handleSubmit,
        errors,
        fields,
        append,
        remove,
        isTierMode,
        isVATType,
        isUpdateMode,
        selectOptions,
        columns,
        handleAddTier,
        onDeleteTier,
        handleUpdateTiers,
        handleSubmitAllTiers,
        openDialog,
        setOpenDialog,
        deleteComponentId,
        confirmDelete,
        cancelDelete,
        isDeleteLoading
    }
}

export default useInfoComponent
