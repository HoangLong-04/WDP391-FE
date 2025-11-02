import React, { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import PrivateDealerManagerApi from "../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";

function useCustomerList() {
  const { user } = useAuth();
  const [customerList, setCustomerList] = useState([]);

  const fetchCustomerList = async () => {
    try {
      const response = await PrivateDealerManagerApi.getCustomerList(
        user?.agencyId
      );
      setCustomerList(response.data.data);
    } catch (error) {
      console.log(error.message);
      
    }
  };

  useEffect(() => {
    fetchCustomerList();
  }, []);
  return { customerList };
}

export default useCustomerList;
