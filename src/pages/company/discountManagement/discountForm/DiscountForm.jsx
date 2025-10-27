import React from "react";

function DiscountForm({
  formData,
  setFormData,
  motorList,
  agencyList,
  isEdit,
  updateForm,
  setUpdateForm,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (value === "null") {
      processedValue = null;
    }

    if (isEdit) {
      setUpdateForm((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
    }
  };

  const currentForm = isEdit ? updateForm : formData;
  const currentValueType = currentForm.value_type;
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Discount Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={isEdit ? updateForm.name : formData.name}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Name"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Discount Type <span className="text-red-500">*</span>
        </label>
        <select
          name="type"
          value={isEdit ? updateForm.type : formData.type}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Select Type --</option>
          <option value="SPECIAL">SPECIAL</option>
          <option value="VOLUME">VOLUME</option>
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Value Type <span className="text-red-500">*</span>
        </label>
        <select
          name="value_type"
          value={isEdit ? updateForm.value_type : formData.value_type}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Select Value Type --</option>
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Value <span className="text-red-500">*</span>
        </label>
        <input
          disabled={!currentValueType}
          type="number"
          name="value"
          min={1}
          max={currentValueType === "PERCENT" && 100}
          value={isEdit ? updateForm.value : formData.value}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter discount value"
          required
        />
        {!currentValueType && (
          <p className="text-red-500">Please choose the value type first</p>
        )}
        {currentValueType === "PERCENT" && (
          <p className="text-gray-500">PERCENT: 1 - 100</p>
        )}
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Min Quantity
        </label>
        <input
          type="number"
          name="min_quantity"
          min={0}
          value={isEdit ? updateForm.min_quantity : formData.min_quantity}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Minimum quantity required"
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={isEdit ? updateForm.status : formData.status}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Start Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="startAt"
          value={isEdit ? updateForm.startAt : formData.startAt}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          End Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="endAt"
          value={isEdit ? updateForm.endAt : formData.endAt}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Agency
        </label>
        <select
          disabled={isEdit}
          name="agencyId"
          value={isEdit ? updateForm.agencyId : formData.agencyId}
          onChange={handleChange}
          className={selectClasses}
        >
          <option value="">-- Select Agency --</option>
          {agencyList.map((agency) => (
            <option key={agency.id} value={agency.id}>
              {agency.name}
            </option>
          ))}
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Motorbike
        </label>
        <select
          disabled={isEdit}
          required
          name="motorbikeId"
          value={
            isEdit ? updateForm.motorbikeId || "" : formData.motorbikeId || ""
          }
          onChange={handleChange}
          className={selectClasses}
        >
          <option value="">-- Select Motorbike --</option>
          {motorList.map((motor) => (
            <option key={motor.id} value={motor.id}>
              {motor.name} - {motor.model}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default DiscountForm;
