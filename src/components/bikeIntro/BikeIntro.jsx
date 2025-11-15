import React, { useState, useEffect } from "react";
import { Lightbulb, Leaf, ShieldCheck, Zap } from "lucide-react";

function BikeIntro({ colors }) {
  const [selectedImage, setSelectedImage] = useState("");

  const [selectedColorType, setSelectedColorType] = useState("");

  useEffect(() => {
    if (colors && colors.length > 0) {
      setSelectedImage(colors[0].imageUrl);
      setSelectedColorType(colors[0].color.colorType);
    }
  }, [colors]);

  const handleColorSelect = (imageURL, colorType) => {
    setSelectedImage(imageURL);
    setSelectedColorType(colorType);
  };

  const getTailwindColorClass = (colorType) => {
    switch (colorType.toLowerCase()) {
      case "red":
        return "bg-red-500";
      case "black":
        return "bg-gray-800";
      case "grey":
        return "bg-gray-500";
      case "blue":
        return "bg-blue-500";
      case "white":
        return "bg-white border border-gray-300";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-12 px-4 md:px-8 bg-white">
      <div className="flex flex-col gap-10 justify-center">
        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-300">
          <span className="text-blue-600 flex-shrink-0">
            <Lightbulb className="w-[70px] h-[70px]" />
          </span>
          <div>
            <span className="text-xl md:text-2xl font-bold text-gray-800">
              DESIGN
            </span>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Compact, modern design, easy to move in the city, and suitable for
              dynamic style.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-300">
          <span className="text-green-600 flex-shrink-0">
            <ShieldCheck className="w-[70px] h-[70px]" />
          </span>
          <div>
            <span className="text-xl md:text-2xl font-bold text-gray-800">
              BODY
            </span>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Sturdy steel frame combined with durable, lightweight, plastic
              shell providing safety and durability overtime.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100/50 scale-130 mx-10">
        {selectedImage ? (
          <div className="relative w-full max-w-lg">
            <img
              src={selectedImage}
              alt={`Bike in ${selectedColorType} color`}
              className="w-full h-auto object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
            No image
          </div>
        )}

        {colors && colors.length > 0 && (
          <div className="flex justify-center gap-3 mt-6">
            {colors.map((item, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full shadow-md transition-all duration-200 ease-in-out
                            ${getTailwindColorClass(item.color.colorType)}
                            ${
                              selectedColorType === item.color.colorType
                                ? "ring-4 ring-offset-2 ring-blue-500"
                                : ""
                            }`}
                onClick={() =>
                  handleColorSelect(item.imageUrl, item.color.colorType)
                }
                aria-label={`Select ${item.color.colorType} color`}
              ></button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-10 justify-center">
        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-300">
          <span className="text-yellow-600 flex-shrink-0">
            <Leaf className="w-[70px] h-[70px]" />
          </span>
          <div>
            <span className="text-xl md:text-2xl font-bold text-gray-800">
              SAVINGS
            </span>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Smooth operation, charging cost are much cheaper than gasoline
              vehicles, environmentally friendly.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-300">
          <span className="text-purple-600 flex-shrink-0">
            <Zap className="w-[70px] h-[70px]" />
          </span>
          <div>
            <span className="text-xl md:text-2xl font-bold text-gray-800">
              VARIETY OF FUNCTIONS
            </span>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Modern smart features, including GPS tracking, remote lock/unlock,
              and customizable ride modes.
            </p>{" "}
            {/* Đã cập nhật mô tả */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BikeIntro;
