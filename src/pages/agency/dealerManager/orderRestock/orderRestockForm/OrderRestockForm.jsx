import React, { useEffect, useState } from "react";
import PublicApi from "../../../../../services/PublicApi";
import { Plus, Trash2 } from "lucide-react";

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

  const handleChange = (e, itemIndex) => {
    const { name, value } = e.target;

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
        if (idx !== itemIndex) return item;
        // Khi đổi xe, reset colorId
        if (name === "motorbikeId") {
          return { ...item, motorbikeId: processedValue, colorId: null };
        }
        return { ...item, [name]: processedValue };
      }),
    }));
  };

  const handleAddItem = () => {
    setForm((prevData) => ({
      ...prevData,
      orderItems: [
        ...prevData.orderItems,
        {
          quantity: 0,
          discountId: null,
          promotionId: null,
          motorbikeId: 0,
          colorId: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (form.orderItems.length <= 1) {
      return; // Keep at least one item
    }
    setForm((prevData) => ({
      ...prevData,
      orderItems: prevData.orderItems.filter((_, idx) => idx !== index),
    }));
  };

  const [colorOptionsMap, setColorOptionsMap] = useState(new Map()); // Map itemIndex -> colorOptions

  // Load colors for each order item when motorbikeId changes
  useEffect(() => {
    const loadColorsForItems = async () => {
      const newColorOptionsMap = new Map();
      
      for (let i = 0; i < form.orderItems.length; i++) {
        const item = form.orderItems[i];
        if (!item.motorbikeId || item.motorbikeId === 0) {
          newColorOptionsMap.set(i, []);
          continue;
        }
        
        try {
          const res = await PublicApi.getMotorDetailForUser(item.motorbikeId);
          const detail = res?.data?.data || res?.data;
          const colors = detail?.colors || [];
          // Extract color objects from colors array
          const colorList = colors.map((colorItem) => ({
            id: colorItem.color?.id || colorItem.id,
            colorType: colorItem.color?.colorType || colorItem.colorType,
          }));
          newColorOptionsMap.set(i, colorList);
        } catch (err) {
          console.error(`Error loading colors for item ${i}:`, err);
          newColorOptionsMap.set(i, []);
        }
      }
      
      setColorOptionsMap(newColorOptionsMap);
    };
    
    loadColorsForItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.orderItems.map(item => item.motorbikeId).join(',')]);

  return (
    <div className="space-y-4">
      {/* Order Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Order Items <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {form.orderItems.map((orderItem, index) => {
          const colorOptions = colorOptionsMap.get(index) || [];
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Item #{index + 1}</h4>
                {form.orderItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={orderItem.quantity || 0}
                    onChange={(e) => handleChange(e, index)}
                    className={inputClasses}
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motorbike <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="motorbikeId"
                    value={orderItem.motorbikeId || ""}
                    onChange={(e) => handleChange(e, index)}
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
                    onChange={(e) => handleChange(e, index)}
                    className={selectClasses}
                    required
                    disabled={!orderItem.motorbikeId || orderItem.motorbikeId === 0}
                  >
                    <option value="" disabled hidden>
                      {orderItem.motorbikeId && orderItem.motorbikeId !== 0 ? "-- Chọn Color --" : "-- Chọn Motorbike trước --"}
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
                    Discount
                  </label>
                  <select
                    name="discountId"
                    value={orderItem.discountId || ""}
                    onChange={(e) => handleChange(e, index)}
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
                    onChange={(e) => handleChange(e, index)}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderRestockForm;
