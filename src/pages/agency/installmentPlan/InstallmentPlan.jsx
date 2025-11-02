import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import FormModal from "../../../components/modal/formModal/FormModal";
import InstallmentForm from "./installmentForm/InstallmentForm";
import { Pencil, Trash2 } from "lucide-react";
import { renderStatusTag } from "../../../utils/statusTag";

function InstallmentPlan() {
  const { user } = useAuth();
  const [installmentLít, setInstallmentList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState('');
  const [interestPaidType, setInterestPaidType] = useState('');
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false)

  const [form, setForm] = useState({
    name: "",
    interestRate: 0,
    interestRateTotalMonth: 0,
    totalPaidMonth: 0,
    interestPaidType: "",
    prePaidPercent: 0,
    processFee: 0,
    startAt: "",
    endAt: "",
    status: "",
    agencyId: user?.agencyId,
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    interestRate: 0,
    interestRateTotalMonth: 0,
    totalPaidMonth: 0,
    interestPaidType: "",
    prePaidPercent: 0,
    processFee: 0,
    startAt: "",
    endAt: "",
    status: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchInstallList = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getInstallmentPlan(
        user?.agencyId,
        { page, limit, interestPaidType, status }
      );
      setInstallmentList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallList();
  }, [page, limit, interestPaidType, status]);

  const handleCreateInstallment = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.createInstallmentPlan(form);
      setFormModal(false);
      toast.success("Create successfully");
      fetchInstallList();
    } catch (error) {
      toast.error(error.message || "Create fail");
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateInstallment = async (e) => {
    e.preventDefault()
    setSubmit(true)
    try {
      await PrivateDealerManagerApi.updateInstallmentPlan(selectedId, updateForm)
      setFormModal(false)
      fetchInstallList()
      toast.success('Update successfully')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const handleDeleteInstallment = async (e) => {
    e.preventDefault()
    setSubmit(true)
    try {
      await PrivateDealerManagerApi.deleteInstallmentPlan(selectedId)
      setDeleteModal(false)
      toast.success('Delete successfully')
      fetchInstallList()
    } catch (error) {
      toast.error(error.message || 'Delete fail')
    } finally {
      setSubmit(false)
    }
  }

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "interestRate", title: "Rate" },
    { key: "interestRateTotalMonth", title: "Total month rate" },
    { key: "totalPaidMonth", title: "Total paid month" },
    { key: "interestPaidType", title: "Rate type" },
    { key: "prePaidPercent", title: "Pre-paid percent" },
    {
      key: "processFee",
      title: "Fee",
      render: (fee) => (fee ? fee.toLocaleString("en-US") + " $" : "0"),
    },
    {
      key: "startAt",
      title: "Ngày Bắt Đầu",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      key: "endAt",
      title: "Ngày Kết Thúc",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      key: "status",
      title: "Trạng Thái",
      render: (status) => renderStatusTag(status),
    },
    { key: "agencyId", title: "Agency ID" },
    {
      key: "action",
      title: "Action",
      render: (_, item) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setIsEdit(true);
              setFormModal(true);
              setSelectedId(item.id);
              setUpdateForm({
                ...item,
                endAt: dayjs(item.endAt).format('YYYY-MM-DD'),
                startAt: dayjs(item.startAt).format('YYYY-MM-DD')
              });
            }}
            className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="Update"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => {
              setDeleteModal(true)
              setSelectedId(item.id)
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
      <div className="my-3 flex justify-end items-center gap-5">
        <div>
          <label className="mr-2 font-medium text-gray-600">Paid type:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={interestPaidType}
            onChange={(e) => {
              setInterestPaidType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="FLAT">FLAT</option>
            <option value="DECLINING">DECLINING</option>
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
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsEdit(false);
            }}
            className="text-white bg-blue-500 hover:bg-blue-600 transition p-2 rounded-lg cursor-pointer"
          >
            Create installment plan
          </button>
        </div>
      </div>
      <PaginationTable
        columns={columns}
        data={installmentLít}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Installment plan"}
        totalItem={totalItem}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update installment plan" : "Create installment plan"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateInstallment : handleCreateInstallment}
        isSubmitting={submit}
      >
        <InstallmentForm
          form={form}
          setForm={setForm}
          isEdit={isEdit}
          setUpdateForm={setUpdateForm}
          updateForm={updateForm}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteInstallment}
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

export default InstallmentPlan;
