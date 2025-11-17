import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import useColorList from "../../../hooks/useColorList";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";
import DataTable from "../../../components/dataTable/DataTable";
import dayjs from "dayjs";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import {
  getStockGeneralFields,
  stockGroupedFields,
} from "../../../components/viewModel/stockModel/StockModel";
import FormModal from "../../../components/modal/formModal/FormModal";
import StockForm from "./stockForm/StockForm";
import { Pencil, Trash2, Plus } from "lucide-react";

function StockManagement() {
  const { user } = useAuth();
  const { colorList } = useColorList();
  const [motorList, setMotorList] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [stock, setStock] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
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
  const [selectedOrderItemId, setSelectedOrderItemId] = useState("") // Track selected order item
  // For update form: available order items with same motorbike and color
  const [availableOrderItemsForUpdate, setAvailableOrderItemsForUpdate] = useState([])
  const [selectedOrderItemIdsForUpdate, setSelectedOrderItemIdsForUpdate] = useState([]) // Array of selected order item IDs
  // Track order items that have been used (added to stock) - these should never appear again
  const [usedOrderItemIds, setUsedOrderItemIds] = useState(new Set())

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
      
      // Filter out items that already have stock created OR have been used before
      // Check if stock exists for each item's motorbikeId and colorId
      // Also check if order item has been used before (added to stock)
      // Only show items that don't have stock yet AND haven't been used before
      const filteredOrders = normalizedOrders.map(order => ({
        ...order,
        items: order.items.filter(item => {
          // Check if this order item has been used before (added to stock)
          const hasBeenUsed = usedOrderItemIds.has(String(item.orderItemId))
          if (hasBeenUsed) {
            return false // Hide items that have been used
          }
          // Check if stock already exists for this motorbike and color
          const hasStock = stockList.some(
            (s) => 
              String(s.motorbikeId) === String(item.motorbikeId) && 
              String(s.colorId) === String(item.colorId)
          )
          // Hide items that already have stock (user can still update stock quantity manually if needed)
          return !hasStock
        })
      })).filter(order => order.items.length > 0) // Remove orders with no items
      
      setDeliveredOrders(filteredOrders)
    } catch (error) {
      toast.error(error.message)
      setDeliveredOrders([])
    } finally {
      setLoadingDelivered(false)
    }
  }, [user?.agencyId, stockList, usedOrderItemIds])

  // Fetch available order items for update (same motorbike and color)
  const fetchAvailableOrderItemsForUpdate = useCallback(async (motorbikeId, colorId) => {
    if (!user?.agencyId || !motorbikeId || !colorId) {
      setAvailableOrderItemsForUpdate([])
      return
    }
    
    try {
      const res = await PrivateDealerManagerApi.getRestockList(user.agencyId, {
        page: 1,
        limit: 50,
        status: 'DELIVERED',
      })
      const orders = res.data?.data || []
      const allItems = []
      
      // Collect all items from all orders
      for (const order of orders) {
        const embeddedItems = order?.orderItems || order?.order_items || []
        if (embeddedItems.length > 0) {
          embeddedItems.forEach((it) => {
            const itemMotorbikeId = it.motorbikeId || it.electricMotorbikeId
            const itemColorId = it.colorId
            // Only include items with same motorbike and color
            if (String(itemMotorbikeId) === String(motorbikeId) && String(itemColorId) === String(colorId)) {
              allItems.push({
                orderItemId: it.id,
                orderId: order.id,
                orderAt: order.orderAt,
                quantity: it.quantity,
                motorbikeId: itemMotorbikeId,
                colorId: itemColorId,
                motorbikeName: it.electricMotorbike?.name,
                colorName: it.color?.colorType,
              })
            }
          })
        } else {
          // Fallback: fetch detail if list does not include items
          const orderDetailRes = await PrivateDealerManagerApi.getRestockDetail(order.id)
          const detail = orderDetailRes.data?.data
          const orderItems = detail?.orderItems || []
          orderItems.forEach((it) => {
            const itemMotorbikeId = it.motorbikeId || it.electricMotorbikeId
            const itemColorId = it.colorId
            if (String(itemMotorbikeId) === String(motorbikeId) && String(itemColorId) === String(colorId)) {
              allItems.push({
                orderItemId: it.id,
                orderId: order.id,
                orderAt: detail?.orderAt || order.orderAt,
                quantity: it.quantity,
                motorbikeId: itemMotorbikeId,
                colorId: itemColorId,
                motorbikeName: it.electricMotorbike?.name,
                colorName: it.color?.colorType,
              })
            }
          })
        }
      }
      
      // Filter out items that have been used before
      const filteredItems = allItems.filter(item => {
        return !usedOrderItemIds.has(String(item.orderItemId))
      })
      
      setAvailableOrderItemsForUpdate(filteredItems)
    } catch (error) {
      console.error("Error fetching available order items:", error)
      setAvailableOrderItemsForUpdate([])
    }
  }, [user?.agencyId, usedOrderItemIds])
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
  const openCreateModal = async () => {
    setFormModal(true)
    setIsEdit(false)
    setSelectedDeliveredOrderId("") // Reset selection
    setSelectedOrderItemId("") // Reset order item selection
    setForm({
      quantity: 0,
      price: 0,
      agencyId: user?.agencyId,
      motorbikeId: "",
      colorId: "",
    })
    // Refetch stock list first to get latest stock data, then fetch delivered orders
    await fetchAllStock()
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
    
    // Validate: must select an order item from delivered orders
    if (!selectedOrderItemId) {
      toast.error("Please select an order item from delivered orders");
      return;
    }
    
    // Validate: must have motorbikeId and colorId (should be auto-filled from order item)
    if (!form.motorbikeId || !form.colorId) {
      toast.error("Please select an order item to get motorbike and color information");
      return;
    }
    
    setSubmit(true);
    try {
      // Check if stock already exists for this motorbike and color
      const existingStock = stockList.find(
        (s) => 
          String(s.motorbikeId) === String(form.motorbikeId) && 
          String(s.colorId) === String(form.colorId)
      );

      if (existingStock) {
        // Update existing stock: add new quantity to existing quantity
        const newQuantity = Number(existingStock.quantity || 0) + Number(form.quantity || 0);
        await PrivateDealerManagerApi.updateStock(existingStock.id, {
          quantity: newQuantity,
          price: form.price || existingStock.price, // Use new price if provided, otherwise keep existing
        });
        toast.success('Stock quantity updated successfully');
      } else {
        // Create new stock
        await PrivateDealerManagerApi.createStock(form);
        toast.success("Stock created successfully");
      }

      setForm({
        quantity: 0,
        price: 0,
        agencyId: user?.agencyId,
        motorbikeId: "",
        colorId: "",
      });
      // Mark the selected order item as used (so it won't appear again)
      if (selectedOrderItemId) {
        setUsedOrderItemIds(prev => new Set([...prev, String(selectedOrderItemId)]));
      }
      
      setSelectedDeliveredOrderId(""); // Reset delivered order selection
      setSelectedOrderItemId(""); // Reset order item selection
      
      // Refetch stock list after create/update
      await fetchAllStock();
      // Refetch delivered orders to update the list (hide items that now have stock or have been used)
      fetchDeliveredOrderItems();
      
      setFormModal(false);
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
      // Calculate additional quantity from selected order items
      let additionalQuantity = 0
      if (selectedOrderItemIdsForUpdate.length > 0) {
        additionalQuantity = availableOrderItemsForUpdate
          .filter(item => selectedOrderItemIdsForUpdate.includes(String(item.orderItemId)))
          .reduce((sum, item) => sum + Number(item.quantity || 0), 0)
      }
      
      // Update stock with new quantity (existing + additional from order items)
      const newQuantity = Number(updateForm.quantity || 0) + additionalQuantity
      
      // If quantity becomes 0, delete the stock instead of updating
      if (newQuantity <= 0) {
        await PrivateDealerManagerApi.deleteStock(selectedId)
        toast.success('Stock deleted successfully (quantity = 0). You can create a new stock now.')
        
        setFormModal(false)
        setSelectedOrderItemIdsForUpdate([])
        setAvailableOrderItemsForUpdate([])
        setIsEdit(false)
        setSelectedId("")
        
        // Reset form to allow creating new stock
        setForm({
          quantity: 0,
          price: 0,
          agencyId: user?.agencyId,
          motorbikeId: "",
          colorId: "",
        })
        
        // Refetch stock list after delete
        await fetchAllStock()
        // Refetch delivered orders to update the list
        fetchDeliveredOrderItems()
        return
      }
      
      // Normal update if quantity > 0
      await PrivateDealerManagerApi.updateStock(selectedId, {
        ...updateForm,
        quantity: newQuantity,
      })
      
      // Mark the selected order items as used (so they won't appear again)
      if (selectedOrderItemIdsForUpdate.length > 0) {
        setUsedOrderItemIds(prev => {
          const newSet = new Set(prev);
          selectedOrderItemIdsForUpdate.forEach(id => newSet.add(String(id)));
          return newSet;
        });
      }
      
      toast.success('Stock quantity updated successfully')
      
      setFormModal(false)
      setSelectedOrderItemIdsForUpdate([])
      setAvailableOrderItemsForUpdate([])
      // Refetch stock list after update
      await fetchAllStock()
      // Refetch delivered orders to update the list (hide items that have been used)
      fetchDeliveredOrderItems()
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

  const handleViewDetail = async (item) => {
    setViewModal(true);
    fetchStockById(item.id);
  };

  const columns = [
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
  ];

  const actions = [
    {
      type: "edit",
      label: "Edit",
      icon: Pencil,
      onClick: async (item) => {
        setIsEdit(true);
        setFormModal(true);
        setSelectedId(item.id);
        setUpdateForm(item);
        setSelectedOrderItemIdsForUpdate([]);
        await fetchAvailableOrderItemsForUpdate(item.motorbikeId, item.colorId);
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
      <DataTable
        title="Stock Management"
        columns={columns}
        data={stockList}
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
          onChangeDeliveredOrder={(orderId) => {
            setSelectedDeliveredOrderId(orderId)
            setSelectedOrderItemId("") // Reset order item when changing order
            setForm((prev) => ({
              ...prev,
              quantity: 0,
              motorbikeId: "",
              colorId: "",
            }))
          }}
          selectedOrderItemId={selectedOrderItemId}
          onChangeOrderItem={(itemId) => setSelectedOrderItemId(itemId)}
          onPickDeliveredOrderItem={async (item) => {
            // Prefill fields from delivered order item
            const motorId = item.motorbikeId
            const colorId = item.colorId
            const quantity = Number(item.quantity || 0)
            
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
            
            // Check if stock already exists
            const existingStock = stockList.find(
              (s) => 
                String(s.motorbikeId) === String(motorId) && 
                String(s.colorId) === String(colorId)
            );
            
            setForm((prev) => ({
              ...prev,
              quantity: quantity, // Set quantity from order item (readonly)
              price: price || 0,
              motorbikeId: motorId || "",
              colorId: colorId || "",
              agencyId: user?.agencyId,
            }))
            
            // Show info if stock already exists
            if (existingStock) {
              toast.info(`Stock already exists. Current quantity: ${existingStock.quantity}. Quantity from order (${quantity}) will be added.`);
            }
          }}
          // For update form
          availableOrderItemsForUpdate={availableOrderItemsForUpdate}
          selectedOrderItemIdsForUpdate={selectedOrderItemIdsForUpdate}
          onChangeOrderItemsForUpdate={(itemIds) => setSelectedOrderItemIdsForUpdate(itemIds)}
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
