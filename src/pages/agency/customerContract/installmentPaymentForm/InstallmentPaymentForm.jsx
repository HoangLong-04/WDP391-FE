import React from "react";

function InstallmentPaymentForm({ form, setForm }) {
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    const newValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;

    setForm({
      ...form,
      [name]: newValue,
    });
  };

  return (
    <div>
      <div className="group">
        <label
          htmlFor="dueDate"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Due date <span className="text-red-500">*</span>
        </label>
        <input
          id="dueDate"
          type="date"
          name="dueDate"
          value={form.dueDate || ""}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="group mt-4">
        {" "}
        {/* Thêm margin top để tách biệt 2 nhóm */}
        <label
          htmlFor="penaltyAmount"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Penalty <span className="text-red-500">*</span>
        </label>
        <input
          id="penaltyAmount"
          type="number"
          name="penaltyAmount"
          value={
            form.penaltyAmount === null || form.penaltyAmount === undefined
              ? ""
              : form.penaltyAmount
          }
          onChange={handleChange}
          required
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}

export default InstallmentPaymentForm;
