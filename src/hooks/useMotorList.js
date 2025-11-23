import React, { useEffect, useState } from 'react'
import PrivateAdminApi from '../services/PrivateAdminApi'

function useMotorList() {
    const [motorList, setMotorList] = useState([])
    const [load, setLoad] = useState(false)
    const [page, setPage] = useState(1)
    const [limit] = useState(100)

    const fetchMotorList = async () => {
        setLoad(true)
        try {
            const response = await PrivateAdminApi.getMotorList({page, limit})
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
    }, [page, limit])
  return { motorList, load, page, setPage, refetch: fetchMotorList };
}

export default useMotorList