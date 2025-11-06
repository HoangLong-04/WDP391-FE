import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerStaffApi from "../../../../services/PrivateDealerStaffApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import { formatCurrency } from "../../../../utils/currency";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import BaseModal from "../../../../components/modal/baseModal/BaseModal";
import { Eye, CheckCircle, XCircle, Clock, RotateCcw, Loader2, FileText } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";

dayjs.extend(utc);

function QuotationManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItem, setTotalItem] = useState(0);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [quoteCode, setQuoteCode] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [quotationDetail, setQuotationDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (user?.agencyId) {
      fetchQuotations();
    }
  }, [page, limit, type, status, quoteCode, user?.agencyId]);

  const fetchQuotations = async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(type && { type }),
        ...(status && { status }),
        ...(quoteCode && { quoteCode }),
      };
      const res = await PrivateDealerStaffApi.getQuotationList(user.agencyId, params);
      const list = res.data?.data || [];
      // Sort newest first by createDate (using raw data time -> UTC instant order)
      list.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
      setQuotations(list);
      setTotalItem(res.data?.paginationInfo?.total || 0);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (quotationId) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const res = await PrivateDealerStaffApi.getQuotationDetail(quotationId);
      setQuotationDetail(res.data?.data || null);
    } catch (error) {
      toast.error(error.message || "Failed to load quotation detail");
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!quotationDetail?.id) return;
    
    setUpdatingStatus(true);
    try {
      await PrivateDealerStaffApi.updateQuotation(quotationDetail.id, { status: newStatus });
      toast.success(`Quotation status updated to ${newStatus}`);
      // Refresh detail
      const res = await PrivateDealerStaffApi.getQuotationDetail(quotationDetail.id);
      setQuotationDetail(res.data?.data || null);
      // Refresh list
      fetchQuotations();
    } catch (error) {
      toast.error(error.message || "Failed to update quotation status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return null;
    return path
      .split(".")
      .reduce(
        (currentObj, key) =>
          currentObj && currentObj[key] !== undefined ? currentObj[key] : null,
        obj
      );
  };

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    return dayjs.utc().isAfter(dayjs.utc(validUntil));
  };

  const canUpdateStatus = (quotation) => {
    if (!quotation) return false;
    const expired = isExpired(quotation.validUntil);
    const currentStatus = quotation.status;
    
    // If expired and not already EXPIRED, can mark as EXPIRED
    if (expired && currentStatus !== "EXPIRED") return true;
    
    // Can update from DRAFT to ACCEPTED or REJECTED
    if (currentStatus === "DRAFT") return true;
    
    // Can update ORDER or PRE_ORDER to REVERSED when bike arrives
    if ((currentStatus === "ACCEPTED" || currentStatus === "DRAFT") && 
        (quotation.type === "ORDER" || quotation.type === "PRE_ORDER")) {
      return true;
    }
    
    return false;
  };

  const columns = [
    {
      key: "quoteCode",
      title: "Quote Code",
      render: (code) => (
        <span className="font-mono text-xs">{code}</span>
      ),
    },
    {
      key: "createDate",
      title: "Create Date",
      // Show as data time (Z means UTC); render in UTC to avoid local timezone shift
      render: (date) => dayjs.utc(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      key: "type",
      title: "Type",
      render: (type) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
          {type}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (status) => {
        const statusColors = {
          DRAFT: "bg-gray-100 text-gray-700",
          ACCEPTED: "bg-green-100 text-green-700",
          REJECTED: "bg-red-100 text-red-700",
          EXPIRED: "bg-orange-100 text-orange-700",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "basePrice",
      title: "Base Price",
      render: (price) => formatCurrency(price),
    },
    {
      key: "promotionPrice",
      title: "Promotion Price",
      render: (price) => formatCurrency(price),
    },
    {
      key: "finalPrice",
      title: "Final Price",
      render: (price) => (
        <span className="font-semibold text-indigo-600">
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      key: "validUntil",
      title: "Valid Until",
      render: (date) => dayjs.utc(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      key: "action",
      title: "Action",
      render: (_, row) => (
        <button
          onClick={() => handleViewDetail(row.id)}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          title="View Detail"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  const renderStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: "bg-gray-100", text: "text-gray-700", label: "DRAFT" },
      ACCEPTED: { bg: "bg-green-100", text: "text-green-700", label: "ACCEPTED" },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", label: "REJECTED" },
      EXPIRED: { bg: "bg-orange-100", text: "text-orange-700", label: "EXPIRED" },
      REVERSED: { bg: "bg-purple-100", text: "text-purple-700", label: "REVERSED" },
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div>
      <div className="my-3 flex flex-wrap gap-4 items-center justify-end">
        <div>
          <label className="mr-2 font-medium text-gray-600">Type:</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="AT_STORE">AT_STORE</option>
            <option value="ORDER">ORDER</option>
            <option value="PRE_ORDER">PRE_ORDER</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Status:</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Quote Code:</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2"
            value={quoteCode}
            onChange={(e) => {
              setQuoteCode(e.target.value);
              setPage(1);
            }}
            placeholder="Search by code..."
          />
        </div>
      </div>
      <PaginationTable
        columns={columns}
        data={quotations}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title="Quotation Management"
        totalItem={totalItem}
      />
      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setQuotationDetail(null);
        }}
        title="Quotation Detail"
        size="lg"
      >
        {loadingDetail ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : quotationDetail ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {getNestedValue(quotationDetail, "quoteCode")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Created: {quotationDetail.createDate 
                      ? dayjs.utc(quotationDetail.createDate).format("DD/MM/YYYY HH:mm") 
                      : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {renderStatusBadge(quotationDetail.status)}
                  {isExpired(quotationDetail.validUntil) && quotationDetail.status !== "EXPIRED" && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                      Expired
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium text-gray-800">{quotationDetail.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {quotationDetail.validUntil 
                      ? dayjs.utc(quotationDetail.validUntil).format("DD/MM/YYYY HH:mm") 
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Base Price</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatCurrency(quotationDetail.basePrice)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Promotion Price</p>
                <p className="text-lg font-semibold text-orange-600">
                  {formatCurrency(quotationDetail.promotionPrice)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border-2 border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Final Price</p>
                <p className="text-xl font-bold text-indigo-700">
                  {formatCurrency(quotationDetail.finalPrice)}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Customer Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(quotationDetail, "customer.name") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(quotationDetail, "customer.phone") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(quotationDetail, "customer.email") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(quotationDetail, "customer.address") || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Product Information
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Motorbike</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(quotationDetail, "motorbike.name") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Model</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(quotationDetail, "motorbike.model") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Color</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(quotationDetail, "color.colorType") || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {quotationDetail.status === "ACCEPTED" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Create Contract</h4>
                <button
                  onClick={() => navigate("/agency/customer-contract", { state: { quotationId: quotationDetail.id } })}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <FileText size={18} />
                  Create Contract
                </button>
              </div>
            )}
            {canUpdateStatus(quotationDetail) && (
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Update Status</h4>
                <div className="flex flex-wrap gap-3">
                  {quotationDetail.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus("ACCEPTED")}
                        disabled={updatingStatus}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("REJECTED")}
                        disabled={updatingStatus}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <XCircle size={18} />
                        )}
                        Reject
                      </button>
                    </>
                  )}
                  {isExpired(quotationDetail.validUntil) && quotationDetail.status !== "EXPIRED" && (
                    <button
                      onClick={() => handleUpdateStatus("EXPIRED")}
                      disabled={updatingStatus}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Clock size={18} />
                      )}
                      Mark as Expired
                    </button>
                  )}
                  {(quotationDetail.type === "ORDER" || quotationDetail.type === "PRE_ORDER") &&
                   (quotationDetail.status === "ACCEPTED" || quotationDetail.status === "DRAFT") && (
                    <button
                      onClick={() => handleUpdateStatus("REVERSED")}
                      disabled={updatingStatus}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <RotateCcw size={18} />
                      )}
                      Mark as Reversed
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No data available</div>
        )}
      </BaseModal>
    </div>
  );
}

export default QuotationManagement;

