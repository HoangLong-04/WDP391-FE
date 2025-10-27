import React, { useEffect, useState } from "react";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import { useAuth } from "../../../../hooks/useAuth";
import dayjs from "dayjs";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import FormModal from "../../../../components/modal/formModal/FormModal";
import DealerStaffForm from "../dealerStaffForm/DealerStaffForm";

function DealerStaffManagement() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullname: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    roleId: Number(4),
    agencyId: Number(user?.agencyId),
  });

  const [updateForm, setUpdateForm] = useState({
    username: "",
    fullname: "",
    email: "",
    phone: "",
    address: "",
  });

  const [iseEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchAllStaff = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getStaffListByAgencyId(
        user?.agencyId,
        { page, limit }
      );
      setStaffList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStaff();
  }, [page, limit]);

  const handleCreateDealerStaff = async (e) => {
    setSubmit(true);
    e.preventDefault();
    console.log(form);

    try {
      await PrivateDealerManagerApi.createDealerStaff(form);
      toast.success("Create successfully");
      setFormModal(false);
      fetchAllStaff();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.updateStaff(selectedId, updateForm);
      toast.success("Update successfully");
      setFormModal(false);
      fetchAllStaff();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteStaff = async (e) => {
    e.preventDefault()
    setSubmit(true)
    try {
      await PrivateDealerManagerApi.deleteStaff(selectedId)
      toast.success('Delete successfully')
      setDeleteModal(false)
      fetchAllStaff()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const column = [
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
          {isDeleted ? "Unavailable" : "Available"}
        </div>
      ),
    },
    {
      key: "agencyId",
      title: "Agency",
      render: (agencyId) => <>{agencyId && agencyId}</>,
    },
    {
      key: "action1",
      title: "Update",
      render: (_, item) => (
        <span
          onClick={() => {
            setIsEdit(true);
            setSelectedId(item.id);
            setUpdateForm(item);
            setFormModal(true);
          }}
          className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg"
        >
          Update
        </span>
      ),
    },
    {
      key: "action2",
      title: "Delete",
      render: (_, item) => (
        <span
          onClick={() => {
            console.log(item.id);
            
            setSelectedId(item.id);
            setDeleteModal(true);
          }}
          className="cursor-pointer text-white bg-red-500 p-2 rounded-lg"
        >
          Delete
        </span>
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
              setIsEdit(false);
            }}
            className="bg-blue-500 hover:bg-blue-600 transition cursor-pointer rounded-lg p-2 text-white"
          >
            Create staff
          </button>
        </div>
      </div>
      <PaginationTable
        columns={column}
        data={staffList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Dealer staff management"}
        totalItem={totalItem}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={iseEdit ? "Update dealer staff" : "Create dealer staff"}
        isSubmitting={submit}
        onSubmit={iseEdit ? handleUpdateStaff : handleCreateDealerStaff}
      >
        <DealerStaffForm
          form={form}
          setForm={setForm}
          isEdit={iseEdit}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteStaff}
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

export default DealerStaffManagement;
