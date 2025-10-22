import React from "react";
import { useNavigate } from "react-router";

function BikeCard({ image, name, price }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate('/user/bike-detail')} className="rounded-2xl transition cursor-pointer">
      <div className="h-[30rem] hover:scale-105 transform duration-300  flex items-end bg-[rgb(241,241,241)] rounded-lg">
        <img width={500} src={image} alt="" />
      </div>
      <div className="text-[rgb(84,82,82)] text-2xl font-medium z-99">{name}</div>
      <div className="text-[rgb(84,82,82)] text-3xl font-bold">
        {price.toLocaleString("vi-VN")}đ
      </div>
    </div>
  );
}

export default BikeCard;
