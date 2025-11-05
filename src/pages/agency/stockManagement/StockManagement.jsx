import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import useColorList from "../../../hooks/useColorList";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import {
  getStockGeneralFields,
  stockGroupedFields,
} from "../../../components/viewModel/stockModel/StockModel";
import FormModal from "../../../components/modal/formModal/FormModal";
import StockForm from "./stockForm/StockForm";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";

function StockManagement() {
  const { user } = useAuth();
  const { colorList } = useColorList();
  const [motorList, setMotorList] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [stock, setStock] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(0);
  const [motorbikeId, setMotorbikeId] = useState("");
  const [colorId, setColorId] = useState("");

  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [viewModal, setViewModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false)

  const [form, setForm] = useState({
    quantity: 0,
    price: 0,
    agencyId: user?.agencyId,
    motorbikeId: "",
    colorId: "",
  });
  const [updateForm, setUpdateForm] = useState({
    quantity: 0,
    price: 0,
  });

  const [selectedId, setSelectedId] = useState('')
  // Delivered orders and items for prefilling
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [loadingDelivered, setLoadingDelivered] = useState(false)
  const [selectedDeliveredOrderId, setSelectedDeliveredOrderId] = useState("")

  const fetchDeliveredOrderItems = useCallback(async () => {
    if (!user?.agencyId) return
    setLoadingDelivered(true)
    try {
      const res = await PrivateDealerManagerApi.getRestockList(user.agencyId, {
        page: 1,
        limit: 50,
        status: 'DELIVERED',
      })
      const orders = res.data?.data || []
      const normalizedOrders = []
      // Prefer using embedded details if available to avoid extra calls
      for (const order of orders) {
        const embeddedItems = order?.orderItems || order?.order_items || []
        if (embeddedItems.length > 0) {
          normalizedOrders.push({
            id: order.id,
            orderAt: order.orderAt,
            items: embeddedItems.map((it) => ({
              orderItemId: it.id,
              quantity: it.quantity,
              motorbikeId: it.motorbikeId || it.electricMotorbikeId,
              colorId: it.colorId,
              motorbikeName: it.electricMotorbike?.name,
              colorName: it.color?.colorType,
            })),
          })
        } else {
          // Fallback: fetch detail if list does not include items
          const orderDetailRes = await PrivateDealerManagerApi.getRestockDetail(order.id)
          const detail = orderDetailRes.data?.data
          const orderItems = detail?.orderItems || []
          normalizedOrders.push({
            id: order.id,
            orderAt: detail?.orderAt || order.orderAt,
            items: orderItems.map((it) => ({
              orderItemId: it.id,
              quantity: it.quantity,
              motorbikeId: it.motorbikeId || it.electricMotorbikeId,
              colorId: it.colorId,
              motorbikeName: it.electricMotorbike?.name,
              colorName: it.color?.colorType,
            })),
          })
        }
      }
      setDeliveredOrders(normalizedOrders)
    } catch (error) {
      toast.error(error.message)
      setDeliveredOrders([])
    } finally {
      setLoadingDelivered(false)
    }
  }, [user?.agencyId])
  const [isEdit, setIsEdit] = useState(false)

  // Track if motorList has been fetched to avoid duplicate fetches
  const motorListFetchedRef = useRef(false);
  // Track if stock is currently being fetched to avoid duplicate fetches
  const isFetchingStockRef = useRef(false);

  const fetchMotorList = useCallback(async () => {
    // Prevent duplicate fetches
    if (motorListFetchedRef.current || motorList.length > 0) return;
    
    motorListFetchedRef.current = true;
    try {
      const response = await PublicApi.getMotorList({ page: 1, limit: 100 });
      // Filter out deleted motorbikes
      const activeMotorbikes = response.data.data.filter(motor => !motor.isDeleted);
      setMotorList(activeMotorbikes);
    } catch (error) {
      console.error("Error fetching motorbike list:", error.message);
      motorListFetchedRef.current = false; // Reset on error to allow retry
    }
  }, [motorList.length]);

  useEffect(() => {
    fetchMotorList();
  }, [fetchMotorList]);

  const fetchAllStock = useCallback(async () => {
    if (!user?.agencyId || isFetchingStockRef.current) return;
    
    isFetchingStockRef.current = true;
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getStockList(
        user.agencyId,
        {
          page,
          limit,
          colorId: colorId || undefined,
          motorbikeId: motorbikeId || undefined,
        }
      );
      setStockList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      isFetchingStockRef.current = false;
    }
  }, [user?.agencyId, page, limit, motorbikeId, colorId]);

  useEffect(() => {
    fetchAllStock();
  }, [fetchAllStock]);

  // Load delivered order items when opening create modal
  const openCreateModal = () => {
    setFormModal(true)
    setIsEdit(false)
    fetchDeliveredOrderItems()
  }

  const fetchStockById = async (id) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getStockById(id);
      setStock(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleCreateStock = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.createStock(form);
      setForm({
        quantity: 0,
        price: 0,
        agencyId: user?.agencyId,
        motorbikeId: "",
        colorId: "",
      });
      toast.success("Create successfully");
      setFormModal(false);
      // Refetch stock list after create
      fetchAllStock();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateStock = async (e) => {
    setSubmit(true)
    e.preventDefault()
    try {
      await PrivateDealerManagerApi.updateStock(selectedId, updateForm)
      toast.success('Update successfully')
      setFormModal(false)
      // Refetch stock list after update
      fetchAllStock()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const handleDeleteStock = async (e) => {
    setSubmit(true)
    e.preventDefault()
    try {
      await PrivateDealerManagerApi.deleteStock(selectedId)
      toast.success('Delete successfully')
      setDeleteModal(false)
      // Refetch stock list after delete
      fetchAllStock()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const column = [
    { key: "id", title: "Id" },
    { key: "quantity", title: "Quantity" },
    {
      key: "price",
      title: "Price",
      render: (price) => {
        return `${price.toLocaleString('vi-VN')} đ`;
      },
    },
    {
      key: "motorbikeId",
      title: "Motorbike",
      render: (motorbikeId) => {
        const motorbike = motorList.find((m) => m.id === motorbikeId);
        return motorbike ? motorbike.name : motorbikeId || "-";
      },
    },
    {
      key: "colorId",
      title: "Color",
      render: (colorId) => {
        const color = colorList.find((c) => c.id === colorId);
        return color ? color.colorType : colorId || "-";
      },
    },
    {
      key: "action",
      title: "Action",
      render: (_, item) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setViewModal(true);
              fetchStockById(item.id);
            }}
            className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="View detail"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => {
              setIsEdit(true)
              setFormModal(true)
              setSelectedId(item.id)
              setUpdateForm(item)
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
      <div className="flex justify-end gap-5 items-center my-3">
        <div>
          <label className="mr-2 font-medium text-gray-600">Motorbike:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={motorbikeId}
            onChange={(e) => {
              setMotorbikeId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {motorList.map((m) => (
              <option value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Color:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={colorId}
            onChange={(e) => {
              setColorId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {colorList.map((m) => (
              <option value={m.id}>{m.colorType}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer rounded-lg px-4 py-2.5 text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <PaginationTable
        columns={column}
        data={stockList}
        loading={loading}
        page={page}
        setPage={setPage}
        pageSize={limit}
        title={"Stock management"}
        totalItem={totalItem}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update stock" : "Create stock"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateStock : handleCreateStock}
        isSubmitting={submit}
        isCreate={!isEdit}
        isUpdate={isEdit}
      >
        <StockForm
          colorList={colorList}
          form={form}
          motorbikeList={motorList}
          setForm={setForm}
          isEdit={isEdit}
          setUpdateForm={setUpdateForm}
          updateForm={updateForm}
          deliveredOrders={deliveredOrders}
          selectedDeliveredOrderId={selectedDeliveredOrderId}
          loadingDelivered={loadingDelivered}
          onChangeDeliveredOrder={(orderId) => setSelectedDeliveredOrderId(orderId)}
          onPickDeliveredOrderItem={async (item) => {
            // Prefill fields from delivered order item
            const motorId = item.motorbikeId
            const colorId = item.colorId
            const quantity = item.quantity
            // Get wholesale price from cached motorbike list; fallback to fetching list
            let price = 0
            let motor = motorList.find((m) => String(m.id) === String(motorId))
            if (!motor) {
              try {
                const res = await PublicApi.getMotorList({ page: 1, limit: 100 })
                const list = res.data?.data || []
                motor = list.find((m) => String(m.id) === String(motorId))
              } catch (error) {
                toast.error(error.message)
              }
            }
            if (motor) {
              price = motor?.wholeSalePrice ?? motor?.wholesalePrice ?? motor?.price ?? 0
            }
            setForm((prev) => ({
              ...prev,
              quantity: quantity || 0,
              price: price || 0,
              motorbikeId: motorId || "",
              colorId: colorId || "",
              agencyId: user?.agencyId,
            }))
          }}
        />
      </FormModal>

      <GroupModal
        data={stock}
        groupedFields={stockGroupedFields}
        isOpen={viewModal}
        loading={viewModalLoading}
        onClose={() => setViewModal(false)}
        title={"Stock info"}
        generalFields={getStockGeneralFields(motorList, colorList)}
      />

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteStock}
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

export default StockManagement;
