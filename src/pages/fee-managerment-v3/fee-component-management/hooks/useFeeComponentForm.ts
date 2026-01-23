import { useState, useEffect, useMemo, useRef } from 'react'
import { useMessage } from '@hooks/useMessage'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useDeleteFeeComponentPoliciesMutation,
  usePostFeeComponentPoliciesMutation,
  usePutFeeComponentPoliciesMutation,
  useGetFeeComponentByIdQuery,
  useGetFeeComponentPoliciesByIdQuery,
  useGetFeeComponentPoliciesQuery
} from '../services/apiFeeComponent.api'
import {
  useGetFeePolicyByIdQuery,
  usePostNewPolicyMutation,
  usePutFeePolicyMutation
} from '../../fee-management/services/apiFeePolicy.service'
import { useGetFeeComponentTierQuery } from '../services/apiFeeComponentTier.api'
import {
  FeeComponentType
} from '../schemas/FeeComponent.schema'
import { PolicySchema as FeePolicySchema, PolicyType as FeePolicyType } from '../../fee-management/schemas/FeeManagement.schema'
import { FeeComponent, FeeTier } from '../types/FeeComponent.types'
import { convertToISO } from '@pages/fee-managerment-v3/utils/FeeManagement.utils'
import { feeComponentColumns } from '../columns/FeeComponentManagement.columns'
import { useSVG } from '@hooks/useSVG'
import { FEEMANAGEMENT_V3 } from '@constants/routersConstant'

interface FormRef {
  submit: () => void
  update: () => void
  reset: () => void
  submitAllTiers: (feeComponentId?: string) => Promise<void>
  updateAllTiers: () => Promise<void>
}

const DEFAULT_VALUES = {
  name: '',
  description: '',
  priority: 0,
  status: '',
  validFrom: '',
  validTo: '',
  currency: '',
  serviceType: '',
  feeDomain: ''
}

