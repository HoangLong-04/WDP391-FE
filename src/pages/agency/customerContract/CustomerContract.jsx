import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import useDealerStaffList from "../../../hooks/useDealerStaffList";
import useCustomerList from "../../../hooks/useCustomerList";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import PrivateDealerStaffApi from "../../../services/PrivateDealerStaffApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
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
import { Pencil, Trash2, Plus, CreditCard } from "lucide-react";
import { renderStatusTag } from "../../../utils/statusTag";
import BaseModal from "../../../components/modal/baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";

function CustomerContract() {
  const { user } = useAuth();
  const { staffList } = useDealerStaffList();
  const { customerList } = useCustomerList();
  const { colorList } = useColorList();
  const { motorList } = useMotorList();
  const [customerContractList, setCustomerContractList] = useState([]);
  const [motorbike, setMotorbike] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Default to 5 for Dealer Staff, can be changed if needed
  const [staffId, setStaffId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [contractType, setContractType] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  // Auto-set staffId for Dealer Staff
  useEffect(() => {
    const isDealerStaff = user?.roles?.includes("Dealer Staff");
    if (isDealerStaff && user?.id) {
      setStaffId(String(user.id));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [motorModal, setMotorModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [contractDetail, setContractDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [installmentContractModal, setInstallmentContractModal] = useState(false);
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

  const [form, setForm] = useState({
    title: "",
    content: "",
    totalAmount: 0,
    depositAmount: 0,
    createDate: "",
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
    totalAmount: 0,
    depositAmount: 0,
    createDate: "",
    contractPaidType: "",
    contractType: "",
    status: "",
    electricMotorbikeId: "",
    colorId: "",
  });

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

  const fetchCustomerContractList = async () => {
    setLoading(true);
    try {
      const isDealerStaff = user?.roles?.includes("Dealer Staff");
      const api = isDealerStaff ? PrivateDealerStaffApi : PrivateDealerManagerApi;
      const response = await api.getCustomerContractList(
        user?.agencyId,
        { page, limit, staffId, customerId, status, contractType }
      );
      const list = response.data.data || [];
      // Sort by newest first (signDate)
      list.sort((a, b) => {
        const dateA = new Date(a.signDate || 0);
        const dateB = new Date(b.signDate || 0);
        return dateB - dateA;
      });
      setCustomerContractList(list);
      setTotalItem(response.data.paginationInfo?.total || 0);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerContractList();
  }, [page, limit, staffId, customerId, status, contractType]);

  const handleCreateCustomerContract = async (e) => {
    setSubmit(true);
    e.preventDefault();
    const sendData = {
      ...form,
      colorId: Number(form.colorId),
      customerId: Number(form.customerId),
      electricMotorbikeId: Number(form.electricMotorbikeId),
      staffId: Number(form.staffId),
    };
    try {
      await PrivateDealerManagerApi.createCustomerContract(sendData);
      setFormModal(false);
      toast.success("Create successfully");
      fetchCustomerContractList();
      setForm({
        title: "",
        content: "",
        totalAmount: 0,
        depositAmount: 0,
        createDate: "",
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
    setSubmit(true)
    e.preventDefault()
    try {
      await PrivateDealerManagerApi.updateCustomerContract(selectedId, updateForm)
      toast.success('Update successfully')
      setFormModal(false)
      fetchCustomerContractList()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const handleDeleteContract = async (e) => {
    e.preventDefault()
    setSubmit(true)
    try {
      await PrivateDealerManagerApi.deleteCustomerContract(selectedId)
      toast.success('Delete successfully')
      setDeleteModal(false)
      fetchCustomerContractList()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const handleViewDetail = async (contractId) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const isDealerStaff = user?.roles?.includes("Dealer Staff");
      const api = isDealerStaff ? PrivateDealerStaffApi : PrivateDealerManagerApi;
      const res = await api.getCustomerContractDetail(contractId);
      setContractDetail(res.data?.data || null);
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

  const handleOpenInstallmentContractModal = (contract) => {
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
    setSubmit(true);
    try {
      const sendData = {
        ...installmentContractForm,
        startDate: new Date(installmentContractForm.startDate).toISOString(),
        penaltyValue: Number(installmentContractForm.penaltyValue),
        customerContractId: Number(installmentContractForm.customerContractId),
        installmentPlanId: Number(installmentContractForm.installmentPlanId),
      };
      await PrivateDealerManagerApi.createInstallmentContract(sendData);
      toast.success("Create installment contract successfully");
      setInstallmentContractModal(false);
      fetchCustomerContractList();
      setInstallmentContractForm({
        startDate: "",
        penaltyValue: 0,
        penaltyType: "FIXED",
        status: "ACTIVE",
        customerContractId: "",
        installmentPlanId: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to create installment contract");
    } finally {
      setSubmit(false);
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

  const columns = [
    { key: "id", title: "Id" },
    {
      key: "contractCode",
      title: "Contract Code",
      render: (code) => (
        <span className="font-mono text-xs">{code}</span>
      ),
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
      render: (date) => date ? dayjs.utc(date).format("DD/MM/YYYY") : "-",
    },
    {
      key: "deliveryDate",
      title: "Delivery Date",
      render: (date) => date ? dayjs.utc(date).format("DD/MM/YYYY") : "-",
    },
    { key: "contractPaidType", title: "Contract Paid Type" },
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
    {
      key: "action",
      title: "Action",
      render: (_, item) => {
        const isDealerStaff = user?.roles?.includes("Dealer Staff");
        const canCreateInstallment = item.status === "PENDING" && item.contractPaidType;
        return (
          <div className="flex gap-2 items-center">
            {canCreateInstallment && !isDealerStaff && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenInstallmentContractModal(item);
                }}
                className="cursor-pointer text-white bg-green-500 p-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                title="Create Installment Contract"
              >
                <CreditCard size={18} />
              </button>
            )}
            {!isDealerStaff && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsedit(true);
                    setSelectedId(item.id);
                    setFormModal(true);
                    setUpdateForm({
                      ...item,
                      createDate: dayjs(item.createDate).format('YYYY-MM-DD')
                    })
                  }}
                  className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                  title="Update"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(item.id);
                    setDeleteModal(true);
                  }}
                  className="cursor-pointer text-white bg-red-500 p-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="my-3 flex justify-end items-center gap-5">
        {!user?.roles?.includes("Dealer Staff") && (
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
      <PaginationTable
        columns={columns}
        data={customerContractList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        totalItem={totalItem}
        title={"Customer contract"}
        onRowClick={handleRowClick}
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
        onSubmit={isEdit ? handleUpdateCustomerContract : handleCreateCustomerContract}
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
                    {plan.name} - {plan.tensor} ({plan.totalPaidMonth} months, {plan.interestPaidType})
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
              <option value="PERCENTAGE">PERCENTAGE</option>
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
                <div>
                  {renderStatusTag(contractDetail.status)}
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
                  <p className="text-sm text-gray-600 mb-1">Contract Paid Type</p>
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
                      ? dayjs.utc(getNestedValue(contractDetail, "customer.dob")).format("DD/MM/YYYY") 
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Credential ID</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "customer.credentialId") || "-"}
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
                    {getNestedValue(contractDetail, "electricMotorbike.name") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Model</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "electricMotorbike.model") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Version</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "electricMotorbike.version") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Make From</p>
                  <p className="font-medium text-gray-800">
                    {getNestedValue(contractDetail, "electricMotorbike.makeFrom") || "-"}
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
          <div className="text-center py-12 text-gray-500">No data available</div>
        )}
      </BaseModal>
    </div>
  );
}

export default CustomerContract;
