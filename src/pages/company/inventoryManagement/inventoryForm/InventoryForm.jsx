import React from "react";

function InventoryForm({
  form,
  setForm,
  motorList,
  warehouseList,
  isEdit,
  setUpdateForm,
  updateForm,
}) {
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          value={isEdit ? updateForm.quantity : form.quantity}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, quantity: e.target.value })
              : setForm({ ...form, quantity: e.target.value });
          }}
          min={1}
          type="number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Stock date <span className="text-red-500">*</span>
        </label>
        <input
          value={isEdit ? updateForm.stockDate : form.stockDate}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, stockDate: e.target.value })
              : setForm({ ...form, stockDate: e.target.value });
          }}
          type="date"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Motorbike <span className="text-red-500">*</span>
        </label>
        <select
          disabled={isEdit}
          value={isEdit ? updateForm.motorId : form.motorId}
          onChange={(e) => setForm({ ...form, motorId: e.target.value })}
          className={`w-full ${
            isEdit && "bg-gray-500"
          } px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 bg-white cursor-pointer appearance-none`}
        >
          {motorList.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} - {m.version} - {m.model}
            </option>
          ))}
        </select>
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Warehouse <span className="text-red-500">*</span>
        </label>
        <select
          disabled={isEdit}
          value={isEdit ? updateForm.warehouseId : form.warehouseId}
          onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
          className={`w-full ${
            isEdit && "bg-gray-500"
          } px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 bg-white cursor-pointer appearance-none`}
        >
          {warehouseList.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} - {w.location} - {w.address}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default InventoryForm;
