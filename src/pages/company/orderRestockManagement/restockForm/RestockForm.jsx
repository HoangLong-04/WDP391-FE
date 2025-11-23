import React from "react";

function RestockForm({form, setForm}) {
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    const processedValue = value === "" ? null : value;

    setForm((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  };
  return (
    <div className="space-y-4">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={form.status || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Select status --</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="PAID">PAID</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELED">CANCELED</option>
        </select>
      </div>
      {(form.status === "CANCELED" || form.note) && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Note {form.status === "CANCELED" && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name="note"
            value={form.note || ""}
            onChange={handleChange}
            className={inputClasses}
            rows={3}
            placeholder={form.status === "CANCELED" ? "Please provide a reason for cancellation" : "Optional note"}
            required={form.status === "CANCELED"}
          />
        </div>
      )}
    </div>
  );
}

export default RestockForm;
