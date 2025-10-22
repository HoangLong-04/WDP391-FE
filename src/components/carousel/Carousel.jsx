import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import BikeCard from "../bikeCard/BikeCard";
import "swiper/css/navigation";

function Carousel() {
  const bikeList = [
    {
      name: "test1",
      price: 2999000,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
    {
      name: "test2",
      price: 6999000,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
    {
      name: "test3",
      price: 6799000,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
    {
      name: "test4",
      price: 1232000,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
    {
      name: "test5",
      price: 666666,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
  ];
  return (
    <div className="p-10">
      <div className="flex justify-center mb-[2rem]">
        <p className="bg-[rgb(69,69,69)] text-white font-medium inline-block p-2 rounded-sm">
          Best Selling Products
        </p>
      </div>

      <Swiper
        slidesPerView={3}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Navigation, Pagination]}
        className="mySwiper"
        
      >
        {bikeList.map((b) => (
          <SwiperSlide>
            <div className="flex justify-center items-center p-2">
              <BikeCard name={b.name} price={b.price} image={b.image} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Carousel;
