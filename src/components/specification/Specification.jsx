import React from "react";

function Specification({
  length,
  width,
  height,
  storageLimit,
  batteryType,
  chargeTime,
  chargeType,
  energyConsumption,
  batteryLimit,
  motorType,
  speedLimit,
  maximumCapacity,
  brake,
  lock,
  colors,
}) {
  return (
    <div className="grid grid-cols-3 gap-20">
      <div className="">
        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Length</span>
          <span>{length} mm</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Width</span>
          <span>{width} mm</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Height</span>
          <span>{height} mm</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Storage limit</span>
          <span>{storageLimit}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200">
          <span className="font-bold">Battery type</span>
          <span>{batteryType}</span>
        </div>
      </div>
      <div className="">
        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Charge time</span>
          <span>{chargeTime}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Charge type</span>
          <span>{chargeType}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Consumption</span>
          <span>{energyConsumption}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Battery limit</span>
          <span>{batteryLimit}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200">
          <span className="font-bold">Motor</span>
          <span>{motorType}</span>
        </div>
      </div>
      <div className="">
        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Speed</span>
          <span>{speedLimit}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Capacity</span>
          <span>{maximumCapacity}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Brake</span>
          <span>{brake}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span className="font-bold">Lock</span>
          <span>{lock}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200">
          <span className="font-bold">Color</span>
          <span>{colors.map((c) => c.color.colorType).join(', ')}</span>
        </div>
      </div>
    </div>
  );
}

export default Specification;
