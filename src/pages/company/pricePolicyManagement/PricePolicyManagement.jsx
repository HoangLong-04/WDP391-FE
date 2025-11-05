import { formatCurrency } from "../../../utils/currency";
import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import { toast } from "react-toastify";
import ViewModal from "../../../components/modal/viewModal/ViewModal";
import { agencyField } from "../../../components/viewModel/agencyModel/AgencyModel";
import {
  motorGeneralFields,
  motorGroupedFields,
} from "../../../components/viewModel/motorbikeModel/MotorbikeModel";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import FormModal from "../../../components/modal/formModal/FormModal";
import useMotorList from "../../../hooks/useMotorList";
import useAgencyList from "../../../hooks/useAgencyList";
import PricePolicyForm from "./pricePolicyForm/PricePolicyForm";

function PricePolicyManagement() {
  const { motorList } = useMotorList();
  const { agencyList } = useAgencyList();
  const [priceList, setPriceList] = useState([]);
  const [agency, setAgency] = useState({});
  const [motor, setMotor] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(null);

  const [agencyModal, setAgencyModal] = useState(false);
  const [motorModal, setMotorModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleleModal, setDeleteModal] = useState(false);

  const [submit, setSubmit] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    policy: "",
    wholesalePrice: 0,
    agencyId: null,
    motorbikeId: null,
  });
  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    policy: "",
    wholesalePrice: 0,
    agencyId: null,
    motorbikeId: null,
  });

  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isEdit, setIsedit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchPriceList = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getPricePolicy({ page, limit });
      setPriceList(response.data.data);
      setTotalItem(response.data.pagination.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceList();
  }, [page, limit]);

  const fetchAgencyById = async (id) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getAgencyById(id);
      console.log("Agency data from API:", response.data.data);
      setAgency(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const sendData = {
      ...form,
      wholesalePrice: Number(form.wholesalePrice),
    };
    try {
      await PrivateAdminApi.createPricePolicy(sendData);
      toast.success("Create successfully");
      setFormModal(false);
      fetchPriceList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setSubmit(true);
    const sendData = {
      policy: updateForm.policy,
      wholesalePrice: Number(updateForm.wholesalePrice),
    };
    try {
      await PrivateAdminApi.updatePricePolicy(selectedId, sendData);
      toast.success("Create successfully");
      fetchPriceList();
      setFormModal(false);
      setIsedit(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeletePolicy = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateAdminApi.deletePricePolicy(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchPriceList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
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

  const columns = [
    { key: "id", title: "Id" },
    { key: "title", title: "Title" },
    { key: "content", title: "Content" },
    { key: "policy", title: "Policy" },
    {
      key: "wholesalePrice",
      title: "Price",
      render: (wholesalePrice) => {
        return formatCurrency(wholesalePrice);
      },
    },
    {
      key: "agencyId",
      title: "Agency",
      render: (agencyId) => (
        <span
          onClick={() => {
            setAgencyModal(true);
            fetchAgencyById(agencyId);
          }}
          className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition mx-auto"
        >
          <Eye className="w-5 h-5 text-white" />
        </span>
      ),
    },
    {
      key: "motorbikeId",
      title: "Motorbike",
      render: (motorbikeId) => (
        <span
          onClick={() => {
            setMotorModal(true);
            fetchMotorById(motorbikeId);
          }}
          className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition mx-auto"
        >
          <Eye className="w-5 h-5 text-white" />
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
            setUpdateForm(item);
            setSelectedId(item.id);
          }}
          className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition mx-auto"
        >
          <Pencil className="w-5 h-5 text-white" />
        </span>
      ),
    },
    {
      key: "action2",
      title: "Delete",
      render: (_, item) => (
        <span
          onClick={() => {
            setSelectedId(item.id);
            setDeleteModal(true);
          }}
          className="cursor-pointer flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg hover:bg-red-600 transition mx-auto"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="my-3 flex justify-end">
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsedit(false);
            }}
            className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition text-white"
          >
            <Plus className="w-5 h-5" />
            <span>Create</span>
          </button>
        </div>
      </div>
      <PaginationTable
        data={priceList}
        page={page}
        setPage={setPage}
        loading={loading}
        columns={columns}
        title={"Price Policy"}
        pageSize={limit}
        totalItem={totalItem}
      />

      <ViewModal
        data={agency}
        fields={agencyField}
        isOpen={agencyModal}
        loading={viewModalLoading}
        onClose={() => setAgencyModal(false)}
        title={"Agency info"}
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
        title={isEdit ? "Update inventory" : "Create inventory"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdatePolicy : handleCreatePolicy}
        isSubmitting={submit}
      >
        <PricePolicyForm
          form={form}
          updateForm={updateForm}
          motorList={motorList}
          agencyList={agencyList}
          setForm={setForm}
          setUpdateForm={setUpdateForm}
          isEdit={isEdit}
        />
      </FormModal>

      <FormModal
        isOpen={deleleModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeletePolicy}
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

export default PricePolicyManagement;
