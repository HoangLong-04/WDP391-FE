import React, { useEffect, useState, useRef } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import ViewModal from "../../../components/modal/viewModal/ViewModal";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import FormModal from "../../../components/modal/formModal/FormModal";
import InventoryForm from "./inventoryForm/InventoryForm";
import {
  motorGeneralFields,
  motorGroupedFields,
} from "../../../components/viewModel/motorbikeModel/MotorbikeModel";
import {
  inventoryGeneralFields,
  inventoryGroupFields,
} from "../../../components/viewModel/inventoryModel/InventoryModel";
import { warehouseFields } from "../../../components/viewModel/warehouseModel/WarehouseModel";
import { Eye, Pencil, Trash2 } from "lucide-react";
import useColorList from "../../../hooks/useColorList";

function InventoryManagement() {
  const [inventoryList, setInventoryList] = useState([]);
  const [motorList, setMototList] = useState([]);
  const [allMotorList, setAllMotorList] = useState([]); // All motorbikes for form
  const [warehouseList, setWarehouseList] = useState([]);
  const [motor, setMotor] = useState({});
  const [warehouse, setWarehouse] = useState({});
  const [inventory, setInventory] = useState({});
  const { colorList } = useColorList();

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItem, setTotalItem] = useState(null);

  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [motorModal, setMotorModal] = useState(false);
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [inventoryModal, setInventoryModal] = useState(false);
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
      setInventoryList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
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

  const fetchMotorById = async (id) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getMotorbikeById(id);
      setMotor(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewModalLoading(false);
    }
  };

  const fetchWarehouseById = async (id) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getWarehouseById(id);
      setWarehouse(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewModalLoading(false);
    }
  };

  const fetchInventoryDetail = async (motorId, warehouseId, colorId) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getInventoryDetail(
        motorId,
        warehouseId,
        colorId
      );
      const data = response.data.data;
      setInventory(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewModalLoading(false);
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
      key: "lastUpdate",
      title: "Last update",
      render: (lastUpdate) => dayjs(lastUpdate).format("DD/MM/YYYY"),
    },
    {
      key: "action1",
      title: "Action",
      render: (_, item) => (
        <div className="flex gap-2">
          <span
            onClick={() => {
              setInventoryModal(true);
              fetchInventoryDetail(
                item.electricMotorbikeId,
                item.warehouseId,
                item.colorId
              );
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition mx-auto"
          >
            <Eye className="w-5 h-5 text-white" />
          </span>
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
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition mx-auto"
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
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg hover:bg-red-600 transition mx-auto"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </span>
        </div>
      ),
    },
    {
      key: "electricMotorbikeId",
      title: "Motorbike",
      render: (electricMotorbikeId) => (
        <span
          onClick={() => {
            setMotorModal(true);
            fetchMotorById(electricMotorbikeId);
          }}
          className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition mx-auto"
        >
          <Eye className="w-5 h-5 text-white" />
        </span>
      ),
    },
    {
      key: "warehouseId",
      title: "Warehouse",
      render: (warehouseId) => (
        <span
          onClick={() => {
            setWarehouseModal(true);
            fetchWarehouseById(warehouseId);
          }}
          className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition mx-auto"
        >
          <Eye className="w-5 h-5 text-white" />
        </span>
      ),
    },
    {
      key: "colorId",
      title: "Color",
      render: (colorId) => {
        const color = colorList.find((c) => c.id === colorId);
        const colorName = color?.colorType || "unknown";

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
          colorList={colorList}
        />
      </FormModal>

      <GroupModal
        data={motor}
        groupedFields={motorGroupedFields}
        isOpen={motorModal}
        loading={viewModalLoading}
        onClose={() => setMotorModal(false)}
        title={"Motorbike info"}
        generalFields={motorGeneralFields}
      />
      <GroupModal
        data={inventory}
        groupedFields={inventoryGroupFields}
        isOpen={inventoryModal}
        loading={viewModalLoading}
        onClose={() => setInventoryModal(false)}
        title={"Inventory info"}
        generalFields={inventoryGeneralFields}
      />
      <ViewModal
        data={warehouse}
        fields={warehouseFields}
        isOpen={warehouseModal}
        loading={viewModalLoading}
        onClose={() => setWarehouseModal(false)}
        title={"Warehouse info"}
      />

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
