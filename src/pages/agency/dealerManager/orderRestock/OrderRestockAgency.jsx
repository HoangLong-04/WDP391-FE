import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import GroupModal from "../../../../components/modal/groupModal/GroupModal";
import {
  generalFields,
  groupedFields,
} from "../../../../components/viewModel/restockModel/RestockModel";
import useColorList from "../../../../hooks/useColorList";
import useMotorList from "../../../../hooks/useMotorList";
import useDiscountAgency from "../../../../hooks/useDiscountAgency";
import useWarehouseAgency from "../../../../hooks/useWarehouseAgency";
import usePromotionAgency from "../../../../hooks/usePromotionAgency";
import FormModal from "../../../../components/modal/formModal/FormModal";
import OrderRestockForm from "./orderRestockForm/OrderRestockForm";
import { Eye, Send, Plus } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";

function OrderRestockAgency() {
  const { user } = useAuth();
  const { colorList } = useColorList();
  const { motorList } = useMotorList();
  const { discountList } = useDiscountAgency();
  const { warehouse } = useWarehouseAgency();
  const { promoList } = usePromotionAgency();
  const [restockList, setRestockList] = useState([]);
  const [restockDetail, setRestockDetail] = useState({});

  const [page, setPage] = useState(1);
  const [totalItem, setTotalItem] = useState(0);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewModalLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [sendRequestModal, setSendRequestModal] = useState(false)

  const [form, setForm] = useState({
    quantity: 0,
    discountId: 0,
    promotionId: 0,
    warehouseId: 0,
    motorbikeId: 0,
    colorId: 0,
    agencyId: user?.agencyId,
  });

  const [selectedId, setSelectedId] = useState('')

  const fetchRestockList = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getRestockList(
        user?.agencyId,
        { page, limit, status }
      );
      setRestockList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderRestockDetail = async (id) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getRestockDetail(id);
      setRestockDetail(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleCreateRestock = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.createRestock(form);
      setForm({
        quantity: 0,
        discountId: 0,
        promotionId: 0,
        warehouseId: 0,
        motorbikeId: 0,
        colorId: 0,
        agencyId: user?.agencyId,
      });
      fetchRestockList();
      setFormModal(false);
      toast.success("Create successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault()
    setSubmit(true)
    try {
      await PrivateDealerManagerApi.sendApproveToAdmin(selectedId)
      setSendRequestModal(false)
      fetchRestockList()
      toast.success('Send success')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  useEffect(() => {
    fetchRestockList();
  }, [page, limit, status]);

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
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
    {
      key: "action",
      title: "Action",
      render: (_, item) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setViewModal(true);
              fetchOrderRestockDetail(item.id);
            }}
            className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="View detail"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => {
              setSendRequestModal(true);
              setSelectedId(item.id);
            }}
            className="cursor-pointer text-white bg-green-500 p-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            title="Send request"
          >
            <Send size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="my-3 flex justify-end gap-5 items-center">
        <div>
          <label className="mr-2 font-medium text-gray-600">Status:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="PAID">PAID</option>
            <option value="PERCENT">CANCELED</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              setFormModal(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer rounded-lg px-4 py-2.5 text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <PaginationTable
        columns={column}
        data={restockList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Order restock"}
        totalItem={totalItem}
      />
      <GroupModal
        data={restockDetail}
        groupedFields={groupedFields}
        isOpen={viewModal}
        loading={viewLoading}
        onClose={() => setViewModal(false)}
        title={"Order info"}
        generalFields={generalFields}
      />
      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={"Create restock"}
        isDelete={false}
        onSubmit={handleCreateRestock}
        isSubmitting={submit}
        isCreate={true}
      >
        <OrderRestockForm
          colorList={colorList}
          form={form}
          motorList={motorList}
          promoList={promoList}
          setForm={setForm}
          warehouseList={warehouse}
          discountList={discountList}
        />
      </FormModal>
      <FormModal
        isOpen={sendRequestModal}
        onClose={() => setSendRequestModal(false)}
        onSubmit={handleSendRequest}
        isSubmitting={submit}
        title={"Confirm send request"}
        isDelete={false}
        isSend={true}
      >
        <p className="text-gray-700">
          Do you want to send order {selectedId}? 
        </p>
      </FormModal>
    </div>
  );
}

export default OrderRestockAgency;
