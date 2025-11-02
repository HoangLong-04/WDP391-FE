import React from "react";

function ConfigurationForm({
  configForm,
  setConfigForm,
  isEdit,
  configUpdateForm,
  setConfigUpdateForm,
}) {
  const currentForm = isEdit ? configUpdateForm : configForm;
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (name === "maximumCapacity" && type === "number") {
      processedValue = value ? Number(value) : 0;
    }

    if (processedValue === "") {
      processedValue = null;
    }

    {
      isEdit
        ? setConfigUpdateForm((prevData) => ({
            ...prevData,
            [name]: processedValue,
          }))
        : setConfigForm((prevData) => ({
            ...prevData,
            [name]: processedValue,
          }));
    }
  };
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Motor type
        </label>
        <input
          type="text"
          name="motorType"
          value={currentForm.motorType || ''}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>
      {/* Speed Limit (Giới hạn Tốc độ) */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Speed limit
        </label>
        <input
          type="text"
          name="speedLimit"
          value={currentForm.speedLimit || ''}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Maximum capacity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="maximumCapacity"
          value={currentForm.maximumCapacity || 0}
          onChange={handleChange}
          className={inputClasses}
          min="0"
          required
        />
      </div>
    </div>
  );
}

export default ConfigurationForm;
