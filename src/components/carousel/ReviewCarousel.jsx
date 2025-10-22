import React from "react";

import { EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import BikeReview from "../bikeReview/BikeReview";
import "swiper/css";
import "swiper/css/effect-coverflow";

function ReviewCarousel() {
  const reviews = [
    {
      name: "Theon S",
      review: "Great value for money — stylish, practical, and eco-friendly",
      img: "/assets/theon.jpg",
      rating: 5,
    },
    {
      name: "Matio",
      review: "The design is modern and compact, perfect for daily city rides.",
      img: "/assets/matio.jpg",
      rating: 4,
    },
    {
      name: "Vento Neo",
      review: "Smooth and quiet ride, I really enjoy the comfort",
      img: "/assets/vento.jpg",
      rating: 5,
    },
  ];
  return (
    <div className="w-full py-10">
      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={2.5}
        loop={true}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 150,
          modifier: 2,
          slideShadows: false,
        }}
        className="w-full"
      >
        {reviews.map((item, index) => (
          <SwiperSlide key={index}>
            <BikeReview {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default ReviewCarousel;
