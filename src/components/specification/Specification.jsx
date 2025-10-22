import React from "react";

function Specification({
  color,
  chargeTime,
  engine,
  normalPower,
  shock,
  batteryType,
  capacity,
  maxSpeed,
  maxPower,
  weight,
  brake,
  volume,
}) {
  return (
    <div className="grid grid-cols-3 gap-20">
      <div className="">
        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Colors</span>
          <span>{color}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Charge time</span>
          <span>{chargeTime}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Normal power</span>
          <span>{normalPower}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200">
          <span>Engine</span>
          <span>{engine}</span>
        </div>
      </div>
      <div className="">
        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Shock absorb</span>
          <span>{shock}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Battery type</span>
          <span>{batteryType}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Battery capacity</span>
          <span>{capacity}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200">
          <span>Maximum speed</span>
          <span>{maxSpeed}</span>
        </div>
      </div>
      <div className="">
        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Maximum power</span>
          <span>{maxPower}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Weight</span>
          <span>{weight}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200 mb-6">
          <span>Size</span>
          <span>{volume}</span>
        </div>

        <div className="flex justify-between border-b-1 border-gray-200">
          <span>Brake</span>
          <span>{brake}</span>
        </div>
      </div>
    </div>
  );
}

export default Specification;
