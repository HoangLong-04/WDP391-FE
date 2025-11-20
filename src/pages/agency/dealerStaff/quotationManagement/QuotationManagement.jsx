import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { CheckCircle, XCircle, Clock, RotateCcw, Loader2, FileText, Wallet, CreditCard, HandCoins, Printer, Pencil } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";

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
  const [depositModal, setDepositModal] = useState(false);
  const [selectedQuotationForDeposit, setSelectedQuotationForDeposit] = useState(null);
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [depositForm, setDepositForm] = useState({
    depositPercent: 20,
    depositAmount: 0,
    holdDays: "",
  });
  const [installmentPlanModal, setInstallmentPlanModal] = useState(false);
  const [selectedQuotationForInstallment, setSelectedQuotationForInstallment] = useState(null);
  const [installmentPlans, setInstallmentPlans] = useState([]);
  const [loadingInstallmentPlans, setLoadingInstallmentPlans] = useState(false);
  const [installmentContractForm, setInstallmentContractForm] = useState({
    startDate: "",
    penaltyValue: 0,
    penaltyType: "FIXED",
    status: "ACTIVE",
    customerContractId: "",
    installmentPlanId: "",
  });
  const [creatingInstallmentContract, setCreatingInstallmentContract] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuotationForEdit, setSelectedQuotationForEdit] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    basePrice: 0,
    promotionPrice: 0,
    finalPrice: 0,
    validUntil: "",
    promotionId: "",
  });
  const [stockPromotions, setStockPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
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
        console.error("Failed to update quotation contract flags:", error);
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
      // Fetch only current page with limit = 5
      const params = {
        page: page,
        limit: limit,
        ...(type && { type }),
        ...(status && { status }),
        ...(quoteCode && { quoteCode }),
      };
      const res = await PrivateDealerStaffApi.getQuotationList(user.agencyId, params);
      const list = res.data?.data || [];
      const totalItems = res.data?.paginationInfo?.total || 0;
      const totalPages = res.data?.paginationInfo?.totalPages || Math.ceil(totalItems / limit);

      // Auto-update EXPIRED status for quotations that have passed validUntil
      // Only update DRAFT and REJECTED quotations (ACCEPTED and REVERSED should not expire)
      // Note: Auto-update is done in background, won't block the UI
      list.forEach(quotation => {
        if (quotation.validUntil && 
            (quotation.status === "DRAFT" || quotation.status === "REJECTED") &&
            dayjs.utc().isAfter(dayjs.utc(quotation.validUntil))) {
          // Auto-update to EXPIRED if expired (only for DRAFT and REJECTED)
          PrivateDealerStaffApi.updateQuotation(quotation.id, { status: "EXPIRED" })
            .then(() => {
              // Update local state immediately
              setAllQuotations(prev => prev.map(q => 
                q.id === quotation.id ? { ...q, status: "EXPIRED" } : q
              ));
            })
            .catch(err => console.error("Failed to auto-update expired status:", err));
        }
      });

      setAllQuotations(list);
      setTotalItem(totalItems);
      setQuotationDepositMap(new Map());
      setQuotationIdsWithContracts(new Set());
      await updateQuotationContractFlags(list);
      
      // Check if quotation list includes depositId or deposit info
      const depositMap = new Map();
      list.forEach(quotation => {
        // If deposit info is directly in quotation list, use it immediately
        if (quotation.deposit) {
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
      isFetchingRef.current = false;
    }
  }, [user?.agencyId, page, limit, type, status, quoteCode, updateQuotationContractFlags]);

  // Use quotations directly from API (no frontend pagination needed)
  const quotations = allQuotations;


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
      const needsFetch = quotations.some(
        (q) => !quotationDepositMap.has(q.id) && (q.depositId || q.type !== "AT_STORE")
      );
      if (needsFetch) {
        fetchDepositsForQuotations();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotations]); // Depend on quotations reference so each page triggers a fetch

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
        signDate: "", // Will be set automatically when creating contract
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
        // Update deposit status to APPLIED
        await PrivateDealerStaffApi.updateDepositStatus(depositInfo.id, { 
          status: "APPLIED",
          depositPercent: depositInfo.depositPercent,
          depositAmount: depositInfo.depositAmount,
          holdDays: depositInfo.holdDays || depositInfo.holdDay,
        });
        
        // Update deposit status in map
        setQuotationDepositMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(quotationId, { ...depositInfo, status: "APPLIED" });
          return newMap;
        });
        
        toast.success("Deposit received, status updated to APPLIED");
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

  // Removed delete functionality - quotations cannot be deleted once created

  const handleOpenEditModal = async (quotation) => {
    try {
      // Fetch full quotation detail
      const res = await PrivateDealerStaffApi.getQuotationDetail(quotation.id);
      const detail = res.data?.data || quotation;
      setSelectedQuotationForEdit(detail);
      
      // Load stock promotions if quotation type is AT_STORE
      if (detail.type === "AT_STORE" && user?.agencyId) {
        setLoadingPromotions(true);
        try {
          const promoRes = await PrivateDealerStaffApi.getStockPromotionListStaff(user.agencyId);
          const promotions = promoRes.data?.data || [];
          setStockPromotions(promotions);
          
          // Find current promotion if exists
          const currentPromo = promotions.find(p => 
            detail.promotionPrice > 0 && 
            ((p.valueType === "PERCENT" && Math.abs((detail.basePrice * p.value / 100) - detail.promotionPrice) < 1) ||
             (p.valueType === "FIXED" && Math.abs(p.value - detail.promotionPrice) < 1))
          );
          
          if (currentPromo) {
            setSelectedPromotion(currentPromo);
            setEditForm({
              basePrice: detail.basePrice || 0,
              promotionPrice: detail.promotionPrice || 0,
              finalPrice: detail.finalPrice || 0,
              validUntil: detail.validUntil 
                ? dayjs.utc(detail.validUntil).format("YYYY-MM-DD")
                : "",
              promotionId: String(currentPromo.id),
            });
          } else {
            setSelectedPromotion(null);
            setEditForm({
              basePrice: detail.basePrice || 0,
              promotionPrice: detail.promotionPrice || 0,
              finalPrice: detail.finalPrice || 0,
              validUntil: detail.validUntil 
                ? dayjs.utc(detail.validUntil).format("YYYY-MM-DD")
                : "",
              promotionId: "",
            });
          }
        } catch (error) {
          console.error("Error loading promotions:", error);
          setStockPromotions([]);
          setEditForm({
            basePrice: detail.basePrice || 0,
            promotionPrice: detail.promotionPrice || 0,
            finalPrice: detail.finalPrice || 0,
            validUntil: detail.validUntil 
              ? dayjs.utc(detail.validUntil).format("YYYY-MM-DD")
              : "",
            promotionId: "",
          });
        } finally {
          setLoadingPromotions(false);
        }
      } else {
        setStockPromotions([]);
        setSelectedPromotion(null);
        setEditForm({
          basePrice: detail.basePrice || 0,
          promotionPrice: detail.promotionPrice || 0,
          finalPrice: detail.finalPrice || 0,
          validUntil: detail.validUntil 
            ? dayjs.utc(detail.validUntil).format("YYYY-MM-DD")
            : "",
          promotionId: "",
        });
      }
      
      setIsEditModalOpen(true);
    } catch (error) {
      toast.error(error.message || "Failed to load quotation detail");
    }
  };

  const handleUpdateQuotation = async (e) => {
    e.preventDefault();
    if (!selectedQuotationForEdit) return;
    
    setEditSubmitting(true);
    try {
      const payload = {
        basePrice: Number(editForm.basePrice || 0),
        promotionPrice: Number(editForm.promotionPrice || 0),
        finalPrice: Number(editForm.finalPrice || 0),
        validUntil: editForm.validUntil 
          ? new Date(editForm.validUntil).toISOString()
          : null,
      };
      
      await PrivateDealerStaffApi.updateQuotation(selectedQuotationForEdit.id, payload);
      toast.success("Quotation updated successfully");
      setIsEditModalOpen(false);
      setSelectedQuotationForEdit(null);
      
      // Refresh quotations list
      fetchQuotations();
    } catch (error) {
      toast.error(error.message || "Failed to update quotation");
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchInstallmentPlans = async () => {
    if (!user?.agencyId) return;
    setLoadingInstallmentPlans(true);
    try {
      const response = await PrivateDealerManagerApi.getInstallmentPlan(user.agencyId, {
        page: 1,
        limit: 100,
        status: "ACTIVE",
      });
      setInstallmentPlans(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching installment plans:", error);
      toast.error("Failed to load installment plans");
    } finally {
      setLoadingInstallmentPlans(false);
    }
  };

  const handleOpenInstallmentPlanModal = async (quotation) => {
    try {
      // Fetch full quotation detail
      const res = await PrivateDealerStaffApi.getQuotationDetail(quotation.id);
      const detail = res.data?.data || quotation;
      setSelectedQuotationForInstallment(detail);

      // Check if customer contract already exists for this quotation
      let customerContractId = null;
      if (quotationIdsWithContracts.has(quotation.id)) {
        // Contract exists, find it
        try {
          const contractsRes = await PrivateDealerStaffApi.getCustomerContractList(
            user.agencyId,
            { page: 1, limit: 100, quotationId: quotation.id }
          );
          const contracts = contractsRes.data?.data || [];
          const contract = contracts.find(c => c.quotationId === quotation.id && c.contractPaidType === "DEBT");
          if (contract) {
            customerContractId = contract.id;
          }
        } catch (err) {
          console.error("Error finding contract:", err);
        }
      }

      // If no contract exists, create one first
      if (!customerContractId) {
        try {
          const contractPayload = {
            title: `Contract for ${detail.customer?.name || "customer"}`,
            content: `Contract created from quotation #${detail.id} for installment plan`,
            finalPrice: detail.finalPrice || 0,
            signDate: new Date().toISOString(),
            contractPaidType: "DEBT",
            customerId: detail.customerId,
            staffId: user?.id || user?.userId,
            agencyId: user?.agencyId,
            electricMotorbikeId: detail.motorbikeId,
            colorId: detail.colorId,
            quotationId: detail.id,
          };
          const contractRes = await PrivateDealerStaffApi.createCustomerContract(contractPayload);
          customerContractId = contractRes.data?.data?.id || contractRes.data?.id;
          
          if (customerContractId) {
            // Update the set of quotationIds with contracts
            setQuotationIdsWithContracts((prev) => new Set([...prev, quotation.id]));
            toast.success("Customer contract created successfully");
          } else {
            throw new Error("Failed to get customer contract ID");
          }
        } catch (error) {
          toast.error(error.message || "Failed to create customer contract");
          return;
        }
      }

      // Check if installment contract already exists
      try {
        const existingRes = await PrivateDealerManagerApi.getInstallmentContractByCustomerContractId(customerContractId);
        const existingInstallment = existingRes.data?.data;
        if (existingInstallment?.id) {
          toast.info("Installment contract already exists for this quotation");
          navigate("/agency/customer-contract");
          return;
        }
      } catch (err) {
        // 404 is expected if no contract exists
        if (err.response?.status !== 404) {
          console.error("Error checking existing installment contract:", err);
        }
      }

      // Set form and open modal
      setInstallmentContractForm({
        startDate: dayjs().format("YYYY-MM-DD"),
        penaltyValue: 0,
        penaltyType: "FIXED",
        status: "ACTIVE",
        customerContractId: customerContractId,
        installmentPlanId: "",
      });
      setInstallmentPlanModal(true);
      await fetchInstallmentPlans();
    } catch (error) {
      toast.error(error.message || "Failed to prepare installment plan creation");
    }
  };

  const handleCreateInstallmentContract = async (e) => {
    e.preventDefault();
    if (!selectedQuotationForInstallment) return;

    // Validate
    if (!installmentContractForm.startDate) {
      toast.error("Please select a start date");
      return;
    }
    if (!installmentContractForm.installmentPlanId) {
      toast.error("Please select an installment plan");
      return;
    }
    if (installmentContractForm.penaltyValue < 0) {
      toast.error("Penalty value must be >= 0");
      return;
    }

    setCreatingInstallmentContract(true);
    try {
      const payload = {
        startDate: new Date(installmentContractForm.startDate).toISOString(),
        penaltyValue: Number(installmentContractForm.penaltyValue),
        penaltyType: installmentContractForm.penaltyType,
        status: installmentContractForm.status,
        customerContractId: Number(installmentContractForm.customerContractId),
        installmentPlanId: Number(installmentContractForm.installmentPlanId),
      };

      const response = await PrivateDealerManagerApi.createInstallmentContract(payload);
      const installmentContractId = response.data?.data?.id;

      if (installmentContractId) {
        // Generate payment schedules
        let paymentSchedulesGenerated = false;
        try {
          await PrivateDealerManagerApi.generateInstallmentPayments(installmentContractId);
          paymentSchedulesGenerated = true;
        } catch (generateError) {
          console.error("Error generating payment schedules:", generateError);
          toast.warning("Contract created but failed to generate payment schedules. Please try again later.");
        }
        
        // Generate interest payments
        try {
          await PrivateDealerManagerApi.generateInterestPayments(installmentContractId);
          if (paymentSchedulesGenerated) {
            toast.success("Installment contract created, payment schedules and interest payments generated successfully");
          } else {
            toast.success("Interest payments generated successfully");
          }
        } catch (interestError) {
          console.error("Error generating interest payments:", interestError);
          if (paymentSchedulesGenerated) {
            toast.warning("Payment schedules generated but failed to generate interest payments. Please try again later.");
          } else {
            toast.warning("Failed to generate interest payments. Please try again later.");
          }
        }
      } else {
        toast.success("Installment contract created successfully");
      }

      setInstallmentPlanModal(false);
      setSelectedQuotationForInstallment(null);
      navigate("/agency/customer-contract");
    } catch (error) {
      toast.error(error.message || "Failed to create installment contract");
    } finally {
      setCreatingInstallmentContract(false);
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
    
    // Can update from REJECTED back to DRAFT (to allow editing)
    if (currentStatus === "REJECTED") return true;
    
    // Can update ORDER or PRE_ORDER from ACCEPTED to REVERSED when bike arrives
    if (currentStatus === "ACCEPTED" && 
        (quotation.type === "ORDER" || quotation.type === "PRE_ORDER")) {
      return true;
    }
    
    return false;
  };

  const canEditQuotation = (quotation) => {
    if (!quotation) return false;
    // Can edit DRAFT and REJECTED quotations
    return quotation.status === "DRAFT" || quotation.status === "REJECTED";
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
          REVERSED: "bg-purple-100 text-purple-700",
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
        const isUpdating = updatingStatus && updatingStatusId === row.id;
        const hasContract = quotationIdsWithContracts.has(row.id);
        const depositInfo = quotationDepositMap.get(row.id);
        const isATStore = row.type === "AT_STORE";
        const isOrderOrPreOrder = row.type === "ORDER" || row.type === "PRE_ORDER";
        const depositStatus = depositInfo?.status;
        const isPreOrderFlow = isOrderOrPreOrder;
        
        return (
          <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
            {/* DRAFT status: Show "In" button to open detail modal */}
            {row.status === "DRAFT" && (
              <button
                onClick={() => handleRowClick(row)}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="In (Xem chi tiết)"
              >
                <Printer size={18} />
              </button>
            )}
            
            {/* REJECTED status: Show edit button to open edit modal */}
            {row.status === "REJECTED" && (
              <button
                onClick={() => {
                  // Load quotation detail and open edit modal
                  handleOpenEditModal(row);
                }}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Edit quotation"
              >
                <Pencil size={18} />
              </button>
            )}
            
            {/* ORDER or PRE_ORDER: change to REVERSED only after deposit applied */}
            {isPreOrderFlow && row.status === "ACCEPTED" && depositStatus === "APPLIED" && (
              <button
                onClick={() => handleUpdateStatus(row.id, "REVERSED")}
                disabled={isUpdating}
                className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Mark as REVERSED (bike arrived at manufacturer)"
              >
                {isUpdating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RotateCcw size={18} />
                )}
              </button>
            )}
            
            {/* Removed delete button - quotations cannot be deleted once created */}
            
            {/* If no contract - Additional actions for AT_STORE and ORDER/PRE_ORDER */}
            {!hasContract && (
              <>
                {/* AT_STORE with deposit PENDING or quotation status PENDING: Show "Đã nhận cọc" button */}
                {isATStore && row.status === "ACCEPTED" && depositStatus === "PENDING" && (
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
                  </>
                )}
                
                {/* AT_STORE with deposit APPLIED: Show "Tạo installment plan" button */}
                {isATStore && depositStatus === "APPLIED" && (
                  <>
                    <button
                      onClick={() => handleOpenInstallmentPlanModal(row)}
                      className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                      title="Tạo installment plan"
                    >
                      <FileText size={18} />
                    </button>
                  </>
                )}
                
                {/* ORDER or PRE_ORDER: Show Đặt cọc */}
                {isPreOrderFlow && row.status === "ACCEPTED" && !depositInfo && (
                  <>
                    <button
                      onClick={() => handleOpenDepositModal(row)}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      title="Đặt cọc (Create Deposit)"
                    >
                      <CreditCard size={18} />
                    </button>
                  </>
                )}
                
                {/* ORDER or PRE_ORDER with deposit PENDING: Show "Đã nhận cọc" button */}
                {isPreOrderFlow && row.status === "ACCEPTED" && depositStatus === "PENDING" && (
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
                  </>
                )}
                
                {/* ORDER or PRE_ORDER with quotation status PENDING: Show "Đã nhận cọc" button */}
                {isPreOrderFlow && row.status === "PENDING" && (
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
                  </>
                )}
                
                {/* ORDER or PRE_ORDER: show create contract only after REVERSED */}
                {isPreOrderFlow && row.status === "REVERSED" && (
                  <button
                    onClick={() => handleOpenContractModal(row, row.contractPaidType || "FULL")}
                    className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                    title="Tạo hợp đồng khách hàng"
                  >
                    <FileText size={18} />
                  </button>
                )}
              </>
            )}

            {/* AT_STORE create contract button (unchanged) */}
            {isATStore && row.status === "ACCEPTED" && !hasContract && (
              <button
                onClick={() => handleOpenContractModal(row, "FULL")}
                className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                title="Tạo hợp đồng"
              >
                <FileText size={18} />
              </button>
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
            <option value="REVERSED">REVERSED</option>
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

            {/* Action buttons for DRAFT status */}
            {quotationDetail.status === "DRAFT" && (
              <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleUpdateStatus(quotationDetail.id, "REJECTED");
                    setIsDetailModalOpen(false);
                  }}
                  disabled={updatingStatus && updatingStatusId === quotationDetail.id}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updatingStatus && updatingStatusId === quotationDetail.id ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      <span>REJECT</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(quotationDetail.id, "ACCEPTED");
                    setIsDetailModalOpen(false);
                  }}
                  disabled={updatingStatus && updatingStatusId === quotationDetail.id}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updatingStatus && updatingStatusId === quotationDetail.id ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>ACCEPT</span>
                    </>
                  )}
                </button>
              </div>
            )}

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
      <FormModal
        isOpen={installmentPlanModal}
        onClose={() => {
          setInstallmentPlanModal(false);
          setSelectedQuotationForInstallment(null);
          setInstallmentContractForm({
            startDate: "",
            penaltyValue: 0,
            penaltyType: "FIXED",
            status: "ACTIVE",
            customerContractId: "",
            installmentPlanId: "",
          });
        }}
        title="Create Installment Contract"
        isDelete={false}
        isCreate={true}
        onSubmit={handleCreateInstallmentContract}
        isSubmitting={creatingInstallmentContract}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Installment Plan <span className="text-red-500">*</span>
            </label>
            {loadingInstallmentPlans ? (
              <div className="text-sm text-gray-500 py-2">Loading installment plans...</div>
            ) : (
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={installmentContractForm.installmentPlanId}
                onChange={(e) =>
                  setInstallmentContractForm((prev) => ({
                    ...prev,
                    installmentPlanId: e.target.value,
                  }))
                }
                required
              >
                <option value="">-- Select Installment Plan --</option>
                {installmentPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.totalPaidMonth} months, {plan.interestRate}% interest
                  </option>
                ))}
              </select>
            )}
            {installmentPlans.length === 0 && !loadingInstallmentPlans && (
              <p className="text-xs text-gray-500 mt-1">
                No active installment plans available. Please create one first.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={installmentContractForm.startDate}
              onChange={(e) =>
                setInstallmentContractForm((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Penalty Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={installmentContractForm.penaltyType}
              onChange={(e) =>
                setInstallmentContractForm((prev) => ({
                  ...prev,
                  penaltyType: e.target.value,
                }))
              }
              required
            >
              <option value="FIXED">FIXED</option>
              <option value="PERCENT">PERCENT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Penalty Value
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg"
              value={installmentContractForm.penaltyValue}
              onChange={(e) =>
                setInstallmentContractForm((prev) => ({
                  ...prev,
                  penaltyValue: Number(e.target.value || 0),
                }))
              }
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </FormModal>
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedQuotationForEdit(null);
          setEditForm({
            basePrice: 0,
            promotionPrice: 0,
            finalPrice: 0,
            validUntil: "",
            promotionId: "",
          });
          setStockPromotions([]);
          setSelectedPromotion(null);
        }}
        title="Chỉnh sửa báo giá"
        isDelete={false}
        isCreate={false}
        onSubmit={handleUpdateQuotation}
        isSubmitting={editSubmitting}
      >
        <div className="space-y-4">
          {selectedQuotationForEdit && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Quote Code</p>
                <p className="font-semibold text-gray-800">
                  {selectedQuotationForEdit.quoteCode || selectedQuotationForEdit.id}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Base Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editForm.basePrice}
                  onChange={(e) => {
                    const basePrice = Number(e.target.value || 0);
                    const promotionPrice = Number(editForm.promotionPrice || 0);
                    const finalPrice = basePrice - promotionPrice;
                    setEditForm(prev => ({
                      ...prev,
                      basePrice,
                      finalPrice: finalPrice > 0 ? finalPrice : 0
                    }));
                  }}
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              {selectedQuotationForEdit.type === "AT_STORE" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Promotion (optional)
                  </label>
                  {loadingPromotions ? (
                    <div className="text-sm text-gray-500 py-2">Đang tải promotions...</div>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={editForm.promotionId}
                      onChange={(e) => {
                        const promoId = e.target.value;
                        setEditForm(prev => ({ ...prev, promotionId: promoId }));
                        
                        if (!promoId) {
                          // No promotion selected
                          setSelectedPromotion(null);
                          const basePrice = Number(editForm.basePrice || 0);
                          setEditForm(prev => ({
                            ...prev,
                            promotionPrice: 0,
                            finalPrice: basePrice,
                          }));
                        } else {
                          // Find selected promotion
                          const promoItem = stockPromotions.find((p) => {
                            return String(p.id) === String(promoId);
                          });
                          if (promoItem) {
                            setSelectedPromotion(promoItem);
                            const basePrice = Number(editForm.basePrice || 0);
                            let promotionPrice = 0;
                            if (promoItem.valueType === "PERCENT") {
                              promotionPrice = (basePrice * Number(promoItem.value || 0)) / 100;
                            } else {
                              promotionPrice = Number(promoItem.value || 0);
                            }
                            const finalPrice = basePrice - promotionPrice;
                            setEditForm(prev => ({
                              ...prev,
                              promotionPrice,
                              finalPrice: Math.max(0, finalPrice),
                            }));
                          }
                        }
                      }}
                    >
                      <option value="">-- No Promotion --</option>
                      {stockPromotions.map((promo) => (
                        <option key={promo.id} value={promo.id}>
                          {promo.name} - {promo.valueType === "PERCENT" 
                            ? `${promo.value}%` 
                            : formatCurrency(promo.value)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Promotion Price
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editForm.promotionPrice}
                  onChange={(e) => {
                    const promotionPrice = Number(e.target.value || 0);
                    const basePrice = Number(editForm.basePrice || 0);
                    const finalPrice = basePrice - promotionPrice;
                    setEditForm(prev => ({
                      ...prev,
                      promotionPrice,
                      finalPrice: finalPrice > 0 ? finalPrice : 0,
                      promotionId: "", // Clear promotion selection if manually edited
                    }));
                    setSelectedPromotion(null);
                  }}
                  min="0"
                  step="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Final Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                  value={editForm.finalPrice}
                  onChange={(e) => setEditForm(prev => ({ ...prev, finalPrice: Number(e.target.value || 0) }))}
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editForm.validUntil}
                  onChange={(e) => setEditForm(prev => ({ ...prev, validUntil: e.target.value }))}
                  required
                />
              </div>
            </>
          )}
        </div>
      </FormModal>
    </div>
  );
}

export default QuotationManagement;

