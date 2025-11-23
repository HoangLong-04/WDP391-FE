import React, { useEffect, useState, useRef } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import FormModal from "../../../components/modal/formModal/FormModal";
import InventoryForm from "./inventoryForm/InventoryForm";
import BaseModal from "../../../components/modal/baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";
import { Pencil, Trash2 } from "lucide-react";
import useColorList from "../../../hooks/useColorList";

function InventoryManagement() {
  const [inventoryList, setInventoryList] = useState([]);
  const [motorList, setMototList] = useState([]);
  const [allMotorList, setAllMotorList] = useState([]); // All motorbikes for form
  const [warehouseList, setWarehouseList] = useState([]);
  const [inventoryDetails, setInventoryDetails] = useState({}); // Map to store detail data: key = "motorId-warehouseId-colorId"
  const [inventoryDetail, setInventoryDetail] = useState(null);
  const { colorList } = useColorList();

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItem, setTotalItem] = useState(null);

  const [loading, setLoading] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [detailModal, setDetailModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleteForm, setDeleteForm] = useState(false);

  const [form, setForm] = useState({
    quantity: 0,
    stockDate: dayjs().format("YYYY-MM-DD"),
    motorId: "",
    warehouseId: "",
    colorId: "",
  });

  const [updateForm, setUpdateForm] = useState({
    quantity: 0,
    stockDate: "",
    motorId: "",
    warehouseId: "",
    colorId: "",
  });

  const [isEdit, setIsedit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const isFetchingAllMotorsRef = useRef(false);

  // const [selectedId, setSelectedId] = useState(null)

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getInventory({ page, limit });
      const inventoryData = response.data.data;
      setInventoryList(inventoryData);
      setTotalItem(response.data.paginationInfo.total);

      // Fetch details for all items in parallel
      const detailPromises = inventoryData.map((item) =>
        PrivateAdminApi.getInventoryDetail(
          item.electricMotorbikeId,
          item.warehouseId,
          item.colorId
        ).catch((error) => {
          console.error(`Failed to fetch detail for inventory item:`, error);
          return null;
        })
      );

      const detailResponses = await Promise.all(detailPromises);
      const detailsMap = {};
      detailResponses.forEach((response, index) => {
        if (response && response.data && response.data.data) {
          const item = inventoryData[index];
          const key = `${item.electricMotorbikeId}-${item.warehouseId}-${item.colorId}`;
          detailsMap[key] = response.data.data;
        }
      });
      setInventoryDetails(detailsMap);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch all motorbikes for form using GET /motorbike API
  const fetchAllMotorbikes = async () => {
    // Prevent duplicate fetches
    if (isFetchingAllMotorsRef.current || allMotorList.length > 0) return;

    isFetchingAllMotorsRef.current = true;
    try {
      let allMotors = [];
      let currentPage = 1;
      const pageSize = 100;
      let hasMore = true;
      let totalItems = 0;

      // Fetch all pages using GET /motorbike API
      while (hasMore) {
        const response = await PrivateAdminApi.getAllMotorbikes({
          page: currentPage,
          limit: pageSize,
        });
        const motors = response.data?.data || [];

        // If no motors returned, stop fetching
        if (motors.length === 0) {
          hasMore = false;
          break;
        }

        // Filter out deleted motorbikes
        const activeMotors = motors.filter((motor) => !motor.isDeleted);
        allMotors = [...allMotors, ...activeMotors];

        // Get total items from first response
        if (currentPage === 1) {
          totalItems = response.data?.paginationInfo?.total || 0;
        }

        // Check if we've fetched all items
        hasMore = allMotors.length < totalItems && motors.length === pageSize;
        currentPage++;

        // Safety check: prevent infinite loop
        if (currentPage > 100) {
          console.warn("Reached maximum page limit for fetching motorbikes");
          break;
        }
      }

      setAllMotorList(allMotors);
    } catch (error) {
      toast.error(error.message);
      isFetchingAllMotorsRef.current = false; // Reset on error to allow retry
    } finally {
      isFetchingAllMotorsRef.current = false;
    }
  };

  useEffect(() => {
    const fetchMotorList = async () => {
      try {
        const response = await PrivateAdminApi.getMotorList({
          page: 1,
          limit: 30,
        });
        setMototList(response.data.data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    const fetchWarehouseList = async () => {
      try {
        const response = await PrivateAdminApi.getWarehouseList({
          page: 1,
          limit: 30,
        });
        setWarehouseList(response.data.data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchInventory();
    fetchMotorList();
    fetchWarehouseList();
  }, [page, limit]);

  // Fetch all motorbikes only once when component mounts
  useEffect(() => {
    fetchAllMotorbikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allMotorList && allMotorList.length > 0) {
      const currentMotorId = form.motorId;
      if (!currentMotorId || currentMotorId === "") {
        const defaultMotorId = allMotorList[0].id;
        setForm((prevForm) => ({
          ...prevForm,
          motorId: defaultMotorId,
        }));
      }
    }
  }, [allMotorList, form.motorId]);

  useEffect(() => {
    if (warehouseList && warehouseList.length > 0) {
      const currentWarehouseId = form.warehouseId;
      if (!currentWarehouseId || currentWarehouseId === "") {
        const defaultWarehouseId = warehouseList[0].id;
        setForm((prevForm) => ({
          ...prevForm,
          warehouseId: defaultWarehouseId,
        }));
      }
    }
  }, [warehouseList, setForm, form.warehouseId]);

  const fetchInventoryDetail = async (motorId, warehouseId, colorId) => {
    setDetailModalLoading(true);
    try {
      const response = await PrivateAdminApi.getInventoryDetail(
        motorId,
        warehouseId,
        colorId
      );
      setInventoryDetail(response.data.data);
    } catch (error) {
      toast.error(error.message || "Failed to load inventory detail");
    } finally {
      setDetailModalLoading(false);
    }
  };

  const handleCreateInventory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert stockDate to ISO string format
    const stockDateISO = form.stockDate
      ? new Date(form.stockDate).toISOString()
      : new Date().toISOString();

    const sendData = {
      quantity: Number(form.quantity),
      stockDate: stockDateISO,
    };

    try {
      await PrivateAdminApi.createInventory(
        form.motorId,
        form.warehouseId,
        form.colorId,
        sendData
      );
      setForm({
        quantity: 0,
        stockDate: dayjs().format("YYYY-MM-DD"),
        motorId: allMotorList.length > 0 ? allMotorList[0].id : "",
        warehouseId: warehouseList.length > 0 ? warehouseList[0].id : "",
      });
      fetchInventory();
      setFormModal(false);
      toast.success("Create successfully");
    } catch (error) {
      toast.error(error.message || "Create fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert stockDate to ISO string format
    const stockDateISO = updateForm.stockDate
      ? typeof updateForm.stockDate === "string"
        ? new Date(updateForm.stockDate).toISOString()
        : new Date(updateForm.stockDate).toISOString()
      : new Date().toISOString();

    const sendData = {
      quantity: Number(updateForm.quantity),
      stockDate: stockDateISO,
    };

    try {
      await PrivateAdminApi.updateInventory(
        updateForm.motorId,
        updateForm.warehouseId,
        updateForm.colorId,
        sendData
      );
      fetchInventory();
      setFormModal(false);
      toast.success("Update successfully");
      setIsedit(false);
    } catch (error) {
      toast.error(error.message || "Update fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInventory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.deleteInventory(
        updateForm.motorId,
        updateForm.warehouseId,
        updateForm.colorId
      );
      fetchInventory();
      setDeleteForm(false);
      toast.success("Delete successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: "quantity", title: "Quantity" },
    {
      key: "stockDate",
      title: "Stock date",
      render: (stockDate) => dayjs(stockDate).format("DD/MM/YYYY"),
    },
    {
      key: "electricMotorbikeId",
      title: "Motorbike",
      render: (electricMotorbikeId, item) => {
        const key = `${item.electricMotorbikeId}-${item.warehouseId}-${item.colorId}`;
        const detail = inventoryDetails[key];
        const motorbikeName = detail?.motorbike?.name || "Loading...";
        return (
          <span className="text-gray-800">
            {motorbikeName}
          </span>
        );
      },
    },
    {
      key: "warehouseId",
      title: "Warehouse",
      render: (warehouseId, item) => {
        const key = `${item.electricMotorbikeId}-${item.warehouseId}-${item.colorId}`;
        const detail = inventoryDetails[key];
        const warehouseName = detail?.warehouse?.name || "Loading...";
        return (
          <span className="text-gray-800">
            {warehouseName}
          </span>
        );
      },
    },
    {
      key: "colorId",
      title: "Color",
      render: (colorId, item) => {
        const key = `${item.electricMotorbikeId}-${item.warehouseId}-${item.colorId}`;
        const detail = inventoryDetails[key];
        const colorName = detail?.color || "Loading...";

        return (
          <div
            className="px-3 py-1 rounded-md text-white font-semibold flex justify-center items-center"
            style={{ backgroundColor: colorName }}
          >
            {colorName}
          </div>
        );
      },
    },
    {
      key: "action",
      title: <span className="block text-center">Action</span>,
      render: (_, item) => (
        <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
          <span
            onClick={() => {
              setUpdateForm({
                colorId: item.colorId,
                motorId: item.electricMotorbikeId,
                warehouseId: item.warehouseId,
                quantity: item.quantity,
                stockDate: dayjs(item.stockDate).format("DD/MM/YYYY"),
              });
              setIsedit(true);
              setFormModal(true);
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
            title="Update"
          >
            <Pencil className="w-5 h-5 text-white" />
          </span>
          <span
            onClick={() => {
              setUpdateForm({
                motorId: item.electricMotorbikeId,
                warehouseId: item.warehouseId,
                colorId: item.colorId,
              });
              setIsDelete(true);
              setDeleteForm(true);
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg hover:bg-red-600 transition"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="my-3 flex justify-end">
        <button
          onClick={() => {
            setIsedit(false);
            setFormModal(true);
          }}
          className="cursor-pointer bg-blue-500 rounded-lg text-white p-2 hover:bg-blue-600 transition "
        >
          Create inventory
        </button>
      </div>
      <PaginationTable
        data={inventoryList}
        loading={loading}
        page={page}
        pageSize={limit}
        title={"Inventory Management"}
        columns={columns}
        setPage={setPage}
        totalItem={totalItem}
        onRowClick={(item) => {
          setDetailModal(true);
          fetchInventoryDetail(
            item.electricMotorbikeId,
            item.warehouseId,
            item.colorId
          );
        }}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update inventory" : "Create inventory"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateInventory : handleCreateInventory}
        isSubmitting={isSubmitting}
      >
        <InventoryForm
          form={form}
          updateForm={updateForm}
          motorList={allMotorList}
          warehouseList={warehouseList}
          setForm={setForm}
          setUpdateForm={setUpdateForm}
          isEdit={isEdit}
        />
      </FormModal>

      <BaseModal
        isOpen={detailModal}
        onClose={() => {
          setDetailModal(false);
          setInventoryDetail(null);
        }}
        title="Inventory Detail"
        size="lg"
      >
        {detailModalLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : inventoryDetail ? (
          <div className="space-y-6">
            {/* Inventory Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="font-medium text-gray-800">{inventoryDetail.quantity || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Color</p>
                  <div
                    className="px-3 py-1 rounded-md text-white font-semibold inline-block"
                    style={{ backgroundColor: inventoryDetail.color }}
                  >
                    {inventoryDetail.color || "-"}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Date</p>
                  <p className="font-medium text-gray-800">
                    {inventoryDetail.stockDate ? dayjs(inventoryDetail.stockDate).format("DD/MM/YYYY") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Update</p>
                  <p className="font-medium text-gray-800">
                    {inventoryDetail.lastUpdate ? dayjs(inventoryDetail.lastUpdate).format("DD/MM/YYYY") : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Warehouse Information */}
            {inventoryDetail.warehouse && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">
                  Warehouse Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">{inventoryDetail.warehouse.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium text-gray-800">{inventoryDetail.warehouse.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-medium text-gray-800">{inventoryDetail.warehouse.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                        inventoryDetail.warehouse.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {inventoryDetail.warehouse.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Motorbike Information */}
            {inventoryDetail.motorbike && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  Motorbike Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">{inventoryDetail.motorbike.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="font-medium text-gray-800">
                      {inventoryDetail.motorbike.price ? inventoryDetail.motorbike.price.toLocaleString('vi-VN') + ' đ' : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Model</p>
                    <p className="font-medium text-gray-800">{inventoryDetail.motorbike.model || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Version</p>
                    <p className="font-medium text-gray-800">{inventoryDetail.motorbike.version || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Make From</p>
                    <p className="font-medium text-gray-800">{inventoryDetail.motorbike.makeFrom || "-"}</p>
                  </div>
                  {inventoryDetail.motorbike.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="font-medium text-gray-800">{inventoryDetail.motorbike.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data available
          </div>
        )}
      </BaseModal>

      <FormModal
        isOpen={deleteForm}
        onClose={() => setDeleteForm(false)}
        onSubmit={handleDeleteInventory}
        isSubmitting={isSubmitting}
        title={"Confirm delete"}
        isDelete={isDelete}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this inventory? This action cannot be
          undone.
        </p>
      </FormModal>
    </div>
  );
}

export default InventoryManagement;
