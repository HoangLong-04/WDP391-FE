import React from "react";
import { useNavigate } from "react-router";

function BikeCard({ image, name, price, id }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/user/bike/${id}`)}
      className="group flex flex-col p-4 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:shadow-2xl hover:scale-[1.02]"
    >
      <div className="relative h-64 md:h-80 lg:h-96 w-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-gray-700 text-lg md:text-xl font-semibold truncate">
          {name}
        </div>

        <div className="text-2xl md:text-3xl font-extrabold text-indigo-600">
          {Number(price).toLocaleString('vi-VN')} đ
        </div>
      </div>
    </div>
  );
}

export default BikeCard;
