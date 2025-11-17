import React from "react";

function ContractForm({
  form,
  setForm,
  isEdit,
  customerList,
  staffList,
  motorbikeList,
  colorList,
  updateForm,
  setUpdateForm,
}) {
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const currentForm = isEdit ? updateForm : form;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (type === "number") {
      processedValue = value ? Number(value) : 0;
    }

    if (processedValue === "") {
      processedValue = null;
    }

    {
      isEdit
        ? setUpdateForm((prevData) => ({
            ...prevData,
            [name]: processedValue,
          }))
        : setForm((prevData) => ({
            ...prevData,
            [name]: processedValue,
          }));
    }
  };
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={currentForm.title}
          onChange={handleChange}
          className={inputClasses}
          placeholder="e.g., Contract for Model X - Agency 1"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Content
        </label>
        <textarea
          name="content"
          value={currentForm.content}
          onChange={handleChange}
          className={`${inputClasses} h-24 resize-none`}
          placeholder="Detailed content or notes for the contract."
        />
      </div>

      {isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sign Date
          </label>
          <input
            type="date"
            name="signDate"
            value={currentForm.signDate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      )}

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Delivery Date
        </label>
        <input
          type="date"
          name="deliveryDate"
          value={currentForm.deliveryDate}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="finalPrice"
            value={currentForm.finalPrice || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Total value of the contract"
            min={1}
            required
          />
        </div>
      )}

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deposit Amount
          </label>
          <input
            type="number"
            name="depositAmount"
            value={currentForm.depositAmount || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Amount deposited by the customer"
            min={0}
          />
        </div>
      )}

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Payment Type {!isEdit && <span className="text-red-500">*</span>}
        </label>
        <select
          name="contractPaidType"
          value={currentForm.contractPaidType || ""}
          onChange={handleChange}
          className={selectClasses}
          required={!isEdit}
        >
          <option value="">-- Select Payment Type --</option>
          <option value="FULL">FULL</option>
          <option value="DEBT">DEBT</option>
        </select>
      </div>

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={currentForm.status || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="">-- Select Status --</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      )}

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            name="customerId"
            value={form.customerId || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="">-- Select Customer --</option>
            {customerList.map((customer) => (
              <option value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
      )}

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Staff/Sales Person <span className="text-red-500">*</span>
          </label>
          <select
            name="staffId"
            value={form.staffId || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="">-- Select Staff --</option>
            {staffList.map((staff) => (
              <option value={staff.id}>{staff.fullname}</option>
            ))}
          </select>
        </div>
      )}

      {!isEdit && (
        <>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Electric Motorbike <span className="text-red-500">*</span>
            </label>
            <select
              name="electricMotorbikeId"
              value={currentForm.electricMotorbikeId || ""}
              onChange={handleChange}
              className={selectClasses}
              required
            >
              <option value="">-- Select Motorbike --</option>
              {motorbikeList.map((motor) => (
                <option value={motor.id}>
                  {motor.name} - {motor.model}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color <span className="text-red-500">*</span>
            </label>
            <select
              name="colorId"
              value={currentForm.colorId || ""}
              onChange={handleChange}
              className={selectClasses}
              required
            >
              <option value="">-- Select Color --</option>
              {colorList.map((color) => (
                <option value={color.id}>{color.colorType}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default ContractForm;
