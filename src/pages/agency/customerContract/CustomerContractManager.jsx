import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import useCustomerList from "../../../hooks/useCustomerList";
import useDealerStaffList from "../../../hooks/useDealerStaffList";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import DataTable from "../../../components/dataTable/DataTable";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatCurrency } from "../../../utils/currency";
import { renderStatusTag } from "../../../utils/statusTag";
import BaseModal from "../../../components/modal/baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";
import { Mail } from "lucide-react";

dayjs.extend(utc);

function CustomerContractManager() {
  const { user } = useAuth();
  const { customerList } = useCustomerList();
  const { staffList } = useDealerStaffList();

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [staffId, setStaffId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [contractType, setContractType] = useState("");
  const [allContracts, setAllContracts] = useState([]); // Store all contracts
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [contractDetail, setContractDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sendingContractEmail, setSendingContractEmail] = useState(false);

  // Fetch all contracts, then sort and paginate in frontend
  const fetchCustomerContractList = useCallback(async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      // Fetch all contracts with a large limit
      let allContractsData = [];
      let currentPage = 1;
      const pageSize = 100;
      let hasMore = true;
      const maxPages = 100;

      // Fetch all pages
      while (hasMore && currentPage <= maxPages) {
        const response = await PrivateDealerManagerApi.getCustomerContractList(
          user.agencyId,
          {
            page: currentPage,
            limit: pageSize,
            staffId,
            customerId,
            status,
            contractType,
          }
        );
        const contracts = response.data.data || [];
        if (contracts.length === 0) {
          break;
        }
        allContractsData = [...allContractsData, ...contracts];
        
        const totalItems = response.data.paginationInfo?.total || 0;
        const totalPages =
          response.data.paginationInfo?.totalPages ||
          (pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1);
        hasMore =
          allContractsData.length < totalItems && currentPage < totalPages;
        currentPage++;
      }
      if (currentPage > maxPages) {
        console.warn(
          "Reached maximum page limit while fetching customer contracts. There might be inconsistent pagination data from API."
        );
      }

      // Sort by newest first (by id - higher id = newer, or by createdAt if available)
      allContractsData.sort((a, b) => {
        // Try createdAt first, then id (higher id = newer), then signDate
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (a.createAt && b.createAt) {
          return new Date(b.createAt) - new Date(a.createAt);
        }
        if (a.id && b.id) {
          return b.id - a.id; // Higher id = newer
        }
        const dateA = new Date(a.signDate || 0);
        const dateB = new Date(b.signDate || 0);
        return dateB - dateA;
      });

      setAllContracts(allContractsData);
      setTotalItem(allContractsData.length);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.agencyId, staffId, customerId, status, contractType]);

  // Paginate the sorted list in frontend
  const customerContractList = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return allContracts.slice(startIndex, endIndex);
  }, [allContracts, page, limit]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [staffId, customerId, status, contractType]);

  useEffect(() => {
    fetchCustomerContractList();
  }, [fetchCustomerContractList]);

  const handleViewDetail = async (contractId) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const res = await PrivateDealerManagerApi.getCustomerContractDetail(contractId);
      const contractDetail = res.data?.data || null;
      setContractDetail(contractDetail);
    } catch (error) {
      toast.error(error.message || "Failed to load contract detail");
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRowClick = (item) => {
    handleViewDetail(item.id);
  };

  const handleSendContractEmail = async (customerContractId) => {
    if (!customerContractId) {
      toast.error("Customer contract ID is missing");
      return;
    }

    setSendingContractEmail(true);
    try {
      await PrivateDealerManagerApi.sendCustomerContractEmail(customerContractId);
      toast.success("Email sent successfully to customer");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to send email");
    } finally {
      setSendingContractEmail(false);
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

  const handleViewDetailFromRow = (item) => {
    handleViewDetail(item.id);
  };

  const columns = [
    { key: "id", title: "Id" },
    {
      key: "contractCode",
      title: "Contract Code",
      render: (code) => <span className="font-mono text-xs">{code}</span>,
    },
    { key: "title", title: "Title" },
    {
      key: "finalPrice",
      title: "Final Price",
      render: (price) => formatCurrency(price),
    },
    {
      key: "signDate",
      title: "Sign Date",
      render: (date) => (date ? dayjs.utc(date).format("DD/MM/YYYY") : "-"),
    },
    {
      key: "deliveryDate",
      title: "Delivery Date",
      render: (date) => (date ? dayjs.utc(date).format("DD/MM/YYYY") : "-"),
    },
    { key: "contractPaidType", title: "Contract Paid Type" },
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
  ];

  // No actions for Dealer Manager - view only
  const actions = [];

  return (
    <div>
      <div className="my-3 flex justify-end items-center gap-5">
        <div>
          <label className="mr-2 font-medium text-gray-600">Staff:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={staffId}
            onChange={(e) => {
              setStaffId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.fullname} - {staff.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Customer:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {customerList.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.id}
              </option>
            ))}
          </select>
        </div>
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
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">
            Contract type:
          </label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={contractType}
            onChange={(e) => {
              setContractType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="AT_STORE">AT_STORE</option>
            <option value="ORDER">ORDER</option>
          </select>
        </div>
      </div>
      <DataTable
        title="Customer Contract"
        columns={columns}
        data={customerContractList}
        loading={loading}
        page={page}
        setPage={setPage}
        totalItem={totalItem}
        limit={limit}
        onRowClick={handleViewDetailFromRow}
        actions={actions}
      />

      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setContractDetail(null);
        }}
        title="Contract Detail"
        size="lg"
      >
        {loadingDetail ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : contractDetail ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {contractDetail.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">
                    {contractDetail.contractCode}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {renderStatusTag(contractDetail.status)}
                  <button
                    onClick={() => handleSendContractEmail(contractDetail.id)}
                    disabled={sendingContractEmail}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send contract to customer email"
                  >
                    <Mail size={18} />
                    {sendingContractEmail ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700">{contractDetail.content}</p>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border-2 border-indigo-200">
              <p className="text-sm text-gray-600 mb-1">Final Price</p>
              <p className="text-2xl font-bold text-indigo-700">
                {formatCurrency(contractDetail.finalPrice)}
              </p>
            </div>

            {/* Dates Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Sign Date</p>
                <p className="font-medium text-gray-800">
                  {contractDetail.signDate
                    ? dayjs.utc(contractDetail.signDate).format("DD/MM/YYYY")
                    : "-"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Delivery Date</p>
                <p className="font-medium text-gray-800">
                  {contractDetail.deliveryDate
                    ? dayjs.utc(contractDetail.deliveryDate).format("DD/MM/YYYY")
                    : "-"}
                </p>
              </div>
            </div>

            {/* Contract Info */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Contract Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Contract Paid Type
                  </p>
                  <p className="font-medium text-gray-800">
                    {contractDetail.contractPaidType || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quotation ID</p>
                  <p className="font-medium text-gray-800">
                    {contractDetail.quotationId || "-"}
                  </p>
                </div>
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
                    {getNestedValue(contractDetail, "customer.name") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "customer.phone") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "customer.email") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "customer.address") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "customer.dob")
                      ? dayjs
                          .utc(getNestedValue(contractDetail, "customer.dob"))
                          .format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Credential ID</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "customer.credentialId") ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Staff Information */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Staff Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Username</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "staff.username") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "staff.email") || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Product Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Motorbike Name</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "electricMotorbike.name") ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Model</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(
                      contractDetail,
                      "electricMotorbike.model"
                    ) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Version</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(
                      contractDetail,
                      "electricMotorbike.version"
                    ) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Make From</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(
                      contractDetail,
                      "electricMotorbike.makeFrom"
                    ) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Color</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "color.colorType") || "-"}
                  </p>
                </div>
              </div>
            </div>
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

export default CustomerContractManager;

