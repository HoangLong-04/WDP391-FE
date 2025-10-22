import React from "react";

function BannerDetail({
  bikeImg,
  bikeName,
  bikeBattery,
  bikePrice,
  bikeSpeed,
}) {
  return (
    <div className="bg-amber-300 flex justify-between p-2">
      <div className="absolute top-35 -left-5">
        <div
          className="bg-blue-500 text-white text-sm font-bold px-12 py-1 
      -rotate-45 origin-left shadow-md"
        >
          New
        </div>
      </div>

      <div className="flex flex-col justify-around ml-10">
        <div className="flex flex-col ">
          <span className="text-2xl font-semibold">{bikeSpeed}</span>
          <span>Speed</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold">{bikeBattery}</span>
          <span>Battery capacity</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="text-4xl font-bold">{bikeName}</div>
        <div>
          <img width={560} src={bikeImg} alt="" />
        </div>
      </div>
      <div className="flex flex-col justify-center mr-10">
        <span className="text-2xl font-semibold">
          {bikePrice.toLocaleString()} Vnđ
        </span>
        <span>Icluding VAT, </span>
        <span>01 set of charger and battery</span>
      </div>
    </div>
  );
}

export default BannerDetail;
