import React from "react";

function CustomerForm({ form, setForm, updateForm, setUpdateForm, isEdit }) {
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const textareaClasses = `${inputClasses} h-20 resize-none`;

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
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={currentForm.name}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Enter customer's full name"
          required
        />
      </div>

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
          placeholder="e.g., example@domain.com"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={currentForm.phone}
          onChange={handleChange}
          className={inputClasses}
          placeholder="e.g., 0901234567"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ID/Credential Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="credentialId"
          value={currentForm.credentialId}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="dob"
          value={currentForm.dob}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Address
        </label>
        <textarea
          name="address"
          value={currentForm.address}
          onChange={handleChange}
          className={textareaClasses}
          placeholder="Enter full residential address"
        />
      </div>
    </div>
  );
}

export default CustomerForm;
