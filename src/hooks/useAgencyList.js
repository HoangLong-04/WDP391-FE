import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../services/PrivateAdminApi";

function useAgencyList() {
  const [agencyList, setAgencyList] = useState([]);
  const [load, setLoad] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [limit] = useState(30);
  const fetchAgencyList = async () => {
    setLoad(true);
    try {
      const response = await PrivateAdminApi.getAgency({ pageNum });
      setAgencyList(response.data.data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchAgencyList();
  }, [pageNum, limit]);
  return {
    agencyList,
    load,
    pageNum,
    setPageNum,
    refetch: fetchAgencyList,
  };
}

export default useAgencyList;
