import React from "react";

function StockForm({
  form,
  setForm,
  motorbikeList,
  colorList,
  isEdit,
  updateForm,
  setUpdateForm,
}) {
  const currentForm = isEdit ? updateForm : form;
  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (
      name === "agencyId" ||
      name === "motorbikeId" ||
      name === "colorId" ||
      name === "quantity" ||
      name === "price"
    ) {
      processedValue = value ? Number(value) : null;
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

  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Quantity In Stock <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="quantity"
          value={currentForm.quantity || ""}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter stock quantity"
          min="0"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Wholesale Price (USD) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="price"
          value={currentForm.price || ""}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter price"
          min="0"
          required
        />
      </div>

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Motorbike Model <span className="text-red-500">*</span>
          </label>
          <select
            name="motorbikeId"
            value={form.motorbikeId || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="">-- Select Motorbike --</option>
            {motorbikeList.map((motor) => (
              <option key={motor.id} value={motor.id}>
                {motor.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Color <span className="text-red-500">*</span>
          </label>
          <select
            name="colorId"
            value={form.colorId || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="">-- Select Color --</option>
            {colorList.map((color) => (
              <option key={color.id} value={color.id}>
                {color.colorType}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default StockForm;
