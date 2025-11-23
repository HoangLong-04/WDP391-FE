import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerStaffApi from "../../../../services/PrivateDealerStaffApi";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import DataTable from "../../../../components/dataTable/DataTable";
import { formatCurrency } from "../../../../utils/currency";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import BaseModal from "../../../../components/modal/baseModal/BaseModal";
import FormModal from "../../../../components/modal/formModal/FormModal";
import CircularProgress from "@mui/material/CircularProgress";
import useWarehouseAgency from "../../../../hooks/useWarehouseAgency";
import { ShoppingCart } from "lucide-react";

dayjs.extend(utc);

function QuotationManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allQuotations, setAllQuotations] = useState([]); // Store all quotations
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
  const [quotationDepositMap, setQuotationDepositMap] = useState(new Map()); // Map quotationId -> deposit info
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [quotationDetailCache, setQuotationDetailCache] = useState(new Map()); // Cache quotation details
  const [quotationIdsWithContracts, setQuotationIdsWithContracts] = useState(new Set());
  const [quotationIdsWithOrderRestock, setQuotationIdsWithOrderRestock] = useState(new Set()); // Track quotations that have order restock
  const { warehouse } = useWarehouseAgency();
  const [orderRestockModal, setOrderRestockModal] = useState(false);
  const [selectedQuotationForRestock, setSelectedQuotationForRestock] = useState(null);
  const [restockForm, setRestockForm] = useState({});
  const [creatingRestock, setCreatingRestock] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchKeyRef = useRef("");

  const updateQuotationContractFlags = useCallback(
    async (quotationList) => {
      if (!user?.agencyId || quotationList.length === 0) {
        setQuotationIdsWithContracts(new Set());
        return;
      }

      try {
        const checkResults = await Promise.all(
          quotationList.map(async (quotation) => {
            try {
              const res = await PrivateDealerStaffApi.getCustomerContractList(
                user.agencyId,
                { page: 1, limit: 1, quotationId: quotation.id }
              );
              const contracts = res.data?.data || [];
              return {
                id: quotation.id,
                hasContract: contracts.some(
                  (contract) => contract.quotationId === quotation.id
                ),
              };
            } catch (error) {
              console.error(
                `Failed to check contracts for quotation #${quotation.id}:`,
                error
              );
              return { id: quotation.id, hasContract: false };
            }
          })
        );

        const quotationIds = new Set(
          checkResults
            .filter((result) => result.hasContract)
            .map((result) => result.id)
        );
        setQuotationIdsWithContracts(quotationIds);
      } catch (error) {
        console.error(
          "Failed to update quotation contract flags for dealer manager:",
          error
        );
      }
    },
    [user?.agencyId]
  );

  const fetchQuotations = useCallback(async () => {
    if (!user?.agencyId) return;

    const fetchKey = `${user.agencyId}-${page}-${limit}-${type}-${status}-${quoteCode}`;
    if (isFetchingRef.current && lastFetchKeyRef.current === fetchKey) {
      return;
    }
    isFetchingRef.current = true;
    lastFetchKeyRef.current = fetchKey;

    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(type && { type }),
        ...(status && { status }),
        ...(quoteCode && { quoteCode }),
      };
      const res = await PrivateDealerStaffApi.getQuotationList(
        user.agencyId,
        params
      );
      const list = res.data?.data || [];
      const totalItems = res.data?.paginationInfo?.total || list.length || 0;

      setAllQuotations(list);
      setTotalItem(totalItems);
      setQuotationDepositMap(new Map());
      setQuotationIdsWithContracts(new Set());

      await updateQuotationContractFlags(list);

      const depositMap = new Map();
      list.forEach((quotation) => {
        if (quotation.deposit) {
          depositMap.set(quotation.id, quotation.deposit);
        }
      });
      if (depositMap.size > 0) {
        setQuotationDepositMap((prev) => {
          const newMap = new Map(prev);
          depositMap.forEach((value, key) => newMap.set(key, value));
          return newMap;
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.agencyId, page, limit, type, status, quoteCode, updateQuotationContractFlags]);


  // Paginate the sorted list in frontend
  const quotations = useMemo(() => {
    const sortedQuotations = [...allQuotations].sort((a, b) => {
      const aHasContract = quotationIdsWithContracts.has(a.id);
      const bHasContract = quotationIdsWithContracts.has(b.id);
      const aIsPreOrderNotCompleted = a.type === "PRE_ORDER" && !aHasContract;
      const bIsPreOrderNotCompleted = b.type === "PRE_ORDER" && !bHasContract;
      if (aIsPreOrderNotCompleted && !bIsPreOrderNotCompleted) return -1;
      if (!aIsPreOrderNotCompleted && bIsPreOrderNotCompleted) return 1;
      const getDateValue = (quotation) => {
        if (quotation.createDate) {
          return new Date(quotation.createDate).getTime();
        }
        return quotation.id || 0;
      };
      return getDateValue(b) - getDateValue(a);
    });
    return sortedQuotations;
  }, [allQuotations, quotationIdsWithContracts]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [type, status, quoteCode]);

  useEffect(() => {
    if (user?.agencyId) {
      fetchQuotations();
    }
  }, [user?.agencyId, fetchQuotations]);

  useEffect(() => {
    if (quotations.length > 0) {
      // Only fetch deposits for quotations that don't already have deposit info
      const needsFetch = quotations.some(q => 
        !quotationDepositMap.has(q.id) && (q.depositId || q.type !== "AT_STORE")
      );
      if (needsFetch) {
        fetchDepositsForQuotations();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotations.length]); // Only depend on length, not the full array

  const fetchDepositsForQuotations = async () => {
    if (quotations.length === 0) return;
    
    setLoadingDeposits(true);
    const depositMap = new Map();
    const depositIdsToFetch = [];
    const quotationIdsToFetch = [];
    
    // First, check if quotations already have depositId or deposit info
    quotations.forEach(quotation => {
      // Check if already in map (from quotation list)
      if (quotationDepositMap.has(quotation.id)) {
        return; // Skip if already have deposit info
      }
      
      // Check if quotation list response has depositId
      if (quotation.depositId) {
        depositIdsToFetch.push({ quotationId: quotation.id, depositId: quotation.depositId });
      } else {
        // Need to fetch quotation detail to get depositId
        quotationIdsToFetch.push(quotation.id);
      }
    });
    
    // Fetch deposits by depositId (parallel)
    if (depositIdsToFetch.length > 0) {
      const depositPromises = depositIdsToFetch.map(async ({ quotationId, depositId }) => {
        try {
          const depositRes = await PrivateDealerStaffApi.getDepositById(depositId);
          const deposit = depositRes.data?.data;
          if (deposit) {
            return { quotationId, deposit };
          }
        } catch (err) {
          // Deposit not found or error - ignore
        }
        return null;
      });
      
      const depositResults = await Promise.all(depositPromises);
      depositResults.forEach(result => {
        if (result) {
          depositMap.set(result.quotationId, result.deposit);
        }
      });
    }
    
    // Fetch quotation details only for those that need it (parallel)
    if (quotationIdsToFetch.length > 0) {
      const detailPromises = quotationIdsToFetch.map(async (quotationId) => {
        try {
          const res = await PrivateDealerStaffApi.getQuotationDetail(quotationId);
          const detail = res.data?.data;
          
          // Cache the detail for later use
          setQuotationDetailCache(prev => {
            const newCache = new Map(prev);
            newCache.set(quotationId, detail);
            return newCache;
          });
          
          // Check if quotation detail includes depositId or deposit info
          if (detail?.depositId) {
            try {
              const depositRes = await PrivateDealerStaffApi.getDepositById(detail.depositId);
              const deposit = depositRes.data?.data;
              if (deposit) {
                return { quotationId, deposit };
              }
            } catch (err) {
              // Deposit not found or error - ignore
            }
          } else if (detail?.deposit) {
            // If deposit info is directly in quotation detail
            return { quotationId, deposit: detail.deposit };
          }
        } catch (err) {
          // Quotation detail error - ignore
        }
        return null;
      });
      
      const detailResults = await Promise.all(detailPromises);
      detailResults.forEach(result => {
        if (result) {
          depositMap.set(result.quotationId, result.deposit);
        }
      });
    }
    
    // Update deposit map
    if (depositMap.size > 0) {
      setQuotationDepositMap(prev => {
        const newMap = new Map(prev);
        depositMap.forEach((value, key) => newMap.set(key, value));
        return newMap;
      });
    }
    
    setLoadingDeposits(false);
  };

  const handleRowClick = async (quotation) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    
    // Check cache first
    const cachedDetail = quotationDetailCache.get(quotation.id);
    if (cachedDetail) {
      setQuotationDetail(cachedDetail);
      setLoadingDetail(false);
      return;
    }
    
    try {
      const res = await PrivateDealerStaffApi.getQuotationDetail(quotation.id);
      const detail = res.data?.data || null;
      setQuotationDetail(detail);
      
      // Cache the detail
      if (detail) {
        setQuotationDetailCache(prev => {
          const newCache = new Map(prev);
          newCache.set(quotation.id, detail);
          return newCache;
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to load quotation detail");
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
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

  const handleOpenOrderRestockModal = async (quotation) => {
    // Fetch full quotation detail to get motorbikeId and colorId
    try {
      let detail = quotationDetailCache.get(quotation.id);
      if (!detail) {
        const res = await PrivateDealerStaffApi.getQuotationDetail(quotation.id);
        detail = res.data?.data || quotation;
        // Cache the detail
        if (detail) {
          setQuotationDetailCache(prev => {
            const newCache = new Map(prev);
            newCache.set(quotation.id, detail);
            return newCache;
          });
        }
      }
      setSelectedQuotationForRestock(detail);
      setRestockForm({});
      setOrderRestockModal(true);
    } catch (error) {
      toast.error(error.message || "Failed to load quotation detail");
    }
  };

  const handleCreateOrderRestock = async (e) => {
    e.preventDefault();
    if (!selectedQuotationForRestock) return;

    if (!selectedQuotationForRestock.motorbikeId || !selectedQuotationForRestock.colorId) {
      toast.error("Quotation is missing motorbike or color information");
      return;
    }

    setCreatingRestock(true);
    try {
      const payload = {
        orderItems: [
          {
            quantity: 1,
            motorbikeId: selectedQuotationForRestock.motorbikeId,
            colorId: selectedQuotationForRestock.colorId,
            ...(selectedQuotationForRestock.discountId && { discountId: selectedQuotationForRestock.discountId }),
            ...(selectedQuotationForRestock.promotionId && { promotionId: selectedQuotationForRestock.promotionId }),
          },
        ],
        agencyId: user?.agencyId,
      };

      await PrivateDealerManagerApi.createRestock(payload);
      
      // Mark quotation as having order restock
      if (selectedQuotationForRestock?.id) {
        setQuotationIdsWithOrderRestock(prev => new Set([...prev, selectedQuotationForRestock.id]));
      }
      
      toast.success("Order restock created successfully");
      setOrderRestockModal(false);
      setSelectedQuotationForRestock(null);
      setRestockForm({});
      
      // Navigate to order restock page
      navigate("/agency/order-restock");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create order restock";
      toast.error(errorMessage);
    } finally {
      setCreatingRestock(false);
    }
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
      render: (date) => dayjs.utc(date).format("DD/MM/YYYY"),
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
      render: (date) => dayjs.utc(date).format("DD/MM/YYYY"),
    },
    {
      key: "depositStatus",
      title: "Deposit Status",
      render: (_, row) => {
        const depositInfo = quotationDepositMap.get(row.id);
        if (!depositInfo) return <span className="text-gray-400">-</span>;
        const statusColors = {
          PENDING: "bg-yellow-100 text-yellow-700",
          APPLIED: "bg-green-100 text-green-700",
          EXPIRED: "bg-red-100 text-red-700",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs ${statusColors[depositInfo.status] || "bg-gray-100 text-gray-700"}`}>
            {depositInfo.status || "-"}
          </span>
        );
      },
    },
    {
      key: "action",
      title: "Action",
      render: (_, row) => {
        const depositInfo = quotationDepositMap.get(row.id);
        const isPreOrder = row.type === "PRE_ORDER";
        const isDepositApplied = depositInfo && depositInfo.status === "APPLIED";
        const hasOrderRestock = quotationIdsWithOrderRestock.has(row.id);
        
        // Show action button only for PRE_ORDER with deposit APPLIED and no order restock yet
        if (isPreOrder && isDepositApplied && !hasOrderRestock) {
          return (
            <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleOpenOrderRestockModal(row)}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Tạo order restock"
              >
                <ShoppingCart size={18} />
              </button>
            </div>
          );
        }
        
        return <span className="text-gray-400">-</span>;
      },
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
      <DataTable
        title="Quotation Management"
        columns={columns}
        data={quotations}
        loading={loading || loadingDeposits}
        page={page}
        setPage={setPage}
        totalItem={totalItem}
        limit={limit}
        onRowClick={handleRowClick}
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
                      ? dayjs.utc(quotationDetail.createDate).format("DD/MM/YYYY") 
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
                      ? dayjs.utc(quotationDetail.validUntil).format("DD/MM/YYYY") 
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

          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No data available</div>
        )}
      </BaseModal>
      <FormModal
        isOpen={orderRestockModal}
        onClose={() => {
          setOrderRestockModal(false);
          setSelectedQuotationForRestock(null);
          setRestockForm({});
        }}
        title="Create Order Restock"
        isDelete={false}
        isCreate={true}
        onSubmit={handleCreateOrderRestock}
        isSubmitting={creatingRestock}
      >
        <div className="space-y-4">
          {selectedQuotationForRestock && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Quotation Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Quote Code:</span> {getNestedValue(selectedQuotationForRestock, "quoteCode") || "-"}</p>
                  <p><span className="font-medium">Motorbike:</span> {getNestedValue(selectedQuotationForRestock, "motorbike.name") || "-"}</p>
                  <p><span className="font-medium">Color:</span> {getNestedValue(selectedQuotationForRestock, "color.colorType") || "-"}</p>
                  <p><span className="font-medium">Quantity:</span> 1</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Warehouse sẽ được EVM Staff chọn khi xử lý đơn hàng.
              </p>
            </>
          )}
        </div>
      </FormModal>
    </div>
  );
}

export default QuotationManagement;

