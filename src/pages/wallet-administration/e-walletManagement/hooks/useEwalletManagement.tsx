import React, { useEffect, useState } from 'react'
import { Column } from '../columns/Column'
import { TableRows } from '../types/Column.type'

const useEwalletManagement = () => {
    const column = Column()
    const [data,setData]=useState([])
    const dataSource=data
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch('http://localhost:4000/users')
                const data = await res.json()
                setData(data.data.content)
            } catch (error: any) {
                console.log(error?.data?.detail)
            }
        }
        getUser()
    }, [])
    return {
        column,
        dataSource
    }
}

export default useEwalletManagement