import React, { useEffect, useState } from "react";
import PublicApi from "../../../../../services/PublicApi";

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
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none shadow-sm text-gray-800`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "orderType") {
      setForm((prevData) => ({
        ...prevData,
        orderType: value,
      }));
      return;
    }

    // Cập nhật orderItem đầu tiên (chỉ hỗ trợ 1 item hiện tại)
    const orderItemIndex = 0;
    let processedValue;

    if (value === "") {
      processedValue = name === "quantity" ? 0 : null;
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
      orderItems: prevData.orderItems.map((item, idx) => {
        if (idx !== orderItemIndex) return item;
        // Khi đổi xe, reset colorId và danh sách màu
        if (name === "motorbikeId") {
          setColorOptions([]);
          return { ...item, motorbikeId: processedValue, colorId: null };
        }
        return { ...item, [name]: processedValue };
      }),
    }));
  };

  const getOrderItem = () => {
    return form.orderItems[0] || {};
  };
  const orderItem = getOrderItem();

  const [colorOptions, setColorOptions] = useState([]);

  useEffect(() => {
    const loadColors = async () => {
      if (!orderItem.motorbikeId || orderItem.motorbikeId === 0) {
        setColorOptions([]);
        return;
      }
      try {
        const res = await PublicApi.getMotorDetailForUser(orderItem.motorbikeId);
        const detail = res?.data?.data || res?.data;
        const colors = detail?.colors || [];
        // Extract color objects from colors array (structure: { color: { id, colorType }, imageUrl })
        const colorList = colors.map((item) => ({
          id: item.color?.id || item.id,
          colorType: item.color?.colorType || item.colorType,
        }));
        setColorOptions(colorList);
      } catch (err) {
        console.error("Error loading colors:", err);
        setColorOptions([]);
      }
    };
    loadColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItem.motorbikeId]);

  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Order Type <span className="text-red-500">*</span>
        </label>
        <select
          name="orderType"
          value={form.orderType || "FULL"}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="FULL">FULL</option>
          <option value="DEFERRED">DEFERRED</option>
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="quantity"
          value={orderItem.quantity || 0}
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
          value={orderItem.discountId || ""}
          onChange={handleChange}
          className={selectClasses}
        >
          <option value="" disabled hidden>
            -- Chọn Discount --
          </option>
          {discountList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
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
          value={orderItem.promotionId || ""}
          onChange={handleChange}
          className={selectClasses}
        >
          <option value="" disabled hidden>
            -- Chọn Promotion --
          </option>
          {promoList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
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
          value={orderItem.motorbikeId || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="" disabled hidden>
            -- Chọn Motorbike --
          </option>
          {motorList.map((d) => (
            <option key={d.id} value={d.id}>
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
          value={orderItem.colorId || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="" disabled hidden>
            -- Chọn Color --
          </option>
          {colorOptions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.colorType}
            </option>
          ))}
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Warehouse <span className="text-red-500">*</span>
        </label>
        <select
          name="warehouseId"
          value={orderItem.warehouseId || ""}
          onChange={handleChange}
          className={selectClasses}
          required
        >
          <option value="" disabled hidden>
            -- Chọn Warehouse --
          </option>
          {warehouseList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.location} - {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default OrderRestockForm;
