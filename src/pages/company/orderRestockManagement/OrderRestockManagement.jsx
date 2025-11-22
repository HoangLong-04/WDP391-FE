import React, { useEffect, useState } from "react";
import useAgencyList from "../../../hooks/useAgencyList";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import BaseModal from "../../../components/modal/baseModal/BaseModal";
import dayjs from "dayjs";
import { renderStatusTag } from "../../../utils/statusTag";
import { formatCurrency } from "../../../utils/currency";
import CircularProgress from "@mui/material/CircularProgress";

function OrderRestockManagement() {
  const { agencyList } = useAgencyList();
  const [orderList, setOrderList] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);

  const [orderModal, setOrderModal] = useState(false);

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

  const fetchOrderRestockDetail = async (orderId) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getOrderRestockDetail(orderId);
      setOrderDetail(response.data.data);
    } catch (error) {
      toast.error(error.message || "Failed to load order detail");
    } finally {
      setViewModalLoading(false);
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
    { key: "itemQuantity", title: "Quantity" },
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
        onRowClick={(item) => {
          setOrderModal(true);
          fetchOrderRestockDetail(item.id);
        }}
      />
      <BaseModal
        isOpen={orderModal}
        onClose={() => {
          setOrderModal(false);
          setOrderDetail(null);
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
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
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

            {/* Order Items */}
            {orderDetail.orderItems && orderDetail.orderItems.length > 0 && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Order Items ({orderDetail.orderItems.length})
                </h4>
                <div className="space-y-4">
                  {orderDetail.orderItems.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3">Item #{index + 1}</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Quantity:</p>
                          <p className="font-medium">{item.quantity || "-"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Base Price:</p>
                          <p className="font-medium">{formatCurrency(item.basePrice || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Wholesale Price:</p>
                          <p className="font-medium">{formatCurrency(item.wholesalePrice || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Discount Total:</p>
                          <p className="font-medium">{formatCurrency(item.discountTotal || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Promotion Total:</p>
                          <p className="font-medium">{formatCurrency(item.promotionTotal || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Final Price:</p>
                          <p className="font-medium text-indigo-600">{formatCurrency(item.finalPrice || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Payments */}
            {orderDetail.orderPayments && orderDetail.orderPayments.length > 0 && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Order Payments ({orderDetail.orderPayments.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Invoice Number</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Amount</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderDetail.orderPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-800">{payment.invoiceNumber || "-"}</td>
                          <td className="px-4 py-2 text-gray-800">{formatCurrency(payment.amount || 0)}</td>
                          <td className="px-4 py-2 text-gray-800">
                            {payment.payAt ? dayjs(payment.payAt).format("DD/MM/YYYY") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data available
          </div>
        )}
      </BaseModal>
    </div>
  );
}

export default OrderRestockManagement;
