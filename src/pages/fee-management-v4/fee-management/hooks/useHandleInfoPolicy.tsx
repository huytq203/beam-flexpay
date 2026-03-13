import { useCallback, useMemo, useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FeeComponentSchema, FeeComponentType } from '@pages/fee-management-v3/schemas/FeeManagement.schema'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import {
    baseOnLabel, beneficiaryTypeLabel, calculationMethodEnum, calculationMethodEnumLabel,
    componentType, componentTypeLabel, payerTypeLabel, roundModeLabel
} from '../constants/FeeManagement.constant'
import { getTierColumns } from '../columns/FormAddFeeComponent.columns'
import {
    useDeleteFeeComponentTierMutation,
    usePostFeeComponentTierMutation,
    usePutFeeComponentTierMutation
} from '@services/apiFeeComponentTier'
import {
    usePostFeeComponentPoliciesMutation,
    usePutFeeComponentPoliciesMutation
} from '@services/apiFeeComponent'
import { useMessage } from '@hooks/useMessage'
import { DEFAULT_TIER, DEFAULT_VALUES } from '../types/InfoPolicy'

interface UseHandleInfoPolicyProps {
    policyId?: string
    selectedRow?: any | null
    onSuccess?: () => void
    onClose?: () => void
}

const useHandleInfoPolicy = ({ policyId, selectedRow, onSuccess, onClose }: UseHandleInfoPolicyProps = {}) => {
    const { control, reset, watch, getValues, handleSubmit } = useForm<FeeComponentType>({
        resolver: zodResolver(FeeComponentSchema),
        defaultValues: DEFAULT_VALUES,
        shouldUnregister: false
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'tiers' })

    const [openDialog, setOpenDialog] = useState(false)
    const [deleteComponentId, setDeleteComponentId] = useState<string>('')
    const [deleteIndex, setDeleteIndex] = useState<number>(-1)

    const { successMess, errorMess } = useMessage()

    const [postFeeComponent] = usePostFeeComponentPoliciesMutation()
    const [putFeeComponent] = usePutFeeComponentPoliciesMutation()
    const [postFeeComponentTier] = usePostFeeComponentTierMutation()
    const [putFeeComponentTier] = usePutFeeComponentTierMutation()
    const [deleteFeeComponentTier, { isLoading: isDeleteLoading }] = useDeleteFeeComponentTierMutation()

    const watchComponentType = watch('componentType')
    const watchCalculationMethod = watch('calculationMethod', calculationMethodEnum.DIRECT)

    const isVATType = ([componentType.VAT] as string[]).includes(String(watchComponentType))
    const isTierMode = ([calculationMethodEnum.PROGRESSIVE_TIER, calculationMethodEnum.FLAT_TIER] as string[]).includes(String(watchCalculationMethod))
    const isUpdateMode = !!(selectedRow as any)?.id

    // Reset calculationMethod về DIRECT khi chọn VAT
    useEffect(() => {
        if (isVATType && watchCalculationMethod !== calculationMethodEnum.DIRECT) {
            reset((curr) => ({ ...curr, calculationMethod: calculationMethodEnum.DIRECT }))
        }
    }, [isVATType, watchCalculationMethod, reset])

    // Fill form khi selectedRow thay đổi
    useEffect(() => {
        if (selectedRow) {
            reset({
                ...selectedRow,
                tiers: selectedRow.tiers?.length ? selectedRow.tiers : [DEFAULT_TIER]
            })
        } else {
            reset(DEFAULT_VALUES)
        }
    }, [selectedRow, reset])

    const selectOptions = useMemo(() => ({
        componentType: mapEnumToSelectOptions(componentTypeLabel),
        baseOn: mapEnumToSelectOptions(baseOnLabel),
        payerType: mapEnumToSelectOptions(payerTypeLabel),
        beneficiaryType: mapEnumToSelectOptions(beneficiaryTypeLabel),
        roundMode: mapEnumToSelectOptions(roundModeLabel),
        calculationMethod: mapEnumToSelectOptions(calculationMethodEnumLabel)
    }), [])

    const handleAddTier = useCallback(() => { append(DEFAULT_TIER) }, [append])

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

    const columns = useMemo(
        () => getTierColumns({ control, getValues, onDeleteTier }),
        [control, getValues, onDeleteTier]
    )

    const handleAdd = handleSubmit(async (data) => {
        try {
            const { tiers, ...payloadWithoutTiers } = data; 
            const payloadData={
                ...payloadWithoutTiers,
                feePolicyId: policyId,
                baseComponentType: null,
                payerObjectType: null,
                payerObjectId: null,
                beneficiaryObjectType: null,
                beneficiaryObjectId: null
            }
            const currentIsTierMode = ([calculationMethodEnum.PROGRESSIVE_TIER, calculationMethodEnum.FLAT_TIER] as string[]).includes(String(data.calculationMethod))
            const res = await postFeeComponent(payloadData).unwrap()
            if (currentIsTierMode && res?.data?.id) {
                const payload = (getValues('tiers') || []).map((tier) => ({
                    feeComponentId: res.data.id,
                    ...tier
                }))
                await postFeeComponentTier(payload).unwrap()
            }
            successMess('Thêm thành phần phí thành công')
            reset(DEFAULT_VALUES)
            onSuccess?.()
            onClose?.()
        } catch {
        }
    })

    const handleUpdate = handleSubmit(async (data) => {
        try {
            const componentId = (selectedRow as any)?.id
            const currentIsTierMode = ([calculationMethodEnum.PROGRESSIVE_TIER, calculationMethodEnum.FLAT_TIER] as string[]).includes(String(data.calculationMethod))
            const promises: Promise<any>[] = [
                putFeeComponent({ id: componentId, body: data }).unwrap()
            ]
            if (currentIsTierMode) {
                const payload = (getValues('tiers') || []).map((tier) => ({
                    feeComponentId: componentId,
                    roundMode: getValues('roundMode'),
                    ...tier
                }))
                promises.push(putFeeComponentTier({ body: payload }).unwrap())
            }
            await Promise.all(promises)
            successMess('Cập nhật thành phần phí thành công')
            onSuccess?.()
            onClose?.()
        } catch {
            errorMess('Cập nhật thất bại')
        }
    })

    const handleReset = useCallback(() => reset(DEFAULT_VALUES), [reset])

    return {
        control,
        fields,
        isVATType,
        isTierMode,
        isUpdateMode,
        selectOptions,
        columns,
        handleAddTier,
        handleAdd,
        handleUpdate,
        handleReset,
        openDialog,
        confirmDelete,
        cancelDelete,
        isDeleteLoading
    }
}

export default useHandleInfoPolicy
