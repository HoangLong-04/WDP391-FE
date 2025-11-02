import React from "react";

function OrderRestockForm({
  form,
  setForm,
  motorList,
  colorList,
  warehouseList,
  promoList,
  discountList,
}) {
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue;

    if (value === "") {
      processedValue = null;
    } else {
      const numericValue = Number(value);

      if (!isNaN(numericValue)) {
        processedValue = numericValue;
      } else {
        processedValue = value;
      }
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
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="quantity"
          value={form.quantity || 0}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter quantity"
          min="1"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Discount
        </label>
        <select
          name="discountId"
          value={form.discountId || ""}
          onChange={handleChange}
          className={selectClasses}
        >
          <option value="">-- Chọn Discount ID --</option>
          {discountList.map((d) => (
            <option value={d.id}>
              {d.name} - {d.id}
            </option>
          ))}
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Promotion
        </label>
        <select
          name="promotionId"
          value={form.promotionId || ""}
          onChange={handleChange}
          className={selectClasses}
        >
          <option value="">-- Chọn Promotion ID --</option>
          {promoList.map((d) => (
            <option value={d.id}>
              {d.name} - {d.description}
            </option>
          ))}
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Motorbike <span className="text-red-500">*</span>
        </label>
        <select
          name="motorbikeId"
          value={form.motorbikeId || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Chọn Motorbike ID --</option>
          {motorList.map((d) => (
            <option value={d.id}>
              {d.name} - {d.model}
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
          value={form.colorId || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Chọn Color ID --</option>
          {colorList.map((d) => (
            <option value={d.id}>{d.colorType}</option>
          ))}
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Warehouse <span className="text-red-500">*</span>
        </label>
        <select
          name="warehouseId"
          value={form.warehouseId || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="">-- Chọn Warehouse ID --</option>
          {warehouseList.map((d) => (
            <option value={d.id}>
              {d.location} - {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default OrderRestockForm;
