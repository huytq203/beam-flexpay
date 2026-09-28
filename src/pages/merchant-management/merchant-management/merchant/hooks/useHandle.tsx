import { useMessage } from '@hooks/useMessage'
import { usePostMerchantMutation, usePutMerchantMutation } from '@services/apiMerchant'
import { CreateMerchantPayload, UpdateMerchantPayload } from '@type/merchant'

const useHandle = () => {
    const { successMess } = useMessage()
    const [postMerchant, { isLoading: isLoadingPostMerchant }] = usePostMerchantMutation()
    const [putMerchant, { isLoading: isLoadingPutMerchant }] = usePutMerchantMutation()

    const handleCreateMerchant = async (data: CreateMerchantPayload, onSuccess?: () => void) => {
        try {
            await postMerchant(data).unwrap()
            successMess('Thêm mới merchant thành công')
            onSuccess?.()
            return true
        } catch {
            return false
        }
    }

    const handlePutMerchant = async (id: string, data: UpdateMerchantPayload, onSuccess?: () => void) => {
        try {
            await putMerchant({ id, payload: data }).unwrap()
            successMess('Cập nhật merchant thành công')
            onSuccess?.()
            return true
        } catch {
            return false
        }
    }

    return {
        handleCreateMerchant,
        isLoadingPostMerchant,
        handlePutMerchant,
        isLoadingPutMerchant,
    }
}

export default useHandle
