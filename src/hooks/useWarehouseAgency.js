import React, { useEffect, useState } from "react";
import PrivateDealerManagerApi from "../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";

function useWarehouseAgency() {
  const [warehouse, setWarehouse] = useState([]);

  const fetchWarehouse = async () => {
    try {
      const response = await PrivateDealerManagerApi.getWarehouseList();
      setWarehouse(response.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);
  return { warehouse };
}

export default useWarehouseAgency;
