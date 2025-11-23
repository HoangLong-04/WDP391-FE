import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import FormModal from "../../../components/modal/formModal/FormModal";
import { Pencil, Trash2 } from "lucide-react";

function WarehouseManagement() {
  const [warehouse, setWarehouse] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [form, setForm] = useState({ location: "", address: "", name: "" });
  const [updateForm, setUpdateForm] = useState({
    location: "",
    address: "",
    name: "",
    isActive: "",
  });

  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchWarehouse = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getWarehouseList({
        page,
        limit,
        address,
        location,
      });
      setWarehouse(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWarehouse();
  }, [page, limit, address, location]);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.createWarehouse(form);
      fetchWarehouse();
      toast.success("Create successfully");
      setForm({ name: "", address: "", location: "" });
      setFormModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.updateWarehouse(selectedId, updateForm);
      fetchWarehouse();
      toast.success("Update successfully");
      setFormModal(false);
      setIsEdit(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteWarehouse = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteWarehouse(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchWarehouse();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const column = [
    { key: "id", title: "Id" },
    { key: "location", title: "Location" },
    { key: "address", title: "Address" },
    { key: "name", title: "Name" },
    {
      key: "isActive",
      title: "Active",
      render: (isActive) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            isActive ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
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
              setSelectedId(item.id);
              setIsEdit(true);
              setFormModal(true);
              setUpdateForm({
                address: item.address,
                location: item.location,
                name: item.name,
                isActive: item.isActive,
              });
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
      <div className="my-3 flex justify-end items-center gap-5">
        <div>
          <label className="mr-2 font-medium text-gray-600">Location:</label>
          <input
            placeholder="Location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
            type="text"
          />
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Address:</label>
          <input
            placeholder="Address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
            type="text"
          />
        </div>
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsEdit(false);
            }}
            className="p-2 rounded-lg cursor-pointer bg-blue-500 hover:bg-blue-600 transition text-white"
          >
            Create warehouse
          </button>
        </div>
      </div>

      <PaginationTable
        columns={column}
        data={warehouse}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Warehouse management"}
        totalItem={totalItem}
      />
      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        onSubmit={isEdit ? handleUpdateWarehouse : handleCreateWarehouse}
        title={isEdit ? "Update warehouse" : "Create warehouse"}
        isSubmitting={submit}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={isEdit ? updateForm.name : form.name}
              onChange={(e) => {
                isEdit
                  ? setUpdateForm({ ...updateForm, name: e.target.value })
                  : setForm({ ...form, name: e.target.value });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={isEdit ? updateForm.location : form.location}
              onChange={(e) => {
                isEdit
                  ? setUpdateForm({ ...updateForm, location: e.target.value })
                  : setForm({ ...form, location: e.target.value });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={isEdit ? updateForm.address : form.address}
              onChange={(e) => {
                isEdit
                  ? setUpdateForm({ ...updateForm, address: e.target.value })
                  : setForm({ ...form, address: e.target.value });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>
          {isEdit && (
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Active <span className="text-red-500">*</span>
              </label>
              <select
                value={updateForm.isActive}
                onChange={(e) => {
                  const isTrue = e.target.value === "true";
                  setUpdateForm({ ...updateForm, isActive: isTrue });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 bg-white cursor-pointer appearance-none"
              >
                <option value={true}>Active</option>
                <option value={false}>Deactive</option>
              </select>
            </div>
          )}
        </div>
      </FormModal>

      <FormModal
        isDelete={true}
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteWarehouse}
        title={"Confirm delete"}
        isSubmitting={submit}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default WarehouseManagement;
