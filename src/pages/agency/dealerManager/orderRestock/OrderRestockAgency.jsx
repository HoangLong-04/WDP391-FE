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
import { Eye, Send, Plus, Trash2 } from "lucide-react";
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
  const [limit] = useState(5);
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewModalLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [sendRequestModal, setSendRequestModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const [form, setForm] = useState({
    orderType: "FULL",
    orderItems: [
      {
        quantity: 0,
        discountId: null,
        promotionId: null,
        warehouseId: 0,
        motorbikeId: 0,
        colorId: 0,
      },
    ],
    agencyId: user?.agencyId,
  });

  const [selectedId, setSelectedId] = useState('')
  const [selectedDeleteId, setSelectedDeleteId] = useState('')

  const fetchRestockList = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getRestockList(
        user?.agencyId,
        { page, limit, status }
      );
      const list = response.data?.data || [];
      setRestockList(list);
      setTotalItem(response.data?.paginationInfo?.total ?? list.length ?? 0);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderRestockDetail = async (item) => {
    setViewModalLoading(true);
    try {
      // Kiểm tra nếu order có orderItems và lấy orderItemId đầu tiên
      const orderItems = item?.orderItems || [];
      if (orderItems.length === 0) {
        toast.error("This order has no items to display");
        setViewModalLoading(false);
        return;
      }
      // Lấy orderItemId đầu tiên từ orderItems
      const orderItemId = orderItems[0]?.id;
      if (!orderItemId) {
        toast.error("Cannot find order item ID");
        setViewModalLoading(false);
        return;
      }
      const response = await PrivateDealerManagerApi.getRestockOrderItemDetail(orderItemId);
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
      // Chuyển đổi form thành format API: loại bỏ null/0 và chỉ gửi giá trị hợp lệ
      const payload = {
        orderType: form.orderType,
        orderItems: form.orderItems
          .filter(
            (item) =>
              item.motorbikeId > 0 &&
              item.colorId > 0 &&
              item.warehouseId > 0 &&
              item.quantity > 0
          )
          .map((item) => ({
            quantity: item.quantity,
            motorbikeId: item.motorbikeId,
            colorId: item.colorId,
            warehouseId: item.warehouseId,
            ...(item.discountId && item.discountId > 0 && { discountId: item.discountId }),
            ...(item.promotionId && item.promotionId > 0 && { promotionId: item.promotionId }),
          })),
        agencyId: user?.agencyId,
      };

      if (payload.orderItems.length === 0) {
        toast.error("Please fill in at least one valid order item");
        setSubmit(false);
        return;
      }

      await PrivateDealerManagerApi.createRestock(payload);
      setForm({
        orderType: "FULL",
        orderItems: [
          {
            quantity: 0,
            discountId: null,
            promotionId: null,
            warehouseId: 0,
            motorbikeId: 0,
            colorId: 0,
          },
        ],
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
      // Cập nhật nhanh trên UI: chuyển sang PENDING
      setRestockList((prev) =>
        prev.map((o) => (o.id === selectedId ? { ...o, status: "PENDING" } : o))
      )
      fetchRestockList()
      toast.success('Send success')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const handleDeleteOrder = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.deleteRestock(selectedDeleteId);
      setDeleteModal(false);
      // Xóa ngay trên UI
      setRestockList((prev) => prev.filter((o) => o.id !== selectedDeleteId));
      setTotalItem((t) => Math.max(0, t - 1));
      toast.success('Delete successfully');
      // Refetch để đồng bộ
      fetchRestockList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  }

  useEffect(() => {
    fetchRestockList();
  }, [page, limit, status]);

  const column = [
    { key: "id", title: "Id" },
    { key: "orderType", title: "Order type" },
    { key: "itemQuantity", title: "Items" },
    {
      key: "subtotal",
      title: "Subtotal",
      render: (val) => (typeof val === "number" ? val.toLocaleString() : val),
    },
    {
      key: "orderAt",
      title: "Order date",
      render: (date) => (date ? dayjs(date).format("DD-MM-YYYY") : "-"),
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
              fetchOrderRestockDetail(item);
            }}
            className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="View detail"
          >
            <Eye size={18} />
          </button>
          {item.status === 'DRAFT' && (
            <>
              <button
                onClick={() => {
                  setSendRequestModal(true);
                  setSelectedId(item.id);
                }}
                className="cursor-pointer text-white bg-green-500 p-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                title="Send to pending"
              >
                <Send size={18} />
              </button>
              <button
                onClick={() => {
                  setDeleteModal(true);
                  setSelectedDeleteId(item.id);
                }}
                className="cursor-pointer text-white bg-red-500 p-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                title="Delete order"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
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
            <option value="CANCELED">CANCELED</option>
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

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteOrder}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete order {selectedDeleteId}? This action cannot be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default OrderRestockAgency;
