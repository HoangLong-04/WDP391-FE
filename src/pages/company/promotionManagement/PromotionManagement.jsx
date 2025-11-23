
import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import dayjs from "dayjs";
import { Pencil, Trash2, Plus } from "lucide-react";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import useMotorList from "../../../hooks/useMotorList";
import { toast } from "react-toastify";
import FormModal from "../../../components/modal/formModal/FormModal";
import PromotionForm from "./promotionForm/PromotionForm";
import BaseModal from "../../../components/modal/baseModal/BaseModal";
import { formatCurrency } from "../../../utils/currency";
import CircularProgress from "@mui/material/CircularProgress";
function PromotionManagement() {
  const { motorList } = useMotorList();
  const [promotion, setPromotion] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItem, setTotalItem] = useState(null);
  const [valueType, setValueType] = useState("");
  const [motorbikeId, setMotorbikeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [promotionDetail, setPromotionDetail] = useState(null);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    value_type: "",
    value: 0,
    startAt: "",
    endAt: "",
    status: "",
    motorbikeId: "",
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    description: "",
    value_type: "",
    value: 0,
    startAt: "",
    endAt: "",
    status: "",
    motorbikeId: "",
  });
  const [isEdit, setIsedit] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const fetchPromotion = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getPromotionList({
        page,
        limit,
        valueType,
        motorbikeId,
      });
      // Sort by ID descending to show newest first
      const sortedData = [...response.data.data].sort((a, b) => b.id - a.id);
      
      // Enrich với vehicle names từ detail API
      const enrichedData = await Promise.all(
        sortedData.map(async (item) => {
          try {
            if (item.motorbikeId) {
              const detailResponse = await PrivateAdminApi.getPromotionDetail(item.id);
              const detail = detailResponse.data?.data;
              return {
                ...item,
                motorbikeName: detail?.motorbike?.name || "-",
                motorbike: detail?.motorbike,
              };
            }
            return {
              ...item,
              motorbikeName: "All",
            };
          } catch (err) {
            console.error(`Error fetching promotion detail for ${item.id}:`, err);
            return {
              ...item,
              motorbikeName: item.motorbikeId ? "-" : "All",
            };
          }
        })
      );
      
      setPromotion(enrichedData);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPromotion();
  }, [page, limit, valueType, motorbikeId]);

  const fetchPromotionDetail = async (promotionId) => {
    setDetailModalLoading(true);
    try {
      const response = await PrivateAdminApi.getPromotionDetail(promotionId);
      setPromotionDetail(response.data.data);
    } catch (error) {
      toast.error(error.message || "Failed to load promotion detail");
    } finally {
      setDetailModalLoading(false);
    }
  };
  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    
    // Validate required fields
    if (!form.name || !form.value_type || !form.status || !form.startAt || !form.endAt) {
      toast.error("Please fill in all required fields");
      setSubmit(false);
      return;
    }
    
    // Validate enum values
    const validValueTypes = ["PERCENT", "FIXED"];
    if (!validValueTypes.includes(form.value_type)) {
      toast.error("Invalid value type. Must be PERCENT or FIXED");
      setSubmit(false);
      return;
    }
    
    const validStatuses = ["ACTIVE", "INACTIVE"];
    if (!validStatuses.includes(form.status)) {
      toast.error("Invalid status. Must be ACTIVE or INACTIVE");
      setSubmit(false);
      return;
    }
    
    // Validate value
    const valueNum = Number(form.value);
    if (isNaN(valueNum) || valueNum <= 0) {
      toast.error("Value must be a positive number");
      setSubmit(false);
      return;
    }
    
    // Validate PERCENT value must be <= 100
    if (form.value_type === "PERCENT" && valueNum > 100) {
      toast.error("Percentage value must be between 1 and 100");
      setSubmit(false);
      return;
    }
    
    // Validate motorbikeId if provided
    if (form.motorbikeId && form.motorbikeId !== "ALL" && form.motorbikeId !== "") {
      const motorbikeIdNum = Number(form.motorbikeId);
      if (isNaN(motorbikeIdNum) || motorbikeIdNum <= 0) {
        toast.error("Invalid motorbike selection");
        setSubmit(false);
        return;
      }
      // Check if motorbikeId exists in motorList
      const motorExists = motorList?.some(m => m.id === motorbikeIdNum);
      if (!motorExists) {
        toast.error("Selected motorbike does not exist");
        setSubmit(false);
        return;
      }
    }
    
    // Convert date strings to ISO datetime format
    const startAtISO = form.startAt 
      ? dayjs(form.startAt).startOf('day').toISOString() 
      : null;
    const endAtISO = form.endAt 
      ? dayjs(form.endAt).endOf('day').toISOString() 
      : null;
    
    // Validate dates
    if (!startAtISO || !endAtISO) {
      toast.error("Please select valid start and end dates");
      setSubmit(false);
      return;
    }
    
    // Validate end date is after start date
    if (dayjs(endAtISO).isBefore(dayjs(startAtISO))) {
      toast.error("End date must be after start date");
      setSubmit(false);
      return;
    }
    
    // Build sendData object with proper types and field names (backend expects camelCase)
    const sendData = {
      name: form.name.trim(),
      description: form.description?.trim() || "", // Empty string is fine if backend accepts it
      valueType: form.value_type, // Backend expects camelCase: valueType (not value_type)
      value: valueNum, // Number, not string
      startAt: startAtISO, // ISO 8601 datetime string
      endAt: endAtISO, // ISO 8601 datetime string
      status: form.status, // ACTIVE or INACTIVE (enum validation on backend)
      // motorbikeId: null if "ALL" or empty, otherwise valid number
      ...(form.motorbikeId === "ALL" || form.motorbikeId === "" 
        ? { motorbikeId: null } 
        : { motorbikeId: Number(form.motorbikeId) }),
    };
    
    // Log detailed data for debugging
    console.log("=== Promotion Create Request ===");
    console.log("Raw form data:", form);
    console.log("Processed sendData:", sendData);
    console.log("Data types:", {
      name: typeof sendData.name,
      description: typeof sendData.description,
      valueType: typeof sendData.valueType, // Note: backend expects camelCase
      value: typeof sendData.value,
      startAt: typeof sendData.startAt,
      endAt: typeof sendData.endAt,
      status: typeof sendData.status,
      motorbikeId: typeof sendData.motorbikeId,
    });
    
    try {
      const response = await PrivateAdminApi.createPromotion(sendData);
      console.log("=== Promotion Create Success ===");
      console.log("Response:", response);
      console.log("Response data:", response?.data);
      fetchPromotion();
      toast.success("Create successfully");
      setFormModal(false);
      setForm({
        name: "",
        description: "",
        value_type: "",
        value: 0,
        startAt: "",
        endAt: "",
        status: "",
        motorbikeId: "",
      });
    } catch (error) {
      console.error("Error creating promotion:", error);
      toast.error(error.message || "Failed to create promotion");
    } finally {
      setSubmit(false);
    }
  };
  const handleUpdatePromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    
    // Convert date strings to ISO datetime format
    const startAtISO = updateForm.startAt 
      ? dayjs(updateForm.startAt).startOf('day').toISOString() 
      : null;
    const endAtISO = updateForm.endAt 
      ? dayjs(updateForm.endAt).endOf('day').toISOString() 
      : null;
    
    // Build sendData object with proper types and field names (backend expects camelCase)
    const sendData = {
      name: updateForm.name.trim(),
      description: updateForm.description?.trim() || "",
      valueType: updateForm.value_type, // Backend expects camelCase: valueType (not value_type)
      value: Number(updateForm.value),
      startAt: startAtISO,
      endAt: endAtISO,
      status: updateForm.status,
      motorbikeId: updateForm.motorbikeId === "ALL" || updateForm.motorbikeId === "" 
        ? null 
        : Number(updateForm.motorbikeId),
    };
    
    try {
      await PrivateAdminApi.updatePromotion(selectedId, sendData);
      setFormModal(false);
      toast.success("Update successfully");
      setIsedit(false);
      fetchPromotion();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };
  const handleDeletePromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deletePromotion(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchPromotion();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };
  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "description", title: "Description" },
    { key: "valueType", title: "Type value" },
    { key: "value", title: "Value" },
    {
      key: "startAt",
      title: "Start date",
      render: (startAt) => dayjs(startAt).format("DD/MM/YYYY"),
    },
    {
      key: "endAt",
      title: "End date",
      render: (endAt) => dayjs(endAt).format("DD/MM/YYYY"),
    },
    {
      key: "status",
      title: "Status",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      key: "motorbike",
      title: "Motorbike",
      render: (_, item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
          {item.motorbikeName || (item.motorbikeId ? "-" : "All")}
        </span>
      ),
    },
    {
      key: "action",
      title: <span className="block text-center">Action</span>,
      render: (_, item) => (
        <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
          <span
            onClick={() => {
              setIsedit(true);
              setFormModal(true);
              setUpdateForm({
                ...item,
                value_type: item.valueType,
                startAt: dayjs(item.startAt).format("YYYY-MM-DD"),
                endAt: dayjs(item.endAt).format("YYYY-MM-DD"),
                motorbikeId: item.motorbikeId || "ALL",
              });
              setSelectedId(item.id);
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
            title="Update"
          >
            <Pencil className="w-5 h-5 text-white" />
          </span>
          <span
            onClick={() => {
              setDeleteModal(true);
              setSelectedId(item.id);
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg hover:bg-red-600 transition"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </span>
        </div>
      ),
    },
  ];
  return (
    <div>
      <div className="my-3 flex justify-end items-center gap-5">
        <div>
          <label className="mr-2 font-medium text-gray-600">Motorbike:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={motorbikeId}
            onChange={(e) => {
              setMotorbikeId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {motorList?.map((m) => (
              <option
                // onChange={(e) => setMotorbikeId(e.target.value)}
                value={m.id}
              >
                {m.name} - {m.model}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Type value:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={valueType}
            onChange={(e) => {
              setValueType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="PERCENT">PERCENT</option>
            <option value="FIXED">FIXED</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsedit(false);
            }}
            className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition text-white"
          >
            <Plus className="w-5 h-5" />
            <span>Create</span>
          </button>
        </div>
      </div>
      <PaginationTable
        data={promotion}
        title={"Promotion Management"}
        page={page}
        setPage={setPage}
        loading={loading}
        columns={columns}
        pageSize={limit}
        totalItem={totalItem}
        onRowClick={(item) => {
          setDetailModal(true);
          fetchPromotionDetail(item.id);
        }}
      />
      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update promotion" : "Create promotion"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdatePromotion : handleCreatePromotion}
        isSubmitting={submit}
      >
        <PromotionForm
          form={form}
          setForm={setForm}
          motorList={motorList}
          isEdit={isEdit}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
        />
      </FormModal>
      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeletePromotion}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>
      </FormModal>

      <BaseModal
        isOpen={detailModal}
        onClose={() => {
          setDetailModal(false);
          setPromotionDetail(null);
        }}
        title="Promotion Detail"
        size="lg"
      >
        {detailModalLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : promotionDetail ? (
          <div className="space-y-6">
            {/* Promotion Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Promotion Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID</p>
                  <p className="font-medium text-gray-800">{promotionDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-800">{promotionDetail.name || "-"}</p>
                </div>
                {promotionDetail.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="font-medium text-gray-800">{promotionDetail.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Value Type</p>
                  <p className="font-medium text-gray-800">{promotionDetail.valueType || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Value</p>
                  <p className="font-medium text-gray-800">
                    {promotionDetail.valueType === "PERCENT" 
                      ? `${promotionDetail.value}%` 
                      : formatCurrency(promotionDetail.value || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-medium text-gray-800">
                    {promotionDetail.startAt ? dayjs(promotionDetail.startAt).format("DD/MM/YYYY") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-medium text-gray-800">
                    {promotionDetail.endAt ? dayjs(promotionDetail.endAt).format("DD/MM/YYYY") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                      promotionDetail.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {promotionDetail.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Motorbike Information */}
            {promotionDetail.motorbike ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  Motorbike Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">{promotionDetail.motorbike.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="font-medium text-gray-800">
                      {formatCurrency(promotionDetail.motorbike.price || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Model</p>
                    <p className="font-medium text-gray-800">{promotionDetail.motorbike.model || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Version</p>
                    <p className="font-medium text-gray-800">{promotionDetail.motorbike.version || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Make From</p>
                    <p className="font-medium text-gray-800">{promotionDetail.motorbike.makeFrom || "-"}</p>
                  </div>
                  {promotionDetail.motorbike.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="font-medium text-gray-800">{promotionDetail.motorbike.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  Motorbike Information
                </h4>
                <p className="text-gray-600 font-medium">All Motorbikes</p>
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
export default PromotionManagement;
