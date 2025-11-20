import React from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

function BannerDetail({
  bikeName,
  bikePrice,
  bikeSpeed,
  bikeBattery,
  images,
  model,
  version,
}) {
  const formattedPrice = bikePrice?.toLocaleString() + " đ";

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 text-white rounded-b-lg shadow-2xl p-6 md:p-10">
      <div className="absolute top-0 left-0 overflow-hidden">
        <div
          className="bg-red-600 text-white text-xs md:text-sm font-bold px-8 py-1 
          -rotate-45 origin-top-left shadow-lg translate-y-3 -translate-x-5 z-10"
        >
          NEW
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8">
        <div className="order-2 lg:order-1 flex flex-row lg:flex-col justify-center lg:justify-around gap-8 text-center lg:text-left w-full lg:w-1/5 py-4">
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-400">
              {bikeSpeed}
            </span>
            <span className="text-sm uppercase tracking-wider text-gray-400">
              Speed
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-400">
              {bikeBattery}
            </span>
            <span className="text-sm uppercase tracking-wider text-gray-400">
              Battery
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-400">
              {model}
            </span>
            <span className="text-sm uppercase tracking-wider text-gray-400">
              Model
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-400">
              {version}
            </span>
            <span className="text-sm uppercase tracking-wider text-gray-400">
              Version
            </span>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex flex-col items-center justify-center w-full lg:w-3/5">
          <div className="text-3xl md:text-5xl font-extrabold mb-4 text-center text-yellow-400">
            {bikeName}
          </div>

          <div className="w-full max-w-4xl h-72 md:h-96">
            <Swiper
              slidesPerView={1}
              spaceBetween={0}
              centeredSlides={true}
              loop={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[Navigation, Pagination]}
              className="w-full h-full rounded-xl overflow-hidden"
            >
              {images.map((imageUrl, index) => (
                <SwiperSlide key={index}>
                  <div className="flex justify-center items-center h-full bg-gray-800">
                    <img
                      src={imageUrl.imageUrl}
                      alt={`${bikeName} image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <div className="order-3 flex flex-col justify-center w-full lg:w-1/5 text-center lg:text-right py-4">
          <span className="text-3xl md:text-5xl font-extrabold text-yellow-400 mb-2">
            {formattedPrice}
          </span>
          <span className="text-sm text-gray-400">Inclued VAT</span>
          <span className="text-sm text-gray-400">charger and battery.</span>
        </div>
      </div>
    </div>
  );
}

export default BannerDetail;
