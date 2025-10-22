import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(null)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await PrivateAdminApi.getInventory({ page, limit });
        setInventory(response.data.data);
        setTotalItem(response.data.paginationInfo.total)
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [page, limit]);

  const columns = [
    { key: "electricMotorbikeId", title: "Motorbike" },
    { key: "warehouseId", title: "Warehouse" },
    { key: "quantity", title: "Quantity" },
    {
      key: "stockDate",
      title: "Stock date",
      render: (stockDate) => dayjs(stockDate).format("DD/MM/YYYY"),
    },
    {
      key: "lastUpdate",
      title: "Last update",
      render: (lastUpdate) => dayjs(lastUpdate).format("DD/MM/YYYY"),
    },
    {
      key: "action",
      title: "Action",
      render: () => (
        <span className="cursor-pointer text-blue-500">
          <EditIcon />
        </span>
      ),
    },
  ];
  return (
    <div>
      <div className="my-3" />
      <PaginationTable
        data={inventory}
        loading={loading}
        page={page}
        pageSize={limit}
        title={"Inventory Management"}
        columns={columns}
        setPage={setPage}
        totalItem={totalItem}
      />
    </div>
  );
}

export default InventoryManagement;
