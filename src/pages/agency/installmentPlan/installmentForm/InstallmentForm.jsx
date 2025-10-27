import React from "react";

function InstallmentForm({ form, setForm, isEdit, setUpdateForm, updateForm }) {
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const currentForm = isEdit ? updateForm : form

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
          Interest rate <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="interestRate"
          value={currentForm.interestRate || 0}
          onChange={handleChange}
          className={inputClasses}
          min={0}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Interest type <span className="text-red-500">*</span>
        </label>
        <select
          name="interestPaidType"
          value={currentForm.interestPaidType || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Select interest type --</option>
          <option value="FLAT">FLAT</option>
          <option value="DECLINING">DECLINING</option>
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pre-paid percent <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="prePaidPercent"
          value={currentForm.prePaidPercent || 0}
          onChange={handleChange}
          className={inputClasses}
          min={1}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Process fee
        </label>
        <input
          type="number"
          name="processFee"
          value={currentForm.processFee || 0}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Ví dụ: 500"
          min="0"
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Total paid month <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="totalPaidMonth"
          value={currentForm.totalPaidMonth || 0}
          onChange={handleChange}
          className={inputClasses}
          min="1"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Interest rate total month <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="interestRateTotalMonth"
          value={currentForm.interestRateTotalMonth || 0}
          onChange={handleChange}
          className={inputClasses}
          min="0"
          required
        />
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

export default InstallmentForm;
