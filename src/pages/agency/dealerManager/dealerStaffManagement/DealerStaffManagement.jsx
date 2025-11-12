import React, { useEffect, useState } from "react";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import { useAuth } from "../../../../hooks/useAuth";
import dayjs from "dayjs";
import DataTable from "../../../../components/dataTable/DataTable";
import FormModal from "../../../../components/modal/formModal/FormModal";
import ConfirmModal from "../../../../components/modal/confirmModal/ConfirmModal";
import DealerStaffForm from "../dealerStaffForm/DealerStaffForm";
import { Pencil, Trash2, Plus } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";
import GroupModal from "../../../../components/modal/groupModal/GroupModal";

function DealerStaffManagement() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
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
  const [viewModal, setViewModal] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchAllStaff = async () => {
    if (!user?.agencyId) return;
    
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getStaffListByAgencyId(
        user.agencyId,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.agencyId, page, limit]);

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

  const handleDeleteStaff = async () => {
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.deleteStaff(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchAllStaff();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleViewDetail = async (item) => {
    setSelectedStaff(item);
    setViewModal(true);
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "username", title: "User name" },
    { key: "fullname", title: "Full name" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    { key: "address", title: "Address" },
    {
      key: "isActive",
      title: "Status",
      render: (isActive) => renderStatusTag(isActive ? "ACTIVE" : "INACTIVE"),
    },
  ];

  const actions = [
    {
      type: "edit",
      label: "Edit",
      icon: Pencil,
      onClick: (item) => {
        setIsEdit(true);
        setSelectedId(item.id);
        setUpdateForm(item);
        setFormModal(true);
      },
    },
    {
      type: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: (item) => {
        setSelectedId(item.id);
        setDeleteModal(true);
      },
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer rounded-lg px-4 py-2.5 text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <DataTable
        title="Dealer Staff Management"
        columns={columns}
        data={staffList}
        loading={loading}
        page={page}
        setPage={setPage}
        totalItem={totalItem}
        limit={limit}
        onRowClick={handleViewDetail}
        actions={actions}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={iseEdit ? "Update dealer staff" : "Create dealer staff"}
        isSubmitting={submit}
        onSubmit={iseEdit ? handleUpdateStaff : handleCreateDealerStaff}
        isCreate={!iseEdit}
        isUpdate={iseEdit}
      >
        <DealerStaffForm
          form={form}
          setForm={setForm}
          isEdit={iseEdit}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
        />
      </FormModal>

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteStaff}
        isSubmitting={submit}
        title="Confirm Delete"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <GroupModal
        data={selectedStaff}
        isOpen={viewModal}
        loading={viewModalLoading}
        onClose={() => {
          setViewModal(false);
          setSelectedStaff(null);
        }}
        title="Staff Detail"
        generalFields={[
          { key: "id", label: "ID" },
          { key: "username", label: "Username" },
          { key: "fullname", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          {
            key: "isActive",
            label: "Status",
            render: (isActive) => renderStatusTag(isActive ? "ACTIVE" : "INACTIVE"),
          },
        ]}
      />
    </div>
  );
}

export default DealerStaffManagement;
