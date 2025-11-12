import { useState, useEffect } from "react";
import useColorList from "../../../../hooks/useColorList";

function ColorImageForm({ form, setForm }) {
  const { colorList } = useColorList();
  const [preview, setPreview] = useState(null);

  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      color_image: file,
    }));

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Color <span className="text-red-500">*</span>
        </label>
        <select
          name="colorId"
          value={form?.colorId || ""}
          onChange={handleSelectChange}
          className={selectClasses}
          required
        >
          <option value="" disabled>
            -- Select Color --
          </option>
          {colorList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.colorType}
            </option>
          ))}
        </select>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upload Photo/Image
        </label>
        <input
          type="file"
          name="color_image"
          onChange={handleFileChange}
          accept="image/jpeg, image/jpg"
          className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
        />

        {preview && (
          <div className="mt-3">
            <img
              src={preview}
              alt="Selected"
              className="w-48 h-32 object-cover rounded-lg border"
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default ColorImageForm;
