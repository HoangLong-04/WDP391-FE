import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import DataTable from "../../../../components/dataTable/DataTable";
import FormModal from "../../../../components/modal/formModal/FormModal";
import StockPromotionForm from "./stockPromotionForm/StockPromotionForm";
import useStockListAgency from "../../../../hooks/useStockListAgency";
import { Pencil, Trash2, Tag, Plus } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";

const inputClasses =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;
function StockPromotion() {
  const { user } = useAuth();
  const { stockList } = useStockListAgency();
  const [stockPromoList, setStockPromoList] = useState([]);
  const [listStockId, setListStockId] = useState([]);
  const [assignedStocks, setAssignedStocks] = useState([]);
  const [loadingAssignDetail, setLoadingAssignDetail] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
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
      fetchStockPromoList();
      await fetchPromotionDetail(selectedId);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };
  const fetchPromotionDetail = async (promotionId) => {
    if (!promotionId) return;
    setLoadingAssignDetail(true);
    try {
      const res = await PrivateDealerManagerApi.getStockPromotionDetail(
        promotionId
      );
      const assignedList =
        res.data?.data?.agencyStockPromotion
          ?.map((item) => item?.agencyStock)
          .filter(Boolean) || [];
      setAssignedStocks(assignedList);
    } catch (error) {
      console.error(error);
      setAssignedStocks([]);
      toast.error(error.message || "Failed to load promotion detail");
    } finally {
      setLoadingAssignDetail(false);
    }
  };

  const assignedStockIdSet = useMemo(
    () => new Set(assignedStocks.map((stock) => stock.id)),
    [assignedStocks]
  );

  const availableStocks = useMemo(
    () =>
      (stockList || []).filter((stock) => !assignedStockIdSet.has(stock.id)),
    [stockList, assignedStockIdSet]
  );


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

  const handleViewDetail = (item) => {
    // Can add view detail modal if needed
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "description", title: "Description" },
    { key: "valueType", title: "Value type" },
    { 
      key: "value", 
      title: "Value", 
      render: (value, row) => {
        const formattedValue = Number(value).toLocaleString('vi-VN');
        const valueType = row.valueType || row.value_type;
        return valueType === "PERCENT" ? `${formattedValue}%` : `${formattedValue} đ`;
      }
    },
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
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
    { key: "agencyId", title: "Agency" },
  ];

  const actions = [
    {
      type: "edit",
      label: "Edit",
      icon: Pencil,
      onClick: (item) => {
        setIsEdit(true);
        setFormModal(true);
        setSelectedId(item.id);
        setUpdateForm({
          ...item,
          endAt: dayjs(item.endAt).format("YYYY-MM-DD"),
          startAt: dayjs(item.startAt).format("YYYY-MM-DD"),
        });
      },
    },
    {
      type: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: (item) => {
        setDeleteModal(true);
        setSelectedId(item.id);
      },
    },
    {
      type: "edit",
      label: "Assign to Stock",
      icon: Tag,
      onClick: (item) => {
        setAssignModal(true);
        setSelectedId(item.id);
        setListStockId([]);
        fetchPromotionDetail(item.id);
      },
    },
  ];

  const handleAddStockId = (e) => {
    const value = e.target.value;
    const selectedId = Number(value);

    if (
      selectedId &&
      !listStockId.includes(selectedId) &&
      !assignedStockIdSet.has(selectedId)
    ) {
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer rounded-lg px-4 py-2.5 text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <DataTable
        title="Stock Promotion"
        columns={columns}
        data={stockPromoList}
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
        title={isEdit ? "Update stock promotion" : "Create stock promotion"}
        isDelete={false}
        onSubmit={
          isEdit ? handleUpdateStockPromotion : handleCreateStockPromotion
        }
        isSubmitting={submit}
        isCreate={!isEdit}
        isUpdate={isEdit}
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
          Are you sure you want to delete this stock promotion? This action cannot
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
              {availableStocks.length > 0 ? (
                availableStocks.map((s) => (
                  <option key={s.id} value={s.id}>
                    Stock: {s.id}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  All stocks already assigned
                </option>
              )}
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
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Stocks already applied
              </p>
              {loadingAssignDetail ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : assignedStocks.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto">
                  {assignedStocks.map((stock) => (
                    <li
                      key={stock.id}
                      className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-1"
                    >
                      <span>
                        ID: {stock.id} • Qty: {stock.quantity} • Price:{" "}
                        {Number(stock.price || 0).toLocaleString("vi-VN")} đ
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  This promotion has not been applied to any stock.
                </p>
              )}
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

export default StockPromotion;
