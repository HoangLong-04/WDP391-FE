import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "../../../hooks/useAuth";
import useDealerStaffList from "../../../hooks/useDealerStaffList";
import useCustomerList from "../../../hooks/useCustomerList";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import PrivateDealerStaffApi from "../../../services/PrivateDealerStaffApi";
import { toast } from "react-toastify";
import DataTable from "../../../components/dataTable/DataTable";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatCurrency } from "../../../utils/currency";
import PrivateAdminApi from "../../../services/PrivateAdminApi";

dayjs.extend(utc);
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import {
  motorGeneralFields,
  motorGroupedFields,
} from "../../../components/viewModel/motorbikeModel/MotorbikeModel";
import useColorList from "../../../hooks/useColorList";
import FormModal from "../../../components/modal/formModal/FormModal";
import ContractForm from "./contractForm/ContractForm";
import useMotorList from "../../../hooks/useMotorList";
import {
  Pencil,
  Trash2,
  Plus,
  CreditCard,
  CheckCircle,
  Mail,
  Edit,
  XCircle,
  Loader2,
  Wallet,
  X,
  PiggyBank,
  Upload,
} from "lucide-react";
import { renderStatusTag } from "../../../utils/statusTag";
import BaseModal from "../../../components/modal/baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";
import ConfirmModal from "../../../components/modal/confirmModal/ConfirmModal";
import InstallmentPaymentForm from "./installmentPaymentForm/InstallmentPaymentForm";
import PublicApi from "../../../services/PublicApi";
import FullPeriodModal from "../../../components/modal/periodModal/FullPeriodModal";
import PrivateDealerStaff from "../../../services/PrivateDealerStaffApi";

