import React from "react";

function SafeFeatureForm({
  isEdit,
  safeFeatureForm,
  safeFeatureUpdateForm,
  setSafeFeatureUpdateForm,
  setSafeFeatureForm,
}) {
  const currentForm = isEdit ? safeFeatureUpdateForm : safeFeatureForm;

  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updateState = isEdit ? setSafeFeatureUpdateForm : setSafeFeatureForm;
    updateState((prevData) => ({ ...prevData, [name]: value }));
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Brake
          </label>
          <input
            type="text"
            name="brake"
            value={currentForm.brake}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Lock
          </label>
          <input
            type="text"
            name="lock"
            value={currentForm.lock}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
}

export default SafeFeatureForm;
