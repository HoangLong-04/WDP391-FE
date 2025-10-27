const inputClasses =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
function DealerStaffForm({ form, setForm, isEdit, setUpdateForm, updateForm }) {
  const currentForm = isEdit ? updateForm : form;
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
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
          Username <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="username"
          value={currentForm.username}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter username"
          required
        />
      </div>

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Enter password"
            required
          />
        </div>
      )}

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullname"
          value={currentForm.fullname}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter full name"
          required
        />
      </div>

      {/* Email */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={currentForm.email}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter email address"
          required
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={currentForm.phone}
          onChange={handleChange}
          className={inputClasses}
          placeholder="+84..."
        />
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Address
        </label>
        <input
          type="text"
          name="address"
          value={currentForm.address}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter address"
        />
      </div>
    </div>
  );
}

export default DealerStaffForm;
