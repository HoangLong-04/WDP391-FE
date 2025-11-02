import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import BikeCard from "../bikeCard/BikeCard";
import "swiper/css/navigation";
import { useEffect, useState } from "react";
import PublicApi from "../../services/PublicApi";
import { toast } from "react-toastify";

function Carousel() {
  const [motorList, setMotorList] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchMotorList = async () => {
    setLoading(true);
    try {
      const response = await PublicApi.getMotorList({ page: 1, limit: 10 });
      setMotorList(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotorList();
  }, []);

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
        {loading
          ? "Loading..."
          : motorList.map((b) => (
              <SwiperSlide>
                <div className="flex justify-center items-center p-2">
                  <BikeCard
                    name={b.name}
                    price={b.price}
                    image={b.images[0].imageUrl}
                    id={b.id}
                  />
                </div>
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
}

export default Carousel;
