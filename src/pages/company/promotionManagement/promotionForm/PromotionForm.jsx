
const inputClasses =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;
function PromotionForm({
  form,
  setForm,
  motorList,
  isEdit,
  updateForm,
  setUpdateForm,
}) {
  const currentForm = isEdit ? updateForm : form;
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={currentForm.name}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, name: e.target.value })
              : setForm({ ...form, name: e.target.value });
          }}
          className={inputClasses}
          placeholder="Enter name"
          required
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={currentForm.description}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, description: e.target.value })
              : setForm({ ...form, description: e.target.value });
          }}
          className={`${inputClasses} h-24 resize-y`}
          placeholder="Enter a detailed description"
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Value Type <span className="text-red-500">*</span>
        </label>
        <select
          name="value_type"
          value={currentForm.value_type}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, value_type: e.target.value })
              : setForm({ ...form, value_type: e.target.value });
          }}
          className={selectClasses}
          required
        >
          <option value="">-- Select Value Type --</option>
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
        </select>
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Value <span className="text-red-500">*</span>
        </label>
        <input
          disabled={!currentForm.value_type}
          type="number"
          name="value"
          min={1}
          max={currentForm.value_type === "PERCENT" && 100}
          value={currentForm.value}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, value: e.target.value })
              : setForm({ ...form, value: e.target.value });
          }}
          className={inputClasses}
          placeholder="Enter discount value"
          required
        />
        {!currentForm.value_type && (
          <p className="text-red-500">Please choose the value type first</p>
        )}
        {currentForm.value_type === "PERCENT" && (
          <p className="text-gray-500">PERCENT: 1 - 100</p>
        )}
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Start Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="startAt"
          value={currentForm.startAt}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, startAt: e.target.value })
              : setForm({ ...form, startAt: e.target.value });
          }}
          className={inputClasses}
          required
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          End Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="endAt"
          value={currentForm.endAt}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, endAt: e.target.value })
              : setForm({ ...form, endAt: e.target.value });
          }}
          className={inputClasses}
          required
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={currentForm.status}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, status: e.target.value })
              : setForm({ ...form, status: e.target.value });
          }}
          className={selectClasses}
          required
        >
          <option value="">-- Select Value Type --</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Motorbike
        </label>
        <select
          disabled={isEdit}
          name="motorbikeId"
          value={currentForm.motorbikeId || ""}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, motorbikeId: e.target.value })
              : setForm({ ...form, motorbikeId: e.target.value });
          }}
          className={selectClasses}
        >
          <option value="">-- Select Motorbike --</option>
          <option value="ALL">All</option>
          {motorList.map((motor) => (
            <option key={motor.id} value={motor.id}>
              {motor.name} - {motor.model}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
export default PromotionForm;
