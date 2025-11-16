import React from "react";

function CreditLineForm({ form, setForm, agencyList, isEdit }) {
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (type === "number" || name === "agencyId") {
      processedValue = value ? Number(value) : null;
    }

    if (processedValue === "") {
      processedValue = null;
    }

    setForm((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  };
  return (
    <div className="space-y-3">
      <div className="group">
        <label
          className="block text-sm font-semibold text-gray-700 mb-2"
          htmlFor="creditLimit"
        >
          Credit Limit <span className="text-red-500">*</span>
        </label>
        <input
          id="creditLimit"
          type="number"
          name="creditLimit"
          value={form?.creditLimit || ""}
          onChange={handleChange}
          className={inputClasses}
          placeholder="e.g., 500000"
          min="1"
          required
        />
      </div>

      <div className="group">
        <label
          className="block text-sm font-semibold text-gray-700 mb-2"
          htmlFor="warningThreshold"
        >
          Warning Threshold <span className="text-red-500">*</span>
        </label>
        <input
          id="warningThreshold"
          type="number"
          name="warningThreshold"
          value={form?.warningThreshold || ""}
          onChange={handleChange}
          className={inputClasses}
          min="1"
          max='100'
          required
        />
      </div>

      <div className="group">
        <label
          className="block text-sm font-semibold text-gray-700 mb-2"
          htmlFor="overDueThreshHoldDays"
        >
          Overdue Threshold Days <span className="text-red-500">*</span>
        </label>
        <input
          id="overDueThreshHoldDays"
          type="number"
          name="overDueThreshHoldDays"
          value={form?.overDueThreshHoldDays || ""}
          onChange={handleChange}
          className={inputClasses}
          placeholder="e.g., 30"
          min="0"
          required
        />
      </div>

      {!isEdit && (
        <div className="group">
          <label
            className="block text-sm font-semibold text-gray-700 mb-2"
            htmlFor="agencyId"
          >
            Agency <span className="text-red-500">*</span>
          </label>
          <select
            id="agencyId"
            name="agencyId"
            value={form?.agencyId || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="" disabled>
              -- Select Agency --
            </option>
            {agencyList &&
              agencyList.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {isEdit && (
        <div className="group">
          <label
            className="block text-sm font-semibold text-gray-700 mb-2"
            htmlFor="isBlocked"
          >
            Block <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              id="isBlocked"
              type="checkbox"
              name="isBlocked"
              checked={form?.isBlocked || false}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isBlocked: e.target.checked,
                }))
              }
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-gray-700">Blocked</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditLineForm;
