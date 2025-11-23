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
import useWarehouseAgency from "../../../../hooks/useWarehouseAgency";
import FormModal from "../../../../components/modal/formModal/FormModal";
import OrderRestockForm from "./orderRestockForm/OrderRestockForm";
import { Send, Plus, Trash2, CreditCard } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";

function OrderRestockAgency() {
  const { user } = useAuth();
  const { colorList } = useColorList();
  const { motorList } = useMotorList();
  const { warehouse } = useWarehouseAgency();
  const [restockList, setRestockList] = useState([]);
  const [restockDetail, setRestockDetail] = useState({});
  const [restockOrderItems, setRestockOrderItems] = useState([]); // All order items detail
  const [orderGeneralInfo, setOrderGeneralInfo] = useState({}); // Order general info
  
  // Promotion and Discount lists - will be fetched dynamically per item
  const [globalPromotions, setGlobalPromotions] = useState([]);
  const [promotionsByMotorbike, setPromotionsByMotorbike] = useState({}); // Map motorbikeId -> promotions
  const [agencyDiscounts, setAgencyDiscounts] = useState([]);
  const [discountsByMotorbike, setDiscountsByMotorbike] = useState({}); // Map motorbikeId -> discounts

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
  const [paymentModal, setPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState(null)

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
      
      // Enrich list with vehicle names from detail API if not available in orderItems
      const enrichedList = await Promise.all(
        list.map(async (order) => {
          const orderItems = order?.orderItems || [];
          
          // Check if orderItems already have vehicle names
          const hasVehicleNames = orderItems.some(
            (item) => item?.electricMotorbike?.name || item?.motorbike?.name
          );
          
          // If vehicle names are missing, fetch them from detail API
          if (!hasVehicleNames && orderItems.length > 0) {
            try {
              const itemDetailPromises = orderItems.map(async (orderItem) => {
                try {
                  if (orderItem.id) {
                    const detailResponse = await PrivateDealerManagerApi.getRestockOrderItemDetail(orderItem.id);
                    const detail = detailResponse.data?.data;
                    return {
                      ...orderItem,
                      electricMotorbike: detail?.electricMotorbike || orderItem.electricMotorbike,
                      motorbike: detail?.motorbike || orderItem.motorbike,
                    };
                  }
                  return orderItem;
                } catch (err) {
                  console.error(`Error fetching vehicle name for item ${orderItem.id}:`, err);
                  return orderItem;
                }
              });
              
              const enrichedItems = await Promise.all(itemDetailPromises);
              return {
                ...order,
                orderItems: enrichedItems,
              };
            } catch (err) {
              console.error(`Error enriching order ${order.id}:`, err);
              return order;
            }
          }
          
          return order;
        })
      );
      
      setRestockList(enrichedList);
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
      // Get orderItems from item (already available from API list)
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
        orderSubtotal: item.subtotal, // Fallback if total is not available
        paidAmount: item.paidAmount,
        itemQuantity: item.itemQuantity,
        creditChecked: item.creditChecked,
        agencyId: item.agencyId,
        note: item.note,
        orderPayments: item.orderPayments || [],
      });

      // Fetch detail for all orderItems
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
      // Refetch to sync
      fetchRestockList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleOpenPaymentModal = (item) => {
    const total = item.total || item.subtotal || 0;
    const paidAmount = item.paidAmount || 0;
    const remainingAmount = total - paidAmount;
    
    if (remainingAmount <= 0) {
      toast.error("Order has been fully paid");
      return;
    }

    setSelectedPaymentOrder({
      orderId: item.id,
      total: total,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
    });
    setPaymentAmount("");
    setPaymentModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!selectedPaymentOrder) {
      toast.error("Payment information is missing");
      return;
    }

    const amount = parseFloat(paymentAmount);
    const MAX_PAYMENT_AMOUNT = 200000000;
    
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > selectedPaymentOrder.remainingAmount) {
      toast.error(`Payment amount cannot exceed remaining amount: ${formatCurrency(selectedPaymentOrder.remainingAmount)}`);
      return;
    }

    if (amount > MAX_PAYMENT_AMOUNT) {
      toast.error(`Payment amount cannot exceed maximum limit: ${formatCurrency(MAX_PAYMENT_AMOUNT)}`);
      return;
    }

    setSubmit(true);
    try {
      const paymentData = {
        orderId: selectedPaymentOrder.orderId,
        amount: amount,
      };

      const response = await PrivateDealerManagerApi.payOrderRestock("web", paymentData);
      
      if (!response?.data?.data?.paymentUrl) {
        toast.error("Failed to receive payment URL from server. Please try again.");
        setSubmit(false);
        return;
      }
      
      toast.success("Redirecting to payment page...");
      setPaymentModal(false);
      setSelectedPaymentOrder(null);
      setPaymentAmount("");
      // Redirect to payment URL
      window.location.href = response.data.data.paymentUrl;
    } catch (error) {
      toast.error(error.message || "An error occurred during payment");
      setSubmit(false);
    }
  };

  // Fetch global promotions
  const fetchGlobalPromotions = async () => {
    try {
      const response = await PrivateDealerManagerApi.getPromotionList({ limit: 100 });
      setGlobalPromotions(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching global promotions:", error);
    }
  };

  // Fetch promotions for specific motorbike
  const fetchPromotionsForMotorbike = async (motorbikeId) => {
    if (!motorbikeId || promotionsByMotorbike[motorbikeId]) {
      return; // Already fetched or invalid
    }
    try {
      const response = await PrivateDealerManagerApi.getPromotionListWithMotorbike(motorbikeId, { limit: 100 });
      setPromotionsByMotorbike(prev => ({
        ...prev,
        [motorbikeId]: response.data?.data || []
      }));
    } catch (error) {
      console.error(`Error fetching promotions for motorbike ${motorbikeId}:`, error);
      setPromotionsByMotorbike(prev => ({
        ...prev,
        [motorbikeId]: []
      }));
    }
  };

  // Fetch agency discounts (base list, no motorbikeId filter)
  const fetchAgencyDiscounts = async () => {
    try {
      const response = await PrivateDealerManagerApi.getDiscountList(user?.agencyId, { limit: 100 });
      setAgencyDiscounts(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching agency discounts:", error);
    }
  };

  // Fetch agency discounts with motorbikeId filter (for a specific item)
  const fetchAgencyDiscountsForMotorbike = async (motorbikeId) => {
    if (!motorbikeId) return;
    try {
      const response = await PrivateDealerManagerApi.getDiscountList(user?.agencyId, { 
        limit: 100,
        motorbikeId 
      });
      // Merge into agencyDiscounts to have both general discounts and discounts for specific motorbike
      setAgencyDiscounts(prev => {
        const existingIds = new Set(prev.map(d => d.id));
        const newDiscounts = (response.data?.data || []).filter(d => !existingIds.has(d.id));
        return [...prev, ...newDiscounts];
      });
    } catch (error) {
      console.error(`Error fetching agency discounts for motorbike ${motorbikeId}:`, error);
    }
  };

  // Fetch common discounts for motorbike
  const fetchDiscountsForMotorbike = async (motorbikeId) => {
    if (!motorbikeId || discountsByMotorbike[motorbikeId]) {
      return; // Already fetched or invalid
    }
    try {
      const response = await PrivateDealerManagerApi.getDiscountListForMotorbike(motorbikeId, { limit: 100 });
      setDiscountsByMotorbike(prev => ({
        ...prev,
        [motorbikeId]: response.data?.data || []
      }));
    } catch (error) {
      console.error(`Error fetching discounts for motorbike ${motorbikeId}:`, error);
      setDiscountsByMotorbike(prev => ({
        ...prev,
        [motorbikeId]: []
      }));
    }
  };

  useEffect(() => {
    fetchRestockList();
  }, [page, limit, status]);

  // Fetch promotions and discounts when form modal opens
  useEffect(() => {
    if (formModal && user?.agencyId) {
      fetchGlobalPromotions();
      fetchAgencyDiscounts();
    }
  }, [formModal, user?.agencyId]);

  // Fetch promotions and discounts when motorbike is selected in form
  useEffect(() => {
    if (formModal) {
      form.orderItems.forEach((item) => {
        if (item.motorbikeId && item.motorbikeId > 0) {
          fetchPromotionsForMotorbike(item.motorbikeId);
          fetchDiscountsForMotorbike(item.motorbikeId);
          fetchAgencyDiscountsForMotorbike(item.motorbikeId);
        }
      });
    }
  }, [form.orderItems.map(item => item.motorbikeId).join(','), formModal]);

  // Check for payment success callback and refresh list
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentStatus = urlParams.get('status');
    
    if (paymentSuccess === 'true' || paymentStatus === 'success') {
      toast.success("Payment completed successfully");
      fetchRestockList();
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancel') {
      toast.error("Payment was cancelled or failed");
      fetchRestockList();
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleViewDetail = async (item) => {
    setViewModal(true);
    fetchOrderRestockDetail(item);
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "itemQuantity", title: "Items" },
    {
      key: "vehicleNames",
      title: "Vehicle Name(s)",
      render: (_, item) => {
        const orderItems = item?.orderItems || [];
        if (orderItems.length === 0) return "-";
        
        // Extract unique vehicle names from orderItems
        const vehicleNames = new Set();
        orderItems.forEach((orderItem) => {
          const vehicleName = orderItem?.electricMotorbike?.name || orderItem?.motorbike?.name;
          if (vehicleName) {
            vehicleNames.add(vehicleName);
          }
        });
        
        if (vehicleNames.size === 0) return "-";
        
        const namesArray = Array.from(vehicleNames);
        // Display each vehicle name on a separate line with badge
        return (
          <div className="flex flex-col gap-1">
            {namesArray.map((name, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        );
      },
    },
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
      label: "Payment",
      icon: CreditCard,
      onClick: (item) => {
        if (item.status === 'DELIVERED') {
          handleOpenPaymentModal(item);
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

            {/* Order Payments */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Order Payments {orderGeneralInfo.orderPayments && orderGeneralInfo.orderPayments.length > 0 && `(${orderGeneralInfo.orderPayments.length})`}
              </h4>
              {orderGeneralInfo.orderPayments && orderGeneralInfo.orderPayments.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Payment ID</th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Invoice Number</th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Amount</th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Payment Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orderGeneralInfo.orderPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-800">{payment.id || "-"}</td>
                            <td className="px-4 py-2 text-gray-800">{payment.invoiceNumber || "-"}</td>
                            <td className="px-4 py-2 text-gray-800">{formatCurrency(payment.amount || 0)}</td>
                            <td className="px-4 py-2 text-gray-800">
                              {payment.payAt ? dayjs(payment.payAt).format("DD/MM/YYYY") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="2" className="px-4 py-2 text-right font-semibold text-gray-700">
                            Total Payments:
                          </td>
                          <td className="px-4 py-2 text-gray-800 font-semibold">
                            {formatCurrency(
                              orderGeneralInfo.orderPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
                            )}
                          </td>
                          <td className="px-4 py-2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No payments recorded
                </div>
              )}
            </div>

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
          setForm={setForm}
          warehouseList={warehouse}
          globalPromotions={globalPromotions}
          promotionsByMotorbike={promotionsByMotorbike}
          agencyDiscounts={agencyDiscounts}
          discountsByMotorbike={discountsByMotorbike}
          onMotorbikeChange={(itemIndex, motorbikeId) => {
            if (motorbikeId && motorbikeId > 0) {
              fetchPromotionsForMotorbike(motorbikeId);
              fetchDiscountsForMotorbike(motorbikeId);
              fetchAgencyDiscountsForMotorbike(motorbikeId);
            }
          }}
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

      <FormModal
        isOpen={paymentModal}
        onClose={() => {
          setPaymentModal(false);
          setSelectedPaymentOrder(null);
          setPaymentAmount("");
        }}
        onSubmit={handlePayment}
        isSubmitting={submit}
        title={"Payment"}
        isDelete={false}
        isPayment={true}
      >
        {selectedPaymentOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Total:</span>
                <span className="font-semibold text-gray-800">{formatCurrency(selectedPaymentOrder.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-semibold text-gray-800">{formatCurrency(selectedPaymentOrder.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2">
                <span className="text-gray-700 font-medium">Remaining Amount:</span>
                <span className="font-bold text-indigo-600">{formatCurrency(selectedPaymentOrder.remainingAmount)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
                min="0"
                max={Math.min(selectedPaymentOrder.remainingAmount, 200000000)}
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum: {formatCurrency(Math.min(selectedPaymentOrder.remainingAmount, 200000000))} per transaction
              </p>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

export default OrderRestockAgency;
