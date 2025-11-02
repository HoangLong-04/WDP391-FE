import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import FormModal from "../../../components/modal/formModal/FormModal";

function ColorManagement() {
  const [colorList, setColorList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);

  const [form, setForm] = useState({
    colorType: "",
  });

  const [formModal, setFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false)

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const fetchColorList = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getColorList();
      setColorList(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColorList();
  }, []);

  const handleCreateColor = async (e) => {
    setSubmit(true);
    e.preventDefault();
    try {
      await PrivateAdminApi.createColor(form);
      setFormModal(false);
      setForm({
        colorType: "",
      });
      toast.success("Create successfully");
      fetchColorList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleDeleteColor = async (e) => {
    setSubmit(true)
    e.preventDefault()
    try {
      await PrivateAdminApi.deleteColor(selectedId)
      toast.success('Delete successfully')
      setDeleteModal(false)
      fetchColorList()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmit(false)
    }
  }

  const columns = [
    { key: "id", title: "Id" },
    { key: "colorType", title: "Color" },
    {
      key: "action1",
      title: "Delete",
      render: (_, item) => (
        <span
          onClick={() => {
            setSelectedId(item.id)
            setDeleteModal(true)
          }}
          className="cursor-pointer bg-red-500 rounded-lg flex justify-center items-center w-[50%] text-white p-2"
        >
          Delete
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end gap-5 my-3">
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsEdit(false);
            }}
            className="p-2 rounded-lg cursor-pointer bg-blue-500 hover:bg-blue-600 transition text-white"
          >
            Create color
          </button>
        </div>
      </div>
      <PaginationTable
        columns={columns}
        data={colorList}
        loading={loading}
        page={1}
        pageSize={10}
      />

      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={isEdit ? "Update color" : "Create color"}
        isDelete={false}
        onSubmit={handleCreateColor}
        isSubmitting={submit}
      >
        <div className="space-y-3">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="color"
              value={form.colorType}
              onChange={(e) => setForm({ ...form, colorType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>
        </div>
      </FormModal>
      <FormModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onSubmit={handleDeleteColor}
        isSubmitting={submit}
        title={"Confirm delete"}
        isDelete={true}
      >
        <p className="text-gray-700">
          Are you sure you want to delete this color? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default ColorManagement;
