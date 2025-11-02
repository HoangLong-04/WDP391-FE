import React, { useEffect, useState } from "react";
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

function InventoryManagement() {
  const [inventoryList, setInventoryList] = useState([]);
  const [motorList, setMototList] = useState([]);
  const [warehouseList, setWarehouseList] = useState([]);
  const [motor, setMotor] = useState({});
  const [warehouse, setWarehouse] = useState({});
  const [inventory, setInventory] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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
  });

  const [updateForm, setUpdateForm] = useState({
    quantity: 0,
    stockDate: "",
    motorId: "",
    warehouseId: "",
  });

  const [isEdit, setIsedit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

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
  useEffect(() => {
    const fetchMotorList = async () => {
      try {
        const response = await PrivateAdminApi.getMotorList({
          page,
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
          page,
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

  useEffect(() => {
    if (motorList && motorList.length > 0) {
      const currentMotorId = form.motorId;
      if (!currentMotorId || currentMotorId === "") {
        const defaultMotorId = motorList[0].id;
        setForm((prevForm) => ({
          ...prevForm,
          motorId: defaultMotorId,
        }));
      }
    }
  }, [motorList, setForm, form.motorId]);

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

  const fetchInventoryDetail = async (motorId, warehouseId) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getInventoryDetail(
        motorId,
        warehouseId
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
    const sendData = {
      quantity: Number(form.quantity),
      stockDate: form.stockDate,
    };
    console.log(sendData);

    try {
      await PrivateAdminApi.createInventory(
        form.motorId,
        form.warehouseId,
        sendData
      );
      setForm({
        quantity: 0,
        stockDate: dayjs().format("'YYYY-MM-DD'"),
        motorId: form.motorId,
        warehouseId: form.warehouseId,
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
    const sendData = {
      quantity: Number(updateForm.quantity),
      stockDate: updateForm.stockDate,
    };
    try {
      await PrivateAdminApi.updateInventory(
        updateForm.motorId,
        updateForm.warehouseId,
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
        updateForm.warehouseId
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
    {
      key: "electricMotorbikeId",
      title: "Motorbike",
      render: (electricMotorbikeId) => (
        <span
          onClick={() => {
            setMotorModal(true);
            fetchMotorById(electricMotorbikeId);
          }}
          className="cursor-pointer bg-blue-500 rounded-lg p-2 flex justify-center items-center text-white"
        >
          View
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
          className="cursor-pointer bg-blue-500 rounded-lg p-2 flex justify-center items-center text-white"
        >
          View
        </span>
      ),
    },
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
        <span
          onClick={() => {
            setInventoryModal(true);
            fetchInventoryDetail(item.electricMotorbikeId, item.warehouseId);
          }}
          className="cursor-pointer bg-blue-500 rounded-lg flex justify-center items-center text-white p-2"
        >
          View
        </span>
      ),
    },
    {
      key: "action2",
      title: "Action",
      render: (_, item) => (
        <span
          onClick={() => {
            setUpdateForm({
              motorId: item.electricMotorbikeId,
              warehouseId: item.warehouseId,
              quantity: item.quantity,
              stockDate: new Date(item.stockDate),
            });
            setIsedit(true);
            setFormModal(true);
          }}
          className="cursor-pointer bg-blue-500 rounded-lg flex justify-center items-center text-white p-2"
        >
          Update
        </span>
      ),
    },
    {
      key: "action3",
      title: "Action",
      render: (_, item) => (
        <span
          onClick={() => {
            setUpdateForm({
              motorId: item.electricMotorbikeId,
              warehouseId: item.warehouseId,
            });
            setIsDelete(true);
            setDeleteForm(true);
          }}
          className="cursor-pointer bg-red-500 rounded-lg flex justify-center items-center text-white p-2"
        >
          Delete
        </span>
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
          motorList={motorList}
          warehouseList={warehouseList}
          setForm={setForm}
          setUpdateForm={setUpdateForm}
          isEdit={isEdit}
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
          Are you sure you want to delete this inventory? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default InventoryManagement;
