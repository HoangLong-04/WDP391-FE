import React, { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import PrivateDealerManagerApi from "../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";

function useDealerStaffList() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);

  const fetchStaffList = async () => {
    try {
      const response = await PrivateDealerManagerApi.getStaffListByAgencyId(
        user?.agencyId, {page: 1, limit: 30}
      );
      setStaffList(response.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);
  return { staffList };
}

export default useDealerStaffList;
