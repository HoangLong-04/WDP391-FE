import { useEffect, useState } from "react";

function BikeSlide({ colors }) {
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColorType, setSelectedColorType] = useState("");

  useEffect(() => {
    if (colors && colors.length > 0) {
      setSelectedImage(colors[0].imageUrl);
      setSelectedColorType(colors[0].color.colorType);
    }
  }, [colors]);

  const getTailwindColorClass = (colorType) => {
    switch (colorType.toLowerCase()) {
      case "red": return "bg-red-500";
      case "black": return "bg-gray-900";
      case "grey": return "bg-gray-500";
      case "blue": return "bg-blue-600";
      case "white": return "bg-white border border-gray-300";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* IMAGE BOX */}
      <div className="w-full h-64 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
        {selectedImage ? (
          <img
            src={selectedImage}
            className="object-contain w-full h-full"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>

      {/* COLOR PICKER */}
      {colors?.length > 0 && (
        <div className="flex justify-center gap-3">
          {colors.map((item, i) => (
            <button
              key={i}
              onClick={() =>
                setSelectedImage(item.imageUrl) ||
                setSelectedColorType(item.color.colorType)
              }
              className={`
                w-9 h-9 rounded-full border shadow-md
                hover:scale-110 transition-all duration-200
                ${getTailwindColorClass(item.color.colorType)}
                ${
                  selectedColorType === item.color.colorType
                    ? "ring-4 ring-blue-500 ring-offset-2"
                    : ""
                }
              `}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}



export default BikeSlide;
