import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import { Pencil, Trash2, Plus } from "lucide-react";
import dayjs from "dayjs";
import useMotorList from "../../../hooks/useMotorList";
import { toast } from "react-toastify";
import FormModal from "../../../components/modal/formModal/FormModal";
import DiscountForm from "./discountForm/DiscountForm";
import useAgencyList from "../../../hooks/useAgencyList";
import BaseModal from "../../../components/modal/baseModal/BaseModal";
import { formatCurrency } from "../../../utils/currency";
import CircularProgress from "@mui/material/CircularProgress";

function DiscountManagement() {
  const { motorList } = useMotorList();
  const { agencyList } = useAgencyList();
  const [discount, setDiscount] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [type, setType] = useState("");
  const [valueType, setValueType] = useState("");
  const [motorbikeId, setMotorbikeId] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [totalItem, setTotalItem] = useState(null);

  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [discountDetail, setDiscountDetail] = useState(null);

  const [submit, setSubmit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    valueType: "",
    value: 0,
    min_quantity: 0,
    startAt: "",
    endAt: new Date(),
    status: "ACTIVE",
    agencyId: null,
    motorbikeId: null,
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    type: "",
    valueType: "",
    value: 0,
    min_quantity: 0,
    startAt: "",
    endAt: new Date(),
    status: "ACTIVE",
    agencyId: null,
    motorbikeId: null,
  });

  const [selectedId, setSelectedId] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const fetchDiscount = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getDiscountList({
        page,
        limit,
        type,
        valueType,
        agencyId,
        motorbikeId,
      });
      // Sort by ID descending to show newest first
      const sortedData = [...response.data.data].sort((a, b) => b.id - a.id);
      
      // Enrich với vehicle names từ detail API
      const enrichedData = await Promise.all(
        sortedData.map(async (item) => {
          try {
            if (item.motorbikeId) {
              const detailResponse = await PrivateAdminApi.getDiscountDetail(item.id);
              const detail = detailResponse.data?.data;
              return {
                ...item,
                motorbikeName: detail?.motorbike?.name || "-",
                motorbike: detail?.motorbike,
              };
            }
            return {
              ...item,
              motorbikeName: "-",
            };
          } catch (err) {
            console.error(`Error fetching discount detail for ${item.id}:`, err);
            return {
              ...item,
              motorbikeName: "-",
            };
          }
        })
      );
      
      setDiscount(enrichedData);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscount();
  }, [page, limit, type, valueType, motorbikeId, agencyId]);

  const fetchDiscountDetail = async (discountId) => {
    setDetailModalLoading(true);
    try {
      const response = await PrivateAdminApi.getDiscountDetail(discountId);
      const detail = response.data.data;
      setDiscountDetail(detail);
      // If editing, update the form with correct values
      if (isEdit && selectedId === discountId) {
        setUpdateForm(prev => ({
          ...prev,
          agencyId: (detail.agencyId && detail.agencyId !== 0 && detail.agencyId !== "0") ? detail.agencyId : null,
          motorbikeId: (detail.motorbikeId && detail.motorbikeId !== 0 && detail.motorbikeId !== "0") ? detail.motorbikeId : null,
        }));
      }
    } catch (error) {
      toast.error(error.message || "Failed to load discount detail");
    } finally {
      setDetailModalLoading(false);
    }
  };

  const handleCreateDiscount = async (e) => {
    setSubmit(true);
    e.preventDefault();
    const sendData = {
      ...formData,
      agencyId: formData.agencyId && formData.agencyId !== "" && formData.agencyId !== "0" 
        ? Number(formData.agencyId) 
        : null,
      min_quantity: Number(formData.min_quantity) || 0,
      motorbikeId: formData.motorbikeId && formData.motorbikeId !== "" && formData.motorbikeId !== "0"
        ? Number(formData.motorbikeId)
        : null,
      value: formData.value ? parseFloat(formData.value) : 0,
    };
    try {
      await PrivateAdminApi.createDiscount(sendData);
      setFormData({
        name: "",
        type: "",
        valueType: "",
        value: 0,
        min_quantity: 0,
        startAt: new Date(),
        endAt: new Date(),
        status: "ACTIVE",
        agencyId: null,
        motorbikeId: null,
      });
      fetchDiscount();
      setFormModal(false);
      toast.success("Create successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateDiscount = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const sendData = {
      ...updateForm,
      agencyId: updateForm.agencyId && updateForm.agencyId !== "" && updateForm.agencyId !== "0" && updateForm.agencyId !== 0
        ? Number(updateForm.agencyId)
        : null,
      motorbikeId: updateForm.motorbikeId && updateForm.motorbikeId !== "" && updateForm.motorbikeId !== "0" && updateForm.motorbikeId !== 0
        ? Number(updateForm.motorbikeId)
        : null,
      min_quantity: Number(updateForm.min_quantity) || 0,
      value: updateForm.value ? parseFloat(updateForm.value) : 0,
    };
    try {
      await PrivateAdminApi.updateDiscount(selectedId, sendData);
      fetchDiscount();
      setFormModal(false);
      setIsEdit(false);
      toast.success("Update successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteDiscount = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteDiscount(selectedId);
      fetchDiscount();
      toast.success("Delete successfully");
      setDeleteModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "type", title: "Type" },
    { key: "valueType", title: "Value type" },
    {
      key: "value",
      title: "Value",
      render: (value, item) => {
        if (item.valueType === "PERCENT") {
          return `${value}%`;
        } else if (item.valueType === "FIXED") {
          return formatCurrency(value || 0);
        }
        return value || "-";
      },
    },
    { key: "min_quantity", title: "Min quantity" },
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
      key: "agencyId",
      title: "Agency",
      render: (agencyId) => {
        const agency = agencyList.find((a) => a.id === agencyId);
        return agency ? agency.name : agencyId || "N/A";
      },
    },
    {
      key: "motorbike",
      title: "Motor",
      render: (_, item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
          {item.motorbikeName || "-"}
        </span>
      ),
    },
    {
      key: "action",
      title: <span className="block text-center">Action</span>,
      render: (_, item) => (
        <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
          <span
            onClick={async () => {
              setFormModal(true);
              setIsEdit(true);
              setSelectedId(item.id);
              // Fetch detail to get accurate values from backend
              try {
                const detailResponse = await PrivateAdminApi.getDiscountDetail(item.id);
                const detail = detailResponse.data.data;
                setUpdateForm({
                  name: detail.name || item.name,
                  type: detail.type || item.type,
                  valueType: detail.valueType || item.valueType,
                  value: detail.value || item.value,
                  min_quantity: detail.min_quantity || item.min_quantity,
                  startAt: detail.startAt ? dayjs(detail.startAt).format("YYYY-MM-DD") : dayjs(item.startAt).format("YYYY-MM-DD"),
                  endAt: detail.endAt ? dayjs(detail.endAt).format("YYYY-MM-DD") : dayjs(item.endAt).format("YYYY-MM-DD"),
                  status: detail.status || item.status,
                  motorbikeId: (detail.motorbikeId && detail.motorbikeId !== 0 && detail.motorbikeId !== "0") ? detail.motorbikeId : null,
                  agencyId: (detail.agencyId && detail.agencyId !== 0 && detail.agencyId !== "0") ? detail.agencyId : null,
                });
              } catch (error) {
                // Fallback to item values if detail fetch fails
                console.error("Error fetching discount detail for edit:", error);
                setUpdateForm({
                  name: item.name,
                  type: item.type,
                  valueType: item.valueType,
                  value: item.value,
                  min_quantity: item.min_quantity,
                  startAt: dayjs(item.startAt).format("YYYY-MM-DD"),
                  endAt: dayjs(item.endAt).format("YYYY-MM-DD"),
                  status: item.status,
                  motorbikeId: (item.motorbikeId && item.motorbikeId !== 0 && item.motorbikeId !== "0") ? item.motorbikeId : null,
                  agencyId: (item.agencyId && item.agencyId !== 0 && item.agencyId !== "0") ? item.agencyId : null,
                });
              }
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
            title="Update"
          >
            <Pencil className="w-5 h-5 text-white" />
          </span>
          <span
            onClick={() => {
              setSelectedId(item.id);
              setDeleteModal(true);
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
      <div className="flex justify-end gap-5 items-center my-3">
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
            {motorList.map((m) => (
              <option value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Agency:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={agencyId}
            onChange={(e) => {
              setAgencyId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {agencyList.map((a) => (
              <option value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Type:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="VOLUME">VOLUME</option>
            <option value="SPECIAL">SPECIAL</option>
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
              setIsEdit(false);
            }}
            className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition text-white"
          >
            <Plus className="w-5 h-5" />
            <span>Create</span>
          </button>
        </div>
      </div>

      <PaginationTable
        columns={columns}
        page={page}
        setPage={setPage}
        data={discount}
        pageSize={limit}
        title={"Disscount Management"}
        loading={loading}
        totalItem={totalItem}
        onRowClick={(item) => {
          setDetailModal(true);
          fetchDiscountDetail(item.id);
        }}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update discount" : "Create discount"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateDiscount : handleCreateDiscount}
        isSubmitting={submit}
      >
        <DiscountForm
          agencyList={agencyList}
          formData={formData}
          motorList={motorList}
          setFormData={setFormData}
          isEdit={isEdit}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteDiscount}
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
          setDiscountDetail(null);
        }}
        title="Discount Detail"
        size="lg"
      >
        {detailModalLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : discountDetail ? (
          <div className="space-y-6">
            {/* Discount Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Discount Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID</p>
                  <p className="font-medium text-gray-800">{discountDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-800">{discountDetail.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-medium text-gray-800">{discountDetail.type || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Value Type</p>
                  <p className="font-medium text-gray-800">{discountDetail.valueType || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Value</p>
                  <p className="font-medium text-gray-800">
                    {discountDetail.valueType === "PERCENT" 
                      ? `${discountDetail.value}%` 
                      : formatCurrency(discountDetail.value || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Min Quantity</p>
                  <p className="font-medium text-gray-800">{discountDetail.min_quantity || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-medium text-gray-800">
                    {discountDetail.startAt ? dayjs(discountDetail.startAt).format("DD/MM/YYYY") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-medium text-gray-800">
                    {discountDetail.endAt ? dayjs(discountDetail.endAt).format("DD/MM/YYYY") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                      discountDetail.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {discountDetail.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Agency Information */}
            {discountDetail.agency && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">
                  Agency Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">{discountDetail.agency.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium text-gray-800">{discountDetail.agency.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-medium text-gray-800">{discountDetail.agency.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contact</p>
                    <p className="font-medium text-gray-800">{discountDetail.agency.contactInfo || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-medium text-gray-800">{discountDetail.agency.status || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Motorbike Information */}
            {discountDetail.motorbike && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  Motorbike Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">{discountDetail.motorbike.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="font-medium text-gray-800">
                      {formatCurrency(discountDetail.motorbike.price || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Model</p>
                    <p className="font-medium text-gray-800">{discountDetail.motorbike.model || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Version</p>
                    <p className="font-medium text-gray-800">{discountDetail.motorbike.version || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Make From</p>
                    <p className="font-medium text-gray-800">{discountDetail.motorbike.makeFrom || "-"}</p>
                  </div>
                  {discountDetail.motorbike.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="font-medium text-gray-800">{discountDetail.motorbike.description}</p>
                    </div>
                  )}
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
    </div>
  );
}

export default DiscountManagement;
