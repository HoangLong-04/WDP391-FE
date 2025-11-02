import React from "react";

function MotorImageForm({ motorImage, setMotorImage }) {
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setMotorImage(files);
  };
  return (
    <div>
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Motorbike Image File
        </label>
        <input
          multiple
          type="file"
          name="motorImage"
          onChange={handleImageChange}
          accept="image/jpeg, image/png"
          className={inputClasses}
        />
      </div>

      {motorImage?.length > 0 && (
  <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
    <h4 className="font-semibold text-sm text-gray-700 mb-2">
      Image Preview:
    </h4>
    <div className="flex flex-wrap gap-4">
      {motorImage?.map((file, index) => (
        <img
          key={index}
          src={URL.createObjectURL(file)}
          alt={`Preview ${index}`}
          className="w-45 object-contain border rounded-lg shadow-md"
        />
      ))}
    </div>
  </div>
)}

    </div>
  );
}

export default MotorImageForm;
