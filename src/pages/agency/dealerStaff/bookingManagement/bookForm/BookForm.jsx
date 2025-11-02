import React from "react";

function BookForm({form, setForm}) {
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

    setForm((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  };
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Fullname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullname"
          value={form.fullname}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drive Date */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Test Drive Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="driveDate"
            value={form.driveDate || ""}
            onChange={handleChange}
            className={inputClasses}
            title="Select the desired date"
            required
          />
        </div>

        {/* Drive Time */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Test Drive Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="driveTime"
            value={form.driveTime || ""}
            onChange={handleChange}
            className={inputClasses}
            title="Select the desired time"
            required
          />
        </div>
      </div>
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
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="CANCELED">CANCELED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>
    </div>
  );
}

export default BookForm;
