import React from "react";

function AppearanceForm({
  isEdit,
  appearanceForm,
  appearanceUpdateForm,
  setAppearanceForm,
  setAppearanceUpdateForm,
}) {
  const currentForm = isEdit ? appearanceUpdateForm : appearanceForm;

  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (type === "number") {
      processedValue = value ? Number(value) : 0;
    }

    if (isEdit) {
      setAppearanceUpdateForm((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
    } else {
      setAppearanceForm((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
    }
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Length <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="length"
            value={currentForm.length || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 1800"
            min="0"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Width <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="width"
            value={currentForm.width || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 700"
            min="0"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Height <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="height"
            value={currentForm.height || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 1080"
            min="0"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Weight <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="weight"
            value={currentForm.weight || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 120"
            min="0"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Undercarriage Distance <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="undercarriageDistance"
            value={currentForm.undercarriageDistance || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 160"
            min="0"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Storage Limit <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="storageLimit"
            value={currentForm.storageLimit || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., 20"
            min="0"
            required
          />
        </div>
      </div>
    </div>
  );
}

export default AppearanceForm;
