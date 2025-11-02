import React from "react";

function MotorForm({ setForm, form, isEdit, setUpdateForm, updateForm }) {
  const currentForm = isEdit ? updateForm : form;
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const textareaClasses = `${inputClasses} h-24 resize-none`;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (name === "price" && type === "number") {
      processedValue = value ? Number(value) : 0;
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
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={currentForm.name}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Price <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="price"
          value={currentForm.price || 0}
          onChange={handleChange}
          className={inputClasses}
          min={0}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={currentForm.description}
          onChange={handleChange}
          className={textareaClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Model <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="model"
          value={currentForm.model}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Made in <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="makeFrom"
          value={currentForm.makeFrom}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Vietnam"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Version <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="version"
          value={currentForm.version}
          onChange={handleChange}
          className={inputClasses}
          placeholder="2025"
          required
        />
      </div>
    </div>
  );
}

export default MotorForm;
