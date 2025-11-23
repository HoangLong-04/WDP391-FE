import React from "react";

function MotorForm({ setForm, form, isEdit, setUpdateForm, updateForm }) {
  const currentForm = isEdit ? updateForm : form;
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const textareaClasses = `${inputClasses} h-24 resize-none`;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (name === "price" && type === "number") {
      processedValue = value ? Number(value) : 0;
    } else if (type === "number" && (name.includes("length") || name.includes("width") || name.includes("height") || name.includes("weight") || name.includes("undercarriageDistance") || name.includes("storageLimit") || name.includes("maximumCapacity"))) {
      processedValue = value ? Number(value) : 0;
    }

    if (isEdit) {
      setUpdateForm((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
    } else {
      setForm((prevData) => ({
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
          Price <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="price"
          value={currentForm.price || 0}
          onChange={handleChange}
          className={inputClasses}
          min={0}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={currentForm.description}
          onChange={handleChange}
          className={textareaClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Model <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="model"
          value={currentForm.model}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Made in <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="makeFrom"
          value={currentForm.makeFrom}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Vietnam"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Version <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="version"
          value={currentForm.version}
          onChange={handleChange}
          className={inputClasses}
          placeholder="2025"
          required
        />
      </div>

      {/* Configuration Section */}
      {!isEdit && (
        <>
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motor Type
                </label>
                <input
                  type="text"
                  name="motorType"
                  value={currentForm.motorType || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., Brushless DC"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Speed Limit
                </label>
                <input
                  type="text"
                  name="speedLimit"
                  value={currentForm.speedLimit || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., 80km/h"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Capacity
                </label>
                <input
                  type="number"
                  name="maximumCapacity"
                  value={currentForm.maximumCapacity || 0}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Length (mm)
                </label>
                <input
                  type="number"
                  name="length"
                  value={currentForm.length || 0}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Width (mm)
                </label>
                <input
                  type="number"
                  name="width"
                  value={currentForm.width || 0}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Height (mm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={currentForm.height || 0}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={currentForm.weight || 0}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Undercarriage Distance (mm)
                </label>
                <input
                  type="number"
                  name="undercarriageDistance"
                  value={currentForm.undercarriageDistance || 0}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Storage Limit (L)
                </label>
                <input
                  type="number"
                  name="storageLimit"
                  value={currentForm.storageLimit || 0}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Battery Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Battery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={currentForm.type || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., Lithium-ion"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="text"
                  name="capacity"
                  value={currentForm.capacity || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., 60V 30Ah"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Charge Time
                </label>
                <input
                  type="text"
                  name="chargeTime"
                  value={currentForm.chargeTime || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., 4 hours"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Charge Type
                </label>
                <select
                  name="chargeType"
                  value={currentForm.chargeType || ""}
                  onChange={handleChange}
                  className={`${inputClasses} bg-white cursor-pointer appearance-none`}
                >
                  <option value="">-- Select Charge Type --</option>
                  <option value="Slow">Slow (Standard)</option>
                  <option value="Fast">Fast Charging</option>
                </select>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Energy Consumption
                </label>
                <input
                  type="text"
                  name="energyConsumption"
                  value={currentForm.energyConsumption || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., 1.7kWh/100km"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Limit / Range
                </label>
                <input
                  type="text"
                  name="limit"
                  value={currentForm.limit || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., 130km"
                />
              </div>
            </div>
          </div>

          {/* Safe Feature Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Safe Feature</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brake
                </label>
                <input
                  type="text"
                  name="brake"
                  value={currentForm.brake || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., Disc"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lock
                </label>
                <input
                  type="text"
                  name="lock"
                  value={currentForm.lock || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g., Smart Lock"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MotorForm;
