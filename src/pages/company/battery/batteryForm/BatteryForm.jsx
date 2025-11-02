import React from "react";

function BatteryForm({
  isEdit,
  batteryUpdateForm,
  batteryForm,
  setBatteryUpdateForm,
  setBatteryForm,
}) {
  const currentForm = isEdit ? batteryUpdateForm : batteryForm;

  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (processedValue === "") {
      processedValue = null;
    }

    const updateState = isEdit ? setBatteryUpdateForm : setBatteryForm;
    updateState((prevData) => ({ ...prevData, [name]: processedValue }));
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Type
          </label>
          <input
            type="text"
            name="type"
            value={currentForm.type}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Capacity (Ah)
          </label>
          <input
            type="text"
            name="capacity"
            value={currentForm.capacity}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 40 Ah"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Charge Time (Hours)
          </label>
          <input
            type="text"
            name="chargeTime"
            value={currentForm.chargeTime}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 6 - 8 hours"
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
            className={selectClasses}
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
            value={currentForm.energyConsumption}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 2 kWh / 100km"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Limit / Range
          </label>
          <input
            type="text"
            name="limit"
            value={currentForm.limit}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 100 km / charge"
          />
        </div>
      </div>
    </div>
  );
}

export default BatteryForm;
