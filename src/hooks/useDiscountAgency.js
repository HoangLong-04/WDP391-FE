import React, { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import PrivateDealerManagerApi from "../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";

function useDiscountAgency() {
  const { user } = useAuth();
  const [discountList, setDiscountList] = useState([]);

  const fetchDiscountList = async () => {
    try {
      const response = await PrivateDealerManagerApi.getDiscountList(
        user?.agencyId
      );
      setDiscountList(response.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchDiscountList();
  }, []);
  return { discountList };
}

export default useDiscountAgency;
