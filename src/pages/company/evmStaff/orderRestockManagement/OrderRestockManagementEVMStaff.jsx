import React, { useEffect, useState } from "react";
import useAgencyList from "../../../../hooks/useAgencyList";
import PrivateAdminApi from "../../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import GroupModal from "../../../../components/modal/groupModal/GroupModal";
import {
  generalFields,
  groupedFields,
} from "../../../../components/viewModel/restockModel/RestockModel";
import FormModal from "../../../../components/modal/formModal/FormModal";
import RestockForm from "../../orderRestockManagement/restockForm/RestockForm";
import dayjs from "dayjs";
import { Eye, Pencil, CheckCircle, Truck, Check, XCircle } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";

function OrderRestockManagementEVMStaff() {
  const { agencyList } = useAgencyList();
  const [orderList, setOrderList] = useState([]);
  const [orderRestock, setOrderRestock] = useState({});
  // Lưu kết quả check credit để biết approve hay cancel
  const [creditCheckResults, setCreditCheckResults] = useState({});

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
      const orders = response.data?.data || [];
      setOrderList(orders);
      const total = response.data?.paginationInfo?.total;
      setTotalItem(total ? Number(total) : 0);
      
      // Tự động load lại kết quả check cho các order đã check nhưng chưa có trong state
      orders.forEach(async (order) => {
        if ((order.creditChecked || creditCheckResults[order.id]?.checked) && order.status === "PENDING" && !creditCheckResults[order.id]?.checked) {
          // Load lại kết quả check một cách silent
          try {
            const orderDetailResponse = await PrivateAdminApi.getOrderRestockDetail(order.id);
            const orderDetail = orderDetailResponse.data.data;
            const orderItems = orderDetail?.orderItems || [];
            if (orderItems.length > 0) {
              const orderItemId = orderItems[0]?.id;
              if (orderItemId) {
                const orderItemResponse = await PrivateAdminApi.getOrderRestockOrderItemDetail(orderItemId);
                const orderItemDetail = orderItemResponse.data.data;
                const finalPrice = orderItemDetail?.finalPrice || 0;
                const agencyId = orderDetail?.agencyId;
                
                if (agencyId) {
                  const creditLineResponse = await PrivateAdminApi.getCreditLine({
                    page: 1,
                    limit: 1,
                    agencyId: agencyId,
                  });
                  const creditLineList = creditLineResponse.data?.data || [];
                  if (creditLineList.length > 0) {
                    const creditLimit = creditLineList[0]?.creditLimit || 0;
                    const canApprove = finalPrice < creditLimit;
                    
                    setCreditCheckResults(prev => ({
                      ...prev,
                      [order.id]: {
                        canApprove,
                        finalPrice,
                        creditLimit,
                        checked: true
                      }
                    }));
                  }
                }
              }
            }
          } catch (error) {
            // Silent fail, không hiển thị error
            console.error("Error loading credit check result:", error);
          }
        }
      });
    } catch (error) {
      toast.error(error.message);
      setOrderList([]);
      setTotalItem(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderRestockDetail = async (item) => {
    setViewModalLoading(true);
    try {
      const orderId = item.id;
      
      // Gọi API đầu tiên để lấy order detail
      const orderDetailResponse = await PrivateAdminApi.getOrderRestockDetail(orderId);
      const orderDetail = orderDetailResponse.data.data;
      
      // Kiểm tra nếu order có orderItems và lấy orderItemId đầu tiên
      const orderItems = orderDetail?.orderItems || [];
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
      
      // Gọi API thứ hai để lấy order item detail
      const orderItemResponse = await PrivateAdminApi.getOrderRestockOrderItemDetail(orderItemId);
      const orderItemDetail = orderItemResponse.data.data;
      
      // Merge dữ liệu từ cả 2 API: order detail + order item detail
      const mergedData = {
        ...orderItemDetail, // Order item detail (có nested objects)
        // Thêm thông tin order vào root level để dễ truy cập
        orderId: orderDetail.id,
        orderSubtotal: orderDetail.subtotal,
        orderItemQuantity: orderDetail.itemQuantity,
        orderAt: orderDetail.orderAt,
        orderType: orderDetail.orderType,
        orderStatus: orderDetail.status,
        creditChecked: orderDetail.creditChecked,
        agencyId: orderDetail.agencyId,
      };
      
      setOrderRestock(mergedData);
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

  const handleApprove = async (orderId) => {
    setSubmit(true);
    try {
      await PrivateAdminApi.updateOrder(orderId, { status: "APPROVED" });
      // Xóa kết quả check sau khi approve
      setCreditCheckResults(prev => {
        const newResults = { ...prev };
        delete newResults[orderId];
        return newResults;
      });
      fetchOrderRestock();
      toast.success("Order approved successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleCancel = async (orderId) => {
    setSubmit(true);
    try {
      await PrivateAdminApi.updateOrder(orderId, { status: "CANCELED" });
      // Xóa kết quả check sau khi cancel
      setCreditCheckResults(prev => {
        const newResults = { ...prev };
        delete newResults[orderId];
        return newResults;
      });
      fetchOrderRestock();
      toast.success("Order canceled successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeliver = async (orderId) => {
    setSubmit(true);
    try {
      await PrivateAdminApi.updateOrder(orderId, { status: "DELIVERED" });
      fetchOrderRestock();
      toast.success("Order delivered successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleCheckCredit = async (item) => {
    setSubmit(true);
    try {
      // Lấy order detail để có finalPrice và agencyId
      const orderDetailResponse = await PrivateAdminApi.getOrderRestockDetail(item.id);
      const orderDetail = orderDetailResponse.data.data;
      
      // Kiểm tra nếu order có orderItems và lấy orderItemId đầu tiên
      const orderItems = orderDetail?.orderItems || [];
      if (orderItems.length === 0) {
        toast.error("This order has no items to display");
        setSubmit(false);
        return;
      }
      
      const orderItemId = orderItems[0]?.id;
      if (!orderItemId) {
        toast.error("Cannot find order item ID");
        setSubmit(false);
        return;
      }
      
      // Lấy order item detail để có finalPrice
      const orderItemResponse = await PrivateAdminApi.getOrderRestockOrderItemDetail(orderItemId);
      const orderItemDetail = orderItemResponse.data.data;
      const finalPrice = orderItemDetail?.finalPrice || 0;
      
      // Lấy credit line với agencyId
      const agencyId = orderDetail?.agencyId;
      if (!agencyId) {
        toast.error("Cannot find agency ID");
        setSubmit(false);
        return;
      }
      
      const creditLineResponse = await PrivateAdminApi.getCreditLine({
        page: 1,
        limit: 1,
        agencyId: agencyId,
      });
      
      const creditLineList = creditLineResponse.data?.data || [];
      if (creditLineList.length === 0) {
        toast.error("Cannot find credit line for this agency");
        setSubmit(false);
        return;
      }
      
      const creditLimit = creditLineList[0]?.creditLimit || 0;
      
      // So sánh finalPrice với creditLimit và lưu kết quả
      const canApprove = finalPrice < creditLimit;
      
      // Gọi API chuyên dụng để đánh dấu đã check credit trên backend
      await PrivateAdminApi.checkCreditOrder(item.id);
      
      // Lưu kết quả check để Action column biết hiển thị nút gì
      setCreditCheckResults(prev => ({
        ...prev,
        [item.id]: {
          canApprove,
          finalPrice,
          creditLimit,
          checked: true
        }
      }));
      
      toast.success(`Credit checked. Final Price: ${finalPrice.toLocaleString()}, Credit Limit: ${creditLimit.toLocaleString()}. ${canApprove ? 'Can approve' : 'Should cancel'}`);
      
      // Refresh lại order list để cập nhật UI
      fetchOrderRestock();
    } catch (error) {
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
      render: (checked, item) => {
        const isChecked = creditCheckResults[item.id]?.checked || checked;
        return (
          <div className="flex items-center justify-center gap-2">
            {isChecked ? (
              <span className="text-green-600 font-medium">Yes</span>
            ) : (
              <>
                <span className="text-gray-500">No</span>
                {item.status === "PENDING" && (
                  <span
                    onClick={() => !submit && handleCheckCredit(item)}
                    className={`flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg hover:bg-blue-600 transition ${
                      submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    title="Check credit"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </span>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      key: "action",
      title: <span className="block text-center">Action</span>,
      render: (_, item) => (
        <div className="flex gap-2 justify-center">
          <span
            onClick={() => {
              setOrderModal(true);
              fetchOrderRestockDetail(item);
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-gray-500 rounded-lg hover:bg-gray-600 transition"
            title="View detail"
          >
            <Eye className="w-5 h-5 text-white" />
          </span>
          {item.status === "PENDING" && creditCheckResults[item.id]?.checked && (
            <>
              {creditCheckResults[item.id].canApprove ? (
                <span
                  onClick={() => !submit && handleApprove(item.id)}
                  className={`flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg hover:bg-green-600 transition ${
                    submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  title="Approve order"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </span>
              ) : (
                <span
                  onClick={() => !submit && handleCancel(item.id)}
                  className={`flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg hover:bg-red-600 transition ${
                    submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  title="Cancel order"
                >
                  <XCircle className="w-5 h-5 text-white" />
                </span>
              )}
            </>
          )}
          {item.status === "APPROVED" && (
            <span
              onClick={() => !submit && handleDeliver(item.id)}
              className={`flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg hover:bg-orange-600 transition ${
                submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              title="Deliver order"
            >
              <Truck className="w-5 h-5 text-white" />
            </span>
          )}
          {item.status !== "PENDING" && item.status !== "APPROVED" && item.status !== "DELIVERED" && (
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
          <label className="mr-2 font-medium text-gray-600">Agency:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={agencyId}
            onChange={(e) => {
              setAgencyId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {agencyList.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>
      </div>
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

export default OrderRestockManagementEVMStaff;
