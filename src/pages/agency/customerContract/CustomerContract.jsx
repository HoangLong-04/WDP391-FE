import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import useDealerStaffList from "../../../hooks/useDealerStaffList";
import useCustomerList from "../../../hooks/useCustomerList";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import {
  motorGeneralFields,
  motorGroupedFields,
} from "../../../components/viewModel/motorbikeModel/MotorbikeModel";
import useColorList from "../../../hooks/useColorList";
import FormModal from "../../../components/modal/formModal/FormModal";
import ContractForm from "./contractForm/ContractForm";
import useMotorList from "../../../hooks/useMotorList";
import { Pencil, Trash2, Eye } from "lucide-react";
import { renderStatusTag } from "../../../utils/statusTag";

function CustomerContract() {
  const { user } = useAuth();
  const { staffList } = useDealerStaffList();
  const { customerList } = useCustomerList();
  const { colorList } = useColorList();
  const { motorList } = useMotorList();
  const [customerContractList, setCustomerContractList] = useState([]);
  const [motorbike, setMotorbike] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [staffId, setStaffId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [contractType, setContractType] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [motorModal, setMotorModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false)

  const [form, setForm] = useState({
    title: "",
    content: "",
    totalAmount: 0,
    depositAmount: 0,
    createDate: "",
    contractPaidType: "",
    contractType: "",
    status: "",
    customerId: "",
    staffId: "",
    agencyId: user?.agencyId,
    electricMotorbikeId: "",
    colorId: "",
  });
  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    totalAmount: 0,
    depositAmount: 0,
    createDate: "",
    contractPaidType: "",
    contractType: "",
    status: "",
    electricMotorbikeId: "",
    colorId: "",
  });

  const [isEdit, setIsedit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchMotorById = async (id) => {
    setViewLoading(true);
    try {
      const response = await PrivateAdminApi.getMotorbikeById(id);
      setMotorbike(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewLoading(false);
    }
  };

  const fetchCustomerContractList = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getCustomerContractList(
        user?.agencyId,
        { page, limit, staffId, customerId, status, contractType }
      );
      setCustomerContractList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerContractList();
  }, [page, limit, staffId, customerId, status, contractType]);

  const handleCreateCustomerContract = async (e) => {
    setSubmit(true);
    e.preventDefault();
    const sendData = {
      ...form,
      colorId: Number(form.colorId),
      customerId: Number(form.customerId),
      electricMotorbikeId: Number(form.electricMotorbikeId),
      staffId: Number(form.staffId),
    };
    try {
      await PrivateDealerManagerApi.createCustomerContract(sendData);
      setFormModal(false);
      toast.success("Create successfully");
      fetchCustomerContractList();
      setForm({
        title: "",
        content: "",
        totalAmount: 0,
        depositAmount: 0,
        createDate: "",
        contractPaidType: "",
        contractType: "",
        status: "",
        customerId: "",
        staffId: "",
        agencyId: user?.agencyId,
        electricMotorbikeId: "",
        colorId: "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateCustomerContract = async (e) => {
    setSubmit(true)
    e.preventDefault()
    try {
      await PrivateDealerManagerApi.updateCustomerContract(selectedId, updateForm)
      toast.success('Update successfully')
      setFormModal(false)
      fetchCustomerContractList()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const handleDeleteContract = async (e) => {
    e.preventDefault()
    setSubmit(true)
    try {
      await PrivateDealerManagerApi.deleteCustomerContract(selectedId)
      toast.success('Delete successfully')
      setDeleteModal(false)
      fetchCustomerContractList()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const columns = [
    { key: "id", title: "Id" },
    { key: "title", title: "Title" },
    { key: "content", title: "Content" },
    {
      key: "totalAmount",
      title: "Total amount",
      render: (amount) => amount.toLocaleString(),
    },
    { key: "depositAmount", title: "Deposit amount" },
    {
      key: "finalAmount",
      title: "Final amount",
      render: (amount) => amount.toLocaleString(),
    },
    {
      key: "createDate",
      title: "Create date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    { key: "contractPaidType", title: "Contract paid type" },
    { key: "contractType", title: "Contract type" },
    {
      key: "status",
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
    { key: "customerId", title: "Customer" },
    { key: "staffId", title: "Staff" },
    { key: "agencyId", title: "Agency" },
    { key: "electricMotorbikeId", title: "Electric motorbike" },
    { key: "colorId", title: "Color" },
    {
      key: "action",
      title: "Action",
      render: (_, item) => (
        <div className="flex gap-2 items-center">
          {item.electricMotorbikeId && (
            <button
              onClick={() => {
                setMotorModal(true);
                fetchMotorById(item.electricMotorbikeId);
              }}
              className="cursor-pointer text-white bg-purple-500 p-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
              title="View motorbike"
            >
              <Eye size={18} />
            </button>
          )}
          <button
            onClick={() => {
              setIsedit(true);
              setSelectedId(item.id);
              setFormModal(true);
              setUpdateForm({
                ...item,
                createDate: dayjs(item.createDate).format('YYYY-MM-DD')
              })
            }}
            className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="Update"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedId(item.id);
              setDeleteModal(true);
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
      <div className="my-3 flex justify-end items-center gap-5">
        <div>
          <label className="mr-2 font-medium text-gray-600">Staff:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={staffId}
            onChange={(e) => {
              setStaffId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {staffList.map((staff) => (
              <option value={staff.id}>
                {staff.fullname} - {staff.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Customer:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {customerList.map((customer) => (
              <option value={customer.id}>
                {customer.name} - {customer.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Status:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">
            Contract type:
          </label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={contractType}
            onChange={(e) => {
              setContractType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="AT_STORE">AT_STORE</option>
            <option value="ORDER">ORDER</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsedit(false);
            }}
            className="bg-blue-500 hover:bg-blue-600 transition cursor-pointer rounded-lg p-2 text-white"
          >
            Create contract
          </button>
        </div>
      </div>
      <PaginationTable
        columns={columns}
        data={customerContractList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        totalItem={totalItem}
        title={"Customer contract"}
      />
      <GroupModal
        data={motorbike}
        groupedFields={motorGroupedFields}
        isOpen={motorModal}
        loading={viewLoading}
        onClose={() => setMotorModal(false)}
        title={"Motorbike info"}
        generalFields={motorGeneralFields}
      />
      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update contract" : "Create contract"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateCustomerContract : handleCreateCustomerContract}
        isSubmitting={submit}
      >
        <ContractForm
          colorList={colorList}
          customerList={customerList}
          form={form}
          motorbikeList={motorList}
          setForm={setForm}
          staffList={staffList}
          isEdit={isEdit}
          setUpdateForm={setUpdateForm}
          updateForm={updateForm}
        />
      </FormModal>

      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteContract}
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

export default CustomerContract;
