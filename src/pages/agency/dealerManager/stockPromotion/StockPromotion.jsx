import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import FormModal from "../../../../components/modal/formModal/FormModal";
import StockPromotionForm from "./stockPromotionForm/StockPromotionForm";
import useStockListAgency from "../../../../hooks/useStockListAgency";

const inputClasses =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;
function StockPromotion() {
  const { user } = useAuth();
  const { stockList } = useStockListAgency();
  const [stockPromoList, setStockPromoList] = useState([]);
  const [listStockId, setListStockId] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [valueType, setValueType] = useState("");
  const [status, setStatus] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    valueType: "",
    value: 0,
    startAt: "",
    endAt: "",
    status: "",
    agencyId: user?.agencyId,
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    description: "",
    valueType: "",
    value: 0,
    startAt: "",
    endAt: "",
    status: "",
  });

  const [selectedId, setSelectedId] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const fetchStockPromoList = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getStockPromotionList(
        user?.agencyId,
        { page, limit, valueType, status }
      );
      setStockPromoList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockPromoList();
  }, [page, limit, status, valueType]);

  const handleCreateStockPromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.createStockPromotion(form);
      toast.success("Create successfully");
      setFormModal(false);
      fetchStockPromoList();
      setForm({
        name: "",
        description: "",
        valueType: "",
        value: 0,
        startAt: "",
        endAt: "",
        status: "",
        agencyId: user?.agencyId,
      });
    } catch (error) {
      toast.error(error.message || "Create fail");
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateStockPromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.updateStockPromotion(
        selectedId,
        updateForm
      );
      toast.success("Update successfully");
      setFormModal(false);
      fetchStockPromoList();
    } catch (error) {
      toast.error(error.message || "Update fail");
    } finally {
      setSubmit(false);
    }
  };

  const handleAssignPromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.assignPromotionToStock({
        stockPromotionId: selectedId,
        listStockId,
      });
      setAssignModal(false);
      toast.success("Assign successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteStockPromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.deleteStockPromotion(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchStockPromoList();
    } catch (error) {
      toast.error(error.message || "Delete fail");
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "description", title: "Description" },
    { key: "valueType", title: "Value type" },
    { key: "value", title: "Value", render: (value) => value.toLocaleString() },
    {
      key: "startAt",
      title: "Start date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    {
      key: "endAt",
      title: "End date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    { key: "status", title: "Status" },
    { key: "agencyId", title: "Agency" },
    {
      key: "action1",
      title: "Update",
      render: (_, item) => (
        <span
          onClick={() => {
            setIsEdit(true);
            setFormModal(true);
            setSelectedId(item.id);
            setUpdateForm({
              ...item,
              endAt: dayjs(item.endAt).format("YYYY-MM-DD"),
              startAt: dayjs(item.startAt).format("YYYY-MM-DD"),
            });
          }}
          className="bg-blue-500 cursor-pointer p-2 rounded-lg text-white"
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
            setDeleteModal(true);
            setSelectedId(item.id);
          }}
          className="bg-red-500 cursor-pointer p-2 rounded-lg text-white"
        >
          Delete
        </span>
      ),
    },
    {
      key: "action3",
      title: "Apply promotion for stock",
      render: (_, item) => (
        <span
          onClick={() => {
            setAssignModal(true);
            setSelectedId(item.id);
          }}
          className="bg-gray-500 cursor-pointer p-2 rounded-lg text-white"
        >
          Assign
        </span>
      ),
    },
  ];

  const handleAddStockId = (e) => {
    const value = e.target.value;
    const selectedId = Number(value);

    if (selectedId && !listStockId.includes(selectedId)) {
      setListStockId((prevIds) => [...prevIds, selectedId]);

      e.target.value = "";
    }
  };
  const handleRemoveStockId = (idToRemove) => {
    setListStockId((prevIds) => prevIds.filter((id) => id !== idToRemove));
  };

  return (
    <div>
      <div className="my-3 flex justify-end gap-5 items-center">
        <div>
          <label className="mr-2 font-medium text-gray-600">Paid type:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={valueType}
            onChange={(e) => {
              setValueType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="FIXED">FIXED</option>
            <option value="PERCENT">PERCENT</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Paid type:</label>
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
            className="bg-blue-500 hover:bg-blue-600 transition text-white rounded-lg p-2 cursor-pointer"
          >
            Create stock
          </button>
        </div>
      </div>
      <PaginationTable
        columns={columns}
        data={stockPromoList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Stock promotion"}
        totalItem={totalItem}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update stock promotion" : "Create stock promotion"}
        isDelete={false}
        onSubmit={
          isEdit ? handleUpdateStockPromotion : handleCreateStockPromotion
        }
        isSubmitting={submit}
      >
        <StockPromotionForm
          form={form}
          isEdit={isEdit}
          setForm={setForm}
          setUpdateForm={setUpdateForm}
          updateForm={updateForm}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteStockPromotion}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>
      </FormModal>

      <FormModal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title={"Apply promotion for stock"}
        isDelete={false}
        onSubmit={handleAssignPromotion}
        isSubmitting={submit}
      >
        <div className="space-y-3">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock id <span className="text-red-500">*</span>
            </label>
            <select
              name="listStockId"
              value={listStockId || ""}
              onChange={handleAddStockId}
              className={selectClasses}
              required={listStockId.length === 0}
            >
              <option value="">-- Select stock id --</option>
              {stockList.map((s) => (
                <option value={s.id}>Stock: {s.id}</option>
              ))}
            </select>
            {listStockId.length > 0 && (
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-600 w-full mb-1">
                  Stock selected
                </span>
                {listStockId.map((id) => (
                  <div
                    key={id}
                    className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full border border-blue-300 shadow-sm"
                  >
                    <span>ID: {id}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStockId(id)}
                      className="ml-2 -mr-1 w-4 h-4 text-blue-800 hover:text-blue-900 hover:bg-blue-200 rounded-full flex items-center justify-center transition"
                      aria-label={`Remove Stock ID ${id}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FormModal>
    </div>
  );
}

export default StockPromotion;
