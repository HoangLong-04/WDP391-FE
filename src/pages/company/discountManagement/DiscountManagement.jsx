import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import useMotorList from "../../../hooks/useMotorList";
import {
  motorGeneralFields,
  motorGroupedFields,
} from "../../../components/viewModel/motorbikeModel/MotorbikeModel";
import { toast } from "react-toastify";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import FormModal from "../../../components/modal/formModal/FormModal";
import DiscountForm from "./discountForm/DiscountForm";
import useAgencyList from "../../../hooks/useAgencyList";

function DiscountManagement() {
  const { motorList } = useMotorList();
  const { agencyList } = useAgencyList();
  const [discount, setDiscount] = useState([]);
  const [motor, setMotor] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState("");
  const [valueType, setValueType] = useState("");
  const [motorbikeId, setMotorbikeId] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [totalItem, setTotalItem] = useState(null);

  const [motorModal, setMotorModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [submit, setSubmit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    value_type: "",
    value: 0,
    min_quantity: 0,
    startAt: "",
    endAt: new Date(),
    status: "ACTIVE",
    agencyId: null,
    motorbikeId: null,
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    type: "",
    value_type: "",
    value: 0,
    min_quantity: 0,
    startAt: "",
    endAt: new Date(),
    status: "ACTIVE",
    agencyId: null,
    motorbikeId: null,
  });

  const [selectedId, setSelectedId] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const fetchDiscount = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getDiscountList({
        page,
        limit,
        type,
        valueType,
        agencyId,
        motorbikeId,
      });
      setDiscount(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscount();
  }, [page, limit, type, valueType, motorbikeId, agencyId]);

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

  const handleCreateDiscount = async (e) => {
    setSubmit(true);
    e.preventDefault();
    const sendData = {
      ...formData,
      agencyId: Number(formData.agencyId),
      min_quantity: Number(formData.min_quantity),
      motorbikeId: Number(formData.motorbikeId),
      value: Number(formData.value),
    };
    try {
      await PrivateAdminApi.createDiscount(sendData);
      setFormData({
        name: "",
        type: "",
        value_type: "",
        value: 0,
        min_quantity: 0,
        startAt: new Date(),
        endAt: new Date(),
        status: "ACTIVE",
        agencyId: null,
        motorbikeId: null,
      });
      fetchDiscount();
      setFormModal(false);
      toast.success("Create successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(true);
    }
  };

  const handleUpdateDiscount = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const sendData = {
      ...updateForm,
      min_quantity: Number(updateForm.min_quantity),
      value: Number(updateForm.value),
    };
    try {
      await PrivateAdminApi.updateDiscount(selectedId, sendData);
      fetchDiscount();
      setFormModal(false);
      setIsEdit(false);
      toast.success("Update successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteDiscount = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deleteDiscount(selectedId);
      fetchDiscount();
      toast.success("Delete successfully");
      setDeleteModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "type", title: "Type" },
    { key: "valueType", title: "Value type" },
    { key: "value", title: "Value" },
    { key: "min_quantity", title: "Min quantity" },
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
      key: "action1",
      title: "Motor",
      render: (_, item) => (
        <span
          onClick={() => {
            fetchMotorById(item.motorbikeId);
            setMotorModal(true);
          }}
          className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg"
        >
          View
        </span>
      ),
    },
    {
      key: "action2",
      title: "Update",
      render: (_, item) => (
        <span
          onClick={() => {
            setFormModal(true);
            setIsEdit(true);
            setSelectedId(item.id);
            setUpdateForm({
              name: item.name,
              type: item.type,
              value_type: item.valueType,
              value: item.value,
              min_quantity: item.min_quantity,
              startAt: dayjs(item.startAt).format("YYYY-MM-DD"),
              endAt: dayjs(item.endAt).format("YYYY-MM-DD"),
              status: item.status,
              motorbikeId: item.motorbikeId,
              agencyId: item.agencyId,
            });
            console.log(item);
          }}
          className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg"
        >
          Update
        </span>
      ),
    },
    {
      key: "action3",
      title: "Delete",
      render: (_, item) => (
        <span
          onClick={() => {
            setSelectedId(item.id);
            setDeleteModal(true);
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
          <label className="mr-2 font-medium text-gray-600">Agency:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={agencyId}
            onChange={(e) => {
              setAgencyId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {agencyList.map((a) => (
              <option value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Type:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="VOLUME">VOLUME</option>
            <option value="SPECIAL">SPECIAL</option>
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
              setIsEdit(false);
            }}
            className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition cursor-pointer"
          >
            Create discount
          </button>
        </div>
      </div>

      <PaginationTable
        columns={columns}
        page={page}
        setPage={setPage}
        data={discount}
        pageSize={limit}
        title={"Disscount Management"}
        loading={loading}
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
        title={isEdit ? "Update discount" : "Create discount"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateDiscount : handleCreateDiscount}
        isSubmitting={submit}
      >
        <DiscountForm
          agencyList={agencyList}
          formData={formData}
          motorList={motorList}
          setFormData={setFormData}
          isEdit={isEdit}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteDiscount}
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

export default DiscountManagement;
