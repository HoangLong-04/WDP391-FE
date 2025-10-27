import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../../services/PrivateAdminApi";
import CircularProgress from "@mui/material/CircularProgress";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import ViewModal from "../../../../components/modal/viewModal/ViewModal";
import FormModal from "../../../../components/modal/formModal/FormModal";
import { toast } from "react-toastify";
import StaffForm from "./staffForm/StaffForm";

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [agency, setAgency] = useState({});
  const [roleList, setRoleList] = useState([]);
  const [agencyList, setAgencyList] = useState([]);
  const [agencyId, setAgencyId] = useState(null);

  const [totalItem, setTotalItem] = useState(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [limit] = useState(10);

  const [loading, setLoading] = useState(false);
  const [formModalLoading, setFormModalLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewModal, setViewModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [assignForm, setAssignForm] = useState(false);
  const [deleteForm, setDeleteForm] = useState(false);

  const [selectedId, setSelectedId] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullname: "",
    email: "",
    phone: "",
    address: "",
    role: [],
  });
  const [staffDetail, setStaffDetail] = useState({
    username: "",
    fullname: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await PrivateAdminApi.getRole();
        setRoleList(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchAgency = async () => {
      try {
        const response = await PrivateAdminApi.getAgency({ page, limit });
        setAgencyList(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAgency();
    fetchAllStaff();
    fetchRole();
  }, [page, limit]);

  const fetchAllStaff = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getAllStaff({
        page,
        limit,
        role,
      });
      setStaff(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.assignStaffToAgency(selectedId, agencyId);
      fetchAllStaff();
      setAssignForm(false);
      toast.success("Assign successfully");
    } catch (error) {
      toast.error(error.message || "Assign fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchStaffById = async (id) => {
    setFormModalLoading(true);
    try {
      const response = await PrivateAdminApi.getStaffById(id);
      const data = response.data.data;
      setSelectedId(id);
      setIsEdit(true);
      setFormModal(true);
      setStaffDetail({
        username: data.username || "",
        fullname: data.fullname || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Get detail fail");
    } finally {
      setFormModalLoading(false);
    }
  };

  const handleDeleteStaff = async (e) => {
    e.preventDefault()
    setIsSubmitting(true);
    try {
      const response = await PrivateAdminApi.deleteStaff(selectedId);
      setIsDelete(false);
      setDeleteForm(false)
      fetchAllStaff();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.updateStaff(selectedId, {
        username: staffDetail.username,
        fullname: staffDetail.fullname,
        email: staffDetail.email,
        phone: staffDetail.phone,
        address: staffDetail.address,
      });
      fetchAllStaff();
      toast.success("Update successfully");
      setIsEdit(false);
      setFormModal(false);
      setStaffDetail({
        username: "",
        fullname: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Update fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAgencyById = async (id) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getAgencyById(id);
      setAgency(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.createStaff(form);
      setForm({
        username: "",
        password: "",
        fullname: "",
        email: "",
        phone: "",
        address: "",
        role: [],
      });
      fetchAllStaff();
      setFormModal(false);

      toast.success("Create successfully");
    } catch (error) {
      console.log(error);
      toast.error("Create fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setForm({ ...form, role: selectedOptions });
  };

  const columns = [
    { key: "id", title: "Id" },
    // { key: "avatar", title: "User name" },
    { key: "username", title: "User name" },
    { key: "fullname", title: "Full name" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    { key: "address", title: "Address" },
    {
      key: "createAt",
      title: "Create date",
      render: (createAt) => dayjs(createAt).format("DD/MM/YYYY"),
    },
    { key: "roleNames", title: "Roles" },
    {
      key: "isActive",
      title: "Status",
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
      key: "isDeleted",
      title: "Available",
      render: (isDeleted) => (
        <div
          className={`px-3 py-1 rounded-full text-white text-sm font-medium text-center ${
            isDeleted ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {isDeleted ? "Not" : "Available"}
        </div>
      ),
    },
    {
      key: "agencyId",
      title: "Agency",
      render: (agencyId) => (
        <>
          {agencyId && (
            <span
              onClick={() => {
                setViewModal(true);
                fetchAgencyById(agencyId);
              }}
              className="cursor-pointer bg-red-500 rounded-lg p-2 flex justify-center items-center text-white"
            >
              Agency
            </span>
          )}
        </>
      ),
    },
    {
      key: "action1",
      title: "Assign",
      render: (_, item) => (
        <>
          {!item.agencyId && (
            <span
              onClick={() => {
                setAssignForm(true);
                setSelectedId(item.id);
              }}
              className="cursor-pointer bg-blue-500 rounded-lg p-2 flex justify-center items-center text-white"
            >
              Assign
            </span>
          )}
        </>
      ),
    },
    {
      key: "action2",
      title: "Update",
      render: (_, item) => (
        <span
          onClick={() => fetchStaffById(item.id)}
          className="cursor-pointer bg-blue-500 rounded-lg p-2 flex justify-center items-center text-white"
        >
          Update
        </span>
      ),
    },
    {
      key: "action3",
      title: "Delete",
      render: (_, item) => (
        <span
          onClick={() => {
            setIsDelete(true);
            setSelectedId(item.id);
            setDeleteForm(true);
            console.log(item.id);
          }}
          className="cursor-pointer bg-red-500 rounded-lg p-2 flex justify-center items-center text-white"
        >
          Delete
        </span>
      ),
    },
  ];

  const agencyFields = [
    { key: "id", label: "Id" },
    { key: "name", label: "Name" },
    { key: "location", label: "Location" },
    { key: "address", label: "Address" },
    { key: "contactInfo", label: "Contact" },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            status ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status ? "Active" : "Not active"}
        </span>
      ),
    },
  ];
  return (
    <div>
      <div className="flex justify-end gap-10 items-center my-3">
        <div>
          <label className="mr-2 font-medium text-gray-600">Role:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>

            {roleList.map((r) => (
              <option key={r.id} value={r.roleName}>
                {r.roleName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsEdit(false);
            }}
            className="cursor-pointer bg-blue-500 rounded-lg text-white p-2 hover:bg-blue-600 transition "
          >
            Create staff
          </button>
        </div>
      </div>

      <PaginationTable
        data={staff}
        loading={loading}
        page={page}
        pageSize={limit}
        title={"Staff Management"}
        setPage={setPage}
        columns={columns}
        totalItem={totalItem}
      />

      <ViewModal
        data={agency}
        fields={agencyFields}
        onClose={() => setViewModal(false)}
        title={"Agency detail"}
        isOpen={viewModal}
        loading={viewModalLoading}
      />

      <FormModal
        isOpen={assignForm}
        onClose={() => setAssignForm(false)}
        title={"Assign staff to agency"}
        onSubmit={handleAssign}
        isSubmitting={isSubmitting}
      >
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Agency <span className="text-red-500">*</span>
          </label>
          <select
            value={agencyId}
            onChange={(e) => setAgencyId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 bg-white cursor-pointer appearance-none"
          >
            <option value="">Select the agency</option>
            {agencyList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} - {a.location}
              </option>
            ))}
          </select>
        </div>
      </FormModal>

      {formModalLoading ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CircularProgress sx={{ color: "white" }} />
        </div>
      ) : (
        <FormModal
          isOpen={formModal}
          onClose={() => setFormModal(false)}
          title={isEdit ? "Update staff" : "Create new staff"}
          onSubmit={isEdit ? updateStaff : handleCreateStaff}
          isSubmitting={isSubmitting}
        >
          <StaffForm
            isEdit={isEdit}
            form={form}
            roleList={roleList}
            handleChangeRole={handleChangeRole}
            setForm={setForm}
            setStaffDetail={setStaffDetail}
            staffDetail={staffDetail}
          />
        </FormModal>
      )}

      <FormModal
        isOpen={deleteForm}
        onClose={() => setDeleteForm(false)}
        onSubmit={handleDeleteStaff}
        isSubmitting={isSubmitting}
        title={"Confirm delete"}
        isDelete={isDelete}
        
      >
        <p className="text-gray-700">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default StaffManagement;
