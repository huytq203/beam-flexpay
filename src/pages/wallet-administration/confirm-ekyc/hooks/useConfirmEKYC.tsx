import React, { useEffect, useState } from 'react'

const useConfirmEKYC = () => {
    const [dataEKYC, setDataEKYC] = useState([])

    // const getData = async () => {
    //     try {
    //         const res = await fetch('http://localhost:4000/confirmEKYC')
    //         const data = await res.json()
    //         setDataEKYC(data?.data?.content)
    //     } catch (error) {

    //     }
    // }
    // useEffect(() => {
    //     getData()
    // },[])

    return {
        dataEKYC,
    }
}

export default useConfirmEKYC