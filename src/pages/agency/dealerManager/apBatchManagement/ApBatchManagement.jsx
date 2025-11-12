import React, { useEffect, useState } from "react";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { useAuth } from "../../../../hooks/useAuth";
import { toast } from "react-toastify";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import BaseModal from "../../../../components/modal/baseModal/BaseModal";
import FormModal from "../../../../components/modal/formModal/FormModal";
import { Eye, CreditCard } from "lucide-react";
import { formatCurrency } from "../../../../utils/currency";
import dayjs from "dayjs";

function ApBatchManagement() {
  const { user } = useAuth();
  const [batchList, setBatchList] = useState([]);
  const [batchDetail, setBatchDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");
  const [totalItem, setTotalItem] = useState(0);
  const [viewModal, setViewModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentType: "INSTALLMENT", // INSTALLMENT or FULL
    amount: 0,
  });

  // Fetch batches list
  const fetchBatches = async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      const params = { page, limit };
      if (status) params.status = status;

      const response = await PrivateDealerManagerApi.getApBatchList(user.agencyId, params);
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
  }, [page, limit, status, user?.agencyId]);

  const handleViewDetail = async (batchId) => {
    setSelectedId(batchId);
    setViewModal(true);
    setViewModalLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getApBatchDetail(batchId);
      setBatchDetail(response.data?.data || null);
    } catch (error) {
      toast.error(error.message || "Failed to fetch batch detail");
      setViewModal(false);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleOpenPaymentModal = (batch) => {
    setBatchDetail(batch);
    setPaymentForm({
      paymentType: "INSTALLMENT",
      amount: 0,
    });
    setPaymentModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!batchDetail) return;

    setPaymentSubmitting(true);
    try {
      // Calculate remaining amount
      const batchAmount = Number(batchDetail.amount || 0);
      const paidAmount = batchDetail.apPayment?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      const remainingAmount = batchAmount - paidAmount;
      const paymentAmount = Number(paymentForm.amount || 0);

      // Validate payment amount
      if (paymentForm.paymentType === "FULL") {
        // For full payment, amount must exactly match remaining amount
        if (Math.abs(paymentAmount - remainingAmount) > 0.01) {
          toast.error(`Số tiền thanh toán phải đúng chính xác số tiền còn lại: ${formatCurrency(remainingAmount)}`);
          setPaymentSubmitting(false);
          return;
        }
      } else {
        // For installment, amount must be greater than 0 and less than or equal to remaining amount
        if (paymentAmount <= 0) {
          toast.error("Số tiền thanh toán phải lớn hơn 0");
          setPaymentSubmitting(false);
          return;
        }

        if (paymentAmount > remainingAmount) {
          toast.error(`Số tiền thanh toán không được vượt quá số tiền còn lại: ${formatCurrency(remainingAmount)}`);
          setPaymentSubmitting(false);
          return;
        }
      }

      const paymentData = {
        batchId: batchDetail.id,
        amount: Number(paymentForm.amount),
      };

      console.log("Payment data:", paymentData); // Debug log

      const response = await PrivateDealerManagerApi.payApBatch("web", paymentData);
      
      console.log("Payment response:", response?.data); // Debug log
      
      // Validate response
      if (!response?.data?.data?.paymentUrl) {
        console.error("Invalid payment response:", response);
        toast.error("Không nhận được payment URL từ server. Vui lòng thử lại.");
        return;
      }
      
      toast.success("Đang chuyển đến trang thanh toán...");
      // Redirect directly to payment URL (don't modify it as it may break VNPay's hash)
      window.location.href = response.data.data.paymentUrl;
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to process payment";
      toast.error(errorMessage);
      
      // Show more details in console for debugging
      if (error.response?.data) {
        console.error("Error details:", error.response.data);
      }
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      OPEN: "bg-yellow-100 text-yellow-800",
      PARTIAL: "bg-blue-100 text-blue-800",
      CLOSED: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    { key: "invoiceNumber", title: "Invoice Number" },
    {
      key: "amount",
      title: "Amount",
      render: (value) => formatCurrency(value || 0),
    },
    {
      key: "dueDate",
      title: "Due Date",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY") : "-",
    },
    {
      key: "status",
      title: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "action",
      title: "Action",
      render: (_, item) => {
        const paidAmount = item.apPayment?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
        const batchAmount = Number(item.amount || 0);
        const remainingAmount = batchAmount - paidAmount;
        const isFullyPaid = remainingAmount <= 0.01;

        return (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleViewDetail(item.id)}
              className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
              title="View Detail"
            >
              <Eye size={18} />
            </button>
            {!isFullyPaid && (
              <button
                onClick={() => handleOpenPaymentModal(item)}
                className="cursor-pointer text-white bg-green-500 p-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                title="Pay"
              >
                <CreditCard size={18} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">AP Batches Management</h2>

      <div className="mb-4 flex gap-4 items-center">
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
            <option value="OPEN">OPEN</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      <PaginationTable
        columns={columns}
        data={batchList}
        loading={loading}
        page={page}
        limit={limit}
        totalItem={totalItem}
        onPageChange={setPage}
      />

      {/* View Detail Modal */}
      <BaseModal
        isOpen={viewModal}
        onClose={() => {
          setViewModal(false);
          setBatchDetail(null);
        }}
        title="AP Batch Detail"
      >
        {viewModalLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : batchDetail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="font-semibold">{batchDetail.invoiceNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold text-indigo-600">
                  {formatCurrency(batchDetail.amount || 0)}
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
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div>{getStatusBadge(batchDetail.status)}</div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">{formatCurrency(batchDetail.amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(
                      batchDetail.apPayment?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-semibold">Remaining Amount:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(
                      Number(batchDetail.amount || 0) -
                        (batchDetail.apPayment?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0)
                    )}
                  </span>
                </div>
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

            {/* Pay Button */}
            {(() => {
              const paidAmount = batchDetail.apPayment?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
              const batchAmount = Number(batchDetail.amount || 0);
              const remainingAmount = batchAmount - paidAmount;
              const isFullyPaid = remainingAmount <= 0.01;

              if (!isFullyPaid) {
                return (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleOpenPaymentModal(batchDetail)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center gap-2"
                    >
                      <CreditCard size={18} />
                      Pay Now
                    </button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : (
          <div className="text-gray-500">No data available</div>
        )}
      </BaseModal>

      {/* Payment Modal */}
      <FormModal
        isOpen={paymentModal}
        onClose={() => {
          setPaymentModal(false);
          setBatchDetail(null);
          setPaymentForm({
            paymentType: "INSTALLMENT",
            amount: 0,
          });
        }}
        title="Pay AP Batch"
        isDelete={false}
        isCreate={true}
        onSubmit={handlePayment}
        isSubmitting={paymentSubmitting}
      >
        {batchDetail && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold mb-2">Batch Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{batchDetail.invoiceNumber || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(batchDetail.amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(
                      batchDetail.apPayment?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-gray-600 font-semibold">Remaining Amount:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(
                      Number(batchDetail.amount || 0) -
                        (batchDetail.apPayment?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={paymentForm.paymentType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setPaymentForm((prev) => {
                    const batchAmount = Number(batchDetail.amount || 0);
                    const paidAmount = batchDetail.apPayment?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
                    const remainingAmount = batchAmount - paidAmount;
                    
                    return {
                      ...prev,
                      paymentType: newType,
                      // If switching to FULL, set amount to remaining amount
                      // If switching to INSTALLMENT, reset to 0
                      amount: newType === "FULL" ? remainingAmount : 0,
                    };
                  });
                }}
                required
              >
                <option value="INSTALLMENT">INSTALLMENT (Gối đầu - có thể tùy chỉnh số tiền)</option>
                <option value="FULL">FULL (Trả full - phải đúng số tiền còn lại)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                value={paymentForm.amount}
                onChange={(e) => {
                  const value = Number(e.target.value || 0);
                  setPaymentForm((prev) => ({ ...prev, amount: value }));
                }}
                disabled={paymentForm.paymentType === "FULL"}
                required
                min="0"
                step="0.01"
              />
              {paymentForm.paymentType === "FULL" && (
                <p className="text-xs text-gray-500 mt-1">
                  Số tiền thanh toán đã được tự động set bằng số tiền còn lại
                </p>
              )}
              {paymentForm.paymentType === "INSTALLMENT" && (
                <p className="text-xs text-gray-500 mt-1">
                  Bạn có thể nhập số tiền muốn thanh toán (không được vượt quá số tiền còn lại)
                </p>
              )}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

export default ApBatchManagement;

