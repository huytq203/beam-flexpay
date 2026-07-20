import { useCallback, useMemo, useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FeeComponentSchema, FeeComponentType } from '../schemas/FeeManagement.schema'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import {
    baseOnLabel, beneficiaryTypeLabel, calculationMethodEnum, calculationMethodEnumLabel,
    componentType, componentTypeLabel, payerTypeLabel, roundModeLabel
} from '../constants/FeeManagement.constant'
import { getTierColumns } from '../columns/FormAddFeeComponent.columns'
import {
    useDeleteFeeComponentTierMutation,
    useGetFeeComponentTierQuery,
    usePostFeeComponentTierMutation,
    usePutFeeComponentTierMutation
} from '@services/apiFeeComponentTier'
import {
    usePostFeeComponentPoliciesMutation,
    usePutFeeComponentPoliciesMutation
} from '@services/apiFeeComponent'
import { useMessage } from '@hooks/useMessage'
import { DEFAULT_TIER, DEFAULT_VALUES } from '../types/InfoPolicy'
import { FeeComponent } from '../types/FeeComponent.types'

interface UseHandleInfoPolicyProps {
    policyId?: string
    selectedRow?: FeeComponent | null
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


    const idComponentTiers = selectedRow?.id
    const { data: dataFeeComponentTier, isLoading: isLoadingFeeComponentTier, isFetching: isFetchingFeeComponentTier } = useGetFeeComponentTierQuery(idComponentTiers, {
        skip: !idComponentTiers
    })


    const watchComponentType = watch('componentType')
    const watchCalculationMethod = watch('calculationMethod', calculationMethodEnum.DIRECT)

    const isVATType = ([componentType.VAT] as string[]).includes(String(watchComponentType))
    const isTierMode = ([calculationMethodEnum.PROGRESSIVE_TIER, calculationMethodEnum.FLAT_TIER] as string[]).includes(String(watchCalculationMethod))
    const isUpdateMode = !!selectedRow?.id

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
                tiers: dataFeeComponentTier?.length ? dataFeeComponentTier : []
            })
        } else {
            reset(DEFAULT_VALUES)
        }
    }, [selectedRow, dataFeeComponentTier, reset])

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
            const payloadData = {
                ...payloadWithoutTiers,
                feePolicyId: policyId,
                baseComponentType: null,
                payerObjectType: null,
                payerObjectId: null,
                beneficiaryObjectType: null,
                beneficiaryObjectId: null
            }
            const res = await postFeeComponent(payloadData).unwrap();
            const currentIsTierMode = ([calculationMethodEnum.PROGRESSIVE_TIER, calculationMethodEnum.FLAT_TIER] as string[]).includes(String(data.calculationMethod))

            if (currentIsTierMode) {
                const feeComponentId = res?.data?.id || res?.id;
                const tierPayload = (tiers || []).map((tier) => ({
                    feeComponentId: feeComponentId,
                    minValue: Number(tier.minValue) || 0,
                    maxValue: Number(tier.maxValue) || 0,
                    roundMode: data.roundMode || "",
                    minFee: Number(tier.minFee) || 0,
                    maxFee: Number(tier.maxFee) || 0,
                    fixedAmount: Number(tier.fixedAmount) || 0,
                    percentage: Number(tier.percentage) || 0
                }))
                await postFeeComponentTier(tierPayload).unwrap();
            }
            successMess('Thêm thành phần phí thành công')
            reset(DEFAULT_VALUES)
            onSuccess?.()
            onClose?.()
        } catch (error) {
        }
        finally {
            onClose?.()
        }
    })

    const handleUpdate = handleSubmit(async (data) => {
        try {
            const componentId = selectedRow?.id
            const currentIsTierMode = ([calculationMethodEnum.PROGRESSIVE_TIER, calculationMethodEnum.FLAT_TIER] as string[]).includes(String(data.calculationMethod))
            const { tiers, ...payloadWithoutTiers } = data
            const payloadData = {
                ...payloadWithoutTiers,
            }
            const promises: Promise<unknown>[] = [
                putFeeComponent({ id: componentId, body: payloadData }).unwrap()
            ]
            if (currentIsTierMode) {
                const payload = (getValues('tiers') || []).map((tier) => ({
                    feeComponentId: componentId,
                    minValue: Number(tier.minValue) || 0,
                    maxValue: Number(tier.maxValue) || 0,
                    roundMode: getValues('roundMode') || "",
                    minFee: Number(tier.minFee) || 0,
                    maxFee: Number(tier.maxFee) || 0,
                    fixedAmount: Number(tier.fixedAmount) || 0,
                    percentage: Number(tier.percentage) || 0
                }))
                promises.push(putFeeComponentTier({ body: payload }).unwrap())
            }
            await Promise.all(promises)
            successMess('Cập nhật thành phần phí thành công')
            onSuccess?.()
            onClose?.()
        } catch {
        }
    })

    const handleReset = useCallback(() => reset(DEFAULT_VALUES), [reset])

    return {
        reset,
        getValues,
        watch,
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
