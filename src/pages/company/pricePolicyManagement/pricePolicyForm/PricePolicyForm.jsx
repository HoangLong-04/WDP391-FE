const inputClasses =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

function PricePolicyForm({
  form,
  setForm,
  motorList,
  agencyList,
  isEdit,
  updateForm,
  setUpdateForm,
}) {
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          disabled={isEdit}
          type="text"
          name="title"
          value={isEdit ? updateForm.title : form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputClasses}
          placeholder="Enter title"
          required
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          disabled={isEdit}
          name="content"
          value={isEdit ? updateForm.content : form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className={`${inputClasses} h-32 resize-y`}
          placeholder="Enter detailed content"
          required
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Policy
        </label>
        <input
          type="text"
          name="policy"
          value={isEdit ? updateForm.policy : form.policy}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, policy: e.target.value })
              : setForm({ ...form, policy: e.target.value });
          }}
          className={inputClasses}
          placeholder="Enter policy details"
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Wholesale Price <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="wholesalePrice"
          min={0}
          value={isEdit ? updateForm.wholesalePrice : form.wholesalePrice}
          onChange={(e) => {
            isEdit
              ? setUpdateForm({ ...updateForm, wholesalePrice: e.target.value })
              : setForm({ ...form, wholesalePrice: e.target.value });
          }}
          className={inputClasses}
          placeholder="Enter price"
          required
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Agency <span className="text-red-500">*</span>
        </label>
        <select
          disabled={isEdit}
          name="agencyId"
          value={isEdit ? updateForm.agencyId : form.agencyId}
          onChange={(e) => {
            // Chuyển chuỗi thành số hoặc null
            const value = e.target.value;
            setForm({
              ...form,
              agencyId: value ? Number(value) : null,
            });
          }}
          className={selectClasses}
          required
        >
          <option value="">-- Select Agency --</option>
          {agencyList.map((agency) => (
            <option key={agency.id} value={agency.id}>
              {agency.name}
            </option>
          ))}
        </select>
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Motorbike <span className="text-red-500">*</span>
        </label>
        <select
          disabled={isEdit}
          name="motorbikeId"
          value={isEdit ? updateForm.motorbikeId : form.motorbikeId}
          onChange={(e) => {
            const value = e.target.value;
            setForm({
              ...form,
              motorbikeId: value ? Number(value) : null,
            });
          }}
          className={selectClasses}
          required
        >
          <option value="">-- Select Motorbike --</option>
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

export default PricePolicyForm;
