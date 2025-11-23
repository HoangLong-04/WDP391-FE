import React, { useEffect, useState } from "react";
import PublicApi from "../../../../../services/PublicApi";
import { Plus, Trash2 } from "lucide-react";

function OrderRestockForm({
  form,
  setForm,
  motorList,
  colorList,
  warehouseList,
  globalPromotions = [],
  promotionsByMotorbike = {},
  agencyDiscounts = [],
  discountsByMotorbike = {},
  onMotorbikeChange,
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
        // When changing motorbike, reset colorId, discountId, promotionId
        if (name === "motorbikeId") {
          const newItem = { ...item, motorbikeId: processedValue, colorId: null, discountId: null, promotionId: null };
          // Call callback to fetch promotions and discounts for the new motorbike
          if (onMotorbikeChange) {
            onMotorbikeChange(itemIndex, processedValue);
          }
          return newItem;
        }
        return { ...item, [name]: processedValue };
      }),
    }));
  };

  // Helper function to get promotions for an item
  const getPromotionsForItem = (itemIndex) => {
    const item = form.orderItems[itemIndex];
    const motorbikeId = item?.motorbikeId;
    
    const promotions = [];
    
    // Add global promotions (without motorbikeId)
    promotions.push(...globalPromotions.filter(p => !p.motorbikeId));
    
    // Add promotions for specific motorbike if selected
    if (motorbikeId && motorbikeId > 0 && promotionsByMotorbike[motorbikeId]) {
      promotions.push(...promotionsByMotorbike[motorbikeId]);
    }
    
    return promotions;
  };

  // Helper function to get discounts for an item
  const getDiscountsForItem = (itemIndex) => {
    const item = form.orderItems[itemIndex];
    const motorbikeId = item?.motorbikeId;
    
    const discounts = [];
    
    // Add agency discounts (may or may not have motorbikeId)
    // If motorbike is selected, only get agency discounts with null or matching motorbikeId
    if (motorbikeId && motorbikeId > 0) {
      discounts.push(...agencyDiscounts.filter(d => !d.motorbikeId || d.motorbikeId === motorbikeId));
    } else {
      discounts.push(...agencyDiscounts.filter(d => !d.motorbikeId));
    }
    
    // Add common discounts for specific motorbike if selected
    if (motorbikeId && motorbikeId > 0 && discountsByMotorbike[motorbikeId]) {
      discounts.push(...discountsByMotorbike[motorbikeId]);
    }
    
    return discounts;
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
          const availablePromotions = getPromotionsForItem(index);
          const availableDiscounts = getDiscountsForItem(index);
          const selectedMotorbike = motorList.find(m => m.id === orderItem.motorbikeId);
          
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
                      -- Select Motorbike --
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
                      {orderItem.motorbikeId && orderItem.motorbikeId !== 0 ? "-- Select Color --" : "-- Select Motorbike First --"}
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
                    disabled={!orderItem.motorbikeId || orderItem.motorbikeId === 0}
                  >
                    <option value="" disabled hidden>
                      {orderItem.motorbikeId && orderItem.motorbikeId !== 0 ? "-- Select Discount --" : "-- Select Motorbike First --"}
                    </option>
                    {availableDiscounts.length > 0 ? (
                      <>
                        {(() => {
                          const agencyDiscountsForItem = orderItem.motorbikeId && orderItem.motorbikeId > 0
                            ? agencyDiscounts.filter(d => !d.motorbikeId || d.motorbikeId === orderItem.motorbikeId)
                            : agencyDiscounts.filter(d => !d.motorbikeId);
                          return agencyDiscountsForItem.length > 0 && (
                            <optgroup label="Discount for Agency">
                              {agencyDiscountsForItem.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })()}
                        {orderItem.motorbikeId && orderItem.motorbikeId > 0 && discountsByMotorbike[orderItem.motorbikeId]?.length > 0 && (
                          <optgroup label="Common Discount">
                            {discountsByMotorbike[orderItem.motorbikeId].map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    ) : (
                      <option value="" disabled>
                        No discount available
                      </option>
                    )}
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
                      -- Select Promotion --
                    </option>
                    {availablePromotions.length > 0 ? (
                      <>
                        {globalPromotions.filter(p => !p.motorbikeId).length > 0 && (
                          <optgroup label="Global Promotion">
                            {globalPromotions.filter(p => !p.motorbikeId).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {orderItem.motorbikeId && orderItem.motorbikeId > 0 && promotionsByMotorbike[orderItem.motorbikeId]?.length > 0 && (
                          <optgroup label={`Promotion for ${selectedMotorbike?.name || 'Selected Motorbike'}`}>
                            {promotionsByMotorbike[orderItem.motorbikeId].map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    ) : (
                      <option value="" disabled>
                        No promotion available
                      </option>
                    )}
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
