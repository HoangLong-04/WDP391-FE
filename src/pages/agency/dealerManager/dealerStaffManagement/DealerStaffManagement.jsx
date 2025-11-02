import React, { useEffect, useState } from "react";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import { useAuth } from "../../../../hooks/useAuth";
import dayjs from "dayjs";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import FormModal from "../../../../components/modal/formModal/FormModal";
import ConfirmModal from "../../../../components/modal/confirmModal/ConfirmModal";
import DealerStaffForm from "../dealerStaffForm/DealerStaffForm";
import { Pencil, Trash2, Plus } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";

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

  const fetchAllStaff = async () => {
    if (!user?.agencyId) return;
    
    setLoading(true);
    try {
      // Fetch trang đầu tiên để lấy tổng số items
      const firstPageResponse = await PrivateDealerManagerApi.getStaffListByAgencyId(
        user.agencyId,
        { page: 1, limit }
      );
      const total = firstPageResponse.data.paginationInfo.total;
      setTotalItem(total);
      
      // Tính tổng số trang
      const totalPages = Math.ceil(total / limit);
      
      // Fetch tất cả các trang (bỏ qua trang 1 vì đã fetch rồi)
      const allPromises = [Promise.resolve(firstPageResponse)];
      for (let i = 2; i <= totalPages; i++) {
        allPromises.push(
          PrivateDealerManagerApi.getStaffListByAgencyId(user.agencyId, {
            page: i,
            limit,
          })
        );
      }
      
      const allResponses = await Promise.all(allPromises);
      const allData = allResponses.flatMap((response) => response.data.data);
      setStaffList(allData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.agencyId, limit]);

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

  const column = [
    { key: "id", title: "Id" },
    // { key: "avatar", title: "User name" },
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
    {
      key: "action",
      title: "Action",
      render: (_, item) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setIsEdit(true);
              setSelectedId(item.id);
              setUpdateForm(item);
              setFormModal(true);
            }}
            className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="Update"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => {
              console.log(item.id);
              setSelectedId(item.id);
              setDeleteModal(true);
            }}
            className="cursor-pointer text-white bg-red-500 p-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
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
              setIsEdit(false);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer rounded-lg px-4 py-2.5 text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <PaginationTable
        columns={column}
        data={staffList.slice((page - 1) * limit, page * limit)}
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
    </div>
  );
}

export default DealerStaffManagement;
