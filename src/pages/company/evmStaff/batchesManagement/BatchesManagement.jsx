import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import FormModal from "../../../../components/modal/formModal/FormModal";
import BaseModal from "../../../../components/modal/baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";
import useAgencyList from "../../../../hooks/useAgencyList";
import { Eye, Pencil, Trash2, Plus, FileText } from "lucide-react";
import { formatCurrency } from "../../../../utils/currency";
import dayjs from "dayjs";

function BatchesManagement() {
  const { agencyList } = useAgencyList();
  const [batchList, setBatchList] = useState([]);
  const [batchDetail, setBatchDetail] = useState(null);

  // Helper function to get agency name from agencyId
  const getAgencyName = (agencyId) => {
    if (!agencyId) return null;
    if (!agencyList || agencyList.length === 0) return `Agency #${agencyId}`;
    const agency = agencyList.find((a) => Number(a.id) === Number(agencyId));
    return agency?.name || `Agency #${agencyId}`;
  };
  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [formModal, setFormModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const [form, setForm] = useState({
    invoiceNumber: "",
    amount: "",
    dueDate: "",
    agencyId: "",
    agencyOrderId: "",
    status: "OPEN",
  });

  const [orderList, setOrderList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch batches list
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (status) params.status = status;

      const response = await PrivateAdminApi.getBatchesList(params);
      setBatchList(response.data?.data || []);
      setTotalItem(response.data?.paginationInfo?.totalItems || 0);
    } catch (error) {
      toast.error(error.message || "Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status]);

  // Fetch agency orders when agency is selected
  useEffect(() => {
    const fetchOrders = async () => {
      if (!form.agencyId) {
        setOrderList([]);
        return;
      }
      setLoadingOrders(true);
      try {
        const response = await PrivateAdminApi.getOrderRestock({
          page: 1,
          limit: 100,
          agencyId: form.agencyId,
          status: "APPROVED", // Only show approved orders
        });
        setOrderList(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrderList([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [form.agencyId]);

  const handleViewDetail = async (batchId) => {
    setSelectedId(batchId);
    setViewModalLoading(true);
    setViewModal(true);
    try {
      const response = await PrivateAdminApi.getBatchDetail(batchId);
      setBatchDetail(response.data?.data || null);
    } catch (error) {
      toast.error(error.message || "Failed to fetch batch detail");
      setViewModal(false);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEdit(false);
    setForm({
      invoiceNumber: "",
      amount: "",
      dueDate: "",
      agencyId: "",
      agencyOrderId: "",
      status: "OPEN",
    });
    setOrderList([]);
    setFormModal(true);
  };

  const handleEdit = async (batchId) => {
    setSelectedId(batchId);
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getBatchDetail(batchId);
      const batch = response.data?.data || null;
      if (batch) {
        setIsEdit(true);
        setForm({
          invoiceNumber: batch.invoiceNumber || "",
          amount: batch.amount || "",
          dueDate: batch.dueDate
            ? dayjs(batch.dueDate).format("YYYY-MM-DDTHH:mm")
            : "",
          agencyId: batch.agencyOrder?.agencyId || "",
          agencyOrderId: batch.agencyOrder?.id || "",
          status: batch.status || "OPEN",
        });
        setFormModal(true);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch batch detail");
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleDelete = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) {
      return;
    }
    try {
      await PrivateAdminApi.deleteBatch(batchId);
      toast.success("Batch deleted successfully");
      fetchBatches();
    } catch (error) {
      toast.error(error.message || "Failed to delete batch");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      const payload = {
        invoiceNumber: Number(form.invoiceNumber),
        amount: Number(form.amount),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        agencyId: Number(form.agencyId),
        agencyOrderId: Number(form.agencyOrderId),
      };

      if (isEdit) {
        payload.status = form.status;
        await PrivateAdminApi.updateBatch(selectedId, payload);
        toast.success("Batch updated successfully");
      } else {
        await PrivateAdminApi.createBatch(payload);
        toast.success("Batch created successfully");
      }

      setFormModal(false);
      fetchBatches();
    } catch (error) {
      toast.error(error.message || "Failed to save batch");
    } finally {
      setSubmit(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-700";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700";
      case "CLOSED":
        return "bg-green-100 text-green-700";
      case "OVERDUE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const columns = [
    {
      key: "id",
      title: "ID",
      render: (value) => <span className="font-semibold">#{value}</span>,
    },
    {
      key: "invoiceNumber",
      title: "Invoice Number",
      render: (value) => value || "-",
    },
    {
      key: "amount",
      title: "Amount",
      render: (value) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(value || 0)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "createAt",
      title: "Created At",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      key: "dueDate",
      title: "Due Date",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY") : "-",
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(item.id);
            }}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="View Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item.id);
            }}
            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Filters and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="CLOSED">CLOSED</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Batch
        </button>
      </div>

      {/* Table */}
      <PaginationTable
        title="AP Batches Management"
        columns={columns}
        data={batchList}
        page={page}
        setPage={setPage}
        loading={loading}
        pageSize={limit}
        totalItem={totalItem}
      />

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={formModal}
        onClose={() => {
          setFormModal(false);
          setIsEdit(false);
          setForm({
            invoiceNumber: "",
            amount: "",
            dueDate: "",
            agencyId: "",
            agencyOrderId: "",
            status: "OPEN",
          });
          setOrderList([]);
        }}
        title={isEdit ? "Edit Batch" : "Create Batch"}
        isDelete={false}
        isCreate={!isEdit}
        onSubmit={handleSubmit}
        isSubmitting={submit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Agency *
            </label>
            <select
              required
              value={form.agencyId}
              onChange={(e) => {
                setForm({ ...form, agencyId: e.target.value, agencyOrderId: "" });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Agency</option>
              {agencyList.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name || `Agency #${agency.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Agency Order *
            </label>
            {loadingOrders ? (
              <div className="text-sm text-gray-500">Loading orders...</div>
            ) : (
              <select
                required
                value={form.agencyOrderId}
                onChange={(e) => setForm({ ...form, agencyOrderId: e.target.value })}
                disabled={!form.agencyId || orderList.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!form.agencyId
                    ? "Select agency first"
                    : orderList.length === 0
                    ? "No approved orders available"
                    : "Select Order"}
                </option>
                {orderList.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} - {formatCurrency(order.subTotal || 0)} -{" "}
                    {dayjs(order.orderAt).format("DD/MM/YYYY")}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Invoice Number *
            </label>
            <input
              type="number"
              required
              value={form.invoiceNumber}
              onChange={(e) =>
                setForm({ ...form, invoiceNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter invoice number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="datetime-local"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="OPEN">OPEN</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="CLOSED">CLOSED</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
          )}
        </div>
      </FormModal>

      {/* View Detail Modal */}
      <BaseModal
        isOpen={viewModal}
        onClose={() => {
          setViewModal(false);
          setBatchDetail(null);
        }}
        title="Batch Detail"
        size="lg"
      >
        {viewModalLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : batchDetail ? (
          <div className="space-y-6">
            {/* Batch Info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Batch Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="font-semibold">#{batchDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-semibold">{batchDetail.invoiceNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-emerald-600">
                    {formatCurrency(batchDetail.amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      batchDetail.status
                    )}`}
                  >
                    {batchDetail.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-semibold">
                    {batchDetail.createAt
                      ? dayjs(batchDetail.createAt).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">
                    {batchDetail.dueDate
                      ? dayjs(batchDetail.dueDate).format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                {batchDetail.agencyId && (
                  <div>
                    <p className="text-sm text-gray-600">Agency</p>
                    <p className="font-semibold">
                      {getAgencyName(batchDetail.agencyId)}
                    </p>
                  </div>
                )}
                {batchDetail.agencyOrderId && (
                  <div>
                    <p className="text-sm text-gray-600">Agency Order ID</p>
                    <p className="font-semibold">#{batchDetail.agencyOrderId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* AP Payments */}
            {batchDetail.apPayment && batchDetail.apPayment.length > 0 ? (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800">AP Payments</h3>
                <div className="space-y-2">
                  {batchDetail.apPayment.map((payment, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-3 border border-blue-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Paid Date</p>
                          <p className="font-semibold">
                            {payment.paidDate
                              ? dayjs(payment.paidDate).format("DD/MM/YYYY HH:mm")
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-emerald-600">
                            {formatCurrency(payment.amount || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-lg mb-2 text-gray-800">AP Payments</h3>
                <p className="text-sm text-gray-600">No payments recorded yet</p>
              </div>
            )}

            {/* Agency Order */}
            {batchDetail.agencyOrder && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Agency Order</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold">#{batchDetail.agencyOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Items Quantity</p>
                    <p className="font-semibold">
                      {batchDetail.agencyOrder.itemQuantity || batchDetail.agencyOrder.itemsQuantity || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sub Total</p>
                    <p className="font-semibold text-emerald-600">
                      {formatCurrency(batchDetail.agencyOrder.subtotal || batchDetail.agencyOrder.subTotal || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Type</p>
                    <p className="font-semibold">
                      {batchDetail.agencyOrder.orderType || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {batchDetail.agencyOrder.status || "-"}
                    </span>
                  </div>
                  {batchDetail.agencyOrder.creditChecked !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Credit Checked</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        batchDetail.agencyOrder.creditChecked 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {batchDetail.agencyOrder.creditChecked ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                  {batchDetail.agencyOrder.agencyId && (
                    <div>
                      <p className="text-sm text-gray-600">Agency</p>
                      <p className="font-semibold">
                        {getAgencyName(batchDetail.agencyOrder.agencyId)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Order At</p>
                    <p className="font-semibold">
                      {batchDetail.agencyOrder.orderAt
                        ? dayjs(batchDetail.agencyOrder.orderAt).format("DD/MM/YYYY HH:mm")
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                {batchDetail.agencyOrder.orderItems &&
                  batchDetail.agencyOrder.orderItems.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 text-gray-700">Order Items</h4>
                      <div className="space-y-2">
                        {batchDetail.agencyOrder.orderItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-3 border border-purple-100"
                          >
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-gray-600">Quantity</p>
                                <p className="font-semibold">{item.quantity || 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Base Price</p>
                                <p className="font-semibold">
                                  {formatCurrency(item.basePrice || 0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Final Price</p>
                                <p className="font-semibold text-emerald-600">
                                  {formatCurrency(item.finalPrice || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No batch detail available
          </div>
        )}
      </BaseModal>
    </div>
  );
}

export default BatchesManagement;

