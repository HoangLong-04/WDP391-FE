import React from "react";

function BikeCard({ image, name, price }) {
  return (
    <div className="rounded-2xl hover:shadow-2xl transition cursor-pointer p-5">
      <div className="h-[30rem] flex items-end">
        <img width={500} src={image} alt="" />
      </div>
      <div className="text-[rgb(84,82,82)] text-2xl font-medium">{name}</div>
      <div className="text-[rgb(84,82,82)] text-3xl font-bold">{price.toLocaleString("vi-VN")}đ</div>
    </div>
  );
}

export default BikeCard;
