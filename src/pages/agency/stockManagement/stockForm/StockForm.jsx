import React from "react";

function StockForm({
  form,
  setForm,
  motorbikeList,
  colorList,
  isEdit,
  updateForm,
  setUpdateForm,
  deliveredOrders = [],
  selectedDeliveredOrderId = "",
  selectedOrderItemId = "",
  loadingDelivered = false,
  onChangeDeliveredOrder,
  onChangeOrderItem,
  onPickDeliveredOrderItem,
  availableOrderItemsForUpdate = [],
  selectedOrderItemIdsForUpdate = [],
  onChangeOrderItemsForUpdate,
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
      // Allow 0 as valid value, only convert empty string to null
      if (value === "" || value === null || value === undefined) {
        processedValue = null;
      } else {
        const numValue = Number(value);
        processedValue = isNaN(numValue) ? null : numValue;
      }
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
      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Delivered order
          </label>
          {loadingDelivered ? (
            <div className="text-sm text-gray-500 italic">Loading orders...</div>
          ) : deliveredOrders.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No orders available</div>
          ) : (
            <select
              className={selectClasses}
              value={selectedDeliveredOrderId}
              onChange={(e) => onChangeDeliveredOrder && onChangeDeliveredOrder(e.target.value)}
            >
              <option value="">-- Select delivered order --</option>
              {deliveredOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} ({(o.items||[]).length} items)
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {!isEdit && selectedDeliveredOrderId && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Order item <span className="text-red-500">*</span>
          </label>
          <select
            className={selectClasses}
            value={selectedOrderItemId}
            onChange={(e) => {
              const id = e.target.value;
              if (onChangeOrderItem) onChangeOrderItem(id);
              if (!id) {
                setForm((prev) => ({
                  ...prev,
                  quantity: 0,
                  motorbikeId: "",
                  colorId: "",
                }));
                return;
              }
              const order = deliveredOrders.find((o) => String(o.id) === String(selectedDeliveredOrderId));
              const picked = order?.items?.find((it) => String(it.orderItemId) === String(id));
              if (picked && onPickDeliveredOrderItem) onPickDeliveredOrderItem(picked);
            }}
            required
          >
            <option value="">-- Select order item --</option>
            {deliveredOrders
              .find((o) => String(o.id) === String(selectedDeliveredOrderId))?.items?.map((it) => (
                <option key={it.orderItemId} value={it.orderItemId}>
                  #{it.orderItemId} - Qty: {it.quantity || 0} {it.motorbikeName ? `(${it.motorbikeName} - ${it.colorName || 'N/A'})` : ''}
                </option>
              ))}
          </select>
          {selectedOrderItemId && (
            <p className="text-xs text-gray-500 mt-1">
              Quantity from order-restock will be added to stock
            </p>
          )}
        </div>
      )}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Quantity In Stock <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="quantity"
          value={currentForm.quantity !== null && currentForm.quantity !== undefined ? currentForm.quantity : ""}
          onChange={handleChange}
          className={`${inputClasses} ${!isEdit && !selectedOrderItemId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder={!isEdit && !selectedOrderItemId ? "Select order item first" : "Enter stock quantity"}
          min="0"
          step="1"
          required
          disabled={!isEdit && !selectedOrderItemId}
          readOnly={!isEdit && selectedOrderItemId ? true : false}
        />
        {!isEdit && selectedOrderItemId && (
          <p className="text-xs text-gray-500 mt-1">
            This quantity is from the selected order-restock item (read-only)
          </p>
        )}
        {isEdit && availableOrderItemsForUpdate.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Available order-restock items to add:
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {availableOrderItemsForUpdate.map((item) => {
                const isSelected = selectedOrderItemIdsForUpdate.includes(String(item.orderItemId))
                
                return (
                  <label
                    key={item.orderItemId}
                    className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-blue-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (onChangeOrderItemsForUpdate) {
                          const itemId = String(item.orderItemId)
                          if (e.target.checked) {
                            onChangeOrderItemsForUpdate([...selectedOrderItemIdsForUpdate, itemId])
                          } else {
                            onChangeOrderItemsForUpdate(selectedOrderItemIdsForUpdate.filter(id => id !== itemId))
                          }
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        Order #{item.orderId} - Item #{item.orderItemId}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        Qty: {item.quantity} | {item.motorbikeName || 'N/A'} - {item.colorName || 'N/A'}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
            {selectedOrderItemIdsForUpdate.length > 0 && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-sm font-semibold text-green-600">
                  Total quantity to add: {availableOrderItemsForUpdate
                    .filter(item => selectedOrderItemIdsForUpdate.includes(String(item.orderItemId)))
                    .reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  New total quantity: {Number(currentForm.quantity || 0) + availableOrderItemsForUpdate
                    .filter(item => selectedOrderItemIdsForUpdate.includes(String(item.orderItemId)))
                    .reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
                </p>
              </div>
            )}
          </div>
        )}
        {isEdit && availableOrderItemsForUpdate.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            No available order-restock items with the same motorbike and color
          </p>
        )}
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Wholesale Price (đ) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="price"
          value={currentForm.price || ""}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter wholesale price"
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
            className={`${selectClasses} ${!selectedOrderItemId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!selectedOrderItemId}
          >
            <option value="">{selectedOrderItemId ? "-- Select Motorbike --" : "-- Select order item first --"}</option>
            {motorbikeList.map((motor) => (
              <option key={motor.id} value={motor.id}>
                {motor.name}
              </option>
            ))}
          </select>
          {selectedOrderItemId && (
            <p className="text-xs text-gray-500 mt-1">
              Auto-filled from order-restock item (read-only)
            </p>
          )}
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
            className={`${selectClasses} ${!selectedOrderItemId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!selectedOrderItemId}
          >
            <option value="">{selectedOrderItemId ? "-- Select Color --" : "-- Select order item first --"}</option>
            {colorList.map((color) => (
              <option key={color.id} value={color.id}>
                {color.colorType}
              </option>
            ))}
          </select>
          {selectedOrderItemId && (
            <p className="text-xs text-gray-500 mt-1">
              Auto-filled from order-restock item (read-only)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StockForm;
