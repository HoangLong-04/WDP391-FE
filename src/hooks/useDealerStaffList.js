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
        user?.agencyId
      );
      setStaffList(response.data.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);
  return { staffList };
}

export default useDealerStaffList;
