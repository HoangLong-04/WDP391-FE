import React, { useEffect, useState } from "react";
import PrivateDealerManagerApi from "../services/PrivateDealerManagerApi";
import { useAuth } from "./useAuth";

function useStockListAgency() {
  const { user } = useAuth();
  const [stockList, setStockList] = useState([]);
  const [load, setLoad] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [limit] = useState(30);
  const fetchStockList = async () => {
    setLoad(true);
    try {
      // Backend expects "page" & "limit" and supports sort param (e.g. newest)
      const response = await PrivateDealerManagerApi.getStockList(
        user?.agencyId,
        {
          page: pageNum,
          limit,
          sort: "newest",
        }
      );
      setStockList(response.data.data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchStockList();
  }, [pageNum, limit]);
  return {
    stockList,
    load,
    pageNum,
    setPageNum,
    refetch: fetchStockList,
  };
}

export default useStockListAgency;
