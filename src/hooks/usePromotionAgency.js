import React, { useEffect, useState } from "react";
import PrivateDealerManagerApi from "../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";

function usePromotionAgency() {
  const [promoList, setPromoList] = useState([]);

  const fetchPromoList = async () => {
    try {
      const response = await PrivateDealerManagerApi.getPromotionList();
      setPromoList(response.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchPromoList();
  }, []);
  return { promoList };
}

export default usePromotionAgency;
