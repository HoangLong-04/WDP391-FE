import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import useMotorList from "../../../hooks/useMotorList";
import { toast } from "react-toastify";
import {
  motorGeneralFields,
  motorGroupedFields,
} from "../../../components/viewModel/motorbikeModel/MotorbikeModel";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import FormModal from "../../../components/modal/formModal/FormModal";
import PromotionForm from "./promotionForm/PromotionForm";

function PromotionManagement() {
  const { motorList } = useMotorList();
  const [promotion, setPromotion] = useState([]);
  const [motor, setMotor] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(null);
  const [valueType, setValueType] = useState("");
  const [motorbikeId, setMotorbikeId] = useState("");

  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [motorModal, setMotorModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    value_type: "",
    value: 0,
    startAt: "",
    endAt: "",
    status: "",
    motorbikeId: "",
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    description: "",
    value_type: "",
    value: 0,
    startAt: "",
    endAt: "",
    status: "",
    motorbikeId: "",
  });

  const [isEdit, setIsedit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchPromotion = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getPromotionList({
        page,
        limit,
        valueType,
        motorbikeId,
      });
      setPromotion(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotion();
  }, [page, limit, valueType, motorbikeId]);

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

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const sendData = {
      ...form,
      motorbikeId: Number(form.motorbikeId),
      value: Number(form.value),
    };
    try {
      await PrivateAdminApi.createPromotion(sendData);
      fetchPromotion();
      toast.success("Create successfully");
      setFormModal(false);
      setForm({
        name: "",
        description: "",
        value_type: "",
        startAt: "",
        endAt: "",
        motorbikeId: "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdatePromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const sendData = {
      ...updateForm,
      value: Number(updateForm.value),
    };
    try {
      await PrivateAdminApi.updatePromotion(selectedId, sendData);
      setFormModal(false);
      toast.success("Update successfully");
      setIsedit(false);
      fetchPromotion();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeletePromotion = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deletePromotion(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchPromotion();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "description", title: "Description" },
    { key: "valueType", title: "Type value" },
    { key: "value", title: "Value" },
    {
      key: "startAt",
      title: "Start date",
      render: (startAt) => dayjs(startAt).format("DD/MM/YYYY"),
    },
    {
      key: "endAt",
      title: "End date",
      render: (endAt) => dayjs(endAt).format("DD/MM/YYYY"),
    },
    {
      key: "status",
      title: "Status",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status}
        </span>
      ),
    },
    { key: "agencyId", title: "Agency" },
    {
      key: "motorbikeId",
      title: "Motorbike",
      render: (motorbikeId) =>
        motorbikeId && (
          <span
            onClick={() => {
              setMotorModal(true);
              fetchMotorById(motorbikeId);
            }}
            className="bg-blue-500 rounded-lg cursor-pointer text-white p-2"
          >
            View
          </span>
        ),
    },
    {
      key: "action1",
      title: "Update",
      render: (_, item) => (
        <span
          onClick={() => {
            setIsedit(true);
            setFormModal(true);
            setUpdateForm({
              ...item,
              value_type: item.valueType,
              startAt: dayjs(item.startAt).format("YYYY-MM-DD"),
              endAt: dayjs(item.endAt).format("YYYY-MM-DD"),
            });
            setSelectedId(item.id);
          }}
          className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg"
        >
          Update
        </span>
      ),
    },
    {
      key: "action",
      title: "Delete",
      render: (_, item) => (
        <span
          onClick={() => {
            setDeleteModal(true);
            setSelectedId(item.id);
          }}
          className="cursor-pointer text-white bg-red-500 p-2 rounded-lg"
        >
          Delete
        </span>
      ),
    },
  ];
  return (
    <div>
      <div className="my-3 flex justify-end items-center gap-5">
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
            {motorList?.map((m) => (
              <option
                // onChange={(e) => setMotorbikeId(e.target.value)}
                value={m.id}
              >
                {m.name} - {m.model}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Type value:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={valueType}
            onChange={(e) => {
              setValueType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="PERCENT">PERCENT</option>
            <option value="FIXED">FIXED</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsedit(false);
            }}
            className="bg-blue-500 text-white hover:bg-blue-600 cursor-pointer transition rounded-lg p-2"
          >
            Create promotion
          </button>
        </div>
      </div>
      <PaginationTable
        data={promotion}
        title={"Promotion Management"}
        page={page}
        setPage={setPage}
        loading={loading}
        columns={columns}
        pageSize={limit}
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
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update promotion" : "Create promotion"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdatePromotion : handleCreatePromotion}
        isSubmitting={submit}
      >
        <PromotionForm
          form={form}
          setForm={setForm}
          motorList={motorList}
          isEdit={isEdit}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeletePromotion}
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

export default PromotionManagement;
