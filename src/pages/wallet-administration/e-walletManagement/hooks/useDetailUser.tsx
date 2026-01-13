import React, { useState } from 'react'

const useDetailUser = () => {

    const [activeKey, setActiveKey] = useState('1')

  return {
    activeKey,
    setActiveKey
  }
}

export default useDetailUser
