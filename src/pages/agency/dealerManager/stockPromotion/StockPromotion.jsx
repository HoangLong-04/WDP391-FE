import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import PrivateDealerStaffApi from "../../../../services/PrivateDealerStaffApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import DataTable from "../../../../components/dataTable/DataTable";
import FormModal from "../../../../components/modal/formModal/FormModal";
import BaseModal from "../../../../components/modal/baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";
import StockPromotionForm from "./stockPromotionForm/StockPromotionForm";
import useStockListAgency from "../../../../hooks/useStockListAgency";
import { Pencil, Trash2, Tag, Plus } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";

const inputClasses =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;
function StockPromotion() {
  const { user } = useAuth();
  const userRole = user?.role?.[0] || "";
  const isDealerStaff = userRole === "Dealer Staff";
  const { stockList } = useStockListAgency();
  const [stockPromoList, setStockPromoList] = useState([]);
  const [listStockId, setListStockId] = useState([]);
  const [assignedStocks, setAssignedStocks] = useState([]);
  const [loadingAssignDetail, setLoadingAssignDetail] = useState(false);
  
  // Detail modal state
  const [detailModal, setDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [promotionDetail, setPromotionDetail] = useState(null);

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

  const fetchStockPromoList = useCallback(async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      let response;
      if (isDealerStaff) {
        // Dealer Staff uses different API
        response = await PrivateDealerStaffApi.getStockPromotionListStaff(user.agencyId);
        setStockPromoList(response.data?.data || []);
        setTotalItem(response.data?.data?.length || 0);
      } else {
        response = await PrivateDealerManagerApi.getStockPromotionList(
          user.agencyId,
          { page, limit, valueType, status }
        );
        setStockPromoList(response.data.data);
        setTotalItem(response.data.paginationInfo.total);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.agencyId, page, limit, status, valueType, isDealerStaff]);

  useEffect(() => {
    fetchStockPromoList();
  }, [fetchStockPromoList]);

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

  const handleViewDetail = async (item) => {
    setDetailModal(true);
    setDetailLoading(true);
    setPromotionDetail(null);
    try {
      const response = isDealerStaff
        ? await PrivateDealerStaffApi.getStockPromotionDetail(item.id)
        : await PrivateDealerManagerApi.getStockPromotionDetail(item.id);
      setPromotionDetail(response.data?.data || null);
    } catch (error) {
      toast.error(error.message || "Failed to fetch promotion detail");
      setDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
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
      render: (date) => date ? dayjs(date).format("DD-MM-YYYY") : "-",
    },
    {
      key: "endAt",
      title: "End date",
      render: (date) => date ? dayjs(date).format("DD-MM-YYYY") : "-",
    },
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
  ];

  const actions = isDealerStaff
    ? [] // Dealer Staff chỉ xem, không có actions
    : [
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
        {!isDealerStaff && (
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
        )}
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

      {/* Detail Modal */}
      <BaseModal
        isOpen={detailModal}
        onClose={() => {
          setDetailModal(false);
          setPromotionDetail(null);
        }}
        title="Stock Promotion Detail"
        size="lg"
      >
        {detailLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : promotionDetail ? (
          <div className="space-y-6">
            {/* Promotion Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Promotion Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID</p>
                  <p className="font-medium text-gray-800">{promotionDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-800">{promotionDetail.name || "-"}</p>
                </div>
                {promotionDetail.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="font-medium text-gray-800">{promotionDetail.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Value Type</p>
                  <p className="font-medium text-gray-800">{promotionDetail.valueType || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Value</p>
                  <p className="font-medium text-gray-800">
                    {promotionDetail.valueType === "PERCENT"
                      ? `${Number(promotionDetail.value || 0).toLocaleString("vi-VN")}%`
                      : `${Number(promotionDetail.value || 0).toLocaleString("vi-VN")} đ`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-medium text-gray-800">
                    {promotionDetail.startAt
                      ? dayjs(promotionDetail.startAt).format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-medium text-gray-800">
                    {promotionDetail.endAt
                      ? dayjs(promotionDetail.endAt).format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <div className="mt-1">{renderStatusTag(promotionDetail.status)}</div>
                </div>
              </div>
            </div>

            {/* Assigned Stocks */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                Assigned Stocks ({promotionDetail.agencyStockPromotion?.length || 0})
              </h3>
              {promotionDetail.agencyStockPromotion &&
              promotionDetail.agencyStockPromotion.length > 0 ? (
                <div className="space-y-3">
                  {promotionDetail.agencyStockPromotion.map((item, idx) => {
                    const stock = item?.agencyStock;
                    if (!stock) return null;
                    return (
                      <div
                        key={stock.id || idx}
                        className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Stock ID</p>
                            <p className="font-semibold text-gray-800">#{stock.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-semibold text-gray-800">
                              {stock.quantity || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="font-semibold text-emerald-600">
                              {Number(stock.price || 0).toLocaleString("vi-VN")} đ
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Color</p>
                            <div
                              className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium"
                              style={{
                                backgroundColor: stock.color?.colorType || "#gray",
                              }}
                            >
                              {stock.color?.colorType || "-"}
                            </div>
                          </div>
                          {stock.motorbike && (
                            <>
                              <div>
                                <p className="text-sm text-gray-600">Motorbike Name</p>
                                <p className="font-semibold text-gray-800">
                                  {stock.motorbike.name || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Model</p>
                                <p className="font-semibold text-gray-800">
                                  {stock.motorbike.model || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Version</p>
                                <p className="font-semibold text-gray-800">
                                  {stock.motorbike.version || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Made From</p>
                                <p className="font-semibold text-gray-800">
                                  {stock.motorbike.makeFrom || "-"}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No stocks assigned to this promotion yet.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No promotion detail available
          </div>
        )}
      </BaseModal>
    </div>
  );
}

export default StockPromotion;
