import React, { useEffect, useState } from "react";
import useAgencyList from "../../../hooks/useAgencyList";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";

function OrderRestockManagement() {
  const { agencyList } = useAgencyList();
  const [orderList, setOrderList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);

  const fetchOrderRestock = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getOrderRestock({
        page,
        limit,
        status,
        agencyId,
      });
      setOrderList(response.data.data);
      setTotalItem(response.data.paginationInfo);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderRestock();
  }, [page, limit, status, agencyId]);

  const column = [
    { key: "id", title: "Id" },
    { key: "quantity", title: "Quantity" },
    { key: "basePrice", title: "Base price" },
    { key: "wholeSalePrice", title: "Wholesale price" },
    { key: "discountTotal", title: "Discount total" },
    { key: "promotionTotal", title: "Promotion total" },
    { key: "finalPrice", title: "Final price" },
    { key: "subTotal", title: "Sub total" },
    { key: "orderAt", title: "Order date" },
    { key: "status", title: "Status" },
  ];
  return (
    <div>
      <div></div>
      <PaginationTable
        columns={column}
        data={orderList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Order restock management"}
        totalItem={totalItem}
      />
    </div>
  );
}

export default OrderRestockManagement;
