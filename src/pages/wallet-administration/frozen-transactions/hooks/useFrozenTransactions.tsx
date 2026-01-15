import React, { useEffect, useState } from 'react'

const useFrozenTransactions = () => {
const [dataTable,setDataTable]=useState()
//     const getData= async() => {
//         try {
//           const res=  await fetch("http://localhost:4000/freezeTransactions") 
//           const data=await res.json()
//           setDataTable(data.data.content)
//         } catch (error) {
            
//         }
//     }
//     console.log(dataTable)
// useEffect(()=>{
//     getData()
// },[])
  return {
    dataTable,
    setDataTable
  }
}

export default useFrozenTransactions