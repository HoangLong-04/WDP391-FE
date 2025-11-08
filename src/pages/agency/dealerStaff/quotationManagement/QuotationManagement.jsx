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
import FormModal from "../../../../components/modal/formModal/FormModal";
import { CheckCircle, XCircle, Clock, RotateCcw, Loader2, FileText, Trash2, Wallet, CreditCard, HandCoins } from "lucide-react";
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
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedQuotationForContract, setSelectedQuotationForContract] = useState(null);
  const [contractSubmitting, setContractSubmitting] = useState(false);
  const [contractForm, setContractForm] = useState({
    title: "",
    content: "",
    finalPrice: 0,
    signDate: "",
    contractPaidType: "FULL",
  });
  const [quotationIdsWithContracts, setQuotationIdsWithContracts] = useState(new Set());
  const [quotationDepositMap, setQuotationDepositMap] = useState(new Map()); // Map quotationId -> deposit info
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [quotationDetailCache, setQuotationDetailCache] = useState(new Map()); // Cache quotation details
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedQuotationForDelete, setSelectedQuotationForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [selectedQuotationForDeposit, setSelectedQuotationForDeposit] = useState(null);
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [depositForm, setDepositForm] = useState({
    depositPercent: 20,
    depositAmount: 0,
    holdDays: "",
  });

  useEffect(() => {
    if (user?.agencyId) {
      fetchQuotations();
      fetchQuotationIdsWithContracts();
    }
  }, [page, limit, type, status, quoteCode, user?.agencyId]);

  useEffect(() => {
    if (quotations.length > 0) {
      fetchDepositsForQuotations();
    }
  }, [quotations]);

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
      
      // Check if quotation list includes depositId or deposit info
      const depositMap = new Map();
      list.forEach(quotation => {
        // If quotation list response already has depositId, fetch deposit
        if (quotation.depositId) {
          // Will fetch deposit in fetchDepositsForQuotations
        } else if (quotation.deposit) {
          // If deposit info is directly in quotation list
          depositMap.set(quotation.id, quotation.deposit);
        }
      });
      if (depositMap.size > 0) {
        setQuotationDepositMap(prev => {
          const newMap = new Map(prev);
          depositMap.forEach((value, key) => newMap.set(key, value));
          return newMap;
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotationIdsWithContracts = async () => {
    if (!user?.agencyId) return;
    try {
      let allContracts = [];
      let currentPage = 1;
      const pageSize = 100;
      let hasMore = true;

      // Fetch all contracts with pagination
      while (hasMore) {
        const response = await PrivateDealerStaffApi.getCustomerContractList(
          user.agencyId,
          { page: currentPage, limit: pageSize }
        );
        const contracts = response.data?.data || [];
        allContracts = [...allContracts, ...contracts];
        
        const totalItems = response.data?.paginationInfo?.total || 0;
        hasMore = allContracts.length < totalItems;
        currentPage++;
      }

      // Extract quotationIds that have contracts (filter out null/undefined)
      const quotationIds = new Set(
        allContracts
          .map((contract) => contract.quotationId)
          .filter((id) => id != null && id !== undefined)
      );
      setQuotationIdsWithContracts(quotationIds);
    } catch (error) {
      // Silently fail - don't show error if contract list fetch fails
      console.error("Failed to fetch contracts:", error);
    }
  };

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

  const handleUpdateStatus = async (quotationId, newStatus) => {
    setUpdatingStatus(true);
    setUpdatingStatusId(quotationId);
    try {
      await PrivateDealerStaffApi.updateQuotation(quotationId, { status: newStatus });
      toast.success(`Quotation status updated to ${newStatus}`);
      fetchQuotations();
    } catch (error) {
      toast.error(error.message || "Failed to update quotation status");
    } finally {
      setUpdatingStatus(false);
      setUpdatingStatusId(null);
    }
  };

  const handleOpenContractModal = async (quotation, contractPaidType = "FULL") => {
    // Fetch full detail to get customer info
    try {
      const res = await PrivateDealerStaffApi.getQuotationDetail(quotation.id);
      const detail = res.data?.data || quotation;
      setSelectedQuotationForContract(detail);
      setContractForm({
        title: `Contract for ${detail.customer?.name || "customer"}`,
        content: `Contract created from quotation #${detail.id}`,
        finalPrice: detail.finalPrice || 0,
        signDate: dayjs().format("YYYY-MM-DD"),
        contractPaidType: contractPaidType,
      });
      setIsContractModalOpen(true);
    } catch (error) {
      toast.error(error.message || "Failed to load quotation detail");
    }
  };

  const handleOpenDepositModal = (quotation) => {
    setSelectedQuotationForDeposit(quotation);
    const depositAmount = Math.round((quotation.finalPrice * 20) / 100);
    setDepositForm({
      depositPercent: 20,
      depositAmount: depositAmount,
      holdDays: dayjs().add(7, 'days').format("YYYY-MM-DD"),
    });
    setDepositModal(true);
  };

  const handleCreateDeposit = async (e) => {
    e.preventDefault();
    if (!selectedQuotationForDeposit) return;
    
    setDepositSubmitting(true);
    try {
      const payload = {
        depositPercent: Number(depositForm.depositPercent),
        depositAmount: Number(depositForm.depositAmount),
        holdDays: depositForm.holdDays ? new Date(depositForm.holdDays).toISOString() : new Date().toISOString(),
        quotationId: selectedQuotationForDeposit.id,
      };
      const response = await PrivateDealerStaffApi.createDeposit(payload);
      const deposit = response.data?.data || response.data;
      
      toast.success("Deposit created successfully");
      setDepositModal(false);
      setSelectedQuotationForDeposit(null);
      
      // Update deposit map with the created deposit
      if (deposit && deposit.id) {
        // Fetch full deposit detail to get latest status
        try {
          const depositDetailRes = await PrivateDealerStaffApi.getDepositById(deposit.id);
          const depositDetail = depositDetailRes.data?.data;
          if (depositDetail) {
            setQuotationDepositMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(selectedQuotationForDeposit.id, depositDetail);
              return newMap;
            });
          } else {
            // Fallback to use deposit from response
            setQuotationDepositMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(selectedQuotationForDeposit.id, deposit);
              return newMap;
            });
          }
        } catch (err) {
          // If fetch fails, use deposit from response
          setQuotationDepositMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(selectedQuotationForDeposit.id, deposit);
            return newMap;
          });
        }
      }
      
      // Refresh quotations list
      fetchQuotations();
    } catch (error) {
      toast.error(error.message || "Failed to create deposit");
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handleReceivedDeposit = async (quotationId) => {
    setUpdatingStatus(true);
    setUpdatingStatusId(quotationId);
    try {
      let depositInfo = quotationDepositMap.get(quotationId);
      
      // If deposit info not in map, try to get from quotation detail
      if (!depositInfo) {
        try {
          const res = await PrivateDealerStaffApi.getQuotationDetail(quotationId);
          const detail = res.data?.data;
          if (detail?.depositId) {
            const depositRes = await PrivateDealerStaffApi.getDepositById(detail.depositId);
            depositInfo = depositRes.data?.data;
            if (depositInfo) {
              setQuotationDepositMap((prev) => {
                const newMap = new Map(prev);
                newMap.set(quotationId, depositInfo);
                return newMap;
              });
            }
          } else if (detail?.deposit) {
            depositInfo = detail.deposit;
            setQuotationDepositMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(quotationId, depositInfo);
              return newMap;
            });
          }
        } catch (err) {
          // Error fetching deposit - continue anyway
        }
      }
      
      if (depositInfo && depositInfo.id) {
        // Update deposit status to HOLDING
        await PrivateDealerStaffApi.updateDepositStatus(depositInfo.id, { 
          status: "HOLDING",
          depositPercent: depositInfo.depositPercent,
          depositAmount: depositInfo.depositAmount,
          holdDays: depositInfo.holdDays || depositInfo.holdDay,
        });
        
        // Update deposit status in map
        setQuotationDepositMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(quotationId, { ...depositInfo, status: "HOLDING" });
          return newMap;
        });
        
        toast.success("Deposit received, status updated to HOLDING");
        fetchQuotations();
      } else {
        toast.error("Deposit not found for this quotation");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update deposit status");
    } finally {
      setUpdatingStatus(false);
      setUpdatingStatusId(null);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    if (!selectedQuotationForContract) return;
    
    setContractSubmitting(true);
    try {
      const payload = {
        title: contractForm.title,
        content: contractForm.content,
        finalPrice: Number(contractForm.finalPrice),
        signDate: contractForm.signDate ? new Date(contractForm.signDate).toISOString() : new Date().toISOString(),
        contractPaidType: contractForm.contractPaidType,
        customerId: selectedQuotationForContract.customerId,
        staffId: user?.id || user?.userId,
        agencyId: user?.agencyId,
        electricMotorbikeId: selectedQuotationForContract.motorbikeId,
        colorId: selectedQuotationForContract.colorId,
        quotationId: selectedQuotationForContract.id,
      };
      await PrivateDealerStaffApi.createCustomerContract(payload);
      toast.success("Contract created successfully");
      setIsContractModalOpen(false);
      // Update the set of quotationIds with contracts
      setQuotationIdsWithContracts((prev) => new Set([...prev, selectedQuotationForContract.id]));
      navigate("/agency/customer-contract");
    } catch (error) {
      toast.error(error.message || "Failed to create contract");
    } finally {
      setContractSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (quotation) => {
    setSelectedQuotationForDelete(quotation);
    setDeleteModal(true);
  };

  const handleDeleteQuotation = async (e) => {
    e.preventDefault();
    if (!selectedQuotationForDelete) return;
    
    setDeleting(true);
    try {
      await PrivateDealerStaffApi.deleteQuotation(selectedQuotationForDelete.id);
      toast.success("Quotation deleted successfully");
      setDeleteModal(false);
      setSelectedQuotationForDelete(null);
      // Refresh quotations list
      fetchQuotations();
      // If this quotation had a contract, remove it from the set
      if (quotationIdsWithContracts.has(selectedQuotationForDelete.id)) {
        setQuotationIdsWithContracts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(selectedQuotationForDelete.id);
          return newSet;
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete quotation");
    } finally {
      setDeleting(false);
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
          HOLDING: "bg-blue-100 text-blue-700",
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
        const isUpdating = updatingStatus && updatingStatusId === row.id;
        const hasContract = quotationIdsWithContracts.has(row.id);
        const depositInfo = quotationDepositMap.get(row.id);
        const isATStore = row.type === "AT_STORE";
        const isOrderOrPreOrder = row.type === "ORDER" || row.type === "PRE_ORDER";
        
        return (
          <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
            {row.status === "DRAFT" && (
              <>
                <button
                  onClick={() => handleUpdateStatus(row.id, "ACCEPTED")}
                  disabled={isUpdating}
                  className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Accept"
                >
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                </button>
                <button
                  onClick={() => handleUpdateStatus(row.id, "REJECTED")}
                  disabled={isUpdating}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reject"
                >
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <XCircle size={18} />
                  )}
                </button>
              </>
            )}
            
            {/* If has contract, only show delete button */}
            {hasContract && (
              <button
                onClick={() => handleOpenDeleteModal(row)}
                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                title="Delete Quotation"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            {/* If no contract */}
            {!hasContract && (
              <>
                {/* AT_STORE type: Show Trả góp / Trả full / Delete */}
                {isATStore && row.status === "ACCEPTED" && !depositInfo && (
                  <>
                    <button
                      onClick={() => handleOpenDepositModal(row)}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      title="Trả góp (Create Deposit)"
                    >
                      <CreditCard size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenContractModal(row, "FULL")}
                      className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      title="Trả full (Create Contract)"
                    >
                      <Wallet size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                
                {/* AT_STORE with deposit PENDING or quotation status PENDING: Show "Đã nhận cọc" button */}
                {isATStore && row.status === "ACCEPTED" && depositInfo && depositInfo.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleReceivedDeposit(row.id)}
                      disabled={isUpdating}
                      className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Đã nhận cọc"
                    >
                      {isUpdating ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <HandCoins size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                
                {/* AT_STORE with quotation status PENDING: Show "Đã nhận cọc" button */}
                {isATStore && row.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleReceivedDeposit(row.id)}
                      disabled={isUpdating}
                      className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Đã nhận cọc"
                    >
                      {isUpdating ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <HandCoins size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                
                {/* AT_STORE with deposit HOLDING: Show "Tạo installment plan" button */}
                {isATStore && depositInfo && depositInfo.status === "HOLDING" && (
                  <>
                    <button
                      onClick={() => {}}
                      className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                      title="Tạo installment plan"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                
                {/* ORDER or PRE_ORDER: Show Đặt cọc / Delete */}
                {isOrderOrPreOrder && row.status === "ACCEPTED" && !depositInfo && (
                  <>
                    <button
                      onClick={() => handleOpenDepositModal(row)}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      title="Đặt cọc (Create Deposit)"
                    >
                      <CreditCard size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                
                {/* ORDER or PRE_ORDER with deposit PENDING: Show "Đã nhận cọc" button */}
                {isOrderOrPreOrder && row.status === "ACCEPTED" && depositInfo && depositInfo.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleReceivedDeposit(row.id)}
                      disabled={isUpdating}
                      className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Đã nhận cọc"
                    >
                      {isUpdating ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <HandCoins size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                
                {/* ORDER or PRE_ORDER with quotation status PENDING: Show "Đã nhận cọc" button */}
                {isOrderOrPreOrder && row.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleReceivedDeposit(row.id)}
                      disabled={isUpdating}
                      className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Đã nhận cọc"
                    >
                      {isUpdating ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <HandCoins size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                
                {/* ORDER or PRE_ORDER with deposit HOLDING: Show "Tạo hợp đồng" button */}
                {isOrderOrPreOrder && depositInfo && depositInfo.status === "HOLDING" && (
                  <>
                    <button
                      onClick={() => handleOpenContractModal(row, "DEBT")}
                      className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                      title="Tạo hợp đồng khách hàng"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        );
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
      <PaginationTable
        columns={columns}
        data={quotations}
        loading={loading || loadingDeposits}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title="Quotation Management"
        totalItem={totalItem}
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
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setSelectedQuotationForContract(null);
        }}
        title="Create Contract"
        isDelete={false}
        isCreate={true}
        onSubmit={handleCreateContract}
        isSubmitting={contractSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              value={contractForm.title}
              onChange={(e) => setContractForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Content *</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
              value={contractForm.content}
              onChange={(e) => setContractForm((prev) => ({ ...prev, content: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Final Price *</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              value={contractForm.finalPrice}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sign Date *</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={contractForm.signDate}
              onChange={(e) => setContractForm((prev) => ({ ...prev, signDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contract Paid Type *</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={contractForm.contractPaidType}
              onChange={(e) => setContractForm((prev) => ({ ...prev, contractPaidType: e.target.value }))}
              required
            >
              <option value="FULL">FULL</option>
              <option value="DEBT">DEBT</option>
            </select>
          </div>
        </div>
      </FormModal>
      <FormModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedQuotationForDelete(null);
        }}
        title="Confirm Delete"
        isDelete={true}
        onSubmit={handleDeleteQuotation}
        isSubmitting={deleting}
      >
        <p className="text-gray-700">
          Are you sure you want to delete quotation{" "}
          <span className="font-semibold">{selectedQuotationForDelete?.quoteCode || selectedQuotationForDelete?.id}</span>?
          This action cannot be undone.
        </p>
      </FormModal>
      <FormModal
        isOpen={depositModal}
        onClose={() => {
          setDepositModal(false);
          setSelectedQuotationForDeposit(null);
        }}
        title="Create Deposit"
        isDelete={false}
        isCreate={true}
        onSubmit={handleCreateDeposit}
        isSubmitting={depositSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deposit Percent (%) *</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg"
              value={depositForm.depositPercent}
              onChange={(e) => {
                const percent = Number(e.target.value);
                const amount = selectedQuotationForDeposit 
                  ? Math.round((selectedQuotationForDeposit.finalPrice * percent) / 100)
                  : 0;
                setDepositForm((prev) => ({ 
                  ...prev, 
                  depositPercent: percent,
                  depositAmount: amount
                }));
              }}
              min="1"
              max="100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deposit Amount *</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              value={depositForm.depositAmount}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hold Days *</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={depositForm.holdDays}
              onChange={(e) => setDepositForm((prev) => ({ ...prev, holdDays: e.target.value }))}
              required
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

export default QuotationManagement;

