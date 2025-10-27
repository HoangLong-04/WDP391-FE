import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../services/PrivateAdminApi";

function useColorList() {
  const [colorList, setColorList] = useState([]);
  const [load, setLoad] = useState(false);

  const fetchColorList = async () => {
    setLoad(true);
    try {
      const response = await PrivateAdminApi.getColorList();
      setColorList(response.data.data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchColorList();
  }, []);
  return { colorList, load, refetch: fetchColorList };
}

export default useColorList;