export const useFeeComponentForm = () => {
  const { successMess, errorMess } = useMessage()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { svg } = useSVG()

  // UI State
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRow, setSelectedRow] = useState<FeeComponent | null>(
    null
  )
  const [updateComponentId, setUpdateComponentId] = useState<string | null>(
    null
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  // Form ref
  const formRef = useRef<FormRef>(null)

  // Policy Form
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<FeePolicyType>({
    resolver: zodResolver(FeePolicySchema),
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: true
  })

  // API Mutations
  const [postFeeComponent, { isLoading: loadPostComponent }] =
    usePostFeeComponentPoliciesMutation()

  const [
    putFeeComponentPolicies,
    { isLoading: putFeeComponentPoliciesLoading }
  ] = usePutFeeComponentPoliciesMutation()

  const [deleteFeeComponent, { isLoading: deleteFeeComponentLoading }] =
    useDeleteFeeComponentPoliciesMutation()

  const [putFeePolicies, { isLoading: putFeePoliciesLoading }] =
    usePutFeePolicyMutation()

  const [postNewPolicy] = usePostNewPolicyMutation()

  // API Queries
  const { data: feeComponent } = useGetFeeComponentByIdQuery(
    selectedRow?.id ?? '',
    { skip: !selectedRow?.id }
  )

  const { data: feeComponentTierData } = useGetFeeComponentTierQuery(
    selectedRow?.id ?? '',
    {
      skip:
        !selectedRow?.id ||
        (selectedRow?.calculationMethod !== 'PROGRESSIVE_TIER' &&
          selectedRow?.calculationMethod !== 'FLAT_TIER')
    }
  )


  const { data: feeComponentPolicyData, isLoading: loadingFeeComponentById } = useGetFeeComponentPoliciesByIdQuery(
    id!,
    { skip: !isEdit }
  )

  const { data: feeData } = useGetFeeComponentPoliciesQuery(
    {
      page,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    },
    { skip: isEdit }
  )

  // Computed Data
  const combinedInitialData = useMemo(() => {
    if (!feeComponent) return null
    if (feeComponentTierData && feeComponentTierData.length > 0) {
      const tiers = feeComponentTierData.map((item: any) => ({
        id: item.id,
        minValue: item.minValue,
        maxValue: item.maxValue,
        roundMode: item.roundMode,
        minFee: item.minFee,
        maxFee: item.maxFee,
        fixedAmount: item.fixedAmount,
        percentage: item.percentage
      }))
      return { ...feeComponent, tiers }
    }
    return feeComponent
  }, [feeComponent, feeComponentTierData])

  const list = (feeComponentPolicyData ?? feeData?.content) || []
  const total = feeData?.totalElements || 0

  const sortedList = useMemo(() => {
    return [...list].sort(
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      }
    )
  }, [list])

  const dataSource = useMemo(() => {
    return sortedList.map((item: FeeComponent, idx: number) => ({
      ...item,
      no: (page - 1) * pageSize + idx + 1
    }))
  }, [sortedList, page, pageSize])

  const columns = feeComponentColumns({
    setSelectedRow,
    setOpen,
    setUpdateComponentId,
    setDeletingId,
    setOpenDialog
  })

  // Helpers
  const transformPayload = (data: FeeComponentType) => ({
    feePolicyId: id,
    componentType: data.componentType,
    baseOn: data.baseOn,
    baseComponentType: null,
    calculationMethod: data.calculationMethod,
    fixedAmount: data.fixedAmount ?? 0,
    percentage: data.percentage ?? 0,
    roundMode: data.roundMode,
    minFee: data.minFee ?? 0,
    maxFee: data.maxFee ?? 0,
    payerType: data.payerType,
    payerObjectType: null,
    payerObjectId: null,
    beneficiaryType: data.beneficiaryType,
    beneficiaryObjectType: null,
    beneficiaryObjectId: null
  })

  // Handlers
  const handleFormSubmit = async (data: FeeComponentType) => {
    try {
      const payload = transformPayload(data)
      const response = await postFeeComponent(payload).unwrap()
      successMess('Thêm thành phần phí thành công')
      setOpen(false)
      return response?.id
    } catch { }
  }

  const handleUpdateFeeComponent = async (data: FeeComponentType) => {
    try {
      const payload = {
        componentType: data.componentType,
        baseOn: data.baseOn,
        baseComponentType: null,
        calculationMethod: data.calculationMethod,
        fixedAmount: data.fixedAmount ?? 0,
        percentage: data.percentage ?? 0,
        roundMode: data.roundMode,
        minFee: data.minFee ?? 0,
        maxFee: data.maxFee ?? 0,
        payerType: data.payerType,
        payerObjectType: null,
        payerObjectId: null,
        beneficiaryType: data.beneficiaryType,
        beneficiaryObjectType: null,
        beneficiaryObjectId: null
      }
      await putFeeComponentPolicies({
        id: updateComponentId,
        body: payload
      }).unwrap()
      // Success toast sẽ được hiển thị trong FormAddFeeComponent.update()
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (deleteId: string | null) => {
    try {
      if (!deleteId) return
      setSelectedRow(null)
      await deleteFeeComponent(deleteId).unwrap()
      setOpenDialog(false)
      successMess('Xoá thành công!')
    } catch {
    }
  }

  const onSubmit = async (data: FeePolicyType) => {
    try {
      await postNewPolicy(data).unwrap()
      successMess('Thêm chính sách thành công!')
    } catch {
    }
  }

  const handleUpdate = async (data: FeePolicyType) => {
    const payload = {
      ...data,
      validFrom: data.validFrom ? convertToISO(data.validFrom) : '',
      validTo: data.validTo ? convertToISO(data.validTo) : ''
    }
    await putFeePolicies({ id: id, body: payload }).unwrap()
    successMess('Cập nhật chính sách thành công!')

  }

  const handleSaveAddFee = () => {
    if (selectedRow) {
      formRef.current?.update()
    } else {
      formRef.current?.submit()
    }
  }

  const handleOpenAddModal = () => {
    formRef.current?.reset()
    setSelectedRow(null)
    setUpdateComponentId(null)
    setOpen(true)
  }

  const handleBack = () => {
    navigate(`${FEEMANAGEMENT_V3}/fee-management`)
  }

  return {
    // Params
    id,
    isEdit,
    svg,

    // UI States
    open,
    setOpen,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedRow,
    setSelectedRow,
    openDialog,
    setOpenDialog,
    deletingId,
    setDeletingId,
    updateComponentId,
    setUpdateComponentId,

    // Form
    formRef,
    control,
    handleSubmit,
    reset,
    errors,

    // Data
    dataSource,
    columns,
    total,
    combinedInitialData,

    // Handlers
    handleFormSubmit,
    handleUpdateFeeComponent,
    handleDelete,
    onSubmit,
    handleUpdate,
    handleSaveAddFee,
    handleOpenAddModal,
    handleBack,

    // Loading states
    isSubmitting: loadPostComponent || putFeeComponentPoliciesLoading,
    isDeleting: deleteFeeComponentLoading,
    putFeePoliciesLoading,
    loadingFeeComponentById

  }
}
