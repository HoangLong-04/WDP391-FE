import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../../services/PrivateAdminApi";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import FormModal from "../../../../components/modal/formModal/FormModal";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus } from "lucide-react";

function AgencyManagement() {
  const [agency, setAgency] = useState([]);

  const [page, setPage] = useState(1);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
    contactInfo: "",
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    location: "",
    address: "",
    contactInfo: "",
  });
  const [selectedId, setSelectedId] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchAgency = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getAgency({
        page,
        limit,
        location,
        address,
      });
      
      setAgency(response.data?.data);
      setTotalItem(response.data?.paginationInfo.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgency();
  }, [page, limit, location, address]);

  const handleCreateAgency = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.createAgency(form);
      fetchAgency();
      toast.success("Create successfully");
      setFormModal(false);
      setForm({ name: "", address: "", contactInfo: "", location: "" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAgency = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.updateAgency(selectedId, updateForm);
      toast.success("Update successfully");
      fetchAgency();
      setFormModal(false);
      setIsEdit(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgency = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.deleteAgency(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchAgency();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "location", title: "Location" },
    { key: "address", title: "Address" },
    { key: "contactInfo", title: "Contact info" },
    {
      key: "status",
      title: "Status",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            status ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "action2",
      title: "Update",
      render: (_, item) => (
        <span
          onClick={() => {
            setSelectedId(item.id);
            setIsEdit(true);
            setFormModal(true);
            setUpdateForm({
              name: item.name,
              contactInfo: item.contactInfo,
              location: item.location,
              address: item.address,
            });
          }}
          className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition mx-auto"
        >
          <Pencil className="w-5 h-5 text-white" />
        </span>
      ),
    },
    {
      key: "action1",
      title: "Delete",
      render: (_, item) => (
        <span
          onClick={() => {
            setSelectedId(item.id);
            console.log(item.id);
            
            setDeleteModal(true);
          }}
          className="cursor-pointer flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg hover:bg-red-600 transition mx-auto"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </span>
      ),
    },
    
  ];
  return (
    <div>
      <div className="flex justify-end gap-5 items-center my-3">
        <div>
          <label className="mr-2 font-medium text-gray-600">Location:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="USA">USA</option>
            <option value="China">China</option>
          </select>
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
            className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition text-white"
          >
            <Plus className="w-5 h-5" />
            <span>Create</span>
          </button>
        </div>
      </div>
      <PaginationTable
        data={agency}
        columns={columns}
        pageSize={limit}
        page={page}
        loading={loading}
        title={"Agency management"}
        setPage={setPage}
        totalItem={totalItem}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update agency" : "Create agency"}
        onSubmit={isEdit ? handleUpdateAgency : handleCreateAgency}
        isSubmitting={isSubmitting}
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact info <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="contactInfo"
              placeholder="abc@gmail.com"
              value={isEdit ? updateForm.contactInfo : form.contactInfo}
              onChange={(e) => {
                isEdit
                  ? setUpdateForm({
                      ...updateForm,
                      contactInfo: e.target.value,
                    })
                  : setForm({ ...form, contactInfo: e.target.value });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>
        </div>
      </FormModal>

      <FormModal
        isDelete={true}
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteAgency}
        title={"Confirm delete"}
        isSubmitting={isSubmitting}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default AgencyManagement;
