import React from "react";

function StockPromotionForm({
  form,
  setForm,
  isEdit,
  updateForm,
  setUpdateForm,
}) {
  const currentForm = isEdit ? updateForm : form;
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (type === "number") {
      processedValue = value ? Number(value) : 0;
    }

    if (processedValue === "") {
      processedValue = null;
    }

    {
      isEdit
        ? setUpdateForm((prevData) => ({
            ...prevData,
            [name]: processedValue,
          }))
        : setForm((prevData) => ({
            ...prevData,
            [name]: processedValue,
          }));
    }
  };
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={currentForm.name}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={currentForm.description}
          onChange={handleChange}
          className={`${inputClasses} h-24 resize-none`}
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={currentForm.status || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Select status --</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Value type <span className="text-red-500">*</span>
        </label>
        <select
          name="valueType"
          value={currentForm.valueType || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Select type --</option>
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Value <span className="text-red-500">*</span>
        </label>
        <input
          disabled={!currentForm.valueType}
          type="number"
          name="value"
          min={1}
          max={currentForm.valueType === "PERCENT" && 100}
          value={currentForm.value}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter discount value"
          required
        />
        {!currentForm.valueType && (
          <p className="text-red-500">Please choose the value type first</p>
        )}
        {currentForm.valueType === "PERCENT" && (
          <p className="text-gray-500">PERCENT: 1 - 100</p>
        )}
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Start date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="startAt"
          value={currentForm.startAt}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          End date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="endAt"
          value={currentForm.endAt}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>
    </div>
  );
}

export default StockPromotionForm;
