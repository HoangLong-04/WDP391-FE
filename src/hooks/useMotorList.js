import React, { useEffect, useState } from 'react'
import PrivateAdminApi from '../services/PrivateAdminApi'

function useMotorList() {
    const [motorList, setMotorList] = useState([])
    const [load, setLoad] = useState(false)
    const [pageNum, setPageNum] = useState(1)
    const [limit] = useState(100)

    const fetchMotorList = async () => {
        setLoad(true)
        try {
            const response = await PrivateAdminApi.getMotorList({pageNum, limit})
            // Filter out deleted motorbikes
            const activeMotorbikes = response.data.data.filter(motor => motor.isDeleted === false)
            setMotorList(activeMotorbikes)
        } catch (error) {
            console.log(error.message);
            
        } finally {
            setLoad(false)
        }
    }

    useEffect(() => {
        fetchMotorList()
    }, [pageNum, limit])
  return { motorList, load, pageNum, setPageNum, refetch: fetchMotorList };
}

export default useMotorList