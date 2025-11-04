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
import { Eye, Pencil } from "lucide-react";
import { renderStatusTag } from "../../../utils/statusTag";

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
      const params = {
        page,
        limit,
      };
      if (status) params.status = status;
      if (agencyId) params.agencyId = agencyId;
      
      const response = await PrivateAdminApi.getOrderRestock(params);
      setOrderList(response.data?.data || []);
      const total = response.data?.paginationInfo?.total;
      setTotalItem(total ? Number(total) : 0);
    } catch (error) {
      toast.error(error.message);
      setOrderList([]);
      setTotalItem(0);
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
    { key: "itemQuantity", title: "Quantity" },
    { key: "subtotal", title: "Sub total" },
    {
      key: "orderAt",
      title: "Order date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    { key: "orderType", title: "Order type" },
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
    {
      key: "creditChecked",
      title: "Credit checked",
      render: (checked) => (checked ? "Yes" : "No"),
    },
    {
      key: "action",
      title: <span className="block text-center">Action</span>,
      render: (_, item) => (
        <div className="flex gap-2 justify-center">
          <span
            onClick={() => {
              setOrderModal(true);
              fetchOrderRestockDetail(item.id);
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-gray-500 rounded-lg hover:bg-gray-600 transition"
            title="View detail"
          >
            <Eye className="w-5 h-5 text-white" />
          </span>
          <span
            onClick={() => {
              setFormModal(true);
              setSelectedId(item.id);
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
            title="Update status"
          >
            <Pencil className="w-5 h-5 text-white" />
          </span>
        </div>
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
