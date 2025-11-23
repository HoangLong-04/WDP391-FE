import { formatCurrency } from "../../../utils/currency";
import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { Pencil, Trash2, Plus } from "lucide-react";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import { toast } from "react-toastify";
import FormModal from "../../../components/modal/formModal/FormModal";
import BaseModal from "../../../components/modal/baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";
import useMotorList from "../../../hooks/useMotorList";
import useAgencyList from "../../../hooks/useAgencyList";
import PricePolicyForm from "./pricePolicyForm/PricePolicyForm";

function PricePolicyManagement() {
  const { motorList } = useMotorList();
  const { agencyList } = useAgencyList();
  const [priceList, setPriceList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItem, setTotalItem] = useState(null);

  const [formModal, setFormModal] = useState(false);
  const [deleleModal, setDeleteModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [pricePolicyDetail, setPricePolicyDetail] = useState(null);

  const [submit, setSubmit] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    policy: "",
    wholesalePrice: 0,
    agencyId: null,
    motorbikeId: null,
  });
  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    policy: "",
    wholesalePrice: 0,
    agencyId: null,
    motorbikeId: null,
  });

  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isEdit, setIsedit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchPriceList = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getPricePolicy({ page, limit });
      setPriceList(response.data.data);
      // API response có pagination hoặc paginationInfo
      setTotalItem(response.data.pagination?.total || response.data.paginationInfo?.total || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricePolicyDetail = async (pricePolicyId) => {
    setDetailModalLoading(true);
    try {
      const response = await PrivateAdminApi.getPricePolicyDetail(pricePolicyId);
      setPricePolicyDetail(response.data.data);
    } catch (error) {
      toast.error(error.message || "Failed to load price policy detail");
    } finally {
      setDetailModalLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceList();
  }, [page, limit]);


  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const sendData = {
      ...form,
      wholesalePrice: Number(form.wholesalePrice),
    };
    try {
      await PrivateAdminApi.createPricePolicy(sendData);
      toast.success("Create successfully");
      setFormModal(false);
      fetchPriceList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const sendData = {
      policy: updateForm.policy,
      wholesalePrice: Number(updateForm.wholesalePrice),
    };
    try {
      await PrivateAdminApi.updatePricePolicy(selectedId, sendData);
      toast.success("Create successfully");
      fetchPriceList();
      setFormModal(false);
      setIsedit(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeletePolicy = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deletePricePolicy(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchPriceList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };


  const columns = [
    { key: "id", title: "Id" },
    { key: "title", title: "Title" },
    { key: "content", title: "Content" },
    { key: "policy", title: "Policy" },
    {
      key: "wholesalePrice",
      title: "Price",
      render: (wholesalePrice) => {
        return formatCurrency(wholesalePrice);
      },
    },
    {
      key: "agency",
      title: "Agency",
      render: (_, item) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md">
          {item.agency?.name || "-"}
        </span>
      ),
    },
    {
      key: "motorbike",
      title: "Motorbike",
      render: (_, item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
          {item.motorbike?.name || "-"}
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
              setUpdateForm(item);
              setSelectedId(item.id);
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
      <div className="my-3 flex justify-end">
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
        data={priceList}
        page={page}
        setPage={setPage}
        loading={loading}
        columns={columns}
        title={"Price Policy"}
        pageSize={limit}
        totalItem={totalItem}
        onRowClick={(item) => {
          setDetailModal(true);
          fetchPricePolicyDetail(item.id);
        }}
      />

      <BaseModal
        isOpen={detailModal}
        onClose={() => {
          setDetailModal(false);
          setPricePolicyDetail(null);
        }}
        title="Price Policy Detail"
        size="lg"
      >
        {detailModalLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : pricePolicyDetail ? (
          <div className="space-y-6">
            {/* Price Policy Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Policy Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID</p>
                  <p className="font-medium text-gray-800">{pricePolicyDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Title</p>
                  <p className="font-medium text-gray-800">{pricePolicyDetail.title || "-"}</p>
                </div>
                {pricePolicyDetail.content && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Content</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.content}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Policy</p>
                  <p className="font-medium text-gray-800">{pricePolicyDetail.policy || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Wholesale Price</p>
                  <p className="font-medium text-gray-800">
                    {formatCurrency(pricePolicyDetail.wholesalePrice || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Agency Information */}
            {pricePolicyDetail.agency && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">
                  Agency Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.agency.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.agency.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.agency.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contact</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.agency.contactInfo || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.agency.status || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Motorbike Information */}
            {pricePolicyDetail.motorbike && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  Motorbike Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.motorbike.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="font-medium text-gray-800">
                      {pricePolicyDetail.motorbike.price ? pricePolicyDetail.motorbike.price.toLocaleString('vi-VN') + ' đ' : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Model</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.motorbike.model || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Version</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.motorbike.version || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Make From</p>
                    <p className="font-medium text-gray-800">{pricePolicyDetail.motorbike.makeFrom || "-"}</p>
                  </div>
                  {pricePolicyDetail.motorbike.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="font-medium text-gray-800">{pricePolicyDetail.motorbike.description}</p>
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

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update inventory" : "Create inventory"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdatePolicy : handleCreatePolicy}
        isSubmitting={submit}
      >
        <PricePolicyForm
          form={form}
          updateForm={updateForm}
          motorList={motorList}
          agencyList={agencyList}
          setForm={setForm}
          setUpdateForm={setUpdateForm}
          isEdit={isEdit}
        />
      </FormModal>

      <FormModal
        isOpen={deleleModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeletePolicy}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default PricePolicyManagement;
