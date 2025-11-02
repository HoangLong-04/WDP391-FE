import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import useColorList from "../../../hooks/useColorList";
import useMotorList from "../../../hooks/useMotorList";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import {
  stockGeneralFields,
  stockGroupedFields,
} from "../../../components/viewModel/stockModel/StockModel";
import FormModal from "../../../components/modal/formModal/FormModal";
import StockForm from "./stockForm/StockForm";
import { Eye, Pencil, Trash2 } from "lucide-react";

function StockManagement() {
  const { user } = useAuth();
  const { colorList } = useColorList();
  const { motorList } = useMotorList();
  const [stockList, setStockList] = useState([]);
  const [stock, setStock] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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
  const [isEdit, setIsEdit] = useState(false)

  const fetchAllStock = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerManagerApi.getStockList(
        user?.agencyId,
        {
          page,
          limit,
          colorId,
          motorbikeId,
        }
      );
      setStockList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStock();
  }, [page, limit, motorbikeId, colorId]);

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
    setSubmit(true);
    try {
      await PrivateDealerManagerApi.createStock(form);
      setForm({
        quantity: 0,
        price: 0,
        agencyId: user?.agencyId,
        motorbikeId: "",
        colorId: "",
      });
      toast.success("Create successfully");
      fetchAllStock();
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
      await PrivateDealerManagerApi.updateStock(selectedId, updateForm)
      toast.success('Update successfully')
      fetchAllStock()
      setFormModal(false)
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
      fetchAllStock()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const column = [
    { key: "id", title: "Id" },
    { key: "quantity", title: "Quantity" },
    {
      key: "price",
      title: "Price",
      render: (price) => {
        return `${price.toLocaleString()} $`;
      },
    },
    {
      key: "createAt",
      title: "Create date",
      render: (createAt) => dayjs(createAt).format("DD/MM/YYYY"),
    },
    {
      key: "updateAt",
      title: "Update date",
      render: (updateAt) => dayjs(updateAt).format("DD/MM/YYYY"),
    },
    {
      key: "action",
      title: "Action",
      render: (_, item) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setViewModal(true);
              fetchStockById(item.id);
            }}
            className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="View detail"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => {
              setIsEdit(true)
              setFormModal(true)
              setSelectedId(item.id)
              setUpdateForm(item)
            }}
            className="cursor-pointer text-white bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="Update"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => {
              setDeleteModal(true)
              setSelectedId(item.id)
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
            onClick={() => {setFormModal(true) 
              setIsEdit(false)}}
            className="bg-blue-500 hover:bg-blue-600 transition p-2 rounded-lg cursor-pointer text-white"
          >
            Create stock
          </button>
        </div>
      </div>
      <PaginationTable
        columns={column}
        data={stockList}
        loading={loading}
        page={page}
        setPage={setPage}
        pageSize={limit}
        title={"Stock management"}
        totalItem={totalItem}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update stock" : "Create stock"}
        isDelete={false}
        onSubmit={isEdit ? handleUpdateStock : handleCreateStock}
        isSubmitting={submit}
      >
        <StockForm
          colorList={colorList}
          form={form}
          motorbikeList={motorList}
          setForm={setForm}
          isEdit={isEdit}
          setUpdateForm={setUpdateForm}
          updateForm={updateForm}
        />
      </FormModal>

      <GroupModal
        data={stock}
        groupedFields={stockGroupedFields}
        isOpen={viewModal}
        loading={viewModalLoading}
        onClose={() => setViewModal(false)}
        title={"Stock info"}
        generalFields={stockGeneralFields}
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
