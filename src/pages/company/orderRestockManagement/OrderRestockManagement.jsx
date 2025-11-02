import React, { useEffect, useState } from "react";
import useAgencyList from "../../../hooks/useAgencyList";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import {
  generalFields,
  groupedFields,
} from "../../../components/viewModel/restockModel/RestockModel";
import FormModal from "../../../components/modal/formModal/FormModal";
import RestockForm from "./restockForm/RestockForm";
import dayjs from "dayjs";

function OrderRestockManagement() {
  const { agencyList } = useAgencyList();
  const [orderList, setOrderList] = useState([]);
  const [orderRestock, setOrderRestock] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [orderModal, setOrderModal] = useState(false);
  const [formModal, setFormModal] = useState(false);

  const [form, setForm] = useState({
    status: "",
  });

  const [selectedId, setSelectedId] = useState("");

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

  const fetchOrderRestockDetail = async (id) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getOrderRestockDetail(id);
      setOrderRestock(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.updateOrder(selectedId, form);
      setFormModal(false);
      fetchOrderRestock();
      toast.success("Update successfully");
      setForm({ status: "" });
    } catch (error) {
      setForm({ status: "" });
      toast.error(error.message);
    } finally {
      setSubmit(false);
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
    {
      key: "orderAt",
      title: "Order date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    { key: "status", title: "Status" },
    {
      key: "action1",
      title: "Detail",
      render: (_, item) => (
        <span
          onClick={() => {
            setOrderModal(true);
            fetchOrderRestockDetail(item.id);
          }}
          className="cursor-pointer text-white p-2 bg-blue-500 rounded-lg"
        >
          View
        </span>
      ),
    },
    {
      key: "action2",
      title: "Update status",
      render: (_, item) => (
        <span
          onClick={() => {
            setFormModal(true);
            setSelectedId(item.id);
          }}
          className="cursor-pointer text-white p-2 bg-blue-500 rounded-lg"
        >
          Update
        </span>
      ),
    },
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
      <GroupModal
        data={orderRestock}
        groupedFields={groupedFields}
        isOpen={orderModal}
        loading={viewModalLoading}
        onClose={() => setOrderModal(false)}
        title={"Order info"}
        generalFields={generalFields}
      />
      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={"Update order"}
        isDelete={false}
        onSubmit={handleUpdateOrder}
        isSubmitting={submit}
      >
        <RestockForm form={form} setForm={setForm} />
      </FormModal>
    </div>
  );
}

export default OrderRestockManagement;
