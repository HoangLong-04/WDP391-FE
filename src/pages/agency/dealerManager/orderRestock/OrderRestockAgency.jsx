import { formatCurrency } from "../../../../utils/currency";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import DataTable from "../../../../components/dataTable/DataTable";
import dayjs from "dayjs";
import BaseModal from "../../../../components/modal/baseModal/BaseModal";
import { CircularProgress } from "@mui/material";
import useColorList from "../../../../hooks/useColorList";
import useMotorList from "../../../../hooks/useMotorList";
import useDiscountAgency from "../../../../hooks/useDiscountAgency";
import useWarehouseAgency from "../../../../hooks/useWarehouseAgency";
import usePromotionAgency from "../../../../hooks/usePromotionAgency";
import FormModal from "../../../../components/modal/formModal/FormModal";
import OrderRestockForm from "./orderRestockForm/OrderRestockForm";
import { Send, Plus, Trash2, CreditCard } from "lucide-react";
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
  const [restockOrderItems, setRestockOrderItems] = useState([]); // All order items detail
  const [orderGeneralInfo, setOrderGeneralInfo] = useState({}); // Order general info

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
    orderItems: [
      {
        quantity: 0,
        discountId: null,
        promotionId: null,
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
      // Lấy orderItems từ item (đã có từ API list)
      const orderItems = item?.orderItems || [];
      if (orderItems.length === 0) {
        toast.error("This order has no items to display");
        setViewModalLoading(false);
        return;
      }

      // Lưu thông tin order chung
      setOrderGeneralInfo({
        orderId: item.id,
        orderAt: item.orderAt,
        orderStatus: item.status,
        orderTotal: item.total,
        orderSubtotal: item.subtotal, // Fallback nếu không có total
        paidAmount: item.paidAmount,
        itemQuantity: item.itemQuantity,
        creditChecked: item.creditChecked,
        agencyId: item.agencyId,
        note: item.note,
      });

      // Fetch detail cho tất cả orderItems
      const itemDetailPromises = orderItems.map(async (orderItem) => {
        try {
          const orderItemId = orderItem.id;
          if (!orderItemId) {
            return null;
          }
          const response = await PrivateDealerManagerApi.getRestockOrderItemDetail(orderItemId);
          return response.data?.data;
        } catch (err) {
          console.error(`Error fetching detail for item ${orderItem.id}:`, err);
          return null;
        }
      });

      const allItemDetails = await Promise.all(itemDetailPromises);
      const validItemDetails = allItemDetails.filter(item => item !== null);

      if (validItemDetails.length === 0) {
        toast.error("Failed to load order items detail");
        setViewModalLoading(false);
        return;
      }

      // Set first item as main detail (for backward compatibility)
      setRestockDetail(validItemDetails[0]);
      
      // Set all items for display
      setRestockOrderItems(validItemDetails);
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
      // Filter valid items (items that will be created)
      const validItems = form.orderItems.filter(
        (item) =>
          item.motorbikeId > 0 &&
          item.colorId > 0 &&
          item.quantity > 0
      );

      if (validItems.length === 0) {
        toast.error("Please fill in at least one valid order item");
        setSubmit(false);
        return;
      }

      // Chuyển đổi form thành format API: loại bỏ null/0 và chỉ gửi giá trị hợp lệ
      const payload = {
        orderItems: validItems.map((item) => ({
          quantity: item.quantity,
          motorbikeId: item.motorbikeId,
          colorId: item.colorId,
          ...(item.discountId && item.discountId > 0 && { discountId: item.discountId }),
          ...(item.promotionId && item.promotionId > 0 && { promotionId: item.promotionId }),
        })),
        agencyId: user?.agencyId,
      };

      await PrivateDealerManagerApi.createRestock(payload);
      
      // Reset form to default after successful creation
      setForm({
        orderItems: [
          {
            quantity: 0,
            discountId: null,
            promotionId: null,
            motorbikeId: 0,
            colorId: 0,
          },
        ],
        agencyId: user?.agencyId,
      });

      fetchRestockList();
      setFormModal(false);
      toast.success(`Create successfully. ${validItems.length} item(s) created.`);
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
  };

  const handlePayment = async (orderId, total, paidAmount) => {
    setSubmit(true);
    try {
      // Tính số tiền còn lại cần thanh toán
      const remainingAmount = (total || 0) - (paidAmount || 0);
      
      if (remainingAmount <= 0) {
        toast.error("Đơn hàng đã được thanh toán đủ");
        setSubmit(false);
        return;
      }

      const paymentData = {
        orderId: orderId,
        amount: remainingAmount,
      };

      const response = await PrivateDealerManagerApi.payOrderRestock("web", paymentData);
      
      if (!response?.data?.data?.paymentUrl) {
        toast.error("Không nhận được payment URL từ server. Vui lòng thử lại.");
        setSubmit(false);
        return;
      }
      
      toast.success("Đang chuyển đến trang thanh toán...");
      // Redirect to payment URL
      window.location.href = response.data.data.paymentUrl;
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi thanh toán");
      setSubmit(false);
    }
  };

  useEffect(() => {
    fetchRestockList();
  }, [page, limit, status]);

  const handleViewDetail = async (item) => {
    setViewModal(true);
    fetchOrderRestockDetail(item);
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "itemQuantity", title: "Items" },
    {
      key: "total",
      title: "Total",
      render: (val) => (typeof val === "number" ? formatCurrency(val) : val),
    },
    {
      key: "paidAmount",
      title: "Paid Amount",
      render: (val) => (typeof val === "number" ? formatCurrency(val) : formatCurrency(0)),
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
  ];

  const actions = [
    {
      type: "edit",
      label: "Send to Pending",
      icon: Send,
      onClick: (item) => {
        if (item.status === 'DRAFT') {
          setSendRequestModal(true);
          setSelectedId(item.id);
        }
      },
      show: (item) => item.status === 'DRAFT',
    },
    {
      type: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: (item) => {
        if (item.status === 'DRAFT') {
          setDeleteModal(true);
          setSelectedDeleteId(item.id);
        }
      },
      show: (item) => item.status === 'DRAFT',
    },
    {
      type: "payment",
      label: "Thanh toán",
      icon: CreditCard,
      onClick: (item) => {
        if (item.status === 'DELIVERED') {
          const total = item.total || item.subtotal || 0;
          const paidAmount = item.paidAmount || 0;
          handlePayment(item.id, total, paidAmount);
        }
      },
      show: (item) => item.status === 'DELIVERED',
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
            <option value="COMPLETED">COMPLETED</option>
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
      <DataTable
        title="Order Restock"
        columns={columns}
        data={restockList}
        loading={loading}
        page={page}
        setPage={setPage}
        totalItem={totalItem}
        limit={limit}
        onRowClick={handleViewDetail}
        actions={actions}
      />
      <BaseModal
        isOpen={viewModal}
        onClose={() => {
          setViewModal(false);
          setRestockOrderItems([]);
          setOrderGeneralInfo({});
        }}
        title="Order Restock Detail"
        size="lg"
      >
        {viewLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order General Info */}
            {orderGeneralInfo.orderId && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <span className="ml-2 font-medium text-gray-800">{orderGeneralInfo.orderId || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Order Date:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {orderGeneralInfo.orderAt ? dayjs(orderGeneralInfo.orderAt).format("DD/MM/YYYY") : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {renderStatusTag(orderGeneralInfo.orderStatus)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {orderGeneralInfo.orderTotal ? formatCurrency(orderGeneralInfo.orderTotal) : orderGeneralInfo.orderSubtotal ? formatCurrency(orderGeneralInfo.orderSubtotal) : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paid Amount:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {orderGeneralInfo.paidAmount ? formatCurrency(orderGeneralInfo.paidAmount) : formatCurrency(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Items:</span>
                    <span className="ml-2 font-medium text-gray-800">{restockOrderItems.length}</span>
                  </div>
                  {orderGeneralInfo.note && (
                    <div className="col-span-full">
                      <span className="text-gray-600">Note:</span>
                      <p className="mt-1 font-medium text-gray-800">{orderGeneralInfo.note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* All Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Order Items ({restockOrderItems.length})
              </h3>
              <div className="space-y-4">
                {restockOrderItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-800">Item #{index + 1}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Motorbike</p>
                        <p className="font-medium text-gray-800">
                          {item.electricMotorbike?.name || item.motorbike?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Color</p>
                        <p className="font-medium text-gray-800">
                          {item.color?.colorType || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Quantity</p>
                        <p className="font-medium text-gray-800">{item.quantity || 0}</p>
                      </div>
                      {item.warehouse && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Warehouse</p>
                          <p className="font-medium text-gray-800">
                            {item.warehouse?.name || item.warehouse?.location || "-"}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Base Price</p>
                        <p className="font-medium text-gray-800">
                          {item.basePrice ? formatCurrency(item.basePrice) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Wholesale Price</p>
                        <p className="font-medium text-gray-800">
                          {item.wholesalePrice ? formatCurrency(item.wholesalePrice) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Final Price</p>
                        <p className="font-medium text-indigo-600">
                          {item.finalPrice ? formatCurrency(item.finalPrice) : "-"}
                        </p>
                      </div>
                      {item.discountPolicy && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Discount</p>
                          <p className="font-medium text-gray-800">
                            {item.discountPolicy.name || "-"}
                            {item.discountPolicy.value && (
                              <span className="ml-2 text-green-600">
                                ({item.discountPolicy.valueType === "PERCENT" 
                                  ? `${item.discountPolicy.value}%` 
                                  : formatCurrency(item.discountPolicy.value)})
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      {item.promotion && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Promotion</p>
                          <p className="font-medium text-gray-800">
                            {item.promotion.name || "-"}
                            {item.promotion.value && (
                              <span className="ml-2 text-green-600">
                                ({item.promotion.valueType === "PERCENT" 
                                  ? `${item.promotion.value}%` 
                                  : formatCurrency(item.promotion.value)})
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </BaseModal>
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
