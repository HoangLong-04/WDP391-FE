import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import FormModal from "../../../components/modal/formModal/FormModal";
import MotorForm from "./motorForm/MotorForm";
import DialogModal from "../../../components/modal/dialogModal/DialogModal";
import ConfigurationForm from "../configuration/configurationForm/ConfigurationForm";
import AppearanceForm from "../appearance/appearanceForm/AppearanceForm";
import BatteryForm from "../battery/batteryForm/BatteryForm";
import SafeFeatureForm from "../safeFeature/safeFeatureForm/SafeFeatureForm";
import {
  motorGeneralFields,
  motorGroupedFields,
} from "../../../components/viewModel/motorbikeModel/MotorbikeModel";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import MotorImageForm from "./motorImageForm/MotorImageForm";

function MotorbikeManagement() {
  const [motorList, setMotorList] = useState([]);
  const [motor, setMotor] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [model, setModel] = useState("");
  const [makeFrom, setMakeFrom] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [motorModal, setMotorModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [appearanceModal, setAppearanceModal] = useState(false);
  const [batteryModal, setBatteryModal] = useState(false);
  const [safeFeatureModal, setSafeFeatureModal] = useState(false);
  const [motorImageModal, setMotorImageModal] = useState(false);
  const [colorImageModal, setColorImageModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    description: "",
    model: "",
    makeFrom: "",
    version: "",
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    price: 0,
    description: "",
    model: "",
    makeFrom: "",
    version: "",
  });
  const [configUpdateForm, setConfigUpdateForm] = useState({
    motorType: "",
    speedLimit: "",
    maximumCapacity: 0,
  });
  const [configForm, setConfigForm] = useState({
    motorType: "",
    speedLimit: "",
    maximumCapacity: 0,
  });
  const [appearanceForm, setApearanceForm] = useState({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    undercarriageDistance: 0,
    storageLimit: 0,
  });
  const [appearanceUpdateForm, setApearanceUpdateForm] = useState({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    undercarriageDistance: 0,
    storageLimit: 0,
  });
  const [batteryForm, setBatteryForm] = useState({
    type: "",
    capacity: "",
    chargeTime: "",
    chargeType: "",
    energyConsumption: "",
    limit: "",
  });
  const [batteryUpdateForm, setBatteryUpdateForm] = useState({
    type: "",
    capacity: "",
    chargeTime: "",
    chargeType: "",
    energyConsumption: "",
    limit: "",
  });
  const [safeFeatureForm, setSafeFeatureForm] = useState({
    brake: "",
    lock: "",
  });
  const [safeFeatureUpdateForm, setSafeFeatureUpdateForm] = useState({
    brake: "",
    lock: "",
  });
  const [motorImage, setMotorImage] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    return () => {
      motorImage?.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [motorImage]);

  const handleAddImageForMotor = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const formData = new FormData();
    motorImage?.forEach((file) => {
      formData.append("images", file);
    });
    try {
      await PrivateAdminApi.addImageForMotor(selectedId, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Add successfully");
      setMotorImage(null);
      setMotorImageModal(false);
    } catch (error) {
      setMotorImage(null);
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteColorImage = async (motorId, colorId, imageUrl) => {
    // Confirmation
    if (
      !window.confirm(`Are you sure you want to delete the ${colorId} color?`)
    ) {
      return;
    }

    try {
      // API call với query params và body
      await PrivateAdminApi.deleteColorImage(motorId, colorId, {
        imageUrl: imageUrl,
      });

      toast.success("Delete ok");

      // Refresh modal data
      fetchMotorById(motorId);
    } catch (error) {
      console.error(error);
      const errorMsg = error.apiError?.message || "Failed to delete color";
      toast.error(errorMsg);
    }
  };

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

  const fetchMotorbikeList = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getMotorList({
        page,
        limit,
        makeFrom,
        model,
      });
      setMotorList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigByMotorId = async (id) => {
    setDialogLoading(true);
    try {
      const response = await PrivateAdminApi.getCongiurationDetail(id);
      setConfigUpdateForm(response.data.data);
    } catch (error) {
      setConfigUpdateForm({
        motorType: "",
        speedLimit: "",
        maximumCapacity: 0,
      });
      toast.error(error.message);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUpdateConfiguration = async (e) => {
    setSubmit(true);
    e.preventDefault();
    try {
      await PrivateAdminApi.updateConfiguration(selectedId, configUpdateForm);
      toast.success("Update successfully");
      setConfigModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleCreateConfiguration = async (e) => {
    setSubmit(true);
    e.preventDefault();
    try {
      await PrivateAdminApi.createConfiguration(selectedId, configForm);
      setConfigForm({
        motorType: "",
        speedLimit: "",
        maximumCapacity: 0,
      });
      toast.success("Add successfully");
      setConfigModal(false);
    } catch (error) {
      setConfigForm({
        motorType: "",
        speedLimit: "",
        maximumCapacity: 0,
      });
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteConfiguration = async () => {
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteConfiguration(selectedId);
      toast.success("Delete successfully");
      setConfigModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const fetchAppearanceDetail = async (id) => {
    setDialogLoading(true);
    try {
      const response = await PrivateAdminApi.getAppearanceDetail(id);
      setApearanceUpdateForm(response.data.data);
    } catch (error) {
      setApearanceUpdateForm({
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        undercarriageDistance: 0,
        storageLimit: 0,
      });
      toast.error(error.message);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUpdateAppearance = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.updateAppearance(selectedId, appearanceUpdateForm);
      setAppearanceModal(false);
      toast.success("Update successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleCreateAppearance = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.createAppearance(selectedId, appearanceForm);
      toast.success("Create successfully");
      setAppearanceModal(false);
      setApearanceForm({
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        undercarriageDistance: 0,
        storageLimit: 0,
      });
    } catch (error) {
      setApearanceForm({
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        undercarriageDistance: 0,
        storageLimit: 0,
      });
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteAppearance = async () => {
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteAppearance(selectedId);
      toast.success("Delete successfully");
      setAppearanceModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const fetchBatteryDetail = async (id) => {
    setDialogLoading(true);
    try {
      const response = await PrivateAdminApi.getBatteryDetail(id);
      setBatteryUpdateForm(response.data.data);
    } catch (error) {
      setBatteryUpdateForm({
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        undercarriageDistance: 0,
        storageLimit: 0,
      });
      toast.error(error.message);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUpdateBattery = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.updateBattery(selectedId, batteryUpdateForm);
      setBatteryModal(false);
      toast.success("Update successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleCreateBattery = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.createBattery(selectedId, batteryForm);
      toast.success("Create successfully");
      setBatteryModal(false);
      setBatteryForm({
        type: "",
        capacity: "",
        chargeTime: "",
        chargeType: "",
        energyConsumption: "",
        limit: "",
      });
    } catch (error) {
      setBatteryForm({
        type: "",
        capacity: "",
        chargeTime: "",
        chargeType: "",
        energyConsumption: "",
        limit: "",
      });
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeletebattery = async () => {
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteBattery(selectedId);
      toast.success("Delete successfully");
      setBatteryModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const fetchSafeFeatureDetail = async (id) => {
    setDialogLoading(true);
    try {
      const response = await PrivateAdminApi.getSafeFeature(id);
      setSafeFeatureUpdateForm(response.data.data);
    } catch (error) {
      setSafeFeatureUpdateForm({
        brake: "",
        lock: "",
      });
      toast.error(error.message);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUpdateSafeFeature = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.updateSafeFeature(
        selectedId,
        safeFeatureUpdateForm
      );
      setSafeFeatureModal(false);
      toast.success("Update successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleCreateSafeFeature = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.createSafeFeature(selectedId, safeFeatureForm);
      toast.success("Create successfully");
      setSafeFeatureModal(false);
      setSafeFeatureForm({
        brake: "",
        lock: "",
      });
    } catch (error) {
      setSafeFeatureForm({
        brake: "",
        lock: "",
      });
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteSafeFeature = async () => {
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteSafeFeature(selectedId);
      toast.success("Delete successfully");
      setSafeFeatureModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  useEffect(() => {
    fetchMotorbikeList();
  }, [page, limit, makeFrom, model]);

  const handleCreateMotorbike = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.createMotorbike(form);
      setForm({
        name: "",
        price: 0,
        description: "",
        model: "",
        makeFrom: "",
        version: "",
      });
      toast.success("Create successfully");
      setFormModal(false);
      fetchMotorbikeList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateMotorbike = async (e) => {
    setSubmit(true);
    e.preventDefault();
    try {
      await PrivateAdminApi.updateMotorbike(selectedId, updateForm);
      toast.success("Update successfully");
      setFormModal(false);
      fetchMotorbikeList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteMotorbike = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteMotorbike(selectedId);
      toast.success("Delete successfully");
      fetchMotorbikeList();
      setDeleteModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    {
      key: "id",
      title: "Motorbike",
      render: (id) => (
        <span
          onClick={() => {
            setMotorModal(true);
            fetchMotorById(id);
          }}
          className="cursor-pointer bg-blue-500 rounded-lg p-2 flex justify-center items-center text-white"
        >
          {id}
        </span>
      ),
    },
    { key: "name", title: "Name" },
    // { key: "price", title: "Price", render: (price) => price.toLocaleString() },
    // { key: "description", title: "Description" },
    { key: "model", title: "Model" },
    { key: "makeFrom", title: "Made in" },
    // { key: "version", title: "Version" },
    {
      key: "isDeleted",
      title: "Available",
      render: (isDeleted) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            isDeleted ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {isDeleted ? "Unavailable" : "Available"}
        </span>
      ),
    },
    {
      key: "action1",
      title: "Update",
      render: (_, item) => (
        <span
          onClick={() => {
            setUpdateForm(item);
            setIsEdit(true);
            setFormModal(true);
            setSelectedId(item.id);
          }}
          className="cursor-pointer bg-blue-500 rounded-lg flex justify-center items-center text-white p-2"
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
          className="cursor-pointer bg-red-500 rounded-lg flex justify-center items-center text-white p-2"
        >
          Delete
        </span>
      ),
    },
    {
      key: "action3",
      title: "Configuration",
      render: (_, item) => (
        <div className="flex gap-2">
          <span
            onClick={() => {
              setConfigModal(true);
              setIsEdit(true);
              fetchConfigByMotorId(item.id);
              setSelectedId(item.id);
            }}
            className="cursor-pointer bg-gray-500 rounded-lg flex justify-center items-center text-white p-2"
          >
            View
          </span>
          <span
            onClick={() => {
              setConfigModal(true);
              setIsEdit(false);
              setSelectedId(item.id);
            }}
            className="cursor-pointer bg-blue-300 rounded-lg flex justify-center items-center text-white p-2"
          >
            Add
          </span>
        </div>
      ),
    },
    {
      key: "action4",
      title: "Appearance",
      render: (_, item) => (
        <div className="flex gap-2">
          <span
            onClick={() => {
              setAppearanceModal(true);
              setIsEdit(true);
              fetchAppearanceDetail(item.id);
              setSelectedId(item.id);
            }}
            className="cursor-pointer bg-gray-500 rounded-lg flex justify-center items-center text-white p-2"
          >
            View
          </span>
          <span
            onClick={() => {
              setAppearanceModal(true);
              setIsEdit(false);
              setSelectedId(item.id);
            }}
            className="cursor-pointer bg-blue-300 rounded-lg flex justify-center items-center text-white p-2"
          >
            Add
          </span>
        </div>
      ),
    },
    {
      key: "action5",
      title: "Battery",
      render: (_, item) => (
        <div className="flex gap-2">
          <span
            onClick={() => {
              setBatteryModal(true);
              setIsEdit(true);
              fetchBatteryDetail(item.id);
              setSelectedId(item.id);
            }}
            className="cursor-pointer bg-gray-500 rounded-lg flex justify-center items-center text-white p-2"
          >
            View
          </span>
          <span
            onClick={() => {
              setBatteryModal(true);
              setIsEdit(false);
              setSelectedId(item.id);
            }}
            className="cursor-pointer bg-blue-300 rounded-lg flex justify-center items-center text-white p-2"
          >
            Add
          </span>
        </div>
      ),
    },
    {
      key: "action6",
      title: "Safe feature",
      render: (_, item) => (
        <div className="flex gap-2">
          <span
            onClick={() => {
              setSafeFeatureModal(true);
              setIsEdit(true);
              fetchSafeFeatureDetail(item.id);
              setSelectedId(item.id);
            }}
            className="cursor-pointer bg-gray-500 rounded-lg flex justify-center items-center text-white p-2"
          >
            View
          </span>
          <span
            onClick={() => {
              setSafeFeatureModal(true);
              setIsEdit(false);
              setSelectedId(item.id);
            }}
            className="cursor-pointer bg-blue-300 rounded-lg flex justify-center items-center text-white p-2"
          >
            Add
          </span>
        </div>
      ),
    },
    {
      key: "action7",
      title: "Image for motorbike",
      render: (_, item) => (
        <span
          onClick={() => {
            setMotorImageModal(true);
            setSelectedId(item.id);
          }}
          className="cursor-pointer bg-blue-500 rounded-lg flex justify-center items-center text-white p-2"
        >
          Add
        </span>
      ),
    },
    {
      key: "action8",
      title: "Color for motorbike",
      render: (_, item) => (
        <span
          // onClick={() => {
          //   setSafeFeatureModal(true);
          //   setIsEdit(false);
          //   setSelectedId(item.id);
          // }}
          className="cursor-pointer bg-blue-500 rounded-lg flex justify-center items-center text-white p-2"
        >
          Add
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="my-3 flex justify-end items-center gap-5">
        <div>
          <label className="mr-2 font-medium text-gray-600">Made in:</label>
          <input
            placeholder="Made in"
            value={makeFrom}
            onChange={(e) => {
              setMakeFrom(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
            type="text"
          />
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Model:</label>
          <input
            placeholder="Model"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
            type="text"
          />
        </div>
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsEdit(false);
            }}
            className="p-2 rounded-lg cursor-pointer bg-blue-500 hover:bg-blue-600 transition text-white"
          >
            Create motorbike
          </button>
        </div>
      </div>
      <PaginationTable
        columns={columns}
        data={motorList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Motorbike"}
        totalItem={totalItem}
      />
      <GroupModal
        data={motor}
        groupedFields={motorGroupedFields}
        isOpen={motorModal}
        loading={viewModalLoading}
        onClose={() => setMotorModal(false)}
        title={"Motorbike info"}
        generalFields={motorGeneralFields}
        onDeleteColor={handleDeleteColorImage}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update motorbike" : "Create motorbike"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateMotorbike : handleCreateMotorbike}
        isSubmitting={submit}
      >
        <MotorForm
          form={form}
          isEdit={isEdit}
          setForm={setForm}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
        />
      </FormModal>
      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteMotorbike}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this motorbike? This action cannot be
          undone.
        </p>
      </FormModal>

      {/* Configuration Form */}
      <DialogModal
        onClose={() => setConfigModal(false)}
        open={configModal}
        title={isEdit ? "Update configuration" : "Add configuration"}
        loading={dialogLoading}
        onUpdate={handleUpdateConfiguration}
        isEdit={isEdit}
        onCreate={handleCreateConfiguration}
        onDelete={handleDeleteConfiguration}
        submit={submit}
      >
        <ConfigurationForm
          configForm={configForm}
          configUpdateForm={configUpdateForm}
          isEdit={isEdit}
          setConfigForm={setConfigForm}
          setConfigUpdateForm={setConfigUpdateForm}
        />
      </DialogModal>

      {/* Appearance Form */}
      <DialogModal
        onClose={() => setAppearanceModal(false)}
        open={appearanceModal}
        title={isEdit ? "Update appearance" : "Add appearance"}
        loading={dialogLoading}
        onUpdate={handleUpdateAppearance}
        isEdit={isEdit}
        onCreate={handleCreateAppearance}
        onDelete={handleDeleteAppearance}
        submit={submit}
      >
        <AppearanceForm
          appearanceForm={appearanceForm}
          appearanceUpdateForm={appearanceUpdateForm}
          isEdit={isEdit}
          setAppearanceForm={setApearanceForm}
          setAppearanceUpdateForm={setApearanceUpdateForm}
        />
      </DialogModal>

      {/* Battery Form */}
      <DialogModal
        onClose={() => setBatteryModal(false)}
        open={batteryModal}
        title={isEdit ? "Update battery" : "Add battery"}
        loading={dialogLoading}
        onUpdate={handleUpdateBattery}
        isEdit={isEdit}
        onCreate={handleCreateBattery}
        onDelete={handleDeletebattery}
        submit={submit}
      >
        <BatteryForm
          batteryForm={batteryForm}
          batteryUpdateForm={batteryUpdateForm}
          isEdit={isEdit}
          setBatteryForm={setBatteryForm}
          setBatteryUpdateForm={setBatteryUpdateForm}
        />
      </DialogModal>

      {/* Safe feature Form */}
      <DialogModal
        onClose={() => setSafeFeatureModal(false)}
        open={safeFeatureModal}
        title={isEdit ? "Update safe feature" : "Add safe feature"}
        loading={dialogLoading}
        onUpdate={handleUpdateSafeFeature}
        isEdit={isEdit}
        onCreate={handleCreateSafeFeature}
        onDelete={handleDeleteSafeFeature}
        submit={submit}
      >
        <SafeFeatureForm
          isEdit={isEdit}
          safeFeatureForm={safeFeatureForm}
          safeFeatureUpdateForm={safeFeatureUpdateForm}
          setSafeFeatureForm={setSafeFeatureForm}
          setSafeFeatureUpdateForm={setSafeFeatureUpdateForm}
        />
      </DialogModal>

      <FormModal
        isOpen={motorImageModal}
        onClose={() => setMotorImageModal(false)}
        title={"Add image"}
        isDelete={false}
        onSubmit={handleAddImageForMotor}
        isSubmitting={submit}
      >
        <MotorImageForm motorImage={motorImage} setMotorImage={setMotorImage} />
      </FormModal>
    </div>
  );
}

export default MotorbikeManagement;
