import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import useAgencyList from "../../../hooks/useAgencyList";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import { Check, Eye, Pencil, Plus, Trash, X } from "lucide-react";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import {
  creditGeneralField,
  creditGroupField,
} from "../../../components/viewModel/creditLineModel/CreditLineModel";
import FormModal from "../../../components/modal/formModal/FormModal";
import CreditLineForm from "./creditLineForm/CreditLineForm";

const defaultCreditLine = {
  creditLimit: "",
  warningThreshold: 0,
  overDueThreshHoldDays: 0,
  agencyId: "",
  isBlocked: false,
};

function CreditLineManagement() {
  const { agencyList } = useAgencyList();
  const [creditLineList, setCreditLineList] = useState([]);
  const [creditDetail, setCreditDetail] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [agencyId, setAgencyId] = useState("");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [detailModal, setDetailModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [creditForm, setCreditForm] = useState(defaultCreditLine);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchCreditLine = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getCreditLineList({
        page,
        limit,
        agencyId,
        sort,
      });
      setCreditLineList(response.data.data);
      setTotalItems(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditDetail = async (id) => {
    setDetailLoading(true);
    try {
      const response = await PrivateAdminApi.getCreditLineDetail(id);
      setCreditDetail(response.data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateCreditLine = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const { isBlocked, ...dataToSend } = creditForm;
    try {
      await PrivateAdminApi.createCreditLine(dataToSend);
      fetchCreditLine();
      toast.success("Create success");
      setCreditForm(defaultCreditLine);
      setOpen(false);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateCreditLine = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const { agencyId, ...rest } = creditForm;
    const dataToSend = {
      ...rest,
      isBlocked: Boolean(creditForm.isBlocked),
    };
    try {
      await PrivateAdminApi.updateCreditLine(selectedId, dataToSend);
      fetchCreditLine();
      setOpen(false);
      toast.success("Update success");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteCreditLine = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteCreditLine(selectedId);
      toast.success("Delete success");
      setDeleteModal(false);
      fetchCreditLine();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setSubmit(false);
    }
  };

  useEffect(() => {
    fetchCreditLine();
  }, [page, agencyId, sort]);

  const columns = [
    { key: "id", title: "Id" },
    {
      key: "creditLimit",
      title: "Limit",
      render: (data) => data.toLocaleString() + " đ",
    },
    { key: "warningThreshold", title: "Threshold", render: (data) => data + " %", },
    { key: "overDueThreshHoldDays", title: "Over due days" },
    {
      key: "isBlocked",
      title: "Available",
      render: (data) => (data === true ? <X /> : <Check />),
    },
    { key: "agencyId", title: "agency" },
    {
      key: "action",
      title: <span className="block text-center">Action</span>,
      render: (_, item) => (
        <div className="flex gap-2 justify-center">
          <span
            onClick={() => {
              setDetailModal(true);
              fetchCreditDetail(item.id);
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-gray-500 rounded-lg hover:bg-gray-600 transition"
            title="View detail"
          >
            <Eye className="w-5 h-5 text-white" />
          </span>
          <span
            onClick={() => {
              setOpen(true);
              setIsEdit(true);
              setCreditForm({
                ...item,
                isBlocked: Boolean(item.isBlocked),
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
            <Trash className="w-5 h-5 text-white" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end gap-5 items-center my-3">
        <div>
          <label className="mr-2 font-medium text-gray-600">Sort:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
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
          <button
            onClick={() => {
              setOpen(true);
              setIsEdit(false);
              setCreditForm(defaultCreditLine);
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
        data={creditLineList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Credit line"}
        totalItem={totalItems}
      />

      <GroupModal
        data={creditDetail}
        groupedFields={creditGroupField}
        isOpen={detailModal}
        loading={detailLoading}
        onClose={() => setDetailModal(false)}
        title={"Credit info"}
        generalFields={creditGeneralField}
      />

      <FormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "Update credit" : "Create credit"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateCreditLine : handleCreateCreditLine}
        isSubmitting={submit}
      >
        <CreditLineForm
          agencyList={agencyList}
          form={creditForm}
          setForm={setCreditForm}
          isEdit={isEdit}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteCreditLine}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this credit line? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default CreditLineManagement;
