import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import FormModal from "../../../components/modal/formModal/FormModal";
import CustomerForm from "./customerForm/CustomerForm";
import { Pencil, Trash2 } from "lucide-react";

function CustomerManagement() {
  const { user } = useAuth();
  const [customerList, setCustomerList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    credentialId: "",
    dob: "",
    agencyId: user?.agencyId,
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    credentialId: "",
    dob: "",
  });

  const [isEdit, setIsedit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchCustomerList = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getCustomerList(
        user?.agencyId
      );
      setCustomerList(response.data.data);
      setTotalItem(response.data.paginationInfo);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    setSubmit(true);
    e.preventDefault();
    try {
      await PrivateDealerManagerApi.createCustomer(form);
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        credentialId: "",
        dob: "",
        agencyId: user?.agencyId,
      });
      toast.success("Create successfully");
      setFormModal(false);
      fetchCustomerList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.updateCustomer(selectedId, updateForm);
      setFormModal(false);
      toast.success("Update successfully");
      fetchCustomerList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteCustomer = async (e) => {
    e.preventDefault();
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.deleteCustomer(selectedId);
      toast.success("Delete successfully");
      setDeleteModal(false);
      fetchCustomerList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  useEffect(() => {
    fetchCustomerList();
  }, [page, limit]);

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "address", title: "Address" },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    { key: "credentialId", title: "Credential" },
    {
      key: "dob",
      title: "Dob",
      render: (dob) => dayjs(dob).format("DD-MM-YYYY"),
    },
    { key: "agencyId", title: "Agency" },
    {
      key: "action",
      title: "Action",
      render: (_, item) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setSelectedId(item.id);
              setFormModal(true);
              setIsedit(true);
              setUpdateForm({
                ...item,
                dob: dayjs(item.dob).format("YYYY-MM-DD"),
              });
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
      <div className="my-3 flex justify-end items-center">
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsedit(false);
            }}
            className="text-white cursor-pointer bg-blue-500 hover:bg-blue-600 transition p-2 rounded-lg"
          >
            Create customer
          </button>
        </div>
      </div>
      <PaginationTable
        columns={columns}
        data={customerList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Customer management"}
        totalItem={totalItem}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update customer" : "Create customer"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateCustomer : handleCreateCustomer}
        isSubmitting={submit}
      >
        <CustomerForm
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
        onSubmit={handleDeleteCustomer}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this customer? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default CustomerManagement;
