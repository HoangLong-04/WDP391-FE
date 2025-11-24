import React, { useEffect, useState } from "react";
import useAgencyList from "../../../../hooks/useAgencyList";
import PrivateAdminApi from "../../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import BaseModal from "../../../../components/modal/baseModal/BaseModal";
import FormModal from "../../../../components/modal/formModal/FormModal";
import RestockForm from "../../orderRestockManagement/restockForm/RestockForm";
import dayjs from "dayjs";
import { Pencil, CheckCircle, Truck, XCircle, Save } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";
import { formatCurrency } from "../../../../utils/currency";
import CircularProgress from "@mui/material/CircularProgress";

function OrderRestockManagementEVMStaff() {
  const { agencyList } = useAgencyList();
  const [orderList, setOrderList] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [warehouseList, setWarehouseList] = useState([]);
  // Track warehouse status for each order: orderId -> boolean (true if all items have warehouse)
  const [orderWarehouseStatus, setOrderWarehouseStatus] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [status, setStatus] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [updatingWarehouse, setUpdatingWarehouse] = useState({}); // Map orderItemId -> boolean
  const [selectedWarehouses, setSelectedWarehouses] = useState({}); // Map orderItemId -> warehouseId

  const [orderModal, setOrderModal] = useState(false);
  const [formModal, setFormModal] = useState(false);

  const [form, setForm] = useState({
    status: "",
    note: "",
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
      
      // API list không trả về orderItems, cần fetch detail để lấy orderItems và vehicle names
      // Nhưng chỉ fetch vehicle names, giữ nguyên tất cả thông tin khác để không làm mất logic warehouse
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            // Fetch order detail để lấy orderItems
            const detailResponse = await PrivateAdminApi.getOrderRestockDetail(order.id);
            const orderDetail = detailResponse.data?.data;
            const orderItems = orderDetail?.orderItems || [];
            
            // Fetch order item details để lấy vehicle names, nhưng giữ nguyên tất cả field gốc
            if (orderItems.length > 0) {
              const itemDetailPromises = orderItems.map(async (orderItem) => {
                try {
                  if (orderItem.id) {
                    const itemDetailResponse = await PrivateAdminApi.getOrderRestockOrderItemDetail(orderItem.id);
                    const itemDetail = itemDetailResponse.data?.data;
                    // Giữ nguyên tất cả thông tin từ orderItem gốc, chỉ thêm vehicle names
                    return {
                      ...orderItem, // Giữ nguyên warehouseId, colorId, electricMotorbikeId, etc.
                      electricMotorbike: itemDetail?.electricMotorbike,
                      motorbike: itemDetail?.motorbike,
                    };
                  }
                  return orderItem;
                } catch (err) {
                  console.error(`Error fetching vehicle name for item ${orderItem.id}:`, err);
                  // Nếu lỗi, vẫn trả về orderItem gốc với đầy đủ thông tin
                  return orderItem;
                }
              });
              
              const enrichedItems = await Promise.all(itemDetailPromises);
              return {
                ...order,
                orderItems: enrichedItems,
              };
            }
            
            return {
              ...order,
              orderItems: [],
            };
          } catch (err) {
            console.error(`Error fetching detail for order ${order.id}:`, err);
            return {
              ...order,
              orderItems: [],
            };
          }
        })
      );
      
      setOrderList(enrichedOrders);
      const total = response.data?.paginationInfo?.total;
      setTotalItem(total ? Number(total) : 0);
      
      // Check warehouse status for APPROVED orders
      const warehouseStatusMap = {};
      for (const order of enrichedOrders) {
        if (order.status === "APPROVED" && order.orderItems && order.orderItems.length > 0) {
          // Check if all items have warehouseId
          const allHaveWarehouse = order.orderItems.every(item => item.warehouseId !== null && item.warehouseId !== undefined);
          warehouseStatusMap[order.id] = allHaveWarehouse;
        }
      }
      setOrderWarehouseStatus(prev => ({ ...prev, ...warehouseStatusMap }));
    } catch (error) {
      toast.error(error.message);
      setOrderList([]);
      setTotalItem(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouseList = async () => {
    try {
      const response = await PrivateAdminApi.getWarehouseList({
        page: 1,
        limit: 100,
      });
      setWarehouseList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching warehouse list:", error);
    }
  };

  const fetchOrderRestockDetail = async (item) => {
    setViewModalLoading(true);
    try {
      const orderId = item.id;
      
      // Call API to get order detail
      const orderDetailResponse = await PrivateAdminApi.getOrderRestockDetail(orderId);
      const orderDetailData = orderDetailResponse.data.data;
      setOrderDetail(orderDetailData);
      
      // Get all order items from API response
      const items = orderDetailData?.orderItems || [];
      if (items.length === 0) {
        toast.error("This order has no items to display");
        setViewModalLoading(false);
        return;
      }
      
      // Fetch detail for each order item to get warehouse and motorbike/color information
      const itemDetailsPromises = items.map(async (orderItem) => {
        try {
          const itemDetailResponse = await PrivateAdminApi.getOrderRestockOrderItemDetail(orderItem.id);
          return {
            ...orderItem,
            detail: itemDetailResponse.data.data,
          };
        } catch (error) {
          console.error(`Error fetching detail for order item ${orderItem.id}:`, error);
          return {
            ...orderItem,
            detail: null,
          };
        }
      });
      
      const itemsWithDetails = await Promise.all(itemDetailsPromises);
      setOrderItems(itemsWithDetails);
      
      // Initialize selected warehouses from current warehouse assignments
      const initialWarehouses = {};
      itemsWithDetails.forEach((item) => {
        if (item.detail?.warehouse?.id) {
          initialWarehouses[item.id] = item.detail.warehouse.id;
        }
      });
      setSelectedWarehouses(initialWarehouses);
      
      // Check if all items have warehouse and update status
      const allHaveWarehouse = itemsWithDetails.every(item => item.detail?.warehouse?.id);
      if (orderDetailData?.status === "APPROVED") {
        setOrderWarehouseStatus(prev => ({ ...prev, [orderId]: allHaveWarehouse }));
      }
      
      // Fetch warehouse list nếu chưa có
      if (warehouseList.length === 0) {
        await fetchWarehouseList();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleUpdateWarehouseItem = async (orderItemId, motorbikeId, warehouseId, colorId) => {
    if (!warehouseId) {
      toast.error("Please select a warehouse");
      return;
    }
    
    setUpdatingWarehouse(prev => ({ ...prev, [orderItemId]: true }));
    try {
      await PrivateAdminApi.updateWarehouseItem(orderItemId, motorbikeId, warehouseId, colorId);
      toast.success("Warehouse updated successfully");
      // Update selected warehouse in state
      setSelectedWarehouses(prev => ({ ...prev, [orderItemId]: warehouseId }));
      // Refresh order detail
      if (orderDetail?.id) {
        await fetchOrderRestockDetail({ id: orderDetail.id });
        
        // Check if all items now have warehouse
        const updatedItems = orderItems.map(item => {
          if (item.id === orderItemId) {
            return { ...item, detail: { ...item.detail, warehouse: { id: warehouseId } } };
          }
          return item;
        });
        setOrderItems(updatedItems);
        
        // Check if all items have warehouse now
        const allHaveWarehouse = updatedItems.every(item => item.detail?.warehouse?.id);
        if (allHaveWarehouse && orderDetail?.id) {
          setOrderWarehouseStatus(prev => ({ ...prev, [orderDetail.id]: true }));
          // Refresh order list to update UI
          fetchOrderRestock();
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to update warehouse");
    } finally {
      setUpdatingWarehouse(prev => ({ ...prev, [orderItemId]: false }));
    }
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      const updateData = {
        status: form.status,
      };
      if (form.note) {
        updateData.note = form.note;
      }
      await PrivateAdminApi.updateOrder(selectedId, updateData);
      setFormModal(false);
      fetchOrderRestock();
      toast.success("Update successfully");
      setForm({ status: "", note: "" });
    } catch (error) {
      setForm({ status: "", note: "" });
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleApprove = async (orderId) => {
    setSubmit(true);
    try {
      await PrivateAdminApi.updateOrder(orderId, { status: "APPROVED" });
      fetchOrderRestock();
      toast.success("Order approved successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleCancel = async (orderId) => {
    // Mở modal để nhập note khi cancel
    setSelectedId(orderId);
    setForm({ status: "CANCELED", note: "" });
    setFormModal(true);
  };

  const handleDeliver = async (orderId) => {
    setSubmit(true);
    try {
      // Check if all items have warehouse
      const orderDetailResponse = await PrivateAdminApi.getOrderRestockDetail(orderId);
      const orderDetail = orderDetailResponse.data.data;
      const items = orderDetail?.orderItems || [];
      
      if (items.length === 0) {
        toast.error("Order has no items");
        setSubmit(false);
        return;
      }
      
      // Fetch detail for each item to check warehouse
      const itemDetailsPromises = items.map(async (item) => {
        try {
          const itemDetailResponse = await PrivateAdminApi.getOrderRestockOrderItemDetail(item.id);
          return itemDetailResponse.data.data;
        } catch (error) {
          return null;
        }
      });
      
      const itemDetails = await Promise.all(itemDetailsPromises);
      const itemsWithoutWarehouse = itemDetails.filter(item => !item?.warehouse?.id);
      
      if (itemsWithoutWarehouse.length > 0) {
        toast.error("Please select warehouse for all items before delivering");
        setSubmit(false);
        return;
      }
      
      await PrivateAdminApi.updateOrder(orderId, { status: "DELIVERED" });
      fetchOrderRestock();
      toast.success("Order delivered successfully");
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
    {
      key: "agency",
      title: "Agency",
      render: (agency) => agency?.name || "-",
    },
    { key: "itemQuantity", title: "Item(s)" },
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
      render: (total) => formatCurrency(total || 0),
    },
    {
      key: "paidAmount",
      title: "Paid Amount",
      render: (paidAmount) => formatCurrency(paidAmount || 0),
    },
    {
      key: "orderAt",
      title: "Order date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    {
      key: "note",
      title: "Note",
      render: (note) => note || "-",
    },
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
    {
      key: "action",
      title: <span className="block text-center">Action</span>,
      render: (_, item) => (
        <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
          {item.status === "PENDING" && (
            <>
          <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!submit) handleApprove(item.id);
                  }}
                  className={`flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg hover:bg-green-600 transition ${
                    submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  title="Approve order"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!submit) handleCancel(item.id);
                  }}
                  className={`flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg hover:bg-red-600 transition ${
                    submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  title="Cancel order"
                >
                  <XCircle className="w-5 h-5 text-white" />
                </span>
            </>
          )}
          {item.status === "APPROVED" && (
            <>
              {orderWarehouseStatus[item.id] === false || orderWarehouseStatus[item.id] === undefined ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOrderModal(true);
                    fetchOrderRestockDetail(item);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition cursor-pointer text-sm font-medium"
                  title="Select warehouse for all items"
                >
                  <Save className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!submit) handleDeliver(item.id);
                  }}
                  disabled={submit}
                  className={`flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition text-sm font-medium ${
                submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
                  title="Giao hàng"
                >
                  <Truck className="w-4 h-4" />
                </button>
              )}
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
            <option value="COMPLETED">COMPLETED</option>
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
        onRowClick={(item) => {
          setOrderModal(true);
          fetchOrderRestockDetail(item);
        }}
      />
      <BaseModal
        isOpen={orderModal}
        onClose={() => {
          setOrderModal(false);
          setOrderDetail(null);
          setOrderItems([]);
          setSelectedWarehouses({});
        }}
        title="Order Detail"
        size="lg"
      >
        {viewModalLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : orderDetail ? (
          <div className="space-y-6">
            {/* Order Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-medium text-gray-800">{orderDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <div>{renderStatusTag(orderDetail.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="font-medium text-gray-800">{formatCurrency(orderDetail.total || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
                  <p className="font-medium text-gray-800">{formatCurrency(orderDetail.paidAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Item Quantity</p>
                  <p className="font-medium text-gray-800">{orderDetail.itemQuantity || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-medium text-gray-800">
                    {orderDetail.orderAt ? dayjs(orderDetail.orderAt).format("DD/MM/YYYY") : "-"}
                  </p>
                </div>
                {orderDetail.note && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Note</p>
                    <p className="font-medium text-gray-800">{orderDetail.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Agency Information */}
            {orderDetail.agency && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">
                  Agency Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">{orderDetail.agency.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium text-gray-800">{orderDetail.agency.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-medium text-gray-800">{orderDetail.agency.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contact</p>
                    <p className="font-medium text-gray-800">{orderDetail.agency.contactInfo || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-medium text-gray-800">{orderDetail.agency.status || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Payments */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-5 border border-yellow-100">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-yellow-200">
                Order Payments {orderDetail.orderPayments && orderDetail.orderPayments.length > 0 && `(${orderDetail.orderPayments.length})`}
              </h4>
              {orderDetail.orderPayments && orderDetail.orderPayments.length > 0 ? (
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
                        {orderDetail.orderPayments.map((payment) => (
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
                              orderDetail.orderPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
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

            {/* Order Items */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Order Items ({orderItems.length})
              </h4>
              <div className="space-y-4">
                {orderItems.map((orderItem, index) => {
                  const detail = orderItem.detail;
                  const currentWarehouseId = detail?.warehouse?.id || "";
                  const selectedWarehouseId = selectedWarehouses[orderItem.id] || currentWarehouseId || "";
                  const isUpdating = updatingWarehouse[orderItem.id];

                  return (
                    <div key={orderItem.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Item #{index + 1}</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Motorbike:</p>
                            <p className="font-medium">{detail?.electricMotorbike?.name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Color:</p>
                            <p className="font-medium">{detail?.color?.colorType || "-"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Quantity:</p>
                            <p className="font-medium">{orderItem.quantity || detail?.quantity || "-"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Base Price:</p>
                            <p className="font-medium">{formatCurrency(orderItem.basePrice || 0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Wholesale Price:</p>
                            <p className="font-medium">{formatCurrency(orderItem.wholesalePrice || 0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Discount Total:</p>
                            <p className="font-medium">{formatCurrency(orderItem.discountTotal || 0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Promotion Total:</p>
                            <p className="font-medium">{formatCurrency(orderItem.promotionTotal || 0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Final Price:</p>
                            <p className="font-medium text-indigo-600">{formatCurrency(orderItem.finalPrice || detail?.finalPrice || 0)}</p>
                          </div>
                          {detail?.warehouse && (
                            <div>
                              <p className="text-gray-600">Current Warehouse:</p>
                              <p className="font-medium">
                                {detail.warehouse.name || detail.warehouse.location || "-"}
                              </p>
                            </div>
                          )}
                          {detail?.discountPolicy && (
                            <div>
                              <p className="text-gray-600">Discount:</p>
                              <p className="font-medium">
                                {detail.discountPolicy.name || "-"}
                                {detail.discountPolicy.value && (
                                  <span className="ml-2 text-green-600">
                                    ({detail.discountPolicy.valueType === "PERCENT" 
                                      ? `${detail.discountPolicy.value}%` 
                                      : formatCurrency(detail.discountPolicy.value)})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          {detail?.promotion && (
                            <div>
                              <p className="text-gray-600">Promotion:</p>
                              <p className="font-medium">
                                {detail.promotion.name || "-"}
                                {detail.promotion.value && (
                                  <span className="ml-2 text-green-600">
                                    ({detail.promotion.valueType === "PERCENT" 
                                      ? `${detail.promotion.value}%` 
                                      : formatCurrency(detail.promotion.value)})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {orderDetail?.status === "APPROVED" && !detail?.warehouse && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Warehouse <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={selectedWarehouseId}
                              onChange={(e) => {
                                setSelectedWarehouses(prev => ({
                                  ...prev,
                                  [orderItem.id]: e.target.value
                                }));
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={isUpdating}
                            >
                              <option value="">-- Select Warehouse --</option>
                              {warehouseList.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                  {warehouse.name} - {warehouse.location}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                const warehouseId = selectedWarehouses[orderItem.id];
                                if (!warehouseId) {
                                  toast.error("Please select a warehouse");
                                  return;
                                }
                                handleUpdateWarehouseItem(
                                  orderItem.id,
                                  detail?.electricMotorbike?.id,
                                  warehouseId,
                                  detail?.color?.id
                                );
                              }}
                              disabled={isUpdating || !selectedWarehouses[orderItem.id]}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isUpdating ? (
                                <>
                                  <CircularProgress size={16} />
                                  <span>Updating...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data available
          </div>
        )}
      </BaseModal>
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
