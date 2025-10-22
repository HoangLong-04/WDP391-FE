import React from 'react'

function BikeReview({ name, review, img, rating }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 flex gap-4 items-center transform transition-all duration-300 ease-in-out">
      <img
        src={img}
        alt={name}
        className="w-40 h-40 object-cover rounded-lg"
      />
      <div className="flex flex-col justify-between">
        <p className="text-xl font-semibold">{name}</p>
        <p className="italic text-gray-600">"{review}"</p>
        <div className="flex text-yellow-400 mt-2">
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </div>
      </div>
    </div>
  )
}

export default BikeReview