function CustomerContract() {
  const { user } = useAuth();
  const { staffList } = useDealerStaffList();
  const { customerList } = useCustomerList();
  const { colorList } = useColorList();
  const { motorList } = useMotorList();
  const [motorbike, setMotorbike] = useState({});
  const [allContracts, setAllContracts] = useState([]);
  const [periodFull, setPeriodFull] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Default to 5 for Dealer Staff, can be changed if needed
  const [staffId, setStaffId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [contractType, setContractType] = useState("");
  const [totalItem, setTotalItem] = useState(0);
  const isFetchingRef = useRef(false);
  const staffIdInitializedRef = useRef(false);

  // Auto-set staffId for Dealer Staff (only once when user is available)
  useEffect(() => {
    const isDealerStaff = user?.roles?.includes("Dealer Staff");
    if (isDealerStaff && user?.id && !staffIdInitializedRef.current) {
      const userIdString = String(user.id);
      setStaffId(userIdString);
      staffIdInitializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.roles]);

  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [motorModal, setMotorModal] = useState(false);
  const [updateInstallmentModal, setUpdateInstallmentModal] = useState(false);
  const [installmentPaymentForm, setInstallmentPaymentForm] = useState({
    dueDate: "",
    penaltyAmount: 0,
  });
  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [contractDetail, setContractDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [installmentContractModal, setInstallmentContractModal] =
    useState(false);
  const [installmentPlanList, setInstallmentPlanList] = useState([]);
  const [loadingInstallmentPlans, setLoadingInstallmentPlans] = useState(false);
  const [installmentContractForm, setInstallmentContractForm] = useState({
    startDate: "",
    penaltyValue: 0,
    penaltyType: "FIXED",
    status: "ACTIVE",
    customerContractId: "",
    installmentPlanId: "",
  });
  const [installmentContractDetail, setInstallmentContractDetail] =
    useState(null);
  const [isInstallmentDetailModalOpen, setIsInstallmentDetailModalOpen] =
    useState(false);
  const [loadingInstallmentDetail, setLoadingInstallmentDetail] =
    useState(false);
  const [installmentContractMap, setInstallmentContractMap] = useState({}); // Map customerContractId -> installmentContractId
  const [isPaymentConfirmModalOpen, setIsPaymentConfirmModalOpen] =
    useState(false);
  const [selectedPaymentForConfirm, setSelectedPaymentForConfirm] =
    useState(null);
  const [isMarkingPaymentAsPaid, setIsMarkingPaymentAsPaid] = useState(false);
  const [sendingContractEmail, setSendingContractEmail] = useState(false);
  const [sendingInstallmentEmail, setSendingInstallmentEmail] = useState(false);
  const [generatingInterestPayments, setGeneratingInterestPayments] =
    useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [fullPaymentModal, setFullPaymentModal] = useState(false);
  const [periodModal, setPeriodModal] = useState(false);
  const [documentUploadModal, setDocumentUploadModal] = useState(false);
  const [fullPaymentForm, setFullPaymentForm] = useState({
    period: 1,
    amount: 0,
    customerContractId: "",
  });
  const [creatingFullPayment, setCreatingFullPayment] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    finalPrice: 0,
    depositAmount: 0,
    signDate: "",
    contractPaidType: "",
    contractType: "",
    status: "",
    customerId: "",
    staffId: "",
    agencyId: user?.agencyId,
    electricMotorbikeId: "",
    colorId: "",
  });
  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    finalPrice: 0,
    depositAmount: 0,
    signDate: "",
    contractPaidType: "",
    contractType: "",
    status: "",
    electricMotorbikeId: "",
    colorId: "",
  });
  const [documentType, setDocumentType] = useState("");
  const [documentImages, setDocumentImages] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [currentContractStatus, setCurrentContractStatus] = useState("");
  const [viewingImageUrl, setViewingImageUrl] = useState(null);

  const [isEdit, setIsedit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchMotorById = async (id) => {
    setViewLoading(true);
    try {
      const response = await PrivateAdminApi.getMotorbikeById(id);
      setMotorbike(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewLoading(false);
    }
  };

  const fetchCustomerContractList = useCallback(async () => {
    if (!user?.agencyId) return;

    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    try {
      const isDealerStaff = user?.roles?.includes("Dealer Staff");
      const api = isDealerStaff
        ? PrivateDealerStaffApi
        : PrivateDealerManagerApi;

      // Fetch current page only with limit = 5
      const response = await api.getCustomerContractList(user.agencyId, {
        page: page,
        limit: limit,
        staffId,
        customerId,
        status,
        contractType,
      });

      const contracts = response.data.data || [];
      const paginationInfo = response.data.paginationInfo || {};

      // Update state with current page data
      setAllContracts(contracts);

      // Update totalItem from paginationInfo
      // This MUST reflect the total number of items matching the current filters
      // If API returns wrong total (unfiltered), that's a backend issue
      const totalFromApi = paginationInfo.total;
      if (
        totalFromApi !== undefined &&
        totalFromApi !== null &&
        !isNaN(totalFromApi)
      ) {
        const totalValue = Math.max(0, Number(totalFromApi));
        setTotalItem(totalValue);
      } else {
        // If paginationInfo.total is missing or invalid, set to 0
        // This will hide pagination until API returns correct value
        setTotalItem(0);
      }

      // Check for installment contracts for DEBT contracts (only check contracts not already in map)
      setInstallmentContractMap((prev) => {
        const contractsToCheck = contracts.filter(
          (contract) =>
            contract.contractPaidType === "DEBT" &&
            contract.status === "PENDING" &&
            !prev[contract.id]
        );

        if (contractsToCheck.length > 0) {
          // Check contracts asynchronously but don't block
          const checkPromises = contractsToCheck.map(async (contract) => {
            try {
              const res =
                await PrivateDealerManagerApi.getInstallmentContractByCustomerContractId(
                  contract.id
                );
              const installmentContract = res.data?.data;
              if (installmentContract?.id) {
                setInstallmentContractMap((current) => ({
                  ...current,
                  [contract.id]: installmentContract.id,
                }));
              }
            } catch (error) {
              // 404 means no installment contract exists - that's fine
              if (error.response?.status !== 404) {
                console.error(
                  `Error checking installment contract for contract ${contract.id}:`,
                  error
                );
              }
            }
          });
          Promise.all(checkPromises).catch((err) =>
            console.error("Error checking installment contracts:", err)
          );
        }

        return prev; // Return unchanged, updates will be done via setState in promises
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.agencyId, staffId, customerId, status, contractType, page, limit]);

  // Use contracts directly from API (already paginated)
  const customerContractList = allContracts;

  // Calculate total pages from totalItem
  const totalPage = Math.ceil(totalItem / limit);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [staffId, customerId, status, contractType]);

  // Fetch data when filters, page, limit, or user changes
  useEffect(() => {
    if (user?.agencyId) {
      fetchCustomerContractList();
    }
  }, [user?.agencyId, staffId, customerId, status, contractType, page, limit]);

  const handleCreateCustomerContract = async (e) => {
    setSubmit(true);
    e.preventDefault();
    const sendData = {
      ...form,
      colorId: Number(form.colorId),
      customerId: Number(form.customerId),
      electricMotorbikeId: Number(form.electricMotorbikeId),
      staffId: Number(form.staffId),
      status: form.status || "PENDING", // Default to PENDING if not specified
    };
    try {
      await PrivateDealerManagerApi.createCustomerContract(sendData);
      setFormModal(false);
      toast.success("Create successfully");
      fetchCustomerContractList();
      setForm({
        title: "",
        content: "",
        finalPrice: 0,
        depositAmount: 0,
        signDate: "",
        contractPaidType: "",
        contractType: "",
        status: "",
        customerId: "",
        staffId: "",
        agencyId: user?.agencyId,
        electricMotorbikeId: "",
        colorId: "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateCustomerContract = async (e) => {
    setSubmit(true);
    e.preventDefault();
    try {
      // Fetch current contract detail to get accurate status
      const isDealerStaff = user?.roles?.includes("Dealer Staff");
      const api = isDealerStaff
        ? PrivateDealerStaffApi
        : PrivateDealerManagerApi;

      let currentContract = null;
      try {
        const res = await api.getCustomerContractDetail(selectedId);
        currentContract = res.data?.data;
      } catch (err) {
        // Fallback to finding in allContracts if detail fetch fails
        currentContract = allContracts.find((c) => c.id === Number(selectedId));
      }

      // Only allow updating: title, content, signDate, deliveryDate, contractPaidType
      const updateData = {};

      // Only include fields that have values
      if (
        updateForm.title !== undefined &&
        updateForm.title !== null &&
        updateForm.title !== ""
      ) {
        updateData.title = updateForm.title;
      }
      if (updateForm.content !== undefined && updateForm.content !== null) {
        updateData.content = updateForm.content;
      }
      if (updateForm.signDate) {
        updateData.signDate = new Date(updateForm.signDate).toISOString();
      }
      if (updateForm.deliveryDate) {
        updateData.deliveryDate = new Date(
          updateForm.deliveryDate
        ).toISOString();
      }
      if (updateForm.contractPaidType) {
        updateData.contractPaidType = updateForm.contractPaidType;
      }

      // Auto-transition: REJECTED -> PENDING after editing (to allow accept again)
      if (currentContract?.status === "REJECTED") {
        updateData.status = "PENDING";
        toast.info(
          "Status automatically changed to PENDING after editing. You can now accept the contract again."
        );
      }

      // Auto-transition: CONFIRMED -> PROCESSING when signDate is updated
      if (currentContract?.status === "CONFIRMED" && updateData.signDate) {
        // If signDate is provided and contract is CONFIRMED, auto-transition to PROCESSING
        updateData.status = "PROCESSING";
        toast.info(
          "Status automatically changed to PROCESSING after updating sign date"
        );
      }

      await PrivateDealerManagerApi.updateCustomerContract(
        selectedId,
        updateData
      );

      // Only show success message if update was successful
      if (updateData.status === "CONFIRMED") {
        toast.success("Contract confirmed successfully");
      } else {
        toast.success("Update successfully");
      }

      setFormModal(false);
      fetchCustomerContractList();
    } catch (error) {
      // Show full error message from backend
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      console.error("Update contract error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(errorMessage || "Failed to update contract");
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteContract = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.deleteCustomerContract(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchCustomerContractList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUploadDocuments = async () => {
    if (!documentType || documentImages.length === 0) {
      toast.error("Please select document type and upload at least one image");
      return;
    }

    if (!selectedId) {
      toast.error("Contract ID is missing");
      return;
    }

    setUploadingDocuments(true);
    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      documentImages.forEach((file) => {
        formData.append("documentImages", file);
      });

      const response = await PrivateDealerStaffApi.uploadContractDocumentImages(
        selectedId,
        formData
      );

      if (response.data?.data && response.data.data.length > 0) {
        toast.success("Documents uploaded successfully");
        // Reset form
        setDocumentType("");
        setDocumentImages([]);
        // Fetch contract detail again to get updated documents with full info
        try {
          const detailRes =
            await PrivateDealerStaffApi.getCustomerContractDetail(selectedId);
          const contractDetail = detailRes.data?.data || null;
          if (
            contractDetail?.contractDocuments &&
            contractDetail.contractDocuments.length > 0
          ) {
            setUploadedDocuments(contractDetail.contractDocuments);
          }
        } catch (error) {
          console.error("Error fetching updated contract documents:", error);
        }
        // Refresh contract list
        fetchCustomerContractList();
        // Close modal after successful upload
        setDocumentUploadModal(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload documents"
      );
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleDeleteDocument = async (documentId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingDocumentId(documentId);
    try {
      await PrivateDealerStaffApi.deleteContractDocumentImage(documentId, {
        imageUrl: imageUrl,
      });
      setUploadedDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentId)
      );
      toast.success("Document deleted successfully");
      // Refresh contract detail
      fetchCustomerContractList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete document"
      );
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleViewDetail = async (contractId) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const isDealerStaff = user?.roles?.includes("Dealer Staff");
      const api = isDealerStaff
        ? PrivateDealerStaffApi
        : PrivateDealerManagerApi;
      const res = await api.getCustomerContractDetail(contractId);
      const contractDetail = res.data?.data || null;
      setContractDetail(contractDetail);

      // Update installment contract map if contract detail has installmentContractId
      if (contractDetail?.installmentContractId) {
        setInstallmentContractMap((prev) => ({
          ...prev,
          [contractId]: contractDetail.installmentContractId,
        }));
      }
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

  const fetchInstallmentPlans = async () => {
    setLoadingInstallmentPlans(true);
    try {
      const response = await PrivateDealerManagerApi.getInstallmentPlan(
        user?.agencyId,
        { page: 1, limit: 100, status: "ACTIVE" }
      );
      setInstallmentPlanList(response.data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load installment plans");
    } finally {
      setLoadingInstallmentPlans(false);
    }
  };

  const handleUpdateInstallmentPayment = async (e) => {
    console.log(installmentPaymentForm);

    setSubmit(true);
    e.preventDefault();
    try {
      await PrivateDealerManagerApi.updateInstallmentPayment(
        selectedId,
        installmentPaymentForm
      );
      toast.success("Update success");
      setUpdateInstallmentModal(false);
    } catch (error) {
      toast.error(error.response.data.message || "Update fail");
    } finally {
      setSubmit(false);
    }
  };

  const handleOpenInstallmentContractModal = async (contract) => {
    console.log("handleOpenInstallmentContractModal called with:", contract);
    // Only allow for DEBT contracts
    if (contract.contractPaidType !== "DEBT") {
      toast.error("Only DEBT contracts can have installment contracts");
      return;
    }

    // First check in local map
    const existingInstallmentId = installmentContractMap[contract.id];
    if (existingInstallmentId) {
      handleViewInstallmentContract(existingInstallmentId);
      return;
    }

    // Use the dedicated API to check if installment contract exists
    try {
      const res =
        await PrivateDealerManagerApi.getInstallmentContractByCustomerContractId(
          contract.id
        );
      const installmentContract = res.data?.data;

      if (installmentContract?.id) {
        setInstallmentContractMap((prev) => ({
          ...prev,
          [contract.id]: installmentContract.id,
        }));
        handleViewInstallmentContract(installmentContract.id);
        return;
      }
    } catch (error) {
      // If 404 or not found, it means no installment contract exists - that's fine
      if (error.response?.status === 404) {
        // No installment contract exists, proceed with creation
      } else {
        console.error("Error checking installment contract:", error);
        toast.error("Failed to verify contract status. Please try again.");
        return; // Don't proceed if we can't verify
      }
    }

    // If no installment contract found, proceed with creation
    setInstallmentContractForm({
      startDate: "",
      penaltyValue: 0,
      penaltyType: "FIXED",
      status: "ACTIVE",
      customerContractId: contract.id,
      installmentPlanId: "",
    });
    setInstallmentContractModal(true);
    fetchInstallmentPlans();
  };

  const handleCreateInstallmentContract = async (e) => {
    e.preventDefault();

    // Validate all required fields before submitting
    if (!installmentContractForm.startDate) {
      toast.error("Please select a start date");
      return;
    }
    if (!installmentContractForm.installmentPlanId) {
      toast.error("Please select an installment plan");
      return;
    }
    if (!installmentContractForm.penaltyType) {
      toast.error("Please select a penalty type");
      return;
    }
    if (
      installmentContractForm.penaltyValue === null ||
      installmentContractForm.penaltyValue === undefined ||
      installmentContractForm.penaltyValue < 0
    ) {
      toast.error("Please enter a valid penalty value (must be >= 0)");
      return;
    }
    if (!installmentContractForm.customerContractId) {
      toast.error("Customer contract ID is missing");
      return;
    }

    setSubmit(true);
    try {
      // Final check using the dedicated API before creating
      try {
        const res =
          await PrivateDealerManagerApi.getInstallmentContractByCustomerContractId(
            installmentContractForm.customerContractId
          );
        const existingInstallment = res.data?.data;

        if (existingInstallment?.id) {
          setInstallmentContractMap((prev) => ({
            ...prev,
            [installmentContractForm.customerContractId]:
              existingInstallment.id,
          }));
          setInstallmentContractModal(false);
          handleViewInstallmentContract(existingInstallment.id);
          setSubmit(false);
          return;
        }
      } catch (checkError) {
        // If 404, it means no installment contract exists - that's fine, continue
        if (checkError.response?.status !== 404) {
          console.error(
            "Error checking installment contract before create:",
            checkError
          );
          toast.error("Failed to verify contract status. Please try again.");
          setSubmit(false);
          return;
        }
      }

      // Prepare data with all required fields
      const sendData = {
        startDate: new Date(installmentContractForm.startDate).toISOString(),
        penaltyValue: Number(installmentContractForm.penaltyValue),
        penaltyType: installmentContractForm.penaltyType,
        status: installmentContractForm.status || "ACTIVE",
        customerContractId: Number(installmentContractForm.customerContractId),
        installmentPlanId: Number(installmentContractForm.installmentPlanId),
      };

      // Verify all fields are present
      if (
        !sendData.startDate ||
        !sendData.penaltyType ||
        !sendData.customerContractId ||
        !sendData.installmentPlanId
      ) {
        toast.error("Please fill in all required fields");
        setSubmit(false);
        return;
      }

      const response = await PrivateDealerManagerApi.createInstallmentContract(
        sendData
      );
      const installmentContractId = response.data?.data?.id;
      if (installmentContractId) {
        // Store the mapping immediately
        setInstallmentContractMap((prev) => ({
          ...prev,
          [installmentContractForm.customerContractId]: installmentContractId,
        }));

        toast.success("Installment contract created successfully");
      } else {
        toast.success("Create installment contract successfully");
      }
      setInstallmentContractModal(false);

      // Refresh the list to update UI
      await fetchCustomerContractList();

      // Redirect to detail page after creating
      if (installmentContractId) {
        handleViewInstallmentContract(installmentContractId);
      }

      // Double check by fetching contract detail to ensure map is updated
      try {
        const contractDetailRes =
          await PrivateDealerManagerApi.getCustomerContractDetail(
            installmentContractForm.customerContractId
          );
        const contractDetail = contractDetailRes.data?.data;
        if (contractDetail?.installmentContractId) {
          setInstallmentContractMap((prev) => ({
            ...prev,
            [installmentContractForm.customerContractId]:
              contractDetail.installmentContractId,
          }));
        }
      } catch (error) {
        console.error("Error fetching contract detail after creation:", error);
      }
      setInstallmentContractForm({
        startDate: "",
        penaltyValue: 0,
        penaltyType: "FIXED",
        status: "ACTIVE",
        customerContractId: "",
        installmentPlanId: "",
      });
    } catch (error) {
      // Better error handling
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create installment contract";
      if (
        errorMessage.includes("Unique") ||
        errorMessage.includes("unique constraint") ||
        errorMessage.includes("customerContractId")
      ) {
        setInstallmentContractModal(false);

        // Try to fetch the existing installment contract using the dedicated API
        try {
          const res =
            await PrivateDealerManagerApi.getInstallmentContractByCustomerContractId(
              installmentContractForm.customerContractId
            );
          const existingInstallment = res.data?.data;

          if (existingInstallment?.id) {
            setInstallmentContractMap((prev) => ({
              ...prev,
              [installmentContractForm.customerContractId]:
                existingInstallment.id,
            }));
            handleViewInstallmentContract(existingInstallment.id);
          } else {
            // If we can't find it, refresh the list
            fetchCustomerContractList();
          }
        } catch (fetchError) {
          console.error(
            "Error fetching installment contract after unique constraint error:",
            fetchError
          );
          // Refresh the list as fallback
          fetchCustomerContractList();
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmit(false);
    }
  };

  const handleViewInstallmentContract = async (installmentContractId) => {
    setLoadingInstallmentDetail(true);
    setIsInstallmentDetailModalOpen(true);
    try {
      const res = await PrivateDealerManagerApi.getInstallmentContractDetail(
        installmentContractId
      );
      const detail = res.data?.data || null;
      setInstallmentContractDetail(detail);
    } catch (error) {
      toast.error(
        error.message || "Failed to load installment contract detail"
      );
      setIsInstallmentDetailModalOpen(false);
    } finally {
      setLoadingInstallmentDetail(false);
    }
  };

  const handleGenerateInterestPayments = async (installmentContractId) => {
    setGeneratingInterestPayments(true);
    try {
      await PrivateDealerManagerApi.generateInterestPayments(
        installmentContractId
      );
      toast.success("Interest payments generated successfully");

      // Immediately refresh the detail to get updated data
      try {
        const res = await PrivateDealerManagerApi.getInstallmentContractDetail(
          installmentContractId
        );
        const updatedDetail = res.data?.data || null;
        // Update detail - this will automatically hide the button if interestPayments exist
        setInstallmentContractDetail(updatedDetail);

        // If still no interestPayments after refresh, try again after a short delay
        if (
          !updatedDetail?.interestPayments ||
          updatedDetail.interestPayments.length === 0
        ) {
          setTimeout(async () => {
            try {
              const retryRes =
                await PrivateDealerManagerApi.getInstallmentContractDetail(
                  installmentContractId
                );
              const retryDetail = retryRes.data?.data || null;
              setInstallmentContractDetail(retryDetail);
            } catch (retryError) {
              console.error(
                "Error retrying refresh after generate:",
                retryError
              );
            }
          }, 1000);
        }
      } catch (refreshError) {
        console.error("Error refreshing detail after generate:", refreshError);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate interest payments"
      );
    } finally {
      setGeneratingInterestPayments(false);
    }
  };

  const handleMarkPaymentAsPaid = (payment) => {
    if (payment.status === "PAID") {
      toast.info("This payment is already marked as PAID");
      return;
    }

    setSelectedPaymentForConfirm(payment);
    setIsPaymentConfirmModalOpen(true);
  };

  const handleConfirmMarkPaymentAsPaid = async () => {
    if (!selectedPaymentForConfirm) return;

    setIsMarkingPaymentAsPaid(true);
    try {
      const payment = selectedPaymentForConfirm;
      const updateData = {
        dueDate: payment.dueDate
          ? new Date(payment.dueDate).toISOString()
          : new Date().toISOString(),
        paidDate: new Date().toISOString(),
        amountDue: payment.amountDue || 0,
        amountPaid: payment.amountDue || 0, // Mark as fully paid
        penaltyAmount: payment.penaltyAmount || 0,
        status: "PAID",
      };

      await PrivateDealerManagerApi.updateInstallmentPayment(
        payment.id,
        updateData
      );
      toast.success("Payment marked as PAID successfully");

      setIsPaymentConfirmModalOpen(false);
      setSelectedPaymentForConfirm(null);

      // Refresh installment contract detail to show updated status
      if (installmentContractDetail?.id) {
        const res = await PrivateDealerManagerApi.getInstallmentContractDetail(
          installmentContractDetail.id
        );
        setInstallmentContractDetail(res.data?.data || null);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update payment status"
      );
    } finally {
      setIsMarkingPaymentAsPaid(false);
    }
  };

  const handleSendContractEmail = async (customerContractId) => {
    if (!customerContractId) {
      toast.error("Customer contract ID is missing");
      return;
    }

    setSendingContractEmail(true);
    try {
      const isDealerStaff = user?.roles?.includes("Dealer Staff");
      const api = isDealerStaff
        ? PrivateDealerStaffApi
        : PrivateDealerManagerApi;
      await api.sendCustomerContractEmail(customerContractId);
      toast.success("Email sent successfully to customer");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to send email"
      );
    } finally {
      setSendingContractEmail(false);
    }
  };

  const handleSendInstallmentScheduleEmail = async (installmentContractId) => {
    if (!installmentContractId) {
      toast.error("Installment contract ID is missing");
      return;
    }

    setSendingInstallmentEmail(true);
    try {
      const isDealerStaff = user?.roles?.includes("Dealer Staff");
      const api = isDealerStaff
        ? PrivateDealerStaffApi
        : PrivateDealerManagerApi;
      await api.sendInstallmentScheduleEmail(installmentContractId);
      toast.success("Installment schedule email sent successfully to customer");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to send email"
      );
    } finally {
      setSendingInstallmentEmail(false);
    }
  };

  const handleUpdateContractStatus = async (contractId, newStatus) => {
    setUpdatingStatus(true);
    setUpdatingStatusId(contractId);
    try {
      const isDealerStaff = user?.roles?.includes("Dealer Staff");
      const api = isDealerStaff
        ? PrivateDealerStaffApi
        : PrivateDealerManagerApi;

      // Only update status, don't update signDate automatically
      // signDate will be updated separately when customer signs
      const updateData = { status: newStatus };

      await api.updateCustomerContract(contractId, updateData);
      toast.success(`Contract status updated to ${newStatus}`);

      // Close detail modal after updating status
      setIsDetailModalOpen(false);
      setContractDetail(null);

      fetchCustomerContractList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update contract status"
      );
    } finally {
      setUpdatingStatus(false);
      setUpdatingStatusId(null);
    }
  };

  const handleCreateFullPayment = async (e) => {
    e.preventDefault();
    setCreatingFullPayment(true);
    try {
      await PrivateDealerManagerApi.createContractFullPayment({
        period: Number(fullPaymentForm.period),
        amount: Number(fullPaymentForm.amount),
        customerContractId: Number(fullPaymentForm.customerContractId),
      });
      toast.success("Create payment period for contract full success");
      setFullPaymentModal(false);
      setFullPaymentForm({
        period: 1,
        amount: 0,
        customerContractId: "",
      });
      fetchCustomerContractList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create full payment"
      );
    } finally {
      setCreatingFullPayment(false);
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

  const handleGetPeriodFullPayment = async (id) => {
    try {
      const response = await PublicApi.getContractFullPayment(id);
      setPeriodFull(response.data.data);
      if (response.data.data.length === 0) {
        toast.warning("No period found!");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleDeletePeriod = async (id) => {
    try {
      await PrivateDealerStaff.deletePeriod(id);
      setPeriodModal(false);
      toast.success("Delete ok");
    } catch (error) {
      toast.error("Delete fail");
    }
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
      key: "customer",
      title: "Customer Name",
      render: (customer) => {
        if (!customer) return "-";
        return (
          <span className="font-medium text-gray-800">
            {customer.name || "-"}
          </span>
        );
      },
    },
    {
      key: "customer",
      title: "Customer Email",
      render: (customer) => {
        if (!customer) return "-";
        return <span className="text-gray-600">{customer.email || "-"}</span>;
      },
    },
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
    { key: "contractPaidType", title: "Payment Type" },
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
  ];

  const actions = [
    {
      type: "edit",
      label: (item) => {
        const installmentContractId = installmentContractMap[item.id];
        return installmentContractId ? "View" : "Installment Contract";
      },
      icon: CreditCard,
      onClick: (item) => {
        console.log("Installment Contract button clicked for item:", item);
        const installmentContractId = installmentContractMap[item.id];
        const hasInstallmentContract = !!installmentContractId;
        if (hasInstallmentContract) {
          console.log(
            "Has existing installment contract, viewing:",
            installmentContractId
          );
          handleViewInstallmentContract(installmentContractId);
        } else {
          console.log("No existing installment contract, opening modal");
          handleOpenInstallmentContractModal(item);
        }
      },
      show: (item) => {
        const isDealerStaff = user?.roles?.includes("Dealer Staff");
        // Allow creating installment contract for DEBT contracts with status COMPLETED only
        const hasAllowedStatus = item.status === "COMPLETED";
        const isDebtType = item.contractPaidType === "DEBT";
        const canShowInstallmentButton = hasAllowedStatus && isDebtType;
        const shouldShow = canShowInstallmentButton && !isDealerStaff;

        // More detailed logging
        if (!shouldShow) {
          console.log(
            `[Installment Button] NOT SHOWING for Contract #${item.id}:`,
            {
              status: item.status,
              hasAllowedStatus,
              contractPaidType: item.contractPaidType,
              isDebtType,
              isDealerStaff,
              reason: !hasAllowedStatus
                ? `Status "${item.status}" must be COMPLETED`
                : !isDebtType
                ? `Contract type is "${item.contractPaidType}", not DEBT`
                : isDealerStaff
                ? "User is Dealer Staff"
                : "Unknown reason",
            }
          );
        } else {
          console.log(`[Installment Button] SHOWING for Contract #${item.id}`);
        }

        return shouldShow;
      },
    },
    {
      type: "edit",
      label: "Edit",
      icon: Pencil,
      onClick: async (item) => {
        setIsedit(true);
        setSelectedId(item.id);
        setFormModal(true);
        setCurrentContractStatus(item.status || "");
        console.log("Setting contract status for edit:", item.status);
        setUpdateForm({
          title: item.title || "",
          content: item.content || "",
          signDate: item.signDate
            ? dayjs(item.signDate).format("YYYY-MM-DD")
            : "",
          deliveryDate: item.deliveryDate
            ? dayjs(item.deliveryDate).format("YYYY-MM-DD")
            : "",
          contractPaidType: item.contractPaidType || "",
        });
        // Reset document upload state
        setDocumentType("");
        setDocumentImages([]);
        setUploadedDocuments([]);
      },
      show: (item) => {
        // Allow edit for REJECTED and CONFIRMED status
        return item.status === "REJECTED" || item.status === "CONFIRMED";
      },
    },
    {
      type: "edit",
      label: "Upload Document",
      icon: Upload,
      onClick: async (item) => {
        setSelectedId(item.id);
        setDocumentType("");
        setDocumentImages([]);
        setUploadedDocuments([]);
        // Fetch existing documents
        try {
          const isDealerStaff = user?.roles?.includes("Dealer Staff");
          const api = isDealerStaff
            ? PrivateDealerStaffApi
            : PrivateDealerManagerApi;
          const res = await api.getCustomerContractDetail(item.id);
          const detail = res.data?.data || null;
          if (detail?.contractDocuments) {
            setUploadedDocuments(detail.contractDocuments || []);
          }
        } catch (error) {
          console.error("Error fetching contract documents:", error);
        }
        setDocumentUploadModal(true);
      },
      show: (item) => item.status === "PROCESSING",
    },
    {
      type: "edit",
      label: "Mark as COMPLETED",
      icon: CheckCircle,
      onClick: (item) => {
        handleUpdateContractStatus(item.id, "COMPLETED");
      },
      show: (item) => item.status === "PROCESSING",
    },
    {
      type: "edit",
      label: "Create Payment",
      icon: Wallet,
      onClick: (item) => {
        setFullPaymentForm({
          period: 1,
          amount: item.finalPrice || 0,
          customerContractId: item.id,
        });
        setFullPaymentModal(true);
      },
      show: (item) =>
        item.status === "COMPLETED" && item.contractPaidType === "FULL",
    },
    {
      type: "view",
      label: "View periods",
      icon: PiggyBank,
      onClick: (item) => {
        setPeriodModal(true);
        handleGetPeriodFullPayment(item.id);
      },
      show: (item) =>
        item.status === "COMPLETED" && item.contractPaidType === "FULL",
    },
    {
      type: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: (item) => {
        setSelectedId(item.id);
        setDeleteModal(true);
      },
      show: (item) => !user?.roles?.includes("Dealer Staff"),
    },
  ];

  return (
    <div>
      <div className="my-3 flex justify-end items-center gap-5">
        {!user?.role?.includes("Dealer Staff") && (
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
                <option value={staff.id}>
                  {staff.fullname} - {staff.id}
                </option>
              ))}
            </select>
          </div>
        )}
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
              <option value={customer.id}>
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
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
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
            <option value="FULL">FULL</option>
            <option value="DEBT">DEBT</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsedit(false);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer rounded-lg px-4 py-2.5 text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
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
      <GroupModal
        data={motorbike}
        groupedFields={motorGroupedFields}
        isOpen={motorModal}
        loading={viewLoading}
        onClose={() => setMotorModal(false)}
        title={"Motorbike info"}
        generalFields={motorGeneralFields}
      />
      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update contract" : "Create contract"}
        isDelete={false}
        onSubmit={
          isEdit ? handleUpdateCustomerContract : handleCreateCustomerContract
        }
        isSubmitting={submit}
        isCreate={!isEdit}
        isUpdate={isEdit}
      >
        <ContractForm
          colorList={colorList}
          customerList={customerList}
          form={form}
          motorbikeList={motorList}
          setForm={setForm}
          staffList={staffList}
          isEdit={isEdit}
          setUpdateForm={setUpdateForm}
          updateForm={updateForm}
          user={user}
          contractStatus={currentContractStatus}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteContract}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>
      </FormModal>

      <FormModal
        isOpen={installmentContractModal}
        onClose={() => {
          setInstallmentContractModal(false);
          setInstallmentContractForm({
            startDate: "",
            penaltyValue: 0,
            penaltyType: "FIXED",
            status: "ACTIVE",
            customerContractId: "",
            installmentPlanId: "",
          });
        }}
        onSubmit={handleCreateInstallmentContract}
        isSubmitting={submit}
        title={"Create Installment Contract"}
        isDelete={false}
        isCreate={true}
      >
        <div className="space-y-3">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={installmentContractForm.startDate}
              onChange={(e) =>
                setInstallmentContractForm({
                  ...installmentContractForm,
                  startDate: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Installment Plan <span className="text-red-500">*</span>
            </label>
            {loadingInstallmentPlans ? (
              <div className="flex justify-center py-4">
                <CircularProgress size={24} />
              </div>
            ) : (
              <select
                name="installmentPlanId"
                value={installmentContractForm.installmentPlanId}
                onChange={(e) =>
                  setInstallmentContractForm({
                    ...installmentContractForm,
                    installmentPlanId: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 bg-white cursor-pointer"
                required
              >
                <option value="">Select Installment Plan</option>
                {installmentPlanList.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.tensor} ({plan.totalPaidMonth} months,{" "}
                    {plan.interestPaidType})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Penalty Type <span className="text-red-500">*</span>
            </label>
            <select
              name="penaltyType"
              value={installmentContractForm.penaltyType}
              onChange={(e) =>
                setInstallmentContractForm({
                  ...installmentContractForm,
                  penaltyType: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 bg-white cursor-pointer"
              required
            >
              <option value="FIXED">FIXED</option>
              <option value="DAILY">DAILY</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Penalty Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="penaltyValue"
              value={installmentContractForm.penaltyValue}
              onChange={(e) =>
                setInstallmentContractForm({
                  ...installmentContractForm,
                  penaltyValue: e.target.value ? Number(e.target.value) : 0,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              min={0}
              required
            />
          </div>
        </div>
      </FormModal>
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
                    ? dayjs
                        .utc(contractDetail.deliveryDate)
                        .format("DD/MM/YYYY")
                    : "-"}
                </p>
              </div>
            </div>

            {/* Contract Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">
                Contract Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Type</p>
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
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-5 border border-teal-100">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-teal-200">
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
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-100">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-orange-200">
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
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">
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

            {/* Contract Documents */}
            {contractDetail.contractDocuments &&
              contractDetail.contractDocuments.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-100">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-amber-200">
                    Contract Documents
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {contractDetail.contractDocuments.map((doc, index) => (
                      <div
                        key={doc.id || index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={doc.imageUrl}
                            alt={doc.documentType || "Document"}
                            className="w-20 h-20 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setViewingImageUrl(doc.imageUrl)}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80?text=Image";
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {doc.documentType || "Unknown Type"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Click image to view
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Action buttons for status transitions */}
            {contractDetail.status === "PENDING" && (
              <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleUpdateContractStatus(contractDetail.id, "REJECTED");
                  }}
                  disabled={
                    updatingStatus && updatingStatusId === contractDetail.id
                  }
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updatingStatus && updatingStatusId === contractDetail.id ? (
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
                    handleUpdateContractStatus(contractDetail.id, "CONFIRMED");
                  }}
                  disabled={
                    updatingStatus && updatingStatusId === contractDetail.id
                  }
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updatingStatus && updatingStatusId === contractDetail.id ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>CONFIRM</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {contractDetail.status === "CONFIRMED" && (
              <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsedit(true);
                    setSelectedId(contractDetail.id);
                    setFormModal(true);
                    setCurrentContractStatus(contractDetail.status || "");
                    setUpdateForm({
                      title: contractDetail.title || "",
                      content: contractDetail.content || "",
                      signDate: contractDetail.signDate
                        ? dayjs(contractDetail.signDate).format("YYYY-MM-DD")
                        : "",
                      deliveryDate: contractDetail.deliveryDate
                        ? dayjs(contractDetail.deliveryDate).format(
                            "YYYY-MM-DD"
                          )
                        : "",
                      contractPaidType: contractDetail.contractPaidType || "",
                    });
                    // Reset document upload state
                    setDocumentType("");
                    setDocumentImages([]);
                    setUploadedDocuments([]);
                    // Fetch existing documents if Dealer Staff and status is CONFIRMED
                    if (
                      user?.roles?.includes("Dealer Staff") &&
                      contractDetail.status === "CONFIRMED" &&
                      contractDetail?.contractDocuments
                    ) {
                      setUploadedDocuments(
                        contractDetail.contractDocuments || []
                      );
                    }
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Pencil size={18} />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data available
          </div>
        )}
      </BaseModal>

      {/* Image View Modal */}
      {viewingImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setViewingImageUrl(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <img
              src={viewingImageUrl}
              alt="Document"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800?text=Image+Not+Found";
              }}
            />
          </div>
        </div>
      )}

      <BaseModal
        isOpen={isInstallmentDetailModalOpen}
        onClose={() => {
          setIsInstallmentDetailModalOpen(false);
          setInstallmentContractDetail(null);
        }}
        title="Installment Contract Detail"
        size="lg"
      >
        {loadingInstallmentDetail ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : installmentContractDetail ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Installment Contract #{installmentContractDetail.id}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {renderStatusTag(installmentContractDetail.status)}
                  {/* Only show Generate button if installment payments don't exist */}
                  {(!installmentContractDetail.installmentPayments ||
                    !Array.isArray(
                      installmentContractDetail.installmentPayments
                    ) ||
                    installmentContractDetail.installmentPayments.length ===
                      0) &&
                  (!installmentContractDetail.interestPayments ||
                    !Array.isArray(
                      installmentContractDetail.interestPayments
                    ) ||
                    installmentContractDetail.interestPayments.length === 0) ? (
                    <button
                      onClick={() =>
                        handleGenerateInterestPayments(
                          installmentContractDetail.id
                        )
                      }
                      disabled={generatingInterestPayments}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate interest payments"
                    >
                      {generatingInterestPayments
                        ? "Generating..."
                        : "Generate Interest Payments"}
                    </button>
                  ) : null}
                  <button
                    onClick={() =>
                      handleSendInstallmentScheduleEmail(
                        installmentContractDetail.id
                      )
                    }
                    disabled={sendingInstallmentEmail}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send installment schedule to customer email"
                  >
                    <Mail size={18} />
                    {sendingInstallmentEmail ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border-2 border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Pre Paid Total</p>
                <p className="text-xl font-bold text-indigo-700">
                  {formatCurrency(installmentContractDetail.prePaidTotal || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Total Debt Paid</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(installmentContractDetail.totalDebtPaid || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Penalty Value</p>
                <p className="text-xl font-bold text-orange-700">
                  {formatCurrency(installmentContractDetail.penaltyValue || 0)}
                </p>
              </div>
            </div>

            {/* Contract Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
              <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">
                Contract Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-medium text-gray-800">
                    {installmentContractDetail?.startAt || installmentContractDetail?.startDate
                      ? dayjs(installmentContractDetail.startAt || installmentContractDetail.startDate).utc().format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Penalty Type</p>
                  <p className="font-medium text-gray-800">
                    {installmentContractDetail?.penaltyType || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Contract Info */}
            {installmentContractDetail.customerContract && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">
                  Customer Contract Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Title</p>
                    <p className="font-medium text-gray-800">
                      {installmentContractDetail.customerContract.title || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-medium text-gray-800">
                      {formatCurrency(
                        installmentContractDetail.customerContract.finalPrice ||
                          0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Deposit Amount</p>
                    <p className="font-medium text-gray-800">
                      {formatCurrency(
                        installmentContractDetail.customerContract
                          .depositAmount || 0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contract Type</p>
                    <p className="font-medium text-gray-800">
                      {installmentContractDetail.customerContract.type || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-medium text-gray-800">
                      {renderStatusTag(
                        installmentContractDetail.customerContract.status
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Installment Plan Info */}
            {installmentContractDetail.installmentPlan && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Installment Plan Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">
                      {installmentContractDetail.installmentPlan.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tensor</p>
                    <p className="font-medium text-gray-800">
                      {installmentContractDetail.installmentPlan.tensor || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
                    <p className="font-medium text-gray-800">
                      {installmentContractDetail.installmentPlan.interestRate ||
                        0}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total Paid Months
                    </p>
                    <p className="font-medium text-gray-800">
                      {installmentContractDetail.installmentPlan
                        .totalPaidMonth || 0}{" "}
                      months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Interest Paid Type
                    </p>
                    <p className="font-medium text-gray-800">
                      {installmentContractDetail.installmentPlan
                        .interestPaidType || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Pre Paid Percent
                    </p>
                    <p className="font-medium text-gray-800">
                      {installmentContractDetail.installmentPlan
                        .prePaidPercent || 0}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Process Fee</p>
                    <p className="font-medium text-gray-800">
                      {formatCurrency(
                        installmentContractDetail.installmentPlan.processFee ||
                          0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Installment Payments */}
            {installmentContractDetail.installmentPayments &&
              installmentContractDetail.installmentPayments.length > 0 && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Installment Payments (
                    {installmentContractDetail.installmentPayments.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Period
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Due Date
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Paid Date
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Amount Due
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Amount Paid
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Penalty
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {installmentContractDetail.installmentPayments.map(
                          (payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-800">
                                {payment.period
                                  ? dayjs
                                      .utc(payment.period)
                                      .format("DD/MM/YYYY")
                                  : "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {payment.dueDate
                                  ? dayjs
                                      .utc(payment.dueDate)
                                      .format("DD/MM/YYYY")
                                  : "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {payment.paidDate
                                  ? dayjs
                                      .utc(payment.paidDate)
                                      .format("DD/MM/YYYY")
                                  : "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {formatCurrency(payment.amountDue || 0)}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {formatCurrency(payment.amountPaid || 0)}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {formatCurrency(payment.penaltyAmount || 0)}
                              </td>
                              <td className="px-4 py-2">
                                {renderStatusTag(payment.status)}
                              </td>
                              <td className="px-4 py-2">
                                {payment.status !== "PAID" && (
                                  <div className="flex gap-5">
                                    <button
                                      onClick={() =>
                                        handleMarkPaymentAsPaid(payment)
                                      }
                                      className="cursor-pointer text-white bg-green-500 p-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                                      title="Mark as PAID"
                                    >
                                      <CheckCircle size={18} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setUpdateInstallmentModal(true);
                                        setInstallmentPaymentForm({
                                          ...installmentPaymentForm,
                                          dueDate: payment.dueDate,
                                        });
                                        setSelectedId(payment.id);
                                      }}
                                      className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                                      title="Update"
                                    >
                                      <Edit size={18} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Interest Payments */}
            {installmentContractDetail.interestPayments &&
              installmentContractDetail.interestPayments.length > 0 && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Interest Payments (
                    {installmentContractDetail.interestPayments.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Period
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Due Date
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Paid Date
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Interest Amount
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Amount Paid
                          </th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {installmentContractDetail.interestPayments.map(
                          (payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-800">
                                {payment.period
                                  ? dayjs
                                      .utc(payment.period)
                                      .format("DD/MM/YYYY")
                                  : "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {payment.dueDate
                                  ? dayjs
                                      .utc(payment.dueDate)
                                      .format("DD/MM/YYYY")
                                  : "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {payment.paidDate
                                  ? dayjs
                                      .utc(payment.paidDate)
                                      .format("DD/MM/YYYY")
                                  : "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {formatCurrency(
                                  payment.interestAmount || payment.amount || 0
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {formatCurrency(payment.amountPaid || 0)}
                              </td>
                              <td className="px-4 py-2">
                                {renderStatusTag(payment.status)}
                              </td>
                            </tr>
                          )
                        )}
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

      <ConfirmModal
        isOpen={isPaymentConfirmModalOpen}
        onClose={() => {
          setIsPaymentConfirmModalOpen(false);
          setSelectedPaymentForConfirm(null);
        }}
        onConfirm={handleConfirmMarkPaymentAsPaid}
        isSubm
        itting={isMarkingPaymentAsPaid}
        title="Mark Payment as PAID"
        message={
          selectedPaymentForConfirm
            ? `Are you sure you want to mark payment #${
                selectedPaymentForConfirm.id
              } as PAID? Amount: ${formatCurrency(
                selectedPaymentForConfirm.amountDue || 0
              )}`
            : "Are you sure you want to mark this payment as PAID?"
        }
        confirmText="Mark as PAID"
        cancelText="Cancel"
        type="warning"
      />

      <FormModal
        isOpen={updateInstallmentModal}
        onClose={() => setUpdateInstallmentModal(false)}
        title={"Update installment payment"}
        isDelete={false}
        isSubmitting={submit}
        onSubmit={handleUpdateInstallmentPayment}
      >
        {/* <MotorForm
          form={form}
          isEdit={isEdit}
          setForm={setForm}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
        /> */}
        <InstallmentPaymentForm
          form={installmentPaymentForm}
          setForm={setInstallmentPaymentForm}
        />
      </FormModal>

      <FormModal
        isOpen={fullPaymentModal}
        onClose={() => {
          setFullPaymentModal(false);
          setFullPaymentForm({
            period: 1,
            amount: 0,
            customerContractId: "",
          });
        }}
        title="Create Full Payment"
        isDelete={false}
        isSubmitting={creatingFullPayment}
        onSubmit={handleCreateFullPayment}
        isCreate={true}
      >
        <div className="space-y-3">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Period <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="period"
              value={fullPaymentForm.period}
              onChange={(e) =>
                setFullPaymentForm({
                  ...fullPaymentForm,
                  period: e.target.value ? Number(e.target.value) : 1,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              min={1}
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={fullPaymentForm.amount}
              onChange={(e) =>
                setFullPaymentForm({
                  ...fullPaymentForm,
                  amount: e.target.value ? Number(e.target.value) : 0,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              min={0}
              required
            />
          </div>
        </div>
      </FormModal>
      <FullPeriodModal
        onClose={() => setPeriodModal(false)}
        open={periodModal}
        periods={periodFull}
        onDelete={handleDeletePeriod}
      />

      {/* Document Upload Modal */}
      <BaseModal
        isOpen={documentUploadModal}
        onClose={() => {
          setDocumentUploadModal(false);
          setDocumentType("");
          setDocumentImages([]);
        }}
        title="Upload Document"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">-- Select Document Type --</option>
              <option value="CONTRACT">CONTRACT</option>
              <option value="INVOICE">INVOICE</option>
              <option value="RECEIPT">RECEIPT</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Document Images <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setDocumentImages(files);
              }}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Uploaded Documents */}
          {uploadedDocuments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Uploaded Documents
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedDocuments.map((doc, index) => (
                  <div
                    key={doc.id || index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={doc.imageUrl}
                        alt={doc.documentType || "Document"}
                        className="w-12 h-12 object-cover rounded border"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/48?text=Image";
                        }}
                      />
                      <span className="text-sm text-gray-700">
                        {doc.documentType || "Unknown Type"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.imageUrl)}
                      disabled={deletingDocumentId === doc.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setDocumentUploadModal(false);
                setDocumentType("");
                setDocumentImages([]);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadDocuments}
              disabled={uploadingDocuments || !documentType || documentImages.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingDocuments ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}

export default CustomerContract;
